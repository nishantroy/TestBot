// grab the packages we need
'use strict';
const express = require('express');
const path = require("path");
const yw = require('weather-yahoo');
const googleFinance = require("google-finance");
const gFinance = require('gfinance');
const MongoClient = require('mongodb').MongoClient;
const stockTracker = require('./bin/stockTracker');
var mongodbURL = 'mongodb://nroy:password@ds159517.mlab.com:59517/testbot';

var port = process.env.PORT || 8080;
const request = require('request');

const bodyParser = require('body-parser');

const botID = 'c7f81be0af8cbbbce84ecab26d';

var app = express();
var db;
// app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
    extended: true
})); // support encoded bodies

MongoClient.connect(mongodbURL, (err, database) => {
    if (err) {
        return console.log(err)
    } else {
        db = database;
        app.listen(port, () => {
            console.log('listening on ' + port);
        })
    }
});


app.post('/api/testbot', function (req, res) {
    console.log("Called now with this body: " + JSON.stringify(req.body));
    var body = req.body;
    var name = body.name;
    var msg = body.text;

    var text = "Hello " + name + "! Nice of you to say " + msg;

    if (body.sender_type != 'system' && body.sender_type != 'bot') {

        var cmd = msg.split(" ", 1)[0];
        if (cmd.toLowerCase() == "weather") {
            var loc = msg.substring(cmd.length).trim();

            request.post('https://api.groupme.com/v3/bots/post', {
                form: {
                    bot_id: botID,
                    text: "Fetching weather for " + loc
                }
            }, function (err, response) {
                // res.send("Success");
                return "Success";
            });

            yw.getSimpleWeather(loc).then(function (result) {
                var weather = result.weather;
                var date = new Date(result.date.substring(0, result.date.length - 3));
                date = date.toDateString();
                var out = "On " + date + ", it is " + weather.condition + " in " + loc + ".\n" + "It is " + weather.temperature.value + weather.temperature.units + " with a " + weather.wind.value + weather.wind.units + " wind.\n" + "With windchill, it is " + weather.windChill.value + weather.windChill.units + ".";

                request.post('https://api.groupme.com/v3/bots/post', {
                    form: {
                        bot_id: botID,
                        text: out
                    }
                }, function (err, response) {
                    // return response;
                    res.send("Success");
                });
            });

        }
        else if (cmd.toLowerCase() == 'stock') {
            var rest = msg.substring(cmd.length).trim().split(" ");
            var cmdStock = rest[0];
            if (cmdStock.toLowerCase() == 'track') {
                var symbol = rest[1].toUpperCase();
                var threshold = parseFloat(rest[2]);
                var toSave = {
                    'Stock': symbol,
                    'Threshold': threshold
                };
                db.collection('tracking').findOneAndUpdate({
                    Stock: symbol
                }, {
                    $set: toSave
                }, {
                    upsert: true
                }, function (err, result) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        request.post('https://api.groupme.com/v3/bots/post', {
                            form: {
                                bot_id: botID,
                                text: "OK! I'll tell you when the price of " + symbol + " is below " + threshold
                            }
                        }, function (err, response) {
                            res.send("Success");
                        });
                    }
                });

            } else if (cmdStock.toLowerCase() == 'check') {
                stockTracker.checkMyThresholds();
                res.send("Success!");
            } else if (cmdStock.toLowerCase() == 'sellcheck') {
                stockTracker.checkMyPurchases();
                res.send("Success!");
            } else if (cmdStock.toLowerCase() == 'bought') {
                symbol = rest[1].toUpperCase();
                var quantity = parseFloat(rest[2]);
                var price = parseFloat(rest[3]);
                toSave = {
                    'Stock': symbol,
                    'Quantity': quantity,
                    'Price': price,
                    'Maximum': 'n/a',
                    'Minimum': 'n/a'
                };
                db.collection('bought').findOneAndUpdate({
                    Stock: symbol
                }, {
                    $set: toSave
                }, {
                    upsert: true
                }, function (err, result) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        request.post('https://api.groupme.com/v3/bots/post', {
                            form: {
                                bot_id: botID,
                                text: "OK! You bought " + quantity + " units of " + symbol + " at $" + price
                            }
                        }, function (err, response) {
                            res.send("Success");
                        });
                    }
                });

            } else if (cmdStock.toLowerCase() == 'profit') {
                symbol = rest[1].toUpperCase();
                var max = parseFloat(rest[2]);
                toSave = {
                    'Maximum': max
                };
                db.collection('bought').findOneAndUpdate({
                    Stock: symbol
                }, {
                    $set: toSave
                }, {
                    upsert: false
                }, function (err, result) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        if (result.value != null) {
                            request.post('https://api.groupme.com/v3/bots/post', {
                                form: {
                                    bot_id: botID,
                                    text: "OK! I'll tell you when you make at least $" + max
                                    + " on " + symbol
                                }
                            }, function (err, response) {
                                res.send("Success");
                            });
                        } else {
                            request.post('https://api.groupme.com/v3/bots/post', {
                                form: {
                                    bot_id: botID,
                                    text: "First tell me how much of " + symbol + " you bought and for how much!"
                                }
                            }, function (err, response) {
                                res.send("Success");
                            });
                        }
                    }
                });
            } else if (cmdStock.toLowerCase() == 'loss') {
                symbol = rest[1].toUpperCase();
                var min = parseFloat(rest[2]);
                toSave = {
                    'Minimum': min
                };
                db.collection('bought').findOneAndUpdate({
                    Stock: symbol
                }, {
                    $set: toSave
                }, {
                    upsert: false
                }, function (err, result) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {
                        if (result.value != null) {
                            request.post('https://api.groupme.com/v3/bots/post', {
                                form: {
                                    bot_id: botID,
                                    text: "OK! I'll tell you when you're going to lose $" + min
                                    + " on " + symbol
                                }
                            }, function (err, response) {
                                res.send("Success");
                            });
                        } else {
                            request.post('https://api.groupme.com/v3/bots/post', {
                                form: {
                                    bot_id: botID,
                                    text: "First tell me how much of " + symbol + " you bought and for how much!"
                                }
                            }, function (err, response) {
                                res.send("Success");
                            });
                        }
                    }
                });
            } else if (cmdStock.toLowerCase() == 'history') {
                var symbol = rest[1].toUpperCase();
                var from = new Date(rest[2]);
                var end = new Date();

                request.post('https://api.groupme.com/v3/bots/post', {
                    form: {
                        bot_id: botID,
                        text: "Fetching stock prices for " + symbol
                    }
                }, function (err, response) {
                    return ("Success");
                });

                googleFinance.historical({
                    symbol: symbol,
                    from: from,
                    to: end
                }).then(function (quotes) {

                    var out = "";
                    if (quotes.length > 0) {
                        for (var i = 0; i < quotes.length; i++) {
                            var quote = quotes[i];
                            var qdate = new Date(quote.date).toDateString();
                            var qclose = parseFloat(quote.close);
                            if (i != quote.length - 1) {
                                out += "On " + qdate + " closing price was: $" + qclose + "\n";
                            } else {
                                out += "On " + qdate + " closing price was: $" + qclose;
                            }

                            if (out.length > 1000) {
                                var subtract = out.length % 1000;
                                out = out.substring(0, out.length - (subtract + 4));
                                out += "...";
                                break;
                            }
                        }
                    } else {
                        out = "No data found!";
                    }
                    request.post('https://api.groupme.com/v3/bots/post', {
                        form: {
                            bot_id: botID,
                            text: out
                        }
                    }, function (err, response) {
                        res.send("Success");
                    });

                });
            } else {
                var symbol = rest[0].toUpperCase();
                var out = "";
                gFinance.get([symbol], function (err, apires) {

                    if (!err) {
                        var apiResult = apires[0];
                        out += 'The price of ' + apiResult.t + ' is ' + apiResult.l;
                    }
                    request.post('https://api.groupme.com/v3/bots/post', {
                        form: {
                            bot_id: botID,
                            text: out
                        }
                    }, function (err, response) {
                        res.send("Success");
                    });
                })
            }

        } else {

            request.post('https://api.groupme.com/v3/bots/post', {
                form: {
                    bot_id: botID,
                    text: text
                }
            }, function (err, response) {
                res.send("Success");
                // return "Done";
            });
        }
        // res.send("Response in process");
        // return console.log("Responding");
    } else {
        res.send("No response if message is from GroupMe or TestBot");
        // return;
        // return console.log("GroupMe/Bot message received. Ignore.");
    }

});