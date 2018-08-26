// Update time on banner every second
function timeNow(){
    var currentTime = moment().format("hh:mm A");
    $("#current-time").text(currentTime);
    setTimeout(timeNow, 1000);
}

// Initialize Firebase
var config = {
apiKey: "AIzaSyCNEUq18O4rcSsNDR_0tBModFo1YTU__tk",
authDomain: "train-schedule-f4e47.firebaseapp.com",
databaseURL: "https://train-schedule-f4e47.firebaseio.com",
projectId: "train-schedule-f4e47",
storageBucket: "train-schedule-f4e47.appspot.com",
messagingSenderId: "131811118409"
};
firebase.initializeApp(config);

var database = firebase.database();

// Declare variables to capture user input
var trainName;
var destination;
var startTime;
var frequency;

// Reset variable values to default
function reset(){
    trainName = "";
    destination = "";
    startTime = "";
    frequency = 0;
}

// When user adds train info and clicks submit
$("#add-train-btn").on("click", function(event){
    event.preventDefault(); // Stops the page from refreshing
    reset(); // Reset variables
    
    // Populate variables with data from user
    trainName = $("#train-name-input").val().trim();
    destination = $("#dest-input").val().trim();
    startTime = $("#first-input").val().trim();
    frequency = $("#frequency-input").val().trim();

    if (trainName === "" || destination === "" || startTime === "" || frequency === "") { // If any of the fields is blank
        $("#message").text("All fields are required"); // Alert the user
        reset();
    
    } else {
        $("#message").text(""); // Clear the alert
        $(".form-control").val(""); // Clear the form fields
        
        //Push the data to Firebase
        database.ref().push({
            trainName: trainName,
            destination: destination,
            startTime: startTime,
            frequency: frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
        });
        $("#message").text("Train added successfully");
        window.location.reload();
    }
});

database.ref().on("child_added", function(childSnapshot) {

    var trainName = childSnapshot.val().trainName;
    var destination = childSnapshot.val().destination;
    var startTime = childSnapshot.val().startTime;
    var frequency = childSnapshot.val().frequency;
    var key = childSnapshot.key;

    var startTimeConverted = moment(startTime, "HH:mm").subtract(1, "years"); // Push train start time back 1 year to ensureit is in the past
    var timeDiff = moment().diff(moment(startTimeConverted), "minutes"); // Difference in minutes between current time and the train start time (from last year)
    var timeRemain = timeDiff % frequency; // To figure out how many minutes have passed since the last train
    var minToArrival = frequency - timeRemain; // Returns the minutes remaining until next train
    var nextTrain = moment().add(minToArrival, "minutes"); // Calculates the arrival time of next train
    
    // Populate the table
    // Add a button to allow user to delete the train records
    var trainRow = $("<tr>");
    trainRow.append($("<td>" + trainName + "</td>"));
    trainRow.append($("<td>" + destination + "</td>"));
    trainRow.append($("<td>" + frequency + "</td>"));
    trainRow.append($("<td>" + moment(nextTrain).format("hh:mm A") + "</td>"));
    trainRow.append($("<td>" + minToArrival + "</td>"));
    trainRow.append($("<td><button class='delete btn btn-danger btn-sm' data-key='" + key + "'>&times;</button></td>"));
    $("#train-rows").append(trainRow);
});

$(document).on("click", ".delete", function() {
    var keyref = $(this).data("key");
    database.ref().child(keyref).remove();
    window.location.reload();
  });

timeNow();