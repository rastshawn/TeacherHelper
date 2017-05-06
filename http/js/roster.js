var changes = [];

function editButton () {
    $(".studentID").each(function(index){
        var StudentID = $(this).html();
        $(this).parent().prop("StudentID", StudentID); 


        var html = "<div class='btn btn-danger tableButtons removeButton' onclick='deleteStudent(" + 
            StudentID + ", " + index + ")'>Remove</div>";
        html += "<div class='btn btn-warning tableButtons editButton' onclick='editStudent(" +
                    StudentID + ", " + index + ")'>Edit</div>";
        $(this).html(html);

    });

/*
    $(".studentFName").each(function(index){
        var t = $(this);

        t.prop("oldFName", t.html());
        var inputHTML = "<input id='fName" + t.parent().prop("StudentID") + 
            "' class='fNameInput' value = '" + t.html() + "'/> \n";

        t.html(inputHTML);
    });
*/

    
    var submitButton = "<div id='submitEdits' class='btn btn-danger'" +
        " onclick='submitEdits()' >Submit edits</div>";

    $("#mainEditButton").parent().html(submitButton);
    
} 

function deleteStudent(studentID, index) {
    changes.push({index : index, type : "remove"}); 
    var cells = $(".studentID");
    $(cells[index]).html("set to be removed");
    //$(cells[index]).prop("disabled", true);
}

function editStudent(studentID, index) {


        var cells = $(".studentID");
        $(cells[index]).html("editing");

        changes.push({index : index, type : "edit"});


// change first name boxes
        var t = $($(".studentFName")[index]);
        var inputHTML = "<input id='fName" + t.parent().prop("StudentID") + 
            "'  value = '" + t.html() + "'/> \n";

        t.html(inputHTML);

        t = $($(".studentLName")[index]);
        var inputHTML = "<input id='lName" + t.parent().prop("StudentID") + 
            "'  value = '" + t.html() + "'/> \n";

        t.html(inputHTML);

        t = $($(".studentIsTalkative")[index]);
        var checked = "checked";
        if (t.html() == "false") checked = "";
        var inputHTML = "<input type='checkbox' id='isTalkative" + t.parent().prop("StudentID") + 
           "' " + checked + "/> \n";

        t.html(inputHTML);



        t = $($(".studentIsNearsighted")[index]);
        checked = "checked";
        if (t.html() == "false") checked = "";
        var inputHTML = "<input type='checkbox' id='isTalkative" + t.parent().prop("StudentID") + 
           "' " + checked + "/> \n";

        t.html(inputHTML);


}

function submitEdits(){
    var students = [];
    for (var c in changes){
        var change  = changes[c];
        
        var StudentID = $($(".studentID")[change.index]).
            parent().prop("StudentID");
        var fName = $("#fName" + StudentID).val();
        var lName = $("#lName" + StudentID).val();
        var isTalkative = $("#isTalkative" + StudentID).prop("checked");
        var isNearsighted = $("#isNearsighted" + StudentID).prop("checked");

        if (change.type == "edit"){
            var student = { StudentID : StudentID, fName : fName, lName : lName, isTalkative : isTalkative, isNearsighted : isNearsighted, action : "edit"};
        } else {
            var student = { StudentID : StudentID, action : "remove" };
        }
        students.push(student); 
    }
    console.log(students);
    $.ajax({
            url : "/UpdateRoster",
            method:"POST",
            data : {
                students : students,
                ClassID  : ClassID
            },
            success: function(response) {
                //TODO check for errors. 
                // FOR NOW just redirect to rosters page
                window.location.href="/";
            },
            error: function(err) {
                console.log(err);
            }
        });
    
        
}
