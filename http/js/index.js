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
					'onclick="createClass()">\n' +
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
}

function loadAttendance() {
    // load attendance page, send current class number
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
}

function changeTeacher() {
    // create id field, submit button
    var html = '<div class="col-xs-8"><h4>Enter username of new teacher:</h4>' +
        '<input id="teacherID" /></div>' + 
        '<div class="col-xs-4"><div class="btn btn-danger"' + 
        ' onclick="sendNewTeacher()">Submit</div>';
    $("#changeTeacher").parent().html(html);
}

function sendNewTeacher() {
    // contact api
    var teacherID = $("#teacherID").val();
    console.log(teacherID);
}


