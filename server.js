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
		var response = getResponseData(body)[0];
        if (response.Status == "login successful"){
            sess.username = req.body.username;
            sess.TeacherID = response.TeacherID;
            sess.fName = response.fName;
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
app.listen(8080, function() {
	console.log('backend running on port 8080');
});



app.get('/GetStudents', function(req, res) {
	//data goes here
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	var data = getPreData('GetStudents');
	/////////TODO add data
	data += getPostData('GetStudents');
	request.post({
		url : apiurl,
		headers : {
			"Content-Type": "application/soap+xml; charset=utf-8"
		},
		body : data
	}, function callback(err, httpResponse, body) {
	if (err) {
		console.log(err);
		res.send("there was an error processing the request.");
	} else {
		var response = getResponseData(body);
		res.send(response);
	}
	});
});

//////// THE REST AUTOMATICALLY GENERATED

app.post('/GetClassesByTeacher', function(req, res) {
	var TeacherID = req.body.TeacherID;
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	var data = getPreData('GetClassesByTeacher');
	data += '<TeacherID>' + TeacherID + '</TeacherID>';
	data += getPostData('GetClassesByTeacher');
	request.post({
		url : apiurl,
		headers : {
			"Content-Type": "application/soap+xml; charset=utf-8"
		},
		body : data
	}, function callback(err, httpResponse, body) {
	if (err) {
		console.log(err);
		res.send("there was an error processing the request.");
	} else {
		var response = getResponseData(body);
        res.send(response);
        /////DO SOMETHING WITH DATA
	}
	});
});

app.get('/GetClasses', function(req, res) {
    
    sess = req.session;
    if (!sess.username) {
        res.render('login.html');
    }

	var TeacherID = sess.TeacherID;

    var data = getPreData('GetClassesByTeacher');
    data += '<TeacherID>' + TeacherID + '</TeacherID>';
    data += getPostData('GetClassesByTeacher');
    request.post({
        url : apiurl,
        headers : {
            "Content-Type": "application/soap+xml; charset=utf-8"
        },
        body : data
    }, function callback(err, httpResponse, body) {
    if (err) {
        console.log(err);
        res.send("there was an error processing the request.");
    } else {
        var response = getResponseData(body);
        res.send(response);
        /////DO SOMETHING WITH DATA
    }
    });

});

app.get('/Roster', function(req, res) {

    sess = req.session;

    if (sess.username)
        res.render('roster.html');
    else
        res.render('login.html');
});

app.post('/GetStudentsByClass', function(req, res) {
    sess = req.session;
    // check if logged in


    // check if class is one owned by teacher
 	var TeacherID = sess.TeacherID;

    var data = getPreData('GetClassesByTeacher');
    data += '<TeacherID>' + TeacherID + '</TeacherID>';
    data += getPostData('GetClassesByTeacher');
    request.post({
        url : apiurl,
        headers : {
            "Content-Type": "application/soap+xml; charset=utf-8"
        },
        body : data
    }, function callback(err, httpResponse, body) {
    if (err) {
        console.log(err);
        res.send("there was an error processing the request.");
    } else {
        var classes = getResponseData(body);
        var ClassID = req.body.ClassID;
        
        var hasAccess = false;
        for (var c in classes) {
            if (ClassID == classes[c].ClassID)
                hasAccess = true;
        }

        /////DO SOMETHING WITH DATA
        if (hasAccess){
            
            var data = getPreData('GetStudentsByClass');
            data += '<ClassID>' + ClassID + '</ClassID>';
            data += getPostData('GetStudentsByClass');
            request.post({
                url : apiurl,
                headers : {
                    "Content-Type": "application/soap+xml; charset=utf-8"
                },
                body : data
            }, function callback(err, httpResponse, body) {
            if (err) {
                console.log(err);
                res.send("there was an error processing the request.");
            } else {
                
                var response = getResponseData(body);
                res.send(response);
                /////DO SOMETHING WITH DATA
            }
            });

        } else {
            res.send("You don't have access to this class.");
        }

    }
    });       

});

app.post('/UpdateRoster', function(req, res) {

    var classID = req.body.ClassID;
    var edits = req.body.students;
    
    for (var e in edits) {
        var edit = edits[e];
        if (edit.action=="edit") {
            editStudent(edit, classID);
        } else {
            removeStudent(edit.StudentID, classID);
        }
    }
    res.send("Success!");

});

function editStudent(student, classID){
    console.log("edit");
    console.log(student);
}
function removeStudent(StudentID, classID){
    console.log("delete " + StudentID + " from " + classID);
}

app.post('/GetStudentsInHat', function(req, res) {
    sess = req.session;
    // check if logged in


    // check if class is one owned by teacher
 	var TeacherID = sess.TeacherID;

    var data = getPreData('GetClassesByTeacher');
    data += '<TeacherID>' + TeacherID + '</TeacherID>';
    data += getPostData('GetClassesByTeacher');
    request.post({
        url : apiurl,
        headers : {
            "Content-Type": "application/soap+xml; charset=utf-8"
        },
        body : data
    }, function callback(err, httpResponse, body) {
    if (err) {
        console.log(err);
        res.send("there was an error processing the request.");
    } else {
        var classes = getResponseData(body);
        var ClassID = req.body.ClassID;
        
        var hasAccess = false;
        for (var c in classes) {
            if (ClassID == classes[c].ClassID)
                hasAccess = true;
        }

        /////DO SOMETHING WITH DATA
        if (hasAccess){
            
            var data = getPreData('GetNamesInHat');
            data += '<ClassID>' + ClassID + '</ClassID>';
            data += getPostData('GetNamesInHat');
            request.post({
                url : apiurl,
                headers : {
                    "Content-Type": "application/soap+xml; charset=utf-8"
                },
                body : data
            }, function callback(err, httpResponse, body) {
            if (err) {
                console.log(err);
                res.send("there was an error processing the request.");
            } else {
                
                var response = getResponseData(body);
                res.send(response);
                /////DO SOMETHING WITH DATA
            }
            });

        } else {
            res.send("You don't have access to this class.");
        }

    }
    });       

});


app.get('/NamePicker', function(req, res) {

    sess = req.session;

    if (sess.username)
        res.render('namepicker.html');
    else
        res.render('login.html');
});

app.post('/DrawStudent', function(req, res) {
    sess = req.session;

    var StudentID = req.body.StudentID;
    var ClassID = req.body.ClassID;
    
    var data = getPreData('DrawStudentFromHat');
    data += '<StudentID>' + StudentID + '</StudentID>';
    data += '<ClassID>' + ClassID + '</ClassID>';
    data += getPostData('DrawStudentFromHat');
    
    request.post({
        url : apiurl,
        headers : {
            "Content-Type": "application/soap+xml; charset=utf-8"
        },
        body : data
    }, function callback(err, httpResponse, body) {
    if (err) {
        console.log(err);
        res.send("there was an error processing the request.");
    } else {
        
        var response = getResponseData(body);
        res.send(response);
    }
    });



});


app.get('/GetCurrentTeacher', function(req, res) {
    sess = req.session;

    var teacher  = {
        "TeacherID" : sess.TeacherID,
        "fName" : sess.fName,
        "lName" : sess.lName
    };

    res.send(teacher);

});

app.post('/ResetHat', function(req, res) {
	var ClassID = req.body.ClassID;
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	var data = getPreData('ResetHat');
	data += '<ClassID>' + ClassID + '</ClassID>';
	data += getPostData('ResetHat');
	request.post({
		url : apiurl,
		headers : {
			"Content-Type": "application/soap+xml; charset=utf-8"
		},
		body : data
	}, function callback(err, httpResponse, body) {
	if (err) {
		console.log(err);
		res.send("there was an error processing the request.");
	} else {
		var response = getResponseData(body);
		res.send(response);
	}
	});
});
