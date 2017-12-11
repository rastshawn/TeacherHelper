"use strict";
/////////////////////////////////////////////////// Server
/*
var connect = require('connect');
var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname + "/http")).listen(3000, function(){
	console.log('Server running on 3000');
});
*/
var apiurl = "http://ec2-54-69-225-248.us-west-2.compute.amazonaws.com/TeacherHelperNET/WebService.asmx";
let PORT = 3511;
/////////////////////////////////////////////////// Backend

var request = require('request');
var express = require('express');
var session = require('express-session');
var app = express();
var bodyParser = require('body-parser');

var sql = require('mssql');
var account = require('./account');

app.use(bodyParser.urlencoded());
app.use(express.static('http'));
app.set('views', __dirname + '/html');
app.engine('html', require('ejs').renderFile);
app.use(session({secret : 'secret'}));



function getResults(query, callback) {
	sql.connect(account.config, function() {
		var request = new sql.Request();
		request.query(query, function(err, records){
			if (err) console.log(err);
			else callback(records);
		})
	});
}

var Parameter = function(name, type, value){
	this.name = name;
	this.type = type;
	this.value = value;
}

sql.connect(account.config, function() {
	
});

function execProcedure(procedure, params,/* type, */callback) {
	// procedure: string containing procedure name
	// params: array of parameter objects:
	// {
	// 	name: "string",
	//	type: sql.Int, sql.VarChar(50),
	//	value: val
	// }

	var request = new sql.Request();
	
	for (var i = 0; i<params.length; i++) {
		request.input(params[i].name, params[i].type, params[i].value);
	}
	
	// maybe include request.type here
	request.execute(procedure, function(err, result) {
		if (result){
			callback(err, result.recordsets[0]);
		}
		else if (err) {
			console.log(err);
		}
		
	});

}


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


app.listen(PORT, function() {
	console.log('backend running on port ' + PORT);
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

	var usernameParam = new Parameter("username", sql.VarChar(30), username);
	var passwordParam = new Parameter("password", sql.VarChar(30), password);
	
	var params = [usernameParam, passwordParam];
	
	execProcedure('spLogin', params, function(err, response){
		
		if (err) {
			res.send("Error, please try again");
		} else {	
			var teacher = response[0];
			if (teacher.Status == "login successful"){
	            sess.username = req.body.username;
	            sess.TeacherID = teacher.TeacherID;
	            sess.fName = teacher.fName;
	            sess.lName = teacher.lName;
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
        
        var nameParam = new Parameter(
			"AssignmentName", 
			sql.VarChar(30), 
			Name
		);
		var assignDateParam = new Parameter(
			"AssignDate",
			sql.DateTime, // TODO test dates
			AssignDate
		);
		var classIDParam = new Parameter(
			"ClassID",
			sql.Int,
			ClassID
		);
		var params = [
			nameParam,
			assignDateParam, 
			classIDParam
		];
        
        execProcedure('spAddAssignment', params, function(err, response) {
			if (err) res.send("Error");
			else {
				console.log(response[0]);
				res.send(response[0]);
			}
			
		});


    }
});



app.post('/DeleteAssignment', function(req, res) {
    sess = req.session;

    if (sess.username) {
        var AssignmentID = req.body.AssignmentID;
        
        var AssignmentIDParam = new Parameter(
			"AssignmentID",
			sql.Int,
			AssignmentID
		);
		
		var params = [AssignmentIDParam];
		
		execProcedure('spDeleteAssignment', params, function(err, response) {
			if (err) res.send("Error");
			else {
				res.send(response);
			}
		});
        
        /*
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
        */
           

    }
});


app.post('/LoadAttendance', function(req, res) {
	var Day = req.body.Day;
    var ClassID = req.body.ClassID;
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	
	var DayParam = new Parameter(
		'Day',
		sql.DateTime,
		Day
	);
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int,
		ClassID
	);
	
	var params = [
		DayParam, 
		ClassIDParam
	];
	
	execProcedure(
		'spGetAttendanceByClassAndDay', 
		params, 
		function(err, response) {
			if (err) res.send("There was an error processing the request.");
			else res.send(response);
	});
	
	/*
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
	*/
});



app.post('/SubmitAttendance', function(req, res) {
	var ClassID = req.body.ClassID;
    var records = req.body.Records;
    sess = req.session;
    
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}


	var ClassIDParam = new Parameter(
		"ClassID",
		sql.Int,
		ClassID
	);
	// YOU LEFT OFF HERE
	
	var recordsRemaining = records.length;
	var numErrors = 0;
	var numSuccesses = 0;
	
    for (var r in records) {
        var record = records[r];
        
        var StudentIDParam = new Parameter(
			"StudentID",
			sql.Int,
			record.StudentID
		);
		var DayParam = new Parameter(
			"Day",
			sql.DateTime,
			record.Day
		);
		var AttendanceIDParam = new Parameter(
			"AttendanceID",
			sql.Int,
			-1
		);
		var IsPresentParam = new Parameter(
			"isPresent",
			sql.Bit,
			record.isPresent
		);
			
		var params = [
			ClassIDParam,
			StudentIDParam, 
			DayParam,
			AttendanceIDParam, 
			IsPresentParam
		];
        
        execProcedure('spAddUpdateAttendance', params, function(err, response) {
			// check to see if all records have been updated
			recordsRemaining--;
			if (err) numErrors++;
			else numSuccesses++;
			
			if (recordsRemaining == 0) {
				res.send(numSuccesses + 
					" records updated successfully, with " + 
					numErrors + " errors."
				);
			}
		});
	}
        /*
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
	*/
});




app.get('/GetStudents', function(req, res) {
	//data goes here
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
		return;
	}
	
	execProcedure('spGetStudents', [], function(err, response) {
		if (err) res.send("There was an error processing the request.");
		else res.send(response);
	});
	/*
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
	*/
});

//////// THE REST AUTOMATICALLY GENERATED

app.post('/GetClassesByTeacher', function(req, res) {
	var TeacherID = req.body.TeacherID;
	sess = req.session;
	if (!sess.username) {
		res.send('You need to be logged in to do that.');
	}
	
	var TeacherIDParam = new Parameter(
		"TeacherID",
		sql.Int,
		TeacherID
	);
	
	var params = [TeacherIDParam];
	
	execProcedure('spGetClassesByTeacher', params, function(err, response) {
		if (err) res.send("Error");
		else res.send(response);
	});
	/*
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
	* */
});

app.get('/GetClasses', function(req, res) {
    
    sess = req.session;
    if (!sess.username) {
        res.render('login.html');
    }

	var TeacherID = sess.TeacherID;

	var TeacherIDParam = new Parameter(
		"TeacherID",
		sql.Int,
		TeacherID
	);
	
	var params = [TeacherIDParam];
	
	execProcedure('spGetClassesByTeacher', params, function(err, response) {
		if (err) res.send("Error");
		else res.send(response);
	});
/*
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
*/
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

	var TeacherIDParam = new Parameter(
		"TeacherID",
		sql.Int,
		TeacherID
	);

	var params = [TeacherIDParam];
	
	execProcedure('spGetClassesByTeacher', params, function(err, response) {
		if (err) res.send("There was a problem with your request.");
		else {
			
			var classes = response;
			var ClassID = req.body.ClassID;
			
			
			
			var hasAccess = false;
			for (var c = 0; c<classes.length; c++) {
				
				if (ClassID == classes[c].ClassID) {
					hasAccess = true;
				}
			}
			
			
			if (hasAccess) {
				var ClassIDParam = new Parameter(
					"ClassID",
					sql.Int,
					ClassID
				);
				params = [ClassIDParam];
				
				execProcedure('spGetStudentsByClass', params, 
					function(err_2, response_2) {
						if (err_2) res.send("There was a problem with your request");
						else {
							console.log(response_2);
							res.send(response_2);
						}
					}
				);
				
			} else {
				res.send("You don't have access to this class!");
			}
		}
	});
	/*
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
    */     

});

app.post('/UpdateRoster', function(req, res) {


    sess = req.session;
    // TODO make app check for login / access to class

    var TeacherID = sess.TeacherID;
    var ClassID = req.body.ClassID;
    var edits = req.body.students;

	var numErrors = 0;
	var numSuccesses = 0;
	var numStudentsRemaining = edits.length;
	
	var whenFinished = function() {
		console.log("finished");
		res.send(numSuccesses + " records updated, with " + numErrors + " failures");
	};

	var TeacherIDParam = new Parameter(
		'TeacherID',
		sql.Int,
		TeacherID
	);
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int, 
		ClassID
	);
   
    for (var e in edits) {
        var student = edits[e];
        if (student.action=="edit") {

            if (!student.isNearsighted) {
                student.isNearsighted = false;
            }

            if (!student.isTalkative) {
                student.isTalkative = false;
            }

			var StudentIDParam = new Parameter(
				'StudentID',
				sql.Int,
				student.StudentID
			);
			var isNearsightedParam = new Parameter(
				'isNearsighted',
				sql.Bit, 
				student.isNearsighted
			);
			
			var isTalkativeParam = new Parameter(
				'isTalkative',
				sql.Bit, 
				student.isTalkative
			);
			var notesParam = new Parameter(
				'notes',
				sql.Text,
				student.notes
			);
			
			var params = [
				TeacherIDParam, 
				StudentIDParam,
				isNearsightedParam,
				isTalkativeParam,
				notesParam
			];
			
			execProcedure('spSetTeacherStudentNotes', params, function(err, response) {
				
				if (err) numErrors++;
				else numSuccesses++;
				
				if (--numStudentsRemaining == 0){
					whenFinished();
				}
				
			});
				
        } else {
            var StudentID = student.StudentID;
        
			
			var StudentIDParam = new Parameter(
				'StudentID',
				sql.Int,
				student.StudentID
			);
			
			var params = [
				StudentIDParam, 
				ClassIDParam
			];
			
			execProcedure('spRemoveStudentFromClass', params, function(err, response) {
				if (err) numErrors++;
				else numSuccesses++;
				
				if (--numStudentsRemaining == 0){
					whenFinished();
				}
			});


        }
    }

});

app.post('/AddStudentToClass', function(req, res) {
    // TODO check to see if teacher has access
    sess = req.session;
    
    var TeacherID = sess.TeacherID;
    
    var StudentID = req.body.StudentID;
    var ClassID = req.body.ClassID;
    
    var StudentIDParam = new Parameter(
		'StudentID',
		sql.Int,
		StudentID
	);
	
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int, 
		ClassID
	);
	
	var params = [
		StudentIDParam, 
		ClassIDParam
	];
	
	execProcedure('spAddStudentToClass', params, function(err, response) {
		if (err) res.send("There was an error processing the request.");
		else res.send(response);
	});
});

app.post('/GetTeacherStudentNotes', function(req, res){

    sess = req.session;
    
    var TeacherID = sess.TeacherID;
    var StudentID = req.body.StudentID;
    
    var TeacherIDParam = new Parameter(
		'TeacherID',
		sql.Int,
		TeacherID
	);
	var StudentIDParam = new Parameter(
		'StudentID',
		sql.Int,
		StudentID
	);
	var params = [
		TeacherIDParam,
		StudentIDParam
	];
	execProcedure('spGetTeacherStudentNotes', params, function(err, response) {
		if(err) {
			console.log(err);
			res.send("there was an error processing the request.");
		} else {
			
			res.send(response);
		}
	});
	
});


// this is called when one of the edits on the roster page is made.
function removeStudentFromClass(StudentID, classID){
    console.log("delete " + StudentID + " from " + classID);

	var TeacherIDParam = new Parameter(
		'TeacherID',
		sql.Int,
		TeacherID
	);
	var StudentIDParam = new Parameter(
		'StudentID',
		sql.Int,
		StudentID
	);
	var params = [
		TeacherIDParam,
		StudentIDParam
	];
	execProcedure('spRemoveStudentFromClass', params, function(err, response) {
		if(err) {
	        res.send("there was an error processing the request.");
		} else {
	        res.send(response);
		}
	});
}


//TODO fix
app.post('/GetStudentsInHat', function(req, res) {
    sess = req.session;


    if (sess.username){
		
		
        
        // check if class is one owned by teacher
        var TeacherID = sess.TeacherID;
		var TeacherIDParam = new Parameter(
			"TeacherID",
			sql.Int,
			TeacherID
		);
	
		var params = [TeacherIDParam];
		
		execProcedure('spGetClassesByTeacher', params, function(err, response) {
			if (err) res.send("There was a problem with your request.");
			else {
				
				var classes = response;
				var ClassID = req.body.ClassID;
				
				
				
				var hasAccess = false;
				for (var c = 0; c<classes.length; c++) {
					
					if (ClassID == classes[c].ClassID) {
						hasAccess = true;
					}
				}
				
				
				if (hasAccess) {
					var ClassIDParam = new Parameter(
						"ClassID",
						sql.Int,
						ClassID
					);
					params = [ClassIDParam];
					
					execProcedure('spGetNamesInHat', params, 
						function(err_2, response_2) {
							if (err_2) res.send("There was a problem with your request");
							else {
								console.log(response_2);
								res.send(response_2);
							}
						}
					);
					
				} else {
					res.send("You don't have access to this class!");
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
    
    var StudentIDParam = new Parameter(
		'StudentID',
		sql.Int,
		StudentID
	);
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int,
		ClassID
	);
	var params = [
		StudentIDParam,
		ClassIDParam
	];
	execProcedure('spDrawStudentFromHat', params, function(err, response) {
		if(err) {
	        res.send("there was an error processing the request.");
		} else {
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
		return;
	}
	
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int,
		ClassID
	);
	var params = [
		ClassIDParam
	];
	execProcedure('spResetHat', params, function(err, response) {
		if(err) {
	
		} else {
	
		}
	});
});

// TODO not working
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
		var ClassIDParam = new Parameter(
			'ClassID',
			sql.Int,
			req.body.ClassID
		);
		var NameParam = new Parameter(
			'Name',
			sql.VarChar(30),
			'asdf'
		);
		var deleteParam = new Parameter(
			'delete',
			sql.Bit,
			true
		);
		var params = [
			ClassIDParam,
			NameParam,
			deleteParam
		];
		execProcedure('spAddUpdateDeleteClass', params, function(err, response) {
			if(err) {
				res.send("there was an error processing the request.");
			} else {
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
    	
    	var nameParam = new Parameter(
			"Name",
			sql.VarChar(30),
			Name
		);
		var TeacherIDParam = new Parameter(
			"TeacherID",
			sql.Int,
			TeacherID
		);
		var params = [
			nameParam,
			TeacherIDParam
		];
    	
    	execProcedure("spAddUpdateDeleteClass", params, function(err, response) {
			if (err) {
	            console.log(err);
	            res.send("there was an error processing the request.");
	        } else {
	            res.send(response);
	        }
		});
    }
});

app.post('/AddTeacher', function(req, res) {
    var username = new Parameter("username", sql.VarChar(30), req.body.username);
    var password = new Parameter("password", sql.VarChar(30), req.body.password);
    var fName = new Parameter("fName", sql.VarChar(30), req.body.fName);
    var lName = new Parameter("lName", sql.VarChar(30), req.body.lName);
    var params = [
		username, 
		password, 
		fName, 
		lName
    ];

	execProcedure('spAddTeacher', params, function(err, response) {
		if (err) res.send("Error");
		else {
			res.send(response);
			console.log(response);
		}
    });
});

app.post('/DeleteAccount', function (req, res) {
    
    sess = req.session;
	var TeacherIDParam = new Parameter(
		'TeacherID',
		sql.Int,
		sess.TeacherID
	);
	var fNameParam = new Parameter(
		'fName',
		sql.VarChar(30),
		'fName'
	);
	var lNameParam = new Parameter(
		'lName',
		sql.VarChar(30),
		'lName'
	);
	var passwordParam = new Parameter(
		'password',
		sql.VarChar(30),
		'pasword'
	);
	var deleteParam = new Parameter(
		'delete',
		sql.Bit,
		true
	);
	var params = [
		TeacherIDParam,
		fNameParam,
		lNameParam,
		passwordParam,
		deleteParam
	];
	execProcedure('spUpdateDeleteTeacher', params, function(err, response) {
		if(err) {
			res.send("there was an error processing the request.");
		} else {
			res.send(response);
		}
	});
});


app.post('/UpdateAccount', function (req, res) {
    
    sess = req.session;
    var fName = req.body.fName;
    var lName = req.body.lName;
    var password = req.body.password;

	var TeacherIDParam = new Parameter(
		'TeacherID',
		sql.Int,
		sess.TeacherID
	);
	var fNameParam = new Parameter(
		'fName',
		sql.VarChar(30),
		fName
	);
	var lNameParam = new Parameter(
		'lName',
		sql.VarChar(30),
		lName
	);
	var passwordParam = new Parameter(
		'password',
		sql.VarChar(30),
		password
	);
	var deleteParam = new Parameter(
		'delete',
		sql.Bit,
		false
	);
	var params = [
		TeacherIDParam,
		fNameParam,
		lNameParam,
		passwordParam,
		deleteParam
	];
	execProcedure('spUpdateDeleteTeacher', params, function(err, response) {
		if(err) {
			res.send("there was an error processing the request.");
		} else {
			res.send(response);
		}
	});
});

app.post('/GetAssignmentsByClass', function (req, res) {
    
    sess = req.session;
    var ClassID = req.body.ClassID;
	var ClassIDParam = new Parameter(
		'ClassID',
		sql.Int,
		ClassID
	);
	var params = [
		ClassIDParam
	];
	execProcedure('spGetAssignmentsByClass', params, function(err, response) {
		if(err) {
			res.send("there was an error processing the request.");
		} else {
			res.send(response);
		}
	});
});




app.post('/GetStudentAssignmentsByAssignDate', function (req, res) {
    
    sess = req.session;

    var StudentID = req.body.StudentID;
    var AssignDate = req.body.AssignDate;

	var StudentIDParam = new Parameter(
		'StudentID',
		sql.Int,
		StudentID
	);
	var AssignDateParam = new Parameter(
		'AssignDate',
		sql.DateTime,
		AssignDate
	);
	var params = [
		StudentIDParam,
		AssignDateParam
	];
	execProcedure('spGetStudentAssignmentsByAssignDate', params, function(err, response) {
		if(err) {
			res.send('there was an error processing the request.');
		} else {
			res.send(response);
		}
	});
   
});


app.post('/GetStudentsMarkedAbsent', function (req, res) {
    
    sess = req.session;
  
	var DayParam = new Parameter(
		'Day',
		sql.DateTime,
		req.body.Day
	);
	var params = [
		DayParam
	];
	execProcedure('spGetStudentsMarkedAbsent', params, function(err, response) {
		if(err) {
			res.send('there was an error processing the request.');
		} else {
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


