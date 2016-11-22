// grab the packages we need
'use strict';
var express = require('express');
var path = require("path");
var yw = require('weather-yahoo');
var googleFinance = require("google-finance")

var port = process.env.PORT || 8080;
var request = require('request');

var bodyParser = require('body-parser');

var botID = 'c7f81be0af8cbbbce84ecab26d';

var app = express();
// app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies


app.post('/api/testbot', function(req, res) {
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
			}, function(err, response) {
				// res.send("Success");
				return "Success";
			});

			yw.getSimpleWeather(loc).then(function(result) {
				var weather = result.weather;
				var date = new Date(result.date.substring(0, result.date.length - 3));
				date = date.toDateString();
				var out = "On " + date + ", it is " + weather.condition + " in " 
				+ loc + ".\n" + "It is " + weather.temperature.value + weather.temperature.units 
				+ " with a " + weather.wind.value + weather.wind.units + " wind.\n" 
				+ "With windchill, it is " + weather.windChill.value + weather.windChill.units + ".";

				request.post('https://api.groupme.com/v3/bots/post', {
					form: {
						bot_id: botID,
						text: out
					}
				}, function(err, response) {
					// return response;
					res.send("Success");
				});
			});

		} else if (cmd.toLowerCase() == 'stock') {
			var rest = msg.substring(cmd.length).trim().split(" ");
			var symbol = rest[0].toUpperCase();
			var from = new Date(rest[1]);
			var end = new Date();

			request.post('https://api.groupme.com/v3/bots/post', {
				form: {
					bot_id: botID,
					text: "Fetching stock prices for " + symbol
				}
			}, function(err, response) {
				return ("Success");
			});

			googleFinance.historical({
				symbol: symbol,
				from: from,
				to: end
			}).then(function(quotes) {

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
				}, function(err, response) {
					res.send("Success");
				});

			});

		} else {

			request.post('https://api.groupme.com/v3/bots/post', {
				form: {
					bot_id: botID,
					text: text
				}
			}, function(err, response) {
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

})

app.listen(port);
console.log('Server started! At port: ' + port);