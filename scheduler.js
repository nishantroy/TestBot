'use strict';
const stockTracker = require('./bin/stockTracker');

var date = new Date();
var day = date.getDay();
var hour = date.getHours();
if ((day > 0 && day < 6) && (hour > 9 && hour < 17)) {
	stockTracker.checkMyThresholds();
} else {
	console.log("It's not time for that!");
}