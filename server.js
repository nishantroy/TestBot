// grab the packages we need
var express = require('express');
var path = require("path");
var yw = require('weather-yahoo');
var ans = {};



app.use(express.static(__dirname + "/public"));

var port = process.env.PORT || 8080;
var request = require('request');

var bodyParser = require('body-parser');

var botID = 'c7f81be0af8cbbbce84ecab26d';

var app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


app.post('/api/testbot', function(req, res) {
	var body = req.body;
	var name = body.name;
	var msg = body.text;
	
	var text = "Hello " + name + "! Nice of you to say " + msg;

	if (name != 'TestBot') {

		var words = msg.split(" ");
		if (words[0].toLowerCase() == "weather" && words.length > 1) {
			var loc = words[1].toLowerCase();
			console.log(loc);

			/*request.post('https://api.groupme.com/v3/bots/post', {
				form: {
					bot_id: botID,
					text: "Fetching weather for " + words[1]
				}
			}, function (err, res) {
				console.log(err, res);
			});*/

			yw.getSimpleWeather(loc).then(function(res) {
				// console.log(res);
			    // var date = new Date(res.date);
			    // date = date.toDateString();
			    var out = "On "  + res.date + "it is " + res.condition + " in " + words[1] + ".\n" 
			    	+ "It is " + res.temperature.value + res.temperature.units + " with a " 
			    	+ res.wind.value + res.wind.units + " wind.\n" 
			    	+ "With windchill, it is " + res.windChill.value + res.windChill.units;
			    console.log("Date: " + res.date + ", temp: " + res.temperature.value);
				console.log(out);

			    request.post('https://api.groupme.com/v3/bots/post', {
					form: {
						bot_id: botID,
						text: text
					}
				}, function (err, reason) {
					console.log(err, reason);
				});
			});

		} else {

			request.post('https://api.groupme.com/v3/bots/post', {
				form: {
					bot_id: botID,
					text: text
				}
			}, function (err, res) {
				console.log(err, res);
			});
		}
	}

})

// routes will go here

// start the server
app.listen(port);
console.log('Server started! At port: ' +  port);