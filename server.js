/////////////////////////////////////////////////// Server
/*
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + "/http")).listen(3000, function(){
	console.log('Server running on 3000');
});
*/
var apiurl = "http://ec2-54-69-225-248.us-west-2.compute.amazonaws.com/TeacherHelperNET/WebService.asmx";

/////////////////////////////////////////////////// Backend

var request = require('request');
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded());
app.use(express.static('http'));
app.set('views', __dirname + '/html');
app.engine('html', require('ejs').renderFile);
app.use(session({secret : 'secret'}));



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

var sess;

app.get('/', function (req, res) {
	sess = req.session;

	if(sess.username) {
		res.render('index.html');
	}	
	else {
		res.render('login.html');
	}
});



app.post('/Login', function (req, res) {

	var username = req.body.username;
	var password = req.body.password;

    sess = req.session;

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

        if (response == "login successful"){
            sess.username = req.body.username;
            res.send('Login successful');
        }
        else {
            res.send('Login unsuccessful');
        }
	}
	});
});


app.get('/logout', function(req, res) {
    req.session.destroy(function(err) {
        if (err) console.log(err);
        else res.redirect('/');
    });
});

app.get('/GetUser', function(req, res) {

    res.send(req.session.username);	
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

app.listen(8080, function() {
	console.log('backend running on port 8080');
});
