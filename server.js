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

// TODO check if this section is necessary.
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

// end section to check



// Non-routing functions

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


app.listen(8080, function() {
	console.log('backend running on port 8080');
});



// routing functions

var sess; // global variable for storing session. 


// Get request to '/', renders login or homepage
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
            sess.lName = response.lName;
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
    var user = {
        "fName" : req.session.fName,
        "lName" : req.session.lName,
        "username" : req.session.username
    };
    res.send(user);	
});

app.get('/Account', function (req, res) {
	sess = req.session;

	if(sess.username) {
		res.render('account.html');
	}	
	else {
		res.render('login.html');
	}
});

app.get('/Attendance', function (req, res) {
	sess = req.session;

	if(sess.username) {
		res.render('attendance.html');
	}	
	else {
		res.render('login.html');
	}
});

app.get('/Overview', function (req, res) {
	sess = req.session;

	if(sess.username) {
		res.render('overview.html');
	}	
	else {
		res.render('login.html');
	}
});



app.get('/Assignments', function (req, res) {
	sess = req.session;

	if(sess.username) {
		res.render('assignments.html');
	}	
	else {
		res.render('login.html');
	}
});

app.post('/AddAssignment', function(req, res) {
    sess = req.session;

    if (sess.username) {
        var Name = req.body.AssignmentName;
        var AssignDate = req.body.AssignDate;
        var ClassID = req.body.ClassID;
        var data = getPreData('AddAssignment');
        data += '<AssignmentName>' + Name + '</AssignmentName>';
        data += '<ClassID>' + ClassID + '</ClassID>';
        data += '<AssignDate>' + AssignDate + '</AssignDate>';
        data += getPostData('AddAssignment');
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
           

    }
});



app.post('/DeleteAssignment', function(req, res) {
    sess = req.session;

    if (sess.username) {
        var AssignmentID = req.body.AssignmentID;
        var data = getPreData('DeleteAssignment');
        data += '<AssignmentID>' + AssignmentID + '</AssignmentID>';
        data += getPostData('DeleteAssignment');
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
           

    }
});


app.post('/LoadAttendance', function(req, res) {
	var Day = req.body.Day;
    var ClassID = req.body.ClassID;
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	var data = getPreData('GetAttendanceByClassAndDay');
	data += '<ClassID>' + ClassID + '</ClassID>';
	data += '<Day>' + Day + '</Day>';
	data += getPostData('GetAttendanceByClassAndDay');
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



app.post('/SubmitAttendance', function(req, res) {
	var ClassID = req.body.ClassID;
    var records = req.body.Records;
    sess = req.session;
    
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}

    for (var r in records) {
        var record = records[r];
        var data = getPreData('AddUpdateAttendance');
        data += '<AttendanceID>' + (0-1) + '</AttendanceID>';
        data += '<StudentID>' + record.StudentID + '</StudentID>';
        data += '<ClassID>' + ClassID + '</ClassID>';
        data += '<Day>' + record.Day + '</Day>';
        data += '<isPresent>' + record.isPresent + '</isPresent>';
        data += getPostData('AddUpdateAttendance');
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
            //var response = getResponseData(body);
            //res.send(response);
            /////DO SOMETHING WITH DATA
        }
        });
    }
    res.send("Success!");

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

    sess = req.session;
    // TODO make app check for login / access to class

    var TeacherID = sess.TeacherID;
    var classID = req.body.ClassID;
    var edits = req.body.students;

   
    for (var e in edits) {
        var student = edits[e];
        if (student.action=="edit") {

            if (!student.isNearsighted) {
                student.isNearsighted = false;
            }

            if (!student.isTalkative) {
                student.isTalkative = false;
            }


            var data = getPreData('SetTeacherStudentNotes');
            data += '<TeacherID>' + TeacherID + '</TeacherID>';
            data += '<StudentID>' + student.StudentID + '</StudentID>';
            data += '<isNearsighted>' + student.isNearsighted + '</isNearsighted>';
            data += '<isTalkative>' + student.isTalkative + '</isTalkative>';
            data += '<notes>' + student.notes + '</notes>';
            data += getPostData('SetTeacherStudentNotes');
            request.post({
                url : apiurl,
                headers : {
                    "Content-Type": "application/soap+xml; charset=utf-8"
                },
                body : data
            }, function callback(err, httpResponse, body) {
            if (err) {
                console.log(err);
                //res.send("there was an error processing the request.");
            } else {
            
                var response = getResponseData(body);
                //res.send(response);
                /////DO SOMETHING WITH DATA
            }
            });



        } else {
            var StudentID = student.StudentID;
        


            var data = getPreData('RemoveStudentFromClass');
            data += '<StudentID>' + StudentID + '</StudentID>';
            data += '<ClassID>' + classID + '</ClassID>';
            data += getPostData('RemoveStudentFromClass');
            request.post({
                url : apiurl,
                headers : {
                    "Content-Type": "application/soap+xml; charset=utf-8"
                },
                body : data
            }, function callback(err, httpResponse, body) {
            if (err) {
                console.log(err);
                //res.send("there was an error processing the request.");
            } else {
                
                var response = getResponseData(body);
                //res.send(response);
                /////DO SOMETHING WITH DATA
            }
            });


        }
    }
    res.send("Success!"); // TODO figure out

});

app.post('/AddStudentToClass', function(req, res) {
    // TODO check to see if teacher has access
    sess = req.session;
    
    var TeacherID = sess.TeacherID;
    
    var StudentID = req.body.StudentID;
    var ClassID = req.body.ClassID;

    var data = getPreData('AddStudentToClass');
    data += '<ClassID>' + ClassID + '</ClassID>';
    data += '<StudentID>' + StudentID + '</StudentID>';
    data += getPostData('AddStudentToClass');
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

app.post('/GetTeacherStudentNotes', function(req, res){

    sess = req.session;
    
    var TeacherID = sess.TeacherID;
    var StudentID = req.body.StudentID;
    var data = getPreData('GetTeacherStudentNotes');
    data += '<TeacherID>' + TeacherID + '</TeacherID>';
    data += '<StudentID>' + StudentID + '</StudentID>';
    data += getPostData('GetTeacherStudentNotes');
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


// this is called when one of the edits on the roster page is made.
function removeStudentFromClass(StudentID, classID){
    console.log("delete " + StudentID + " from " + classID);


    var data = getPreData('RemoveStudentFromClass');
    data += '<TeacherID>' + TeacherID + '</TeacherID>';
    data += '<StudentID>' + StudentID + '</StudentID>';
    data += getPostData('RemoveStudentFromClass');
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



}

app.post('/GetStudentsInHat', function(req, res) {
    sess = req.session;


    if (sess.username){
        
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

    } else {
        res.send('You need to be logged in');
    }

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

app.post('/ChangeTeacher', function(req, res) {
    sess = req.session;
 	var TeacherID = sess.TeacherID;
    var newTeacherUsername = req.body.username;
    var ClassID = req.body.ClassID;


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
        
        var hasAccess = false;
        for (var c in classes) {
            if (ClassID == classes[c].ClassID)
                hasAccess = true;
        }

        if (hasAccess){
        
            // TODO make this actually change the teacher, 
            // add proper stored procedure
            
            res.send("Success!");
        } else {
            res.send("You don't have access to this class.");
        }

    }
    });       
});

app.post('/DeleteClass', function(req, res) {

    sess = req.session;
    //TODO check if teacher has access to this class

    if (!sess.username){
        res.send("You need to be logged in to do that.");
    } else {

    	var data = getPreData('AddUpdateDeleteClass');
        data += '<ClassID>' + req.body.ClassID + '</ClassID>';
        data += '<Name>' + 'asdf' + '</Name>';
        data += '<delete>' + 'true' + '</delete>';
        data += getPostData('AddUpdateDeleteClass');
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
        

    }
});

app.post("/AddClass", function(req, res){

    sess = req.session;
    if (!sess.username){
        res.send("You need to be logged in to do that.");
    } else {

        var Name = req.body.className;
        var TeacherID = sess.TeacherID;
    	var data = getPreData('AddUpdateDeleteClass');
        data += '<Name>' + Name + '</Name>';
        data += '<TeacherID>' + TeacherID + '</TeacherID>';
        data += getPostData('AddUpdateDeleteClass');
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
        

    }
});

app.post('/AddTeacher', function(req, res) {
    var username = req.body.username;
    var password = req.body.password;
    var fName = req.body.fName;
    var lName = req.body.lName;

    var data = getPreData('AddTeacher');
    data += '<fName>' + fName + '</fName>';
    data += '<lName>' + lName + '</lName>';
    data += '<username>' + username + '</username>';
    data += '<password>' + password + '</password>';
    data += getPostData('AddTeacher');
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

app.post('/DeleteAccount', function (req, res) {
    
    sess = req.session;

    var data = getPreData('UpdateDeleteTeacher');
    data += '<TeacherID>' + sess.TeacherID + '</TeacherID>';
    data += '<fName>' + 'fname'+ '</fName>';
    data += '<lName>' + 'lName' + '</lName>';
    data += '<password>' + 'password' + '</password>';
    data += '<delete>' + 'true' + '</delete>';
    data += getPostData('UpdateDeleteTeacher');
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


app.post('/UpdateAccount', function (req, res) {
    
    sess = req.session;
    var fName = req.body.fName;
    var lName = req.body.lName;
    var password = req.body.password;


    var data = getPreData('UpdateDeleteTeacher');
    data += '<TeacherID>' + sess.TeacherID + '</TeacherID>';
    data += '<fName>' + fName + '</fName>';
    data += '<lName>' + lName + '</lName>';
    data += '<password>' + password + '</password>';
    data += '<delete>' + 'false' + '</delete>';
    data += getPostData('UpdateDeleteTeacher');
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

app.post('/GetAssignmentsByClass', function (req, res) {
    
    sess = req.session;
    var ClassID = req.body.ClassID;

    var data = getPreData('GetAssignmentsByClass');
    data += '<ClassID>' + ClassID + '</ClassID>';
    data += getPostData('GetAssignmentsByClass');
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




app.post('/GetStudentAssignmentsByAssignDate', function (req, res) {
    
    sess = req.session;

    var StudentID = req.body.StudentID;
    var AssignDate = req.body.AssignDate;

    var data = getPreData('GetStudentAssignmentsByAssignDate');
    data += '<StudentID>' + StudentID + '</StudentID>';
    data += '<AssignDate>' + AssignDate + '</AssignDate>';
    data += getPostData('GetStudentAssignmentsByAssignDate');
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


app.post('/GetStudentsMarkedAbsent', function (req, res) {
    
    sess = req.session;
    var fName = req.body.fName;
    var lName = req.body.lName;
    var password = req.body.password;


    var data = getPreData('GetStudentsMarkedAbsent');
    data += '<Day>' + Day + '</Day>';
    data += getPostData('GetStudentsMarkedAbsent');
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



app.post('/GetStudentsTemporarilyAbsent', function (req, res) {
    
    sess = req.session;


    var data = getPreData('GetStudentsTemporarilyAbsent');
    data += getPostData('GetStudentsTemporarilyAbsent');
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

app.post('/GetStudentsWithPerfectAttendance', function (req, res) {
    
    sess = req.session;


    var data = getPreData('GetStudentsWithPerfectAttendance');
    data += getPostData('GetStudentsWithPerfectAttendance');
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


app.post('/GetAbsencesRank', function (req, res) {
    
    sess = req.session;


    var data = getPreData('GetAbsencesRank');
    data += getPostData('GetAbsencesRank');
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


