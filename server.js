/////////////////////////////////////////////////// Server
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + "/http")).listen(8080, function(){
	console.log('Server running on 8080');
});

var apiurl = "http://ec2-54-69-225-248.us-west-2.compute.amazonaws.com/TeacherHelperNET/WebService.asmx";

/////////////////////////////////////////////////// Backend

var request = require('request');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded());

// from http://stackoverflow.com/questions/18310394/no-access-control-allow-origin-node-apache-port-issue

// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*'); // TODO

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});



app.get('/', function (req, res) {
	res.send('sent');
	console.log("GET request recieved");
});

var preData = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><Login xmlns="http://tempuri.org/">';
var postData = '</Login></soap12:Body></soap12:Envelope>';


app.post('/Login', function (req, res) {

	var username = req.body.username;
	var password = req.body.password;


	var body = {
		"username":username,
		"password":password
	};

	var data = preData + "<username>" + username + "</username><password>" + password + "</password>" + postData;	 


	request.post({
		url:apiurl, 
		headers : {
			"Content-Type": "application/soap+xml; charset=utf-8"
		},
		body :data 
	}, function callBack(err, httpResponse, body) {
	if (err) {
		console.log('serverError');
		console.log(err);
		res.send("there was an error processing your request.");
	} else {
		var response = JSON.parse(body.split('<')[0])[0].Column1; // TODO rename column
		res.send(response);
	}
	});
});



app.listen(3000, function() {
	console.log('backend running on port 3000');
});
