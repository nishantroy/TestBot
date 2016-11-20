var express = require('express');
var path = require("path");
var yw = require('weather-yahoo');
var ans = {};





var port = process.env.PORT || 8080;
var request = require('request');

var bodyParser = require('body-parser');

var botID = 'c7f81be0af8cbbbce84ecab26d';

var app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies
var loc = "delhi";

yw.getSimpleWeather(loc).then(function(res) {
	console.log(res.weather.temperature.value);
	var weather = res.weather;
	var date = new Date(res.date);
	//date = date.toDateString();
	var out = "On " + date + ", it is " + weather.condition + " in delhi" 
	+ ".\n" + "It is " + weather.temperature.value + weather.temperature.units 
	+ " with a " + weather.wind.value + weather.wind.units + " wind.\n" + "With windchill, it is " 
	+ weather.windChill.value + weather.windChill.units + ".";

	console.log(date);

	/*request.post('https://api.groupme.com/v3/bots/post', {
		form: {
			bot_id: botID,
			text: out
		}
	}, function(err, reason) {
		console.log(err, reason);
	});*/
	
}).catch(function(err) {
	console.log(err);
});