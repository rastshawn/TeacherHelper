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

function getPreData(spName){
	var ret = '<?xml version="1.0" encoding="utf-8"?><soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope"><soap12:Body><';
	ret += spName;
	ret += ' xmlns="http://tempuri.org/">';

	return ret;
}
function getPostData(spName){

	var ret = '</' + spName;

	ret += '></soap12:Body></soap12:Envelope>';

	return ret;
}

function getResponseData(body){
	
	return JSON.parse(body.split('<')[0]); 
}

app.get('/', function (req, res) {
	res.send('sent');
	console.log("GET request recieved");
});



app.post('/Login', function (req, res) {

	var username = req.body.username;
	var password = req.body.password;


	var body = {
		"username":username,
		"password":password
	};

	var data = getPreData('Login') + "<username>" + username + "</username><password>" + password + "</password>" + getPostData('Login');	 


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
		var response = getResponseData(body);
		response = response[0].Column1;
		res.send(response);
	}
	});
});

app.get('/GetStudents', function(req, res) {

	var data = getPreData('GetStudents') + getPostData('GetStudents');
	request.post({
		url:apiurl,
		headers : {
			"Content-Type": "application/soap+xml; charset=utf-8"
		},
		body: data
	}, function callback(err, httpResponse, body) {
	if (err) {
		console.log('serverError');
		console.log(err);
		res.send("There was an error processing your request.");
	} else {
		var response = getResponseData(body);
		res.send(response);	
	}
	});
});

app.listen(3000, function() {
	console.log('backend running on port 3000');
});
