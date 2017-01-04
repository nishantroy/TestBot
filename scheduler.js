'use strict';
const stockTracker = require('./bin/stockTracker');

var date = new Date();
var day = date.getDay();
var hour = date.getHours();
if ((day > 0 && day < 6) && (hour > 14 && hour < 22)) {
	stockTracker.checkMyThresholds();
	stockTracker.checkMyPurchases();
} else {
	console.log("It's not time for that!");
}