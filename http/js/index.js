function editClass(){
    // change buttons div to "change teacher" and "delete class" buttons.
    var buttonHTML = "" + 
		'<div class="container-fluid">\n' + 
            '\t<div class="col-sm-6">\n' +
                '\t\t<div id="changeTeacher" ' +
                    'class="btn btn-warning mainButton" ' + 
					'onclick="changeTeacher()">\n' +
                    '\t\t\t<h4 class="btnText">Change Teacher</h4>\n' + 
                '\t\t</div>\n' +
            '\t</div>\n' +
            '\t<div class="col-sm-6">\n' +
                '\t\t<div id="deleteClass" ' + 
                    'class="btn btn-danger mainButton" ' + 
					'onclick="deleteClass()">\n' +
                    '\t\t\t<h4 class="btnText">Delete Class</h4>\n' +
                '\t\t</div>\n' +
            '\t</div>\n' +
		'</div>';


    buttonHTML += "" +
        '<div class="container-fluid">\n' +
            '\t<div class="col-sm-3"></div>\n' +
            '\t<div class="col-sm-6">\n' +
                '\t\t<div class="btn btn-primary rosterButton" ' +
					'onclick="showNewClassForm(\'button\')">\n' +
                    '\t\t\t<h4 class="rosterButtonText">Create New Class' +
					' </h4>\n' +
                '\t\t</div>\n' +
            '\t</div>\n' +
            '\t<div class="col-sm-3"></div>\n' +
        '</div>';
	$("#buttons").html(buttonHTML);
	
    // change class name h3 to an input box

    var classH3 = $("#h3ClassName");
    var className = classH3.html();

    var inputHTML = '<input type="text" id="classNameInput" />';
    classH3.html(inputHTML);
    $("#classNameInput").val(className);


    // change "edit" button to red, and change text to "submit"

    var editButtonHTML = '<button id="buttonEdit" class="btn btn-danger" ' + 
            'onclick="submitEdits(' + "'" + className + "'" + 
            ')">Submit</button>';

    $("#buttonEdit").parent().html(editButtonHTML);

    // grey out select bar while editing

    $("#selectClasses").prop("disabled", true);

}

function submitEdits(oldClassName) {
    
    var classInputName = $("#classNameInput").val();

    console.log(classInputName == oldClassName);

    // get page reload from server? Maybe manually reload page browser side
}

function loadAssignments() {
    // load the assignments page (get request?) and
    // send the current class number
    window.location.href = "/Assignments?ClassID=" + classes[$("#selectClasses").val()].ClassID;
}

function loadAttendance() {
    // load attendance page, send current class number
    window.location.href = "/Attendance?ClassID=" + classes[$("#selectClasses").val()].ClassID;
}

function loadNamePicker() {
    // load namePicker, send class number
    window.location.href = "/NamePicker?ClassID=" + classes[$("#selectClasses").val()].ClassID;
}

function loadSeatingCharts() {
    // load seating charts, send current class number
}

function loadRoster() {

    window.location.href = "/Roster?ClassID=" + classes[$("#selectClasses").val()].ClassID;
}

function deleteClass() {
    // call api, try to delete class
    var ClassID = classes[$("#selectClasses").val()].ClassID;

    $.ajax({
        url: "/DeleteClass",
        method:"POST",
        data : {
            "ClassID":ClassID
        }, 
        success: function(response){
            window.location.href = '/';
        }, 
        error: function(err) {
            console.log(err);
        }
    });
}

function changeTeacher() {
    // create id field, submit button
    var html = '<div class="col-xs-8"><h4>Enter username of new teacher:</h4>' +
        '<input id="teacherUsername" /></div>' + 
        '<div class="col-xs-4"><div id="changeTeacherSubmitButton" ' + 
        'class="btn btn-danger"' + 
        ' onclick="sendNewTeacher()">Submit</div>';
    $("#changeTeacher").parent().html(html);
}

function sendNewTeacher() {
    // contact api

    var username = $("#teacherUsername").val();
    var ClassID = classes[$("#selectClasses").val()].ClassID; 
    $.ajax({
        url: "/ChangeTeacher",
        method: "POST",
        data : {
            "username" : username,
            "ClassID" : ClassID
        },
        success: function(response){
            console.log(response);
            $("#changeTeacherSubmitButton").html("Success!");
            $("#changeTeacherSubmitButton").removeClass("btn-danger");
            $("#changeTeacherSubmitButton").addClass("btn-success");
        },
        error: function(err) {
            console.log(err);
        }
    });
}

function showNewClassForm(source){

    $("#MyClasses").html("");

    var html = "";

    if (source == "button") {
        // do nothing
    } else {
        html += "<div class='container-fluid'>\n";
        html += "<p>It looks like you don't have any classes.";
        html += " Use the form below to add one!</p>";
        html += "</div>"
    }

    html += "<div class='container-fluid'>";

    html += "<form>";
    html += "\t<div class='form-group'>\n";
    html += "\t\t<label for='newClassName'>Class Name:</label>\n"
    html += "\t\t<input id='newClassName' class='form-control' />\n";
    html += "\t</div>\n";

    html += "\t<div id='btnSubmitNewClass' class='btn btn-primary' ";
    html += "onclick='submitNewClass()'>Submit</div>";
    html += "</form>";


    html += "</div>";

    $("#MyClasses").html(html);

}

function submitNewClass(){

    var className = $("#newClassName").val();
    
    $.ajax({
        url: "/AddClass",
        method: "post",
        data: {
            "className" : className
        },
        success: function(response) {
            // TODO actually write
            location.reload();
            console.log(response);
        },
        error: function(err){
            console.log(err);
        }
    });

}
