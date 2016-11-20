// grab the packages we need
var express = require('express');
var path = require("path");
var app = express();
app.use(express.static(__dirname + "/public"));
var port = process.env.PORT || 8080;

var bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/api/users', function(req, res) {
    var user_id = req.body.id;
    var token = req.body.token;
    var geo = req.body.geo;

    res.send(user_id + ' ' + token + ' ' + geo);
});

// routes will go here

// start the server
app.listen(port);
console.log('Server started! At port: ' +  port);