// grab the packages we need
var express = require('express');
var path = require("path");
var app = express();
app.use(express.static(__dirname + "/public"));
var port = process.env.PORT || 8080;
var request = require('request');

var bodyParser = require('body-parser');

var botID = 'c7f81be0af8cbbbce84ecab26d';


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/api/users', function(req, res) {
    var user_id = req.body.id;
    var token = req.body.token;
    var geo = req.body.geo;

    res.send(user_id + ' ' + token + ' ' + geo);
});

app.post('/api/testbot', function(req, res) {
	var body = req.body;
	var name = body.name;
	var msg = body.text;
	
	var text = "Hello " + name + "! Nice of you to say " + msg;

	request.post('https://api.groupme.com/v3/bots/post', {
		form: {
			bot_id: botID,
			text: text
		}
	}, function (err, res) {
		console.log(err, res);
	});

})

// routes will go here

// start the server
app.listen(port);
console.log('Server started! At port: ' +  port);