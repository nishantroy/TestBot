'use strict';
const express = require('express');
const path = require("path");
const googleFinance = require("google-finance");
const MongoClient = require('mongodb').MongoClient;
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
		db = database
			// app.listen(port, () => {
			// 	console.log('listening on ' + port);
			// })
		trackStocks();

	}
})

function trackStocks() {
	var end = new Date();
	var day = end.getDay();
	if (day == 0) {
		end.setDate(end.getDate() - 2);
	} else if (day == 6) {
		end.setDate(end.getDate() - 1);
	}
	var from = new Date(end);
	from.setDate(from.getDate() - 1);

	var cursor = db.collection('tracking').find().toArray(function(err, results) {
		var stockData = results;
		var out = '';
		stockData.forEach(function(stock, index) {
			var symbol = stock.Stock;
			var threshold = stock.Threshold;
			googleFinance.historical({
				symbol: symbol,
				from: from,
				to: end
			}).then(function(quotes) {
				quotes = quotes[0];

				if (parseInt(quotes.close) < threshold) {
					out += 'The price of ' + quotes.symbol + ' is ' + quotes.close + ', below your threshold: ' + threshold + '\n';
				}
				if (index == stockData.length - 1) {
					if (out.length == 0) {
						out = 'None of your stocks are below your set thresholds yet!';
					}

					request.post('https://api.groupme.com/v3/bots/post', {
						form: {
							bot_id: botID,
							text: out
						}
					}, function(err, response) {
						// res.send("Success");
						return "Success";
					});
				}
			})
		})

		/*for (var i = 0; i < stockData.length; i++) {
			var object = stockData[i];
			var symbol = object.Stock;
			var threshold = object.Threshold;


			googleFinance.historical({
				symbol: symbol,
				from: from,
				to: end
			}).then(function(quotes) {
				quotes = quotes[0];
				if (quotes.close < threshold) {
					if (i < stockData.length - 1) {
						out += 'The price of ' + quotes.symbol + ' is ' + quotes.close + ', below your threshold: ' + threshold + '\n';
					} else {
						out += 'The price of ' + quotes.symbol + ' is ' + quotes.close + ', below your threshold: ' + threshold;
					}
				}
			})
		}*/
	})
}