var googleFinance = require("google-finance")

var SYMBOL = 'goog';
var FROM = '2016-11-15';
var TO = '2016-11-20';

var start = new Date().getTime();

googleFinance.historical({
  symbol: SYMBOL,
  from: FROM,
  to: TO
}).then(function (quotes) {

    var end = new Date().getTime();
    console.log(quotes);
    console.log("Time taken: " + (end - start) + "ms");
});