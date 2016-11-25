#!/bin/env node


'use strict';
const express = require('express');
const path = require("path");
// const googleFinance = require("google-finance");
const googleFinance = require("gfinance");
const MongoClient = require('mongodb').MongoClient;
var mongodbURL = 'mongodb://nroy:password@ds159517.mlab.com:59517/testbot';

var port = process.env.PORT || 8080;
const request = require('request');

const bodyParser = require('body-parser');

const botID = 'c7f81be0af8cbbbce84ecab26d';
const async = require('async');

module.exports = {
	checkMyThresholds: function() {
		var date = new Date();
		var day = date.getDay();
		var hour = date.getHours();
		if (day > 0 && day < 6) && (hour > 9 && hour < 17) {
			MongoClient.connect(mongodbURL, (err, database) => {
				if (err) {
					return console.log(err)
				} else {
					db = database
					console.log("DB found");
					trackStocks();
				}
			})
		} else {
			console.log("It's not time for that!");
		}
	}
};

var app = express();
var db;
// app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({
	extended: true
})); // support encoded bodies

/*MongoClient.connect(mongodbURL, (err, database) => {
	if (err) {
		return console.log(err)
	} else {
		db = database
		console.log("DB found");
		trackStocks();
	}
})*/

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

		async.each(stockData, function(name, callback) {
			var symbol = name.Stock;
			var threshold = parseFloat(name.Threshold);

			/*googleFinance.historical({
				symbol: symbol,
				from: from,
				to: end
			}).then(function(quotes) {
				quotes = quotes[0];
				console.log("Symbol: " + quotes.symbol + ", price: " + quotes.close + " threshold: " + threshold);

				if (parseFloat(quotes.close) < threshold) {
					// if (i < stockData.length - 1) {
					out += 'The price of ' + quotes.symbol + ' is ' + quotes.close + ', below your threshold: ' + threshold + '\n';
					console.log("Just added: " + quotes.symbol);
					// } else {
					// 	out += 'The price of ' + quotes.symbol + ' is ' + quotes.close + ', below your threshold: ' + threshold;
					// }
				}
				callback();
			});*/
			var checkLastIndex = 0;
			googleFinance.get([symbol], function(err, res) {
				console.log(res);
				if (!err) {
					checkLastIndex++;
					var apiResult = res[0];
					console.log("Symbol: " + apiResult.t + ", price: " + apiResult.l + " threshold: " + threshold);
					if (parseFloat(apiResult.l) < threshold) {
						if (checkLastIndex != stockData.length - 1) {
							out += 'The price of ' + apiResult.t + ' is ' + apiResult.l + ', below your threshold: ' + threshold + '\n';
						} else {
							out += 'The price of ' + apiResult.t + ' is ' + apiResult.l + ', below your threshold: ' + threshold;
						}
						console.log("Just added: " + apiResult.t);
					}
				}
				callback();
			})

		}, function(err) {
			if (err) {
				return console.log(err);
			} else {
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
		});
	})
}

require('make-runnable');