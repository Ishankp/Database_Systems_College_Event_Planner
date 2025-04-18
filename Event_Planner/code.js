const urlBase = ""; // leave as is or set to your domain if needed
const extension = 'php';
const apiUrl = "http://localhost/Event_planner/api.php";
//insert javascript here for website


//grabs the input from the username and password text boxes
$('#loginButton').click(function () {
     var login = $("#username").val();
     var password = $("#password").val();
 
     if (login === '' || password === '') {
         $('#errorBoxLogin').html("Error: please fill in all boxes").show();
         return;
     }
 
     $.ajax({
         type: "POST",
         url: "api.php",  // Adjust this to your API file location.
         data: {
             action: "loginUser",
             email: login,
             password: password
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 // Optionally store UID and role in localStorage.
                 localStorage.setItem('uid', response.uid);
                 localStorage.setItem('role', response.role);
 
                 // Redirect based on role.
                 if (response.role === "superadmin") {
                     window.location.href = "superAdmin_home.html";
                 } else if (response.role === "admin") {
                     window.location.href = "admin_home.html";
                 } else {
                     window.location.href = "home.html";
                 }
             } else {
                 $('#errorBoxLogin').html(response.message).show();
             }
         },
         error: function(jqXHR, textStatus) {
             $('#errorBoxLogin').html("Error: " + textStatus).show();
         }
     });
 });

//checks if all boxes are filled out
$('#signUpButton').click(function checkCredentials(){

     var firstName = document.getElementById("firstName").value;
     var lastName = document.getElementById("lastName").value;
     var email = document.getElementById("email").value;
     var phone = document.getElementById("phone").value;
     var username = document.getElementById("username").value;
	var password = document.getElementById("password").value;
     if(firstName === '' || lastName === '' || email === '' || phone === '' || username === '' || password === ''){
          $('#errorBox').html("Error: please fill in all boxes");
          $('#errorBox').show();
     }else{
          $('#errorBox').hide();
          let universities = ["UCF","USF","FSU","UF"];
          const container = document.getElementById("signUpBox");
          container.innerHTML = 
          `
               <h2 class = "text-center">Select a University</h2>
               <select class="form-control" id="universities">
                    <option value = ""></option>
               </select>
               <br>
               <button class = "btn btn-large btn-primary" id = "makeUser" onClick="makeUser('${firstName}', '${lastName}', '${email}', '${phone}', '${username}', '${password}')">Create Account</button>
          `
          ;
          let dropDown = document.getElementById("universities");
          universities.forEach(x => {
               let option = document.createElement("option");
               option.text = x;
               dropDown.add(option);
           });
          
     }
     
});

// Use 'let' so we can update last_uid
const uid = localStorage.getItem('uid');
let last_uid = uid || 1011; // Initialize uid outside the function to keep track of it
const uidmaker = () => {
     let uid = Number(last_uid + 1); // Increment the uid by 1
     console.log(uid);
     last_uid = uid;         // Update last_uid to the new uid
     return uid.toString();  // Return the new uid as a string
};

let last_eventid = 3010 || eventid; 
const eventIdMaker = () => {
     let eventid = Number(last_eventid + 1);
     last_eventid = eventid;        
     return eventid.toString();  
};

function makeUser(first, last, email, phone, username, password) {
     const dropDown = document.getElementById("universities");
 
     if (!dropDown) {
         console.error("Dropdown not found!");
         return;
     }
 
     const university = dropDown.value;
 
     if (!university) {
         $('#errorBox').html("Error: You must pick a University").show();
     } else {
         $('#errorBox').hide();
         // Get a new uid from uidmaker
         let uid = uidmaker(); 
 
         $.ajax({
            type: "POST",
            url: apiUrl,  // Ensure apiUrl is correctly defined as the absolute URL to your API file
            data: {
                action: "registerUser",
                uid: uid,
                university: university,
                email: email,
                firstname: first,
                lastname: last,
                phone: phone,
                password: password
            },
            dataType: "json",
            success: function(response) {
                if (response.success) {
                    // Registration successful
                    window.location.href = "index.html"; // Redirect as needed
                } else {
                    $('#errorBox').html("Error: " + response.message).show();
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                $('#errorBox').html("Error: " + textStatus).show();
            }
         });
     }
}


//used for normal password box in both login and sign up sheets
$('#check-show').click(function(){
     if('password' == $('#password').attr('type')){
          $('#password').prop('type', 'text');
     }else{
          $('#password').prop('type', 'password');
     }
 });

 //used for confirm password box in sign-up sheet
 $('#check-show-2').click(function(){
     if('password' == $('#password-2').attr('type')){
          $('#password-2').prop('type', 'text');
     }else{
          $('#password-2').prop('type', 'password');
     }
 });


//start of student view functions (some of these functions as also used in admin and superAdmin)

//holds all event data (functions will trim this to fit specifications like "approved events" or "Events you've signed up for")

let events = []; // Global array (if needed elsewhere)
const rowsPerPage = 6;
let currentPage = 1;

$(document).ready(function() {
    const uid = localStorage.getItem('uid');
    // Load events and then fetch detailed info for each event.
    loadAllAndSpecificEvents(uid);
});

// Function to load all events (returns basic info, such as EventID) then load full details.
function loadAllAndSpecificEvents(uid) {
    $.ajax({
        type: "POST",
        url: apiUrl,
        data: { 
            action: "loadAllEvents",
            uid: uid
        },
        dataType: "json",
        success: function(response) {
            if (response.success) {
                // Use a local variable to store the partial events
                const partialEvents = response.events; // Expected to be an array with at least an "EventID" field
                // Create an empty array to store the detailed events.
                const detailedEvents = [];
                
                // Map each partial event to an AJAX call for detailed data:
                const detailRequests = partialEvents.map(event => {
                    return $.ajax({
                        type: "POST",
                        url: apiUrl,
                        data: {
                            action: "loadSpecificEvent",
                            eventID: event.EventID // Make sure this key matches what loadAllEvents returns.
                        },
                        dataType: "json"
                    });
                });
                
                // When all AJAX calls for details complete.
                $.when(...detailRequests)
                    .done(function() {
                        // If there's only one event, $.when returns a single response.
                        if (detailRequests.length === 1) {
                            const res = arguments[0]; // arguments[0] is the JSON response.
                            if (res.success) {
                                detailedEvents.push(res);
                            }
                        } else {
                            // For multiple responses, each argument is an array [data, textStatus, jqXHR].
                            for (let i = 0; i < arguments.length; i++) {
                                const res = arguments[i][0];
                                if (res.success) {
                                    detailedEvents.push(res);
                                }
                            }
                        }
                        // Display the detailed events in the table.
                        displayDetailedEvents(detailedEvents, partialEvents);
                    })
                    .fail(function() {
                        $("#availableEvents").html("<tr><td colspan='7'>Error loading event details.</td></tr>");
                    });
            } else {
                $("#availableEvents").html("<tr><td colspan='7'>Error: " + response.message + "</td></tr>");
            }
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#availableEvents").html("<tr><td colspan='7'>Error: " + textStatus + "</td></tr>");
        }
    });
}


function displayDetailedEvents(events, eventIDs) {
    const table = $("#availableEvents");

    // Build the table header – note that we provide 7 columns here:
    // Event Name, Description, Time, Location, University, Type, and RSO Name.
    table.html(`
        <tr>
            <th>Event Name</th>
            <th>Description</th>
            <th>Time</th>
            <th>Location</th>
            <th>University</th>
            <th>Type</th>
            <th>RSO Name</th>
            <th>Leave a comment</th>
            <th>Show Comments</th>
        </tr>
    `);

    // Build each table row based on the detailed event data.
    let i = 0;
    events.forEach(event => {
        // If the event is not an RSO event, we leave rsoName blank.
        const eventID = eventIDs[i].EventID;
        const rsoDisplay = (event.type === "RSO" && event.rsoName) ? event.rsoName : "";
        const row = `
            <tr>
                <td>${event.eventName}</td>
                <td>${event.description}</td>
                <td>${event.eventTime}</td>
                <td>${event.location_name}</td>
                <td>${event.university}</td>
                <td>${event.type}</td>
                <td>${rsoDisplay}</td>
                <td><button onClick = "rateEvent(${eventID})">Comment</button></td>
                <td><button onClick = "showComments(${eventID})">Show Comments</button></td>
            </tr>
        `;
        table.append(row);
        i++;
    });
}
 

 function updatePagination(currentPage, eventList) {
     const pageCount = Math.ceil(eventList.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayEvents(i, eventList);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

//subsets of events 
let approvedEvents = getApprovedEvents(events);
let unapprovedEvents = getUnapprovedEvents(events);



function searchEvents(){
     const searchValue = document.getElementById("EventSearchBar").value;
     alert("User is searching for \"" + searchValue + "\"");
}

function getApprovedEvents(events){
     let approvedEvents = [];
     events.forEach(item => {
          if(item.approved){
               approvedEvents.push(item);
          }
     });
     return approvedEvents;
}

function getUnapprovedEvents(events){
     let approvedEvents = [];
     events.forEach(item => {
          if(!(item.approved)){
               approvedEvents.push(item);
          }
     });
     return approvedEvents;
}

//expands the event details when the expand button is clicked
function expandEvent(eventId) {
     // Get the actual event using the button's ID (which is the name with hyphens)
     const event = events.find(e => e.name.replace(/\s+/g, '-') === eventId);
 
     if (event) {
         const container = document.getElementById("main_space");
          container.innerHTML = 
          `
               <h2>Event Details:</h2>
               <h5 class = "eventTypeStyling">Name: ${event.name}</h5>
               <h5 class = "eventTypeStyling">Name: ${event.type}</h5>
               <h5 class = "eventTypeStyling">Description: ${event.description}</h5>
               <h5 class = "eventTypeStyling">Date: ${event.date}</h5>
               <h5 class = "eventTypeStyling">Time: ${event.time}</h5>
               <h5 class = "eventTypeStyling">Location: ${event.location}</h5>
               <h5 class = "eventTypeStyling">University: ${event.University}</h5>
               <h5 class = "eventTypeStyling">RSO: ${event.RSO}</h5>
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "joinEvent" >Join</button>
          `;
     } else {
         alert("Event not found.");
     }
 }

 function displayUserEvents(page, eventList) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     
     const slicedData = eventList.slice(startIndex, endIndex);

     // Clear existing table rows
     table.innerHTML = 
     `
     <tr>
          <th>Name</th>
          <th>Date</th>
          <th>Time</th>
          <th>Location</th>
          <th>Rating</th>
          <th></th>
     </tr>
     `;

     // Add new rows to the table
     slicedData.forEach(item => {
          
               const row = table.insertRow();
               const nameCell = row.insertCell(0);
               const dateCell = row.insertCell(1);
               const timeCell = row.insertCell(2);
               const locationCell = row.insertCell(3); 
               const ratingButton = row.insertCell(4);
               const expandButton = row.insertCell(5);
               
               
               const name = item.name;
               const date = item.date;
               const time = item.time;
               const lcoation = item.location;
               const university = item.university;

               nameCell.innerHTML = item.name;
               dateCell.innerHTML = item.date;
               timeCell.innerHTML = item.time;
               locationCell.innerHTML = item.location;
               ratingButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "rateEvent(this.id)">Rate</button>';
               expandButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "expandUserEvent(this.id)">Expand</button>';

     });

     // Update pagination
     updateUserEventsPagination(page, eventList);
 }

 function rateEvent(eventId) {
     const container = document.getElementById("main_space");
     container.innerHTML = 
     `
         <h2>Rate The Event</h2>
         <div class="eventTypeStyling">
             <label>Enter your comments here: (max 200 characters)</label>
             <input type="text" class="form-control" data-bs-theme="dark" id="comment">
         </div>
         <div class="eventTypeStyling">
             <label>Please rate the event:</label>
             <select name="eventType" class="form-control" data-bs-theme="dark" id="rating">
                 <option value="1">Poor</option>
                 <option value="2">Fair</option>
                 <option value="3">Good</option>
                 <option value="4">Great</option>
                 <option value="5">Excellent</option>
             </select>
         </div>
         <button class="btn btn-large btn-dark eventTypeStyling" id="${eventId}" onClick="createRating(this.id)">Rate</button>
     `;
 }
 

 function createRating(eventId){
     const comment = document.getElementById("comment").value;
     const rating = document.getElementById("rating").value;
     const uid = localStorage.getItem('uid');
     if(!(comment)){
          alert("Please enter a comment and select a rating");
          return;
     }
     // Make AJAX call to create the comment.
    $.ajax({
          type: "POST",
          url: apiUrl,  // Make sure apiUrl is set correctly.
          data: {
               action: "createComment",
               uid: uid,
               eventid: eventId,   // eventId should be the event's identifier as required by your API
               text: comment,
               rating: rating
          },
          dataType: "json",
          success: function(response) {
          if (response.success) {
               alert("Comment created successfully!");
               // Optionally update the UI or clear the comment fields:
               document.getElementById("comment").value = "";
               document.getElementById("rating").selectedIndex = 0;
          } else {
               alert("Error: " + response.message);
          }
          },
          error: function(jqXHR, textStatus) {
               alert("Error: " + textStatus);
          }
     });
     
 }



 function updateUserEventsPagination(currentPage, eventList) {
     const pageCount = Math.ceil(eventList.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             event.preventDefault();
             displayUserEvents(i, eventList);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

 function expandUserEvent(eventId) {
     // Get the actual event using the button's ID (which is the name with hyphens)
     const event = events.find(e => e.name.replace(/\s+/g, '-') === eventId);
 
     if (event) {
         const container = document.getElementById("main_space");
          container.innerHTML = 
          `
               <h2>Event Details:</h2>
               <h5 class = "eventTypeStyling">Name: ${event.name}</h5>
               <h5 class = "eventTypeStyling">Type: ${event.type}</h5>
               <h5 class = "eventTypeStyling">Description: ${event.description}</h5>
               <h5 class = "eventTypeStyling">Date: ${event.date}</h5>
               <h5 class = "eventTypeStyling">Time: ${event.time}</h5>
               <h5 class = "eventTypeStyling">Location: ${event.location}</h5>
               <h5 class = "eventTypeStyling">University: ${event.university}</h5>
               <h5 class = "eventTypeStyling">RSO: ${event.RSO}</h5>
               <button class="btn btn-large btn-dark eventTypeStyling" id="Comments" onClick="showComments('${event.name.replace(/\s+/g, '-')}')">Comments</button>
          `;
     } else {
         alert("Event not found.");
     }
 }

 function showComments(eventId) {
     // First, get the specific event details (to obtain the event name)
     $.ajax({
         type: "POST",
         url: apiUrl, 
         data: {
             action: "loadSpecificEvent",
             eventID: eventId
         },
         dataType: "json",
         success: function(eventResponse) {
             // Use the event name from the response or a fallback if something goes wrong.
             let eventName = eventResponse.success ? eventResponse.eventName : "Event " + eventId;
             
             // Now fetch the comments for that event.
             $.ajax({
                 type: "POST",
                 url: apiUrl,  
                 data: {
                     action: "loadEventComments",
                     eventid: eventId
                 },
                 dataType: "json",
                 success: function(commentsResponse) {
                     if (commentsResponse.success) {
                         const container = document.getElementById("main_space");
                         let htmlOutput = `<h2>Comments for ${eventName}:</h2>`;
 
                         if (commentsResponse.comments && commentsResponse.comments.length > 0) {
                             htmlOutput += "<ul>";
                             commentsResponse.comments.forEach(comment => {
                                 htmlOutput += `<li>
                                     <strong>${comment.firstname} ${comment.lastname}:</strong>
                                     "${comment.text}" - Rating: ${comment.rating}/5
                                 </li>`;
                             });
                             htmlOutput += "</ul>";
                         } else {
                             htmlOutput += "<p>No comments yet. Be the first to comment!</p>";
                         }
                         container.innerHTML = htmlOutput;
                     } else {
                         alert("Error loading comments: " + commentsResponse.message);
                     }
                 },
                 error: function(jqXHR, textStatus, errorThrown) {
                     alert("Error loading comments: " + textStatus);
                 }
             });
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert("Error loading event details: " + textStatus);
         }
     });
 }
 
 

 function showUserEvents(){
     //need a userEvents list (using full list for example)
     const container = document.getElementById("main_space");
     container.innerHTML = 
     `
     <h3>Your Events</h3>
                  <div class="input-group mb-3">
                        <input type="text" class="form-control" id="EventSearchBar" placeholder="Search Events" aria-label="Search Events" aria-describedby="basic-addon2">
                        <div class="input-group-append">
                            <button class="btn btn-outline-secondary" type="button" onClick="searchEvents()">Search</button>
                        </div>
                  </div>
                  <table id="availableEvents">
                    <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                    </tr>
                    <!-- Table rows will be added dynamically -->
                </table>
                <div id="pagination"></div>
     `
     ;
     displayUserEvents(currentPage, events);
 }


const RSOs = [
     { name: "Chess Team", description: "This is an RSO", numMembers: 3},
     { name: "Swimming Team", description: "This is an RSO", numMembers: 3},
     { name: "Event 3", description: "This is an RSO", numMembers: 3},
     { name: "Event 4", description: "This is an RSO", numMembers: 3},
     { name: "Event 5", description: "This is an RSO", numMembers: 3},
     { name: "Event 6", description: "This is an RSO", numMembers: 3},
     { name: "Event 7", description: "This is an RSO", numMembers: 3},
     { name: "Event 8", description: "This is an RSO", numMembers: 3},
     { name: "Event 9", description: "This is an RSO", numMembers: 3},
     { name: "Event 10", description: "This is an RSO", numMembers: 3},
     { name: "Event 11", description: "This is an RSO", numMembers: 3},
     { name: "Event 12", description: "This is an RSO", numMembers: 3},

 ];

 let currentRSOPage = 1;

 function displayAllRSOEvents(page, RSOList) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     const slicedData = RSOList.slice(startIndex, endIndex);

     // Clear existing table rows
     table.innerHTML = 
     `
     <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Number of Members</th>
          <th></th>
     </tr>
     `;

     // Add new rows to the table
     slicedData.forEach(item => {
         const row = table.insertRow();
         const nameCell = row.insertCell(0);
         const descriptionCell = row.insertCell(1);
         const membersCell = row.insertCell(2);
         const expandButton = row.insertCell(3);
         //need to fix issue with grabbing name for the id
         //id only grabs the first word stops once a space is reached
         nameCell.innerHTML = item.name;
         descriptionCell.innerHTML = item.description;
         membersCell.innerHTML = item.numMembers;
         expandButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "expandRSO(this.id)">Expand</button>';
     });

     // Update pagination
     updateRSOPagination(page, RSOList);
 }

 function updateRSOPagination(currentPage, RSOList) {
     const pageCount = Math.ceil(RSOList.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";
 
     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayAllRSOEvents(i, RSOList); 
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }
 

 function expandRSO(RSOid, RSOName) {
     // Call the API to load the members of the given RSO using the RSOid.
     $.ajax({
         type: "POST",
         url: apiUrl,  // Ensure apiUrl points to your API file.
         data: {
             action: "loadRSOMembers",
             rsoid: RSOid
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 // Build the HTML output using the retrieved members and use RSOName in the header.
                 let htmlOutput = `<h2>Members of RSO: ${RSOName}</h2>`;
                 if (response.members && response.members.length > 0) {
                     htmlOutput += `<ul>`;
                     response.members.forEach(member => {
                         htmlOutput += `<li>${member.firstname} ${member.lastname} (${member.email})</li>`;
                     });
                     htmlOutput += `</ul>`;
                 } else {
                     htmlOutput += `<p>No members found.</p>`;
                 }
                 // Inject the HTML into your main container (an element with id "main_space")
                 document.getElementById("main_space").innerHTML = htmlOutput;
             } else {
                 alert("Error: " + response.message);
             }
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert("Error loading RSO members: " + textStatus);
         }
     });
 }

 function joinRSO(rsoid) {
     // Retrieve the logged-in user's UID from localStorage.
     const uid = localStorage.getItem('uid');
     
     if (!uid) {
         alert("User not logged in.");
         return;
     }
     
     $.ajax({
         type: "POST",
         url: apiUrl, // Your API file, e.g., "http://localhost/Event_planner/api.php"
         data: {
             action: "studentRSOJoin", // This is the action your API expects
             uid: uid,
             rsoid: rsoid
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 alert("RSO joined successfully!");
                 // Optionally update the UI, such as refreshing the list of RSOs or 
                 // disabling the join button for the joined RSO.
             } else {
                 alert("Error: " + response.message);
             }
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert("Error joining RSO: " + textStatus);
         }
     });
 }

 // Initial display for RSO table
// Function to look up all RSOs for the current user's university using the studentRSOLookup API.
function lookupRSOs() {
     // Retrieve the user id from localStorage.
     const uid = localStorage.getItem('uid');
     if (!uid) {
         alert("User not logged in.");
         return;
     }
     
     $.ajax({
         type: "POST",
         url: apiUrl, // Make sure apiUrl points to your API file (e.g., "http://localhost/Event_planner/api.php")
         data: {
             action: "studentRSOLookup",
             uid: uid
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 // response.rsos should be an array of RSOs, each with at least "RSOID" and "Name"
                 displayRSOs(response.rsos);
             } else {
                 $("#main_space").html("<p>Error: " + response.message + "</p>");
             }
         },
         error: function(jqXHR, textStatus, errorThrown) {
             $("#main_space").html("<p>Error: " + textStatus + "</p>");
         }
     });
 }
 
 // Function to display the RSOs in a table.
 function displayRSOs(rsos) {
     // Build the HTML for the RSOs.
     const container = $("#main_space");
     container.html(`
         <h2>Available RSOs</h2>
         <table id="availableRSOs" class="table table-striped">
             <tr>
                 <th>RSO Name</th>
                 <th>Actions</th>
             </tr>
         </table>
     `);
     
     const table = $("#availableRSOs");
     rsos.forEach(rso => {
         // Use template literals and wrap parameters in quotes as needed.
         const row = `
             <tr>
                 <td>${rso.Name}</td>
                 <td>
                     
                     <button class="btn btn-info" onClick="expandRSO('${rso.RSOID}', '${rso.Name}')">View Details</button>
                     <button class="btn btn-info" onClick="joinRSO('${rso.RSOID}')">Join</button>
                 </td>
             </tr>
         `;
         table.append(row);
     });
 }
 
 // Optional: Modify your showRSOs function to use the API-based lookup.
 function showRSOs() {
     lookupRSOs();
 }



function displayUserRSOEvents(page, RSOList) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     const slicedData = RSOList.slice(startIndex, endIndex);

     // Clear existing table rows
     table.innerHTML = 
     `
     <tr>
          <th>Name</th>
          <th>Description</th>
          <th>Number of Members</th>
          <th></th>
     </tr>
     `;

     // Add new rows to the table
     slicedData.forEach(item => {
         const row = table.insertRow();
         const nameCell = row.insertCell(0);
         const descriptionCell = row.insertCell(1);
         const membersCell = row.insertCell(2);
         const expandButton = row.insertCell(3);
         //need to fix issue with grabbing name for the id
         //id only grabs the first word stops once a space is reached
         nameCell.innerHTML = item.name;
         descriptionCell.innerHTML = item.description;
         membersCell.innerHTML = item.numMembers;
         expandButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "expandUserRSO(this.id)">Expand</button>';
     });

     // Update pagination
     updateUserRSOPagination(page, RSOList);
 }

 function updateUserRSOPagination(currentPage, RSOList) {
     const pageCount = Math.ceil(RSOList.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";
 
     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayAllRSOEvents(i, RSOList); 
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }
 
 function leaveRSO(rsoid) {
     // Confirm with the user.
     const confirmLeave = confirm("Are you sure you want to leave this RSO?");
     if (!confirmLeave) return;
 
     // Retrieve the current user's uid from localStorage.
     const uid = localStorage.getItem('uid');
     if (!uid) {
         alert("User not logged in.");
         return;
     }
 
     // Make the AJAX call to leave the RSO.
     $.ajax({
         type: "POST",
         url: apiUrl,  // Ensure this points to your API file, e.g., "http://localhost/Event_planner/api.php"
         data: {
             action: "studentRSOLeave",
             uid: uid,
             rsoid: rsoid
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 alert("You have left the RSO successfully!");
                 // Optionally, refresh the list of RSOs for the user
                 showUserRSOs();
             } else {
                 alert("Error: " + response.message);
             }
         },
         error: function(jqXHR, textStatus, errorThrown) {
             alert("Error leaving RSO: " + textStatus);
         }
     });
 }
 function expandUserRSO(RSOid) {
     // Get the actual event using the button's ID (which is the name with hyphens)
     const RSO = RSOs.find(e => e.name.replace(/\s+/g, '-') === RSOid);
 
     if (RSO) {
         const container = document.getElementById("main_space");
          container.innerHTML = 
          `
               <h2>RSO Details:</h2>
               <h5 class = "eventTypeStyling">Name: ${RSO.name}</h5>
               <h5 class = "eventTypeStyling">Description: ${RSO.description}</h5>
               <h5 class = "eventTypeStyling">Number of Members: ${RSO.numMembers}</h5>
               
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "leaveRSO" onClick="leaveRSO()">Leave</button>
          `;
     } else {
         alert("Event not found.");
     }
 }



 function showUserRSOs() {
     // Retrieve the user's UID from localStorage.
     const uid = localStorage.getItem('uid');
     if (!uid) {
         alert("User not logged in.");
         return;
     }
     
     $.ajax({
         type: "POST",
         url: apiUrl, // e.g., "http://localhost/Event_planner/api.php"
         data: {
             action: "loadUserRSOs",
             uid: uid
         },
         dataType: "json",
         success: function(response) {
             if (response.success) {
                 // Build the HTML output similar to the events table.
                 let htmlOutput = `
                     <h2>Your RSOs</h2>
                     <table id="userRSOs" class="table table-striped">
                         <tr>
                             <th>RSO Name</th>
                             <th>Actions</th>
                         </tr>
                 `;
                 response.rsos.forEach(rso => {
                     htmlOutput += `
                         <tr>
                             <td>${rso.Name}</td>
                             <td>
                                 <button class="btn btn-info" onClick="expandRSO('${rso.RSOID}', '${rso.Name}')">View Details</button>
                                 <button class="btn btn-danger" onClick="leaveRSO('${rso.RSOID}')">Leave RSO</button>
                             </td>
                         </tr>
                     `;
                 });
                 htmlOutput += `</table>`;
                 document.getElementById("main_space").innerHTML = htmlOutput;
             } else {
                 document.getElementById("main_space").innerHTML = `<p>Error: ${response.message}</p>`;
             }
         },
         error: function(jqXHR, textStatus, errorThrown) {
             document.getElementById("main_space").innerHTML = `<p>Error: ${textStatus}</p>`;
         }
     });
 }

 function renderEventForm(){
     const container = document.getElementById("main_space");
     container.innerHTML = `
       <h4>Create New Event</h4>
   
       <div class="mb-3">
         <label for="eventName">Event Name:</label>
         <input type="text" id="eventName" class="form-control">
       </div>
   
       <div class="mb-3">
         <label for="eventType">Event Type:</label>
         <select id="eventType" class="form-control">
           <option value="">Select an event type</option>
           <option value="public">Public</option>
           <option value="private">Private</option>
           <option value="RSO">RSO</option>
         </select>
       </div>
   
       <div class="mb-3" id="rsoDiv" style="display:none;">
         <label for="rsoSelect">RSO:</label>
         <select id="rsoSelect" class="form-control">
           <option value="">-- choose an RSO --</option>
         </select>
       </div>
   
       <div class="mb-3">
         <label for="eventDate">Date:</label>
         <input type="date" id="eventDate" class="form-control">
       </div>
   
       <div class="mb-3">
         <label for="eventTime">Time:</label>
         <input type="time" id="eventTime" class="form-control">
       </div>
   
       <div class="mb-3">
         <label for="eventLocation">Location:</label>
         <input type="text" id="eventLocation" class="form-control">
       </div>
   
       <div class="mb-3">
         <label for="eventDescription">Description:</label>
         <textarea id="eventDescription" class="form-control" rows="5"></textarea>
       </div>
   
       <button class="btn btn-primary" id="createEvent">Create Event</button>
     `;
   
     // 1) Show/hide the RSO selector when type changes
     document.getElementById("eventType")
       .addEventListener("change", function(){
         document.getElementById("rsoDiv").style.display =
           this.value === "RSO" ? "block" : "none";
       });
   
     // 2) Fetch all approved RSOs and populate the dropdown
     $.post(apiUrl,
       { action: "getRSOs", uid: localStorage.getItem("uid") },
       function(resp){
         if (resp.success) {
           const sel = document.getElementById("rsoSelect");
           resp.rsos.forEach(rso => {
             const opt = document.createElement("option");
             opt.value = rso.RSOID;
             opt.textContent = rso.Name;
             sel.appendChild(opt);
           });
         } else {
           console.error("Failed to load RSOs:", resp.message);
         }
       },
       "json"
     );
   
     // 3) Handle the Create Event click
     document.getElementById("createEvent")
       .addEventListener("click", function(){
         const name        = document.getElementById("eventName").value.trim();
         const type        = document.getElementById("eventType").value;
         const rsoid       = document.getElementById("rsoSelect").value;
         const dateVal     = document.getElementById("eventDate").value;
         const timeVal     = document.getElementById("eventTime").value;
         const locationVal = document.getElementById("eventLocation").value.trim();
         const description = document.getElementById("eventDescription").value.trim();
   
         // basic validation
         if (!name || !type || !dateVal || !timeVal || !locationVal) {
           return alert("Please fill in all required fields.");
         }
         if (type === "RSO" && !rsoid) {
           return alert("Please select an RSO.");
         }
   
         // build payload
         const payload = {
           action:       type === "public"
                           ? "createPublicEvent"
                           : type === "private"
                             ? "createPrivateEvent"
                             : "createRSOEvent",
           eventid:      eventIdMaker(),
           eventname:    name,
           description:  description,
           eventtime:    dateVal + " " + timeVal,
           location_name: locationVal,
           uid:          localStorage.getItem("uid")
         };
         if (type === "RSO") payload.rsoid = rsoid;
   
         // send to API
         $.post(apiUrl, payload, function(res){
           if (res.success) {
             alert("Event created successfully!");
             // optionally clear or redirect:
             window.location.href = "admin_home.html";
           } else {
             alert("Error: " + res.message);
           }
         }, "json")
         .fail((_, status) => alert("Request failed: " + status));
     });
   }
   


//start of superAdmin functions
function displaySuperAdminEvents(page, eventList) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     
     const slicedData = eventList.slice(startIndex, endIndex);

     // Clear existing table rows
     table.innerHTML = 
     `
     <tr>
          <th>Name</th>
          <th>Date</th>
          <th>Time</th>
          <th>Location</th>
          <th></th>
     </tr>
     `;

     // Add new rows to the table
     slicedData.forEach(item => {
          
               const row = table.insertRow();
               const nameCell = row.insertCell(0);
               const dateCell = row.insertCell(1);
               const timeCell = row.insertCell(2);
               const locationCell = row.insertCell(3); 
               const expandButton = row.insertCell(4);
               
               const name = item.name;
               const date = item.date;
               const time = item.time;
               const lcoation = item.location;
               const university = item.university;

               nameCell.innerHTML = item.name;
               dateCell.innerHTML = item.date;
               timeCell.innerHTML = item.time;
               locationCell.innerHTML = item.location;
               expandButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "approveEvent(this.id)">Approve</button>';

     });

     // Update pagination
     updateSuperAdminPagination(page, eventList);
 }

 function updateSuperAdminPagination(currentPage, eventList) {
     const pageCount = Math.ceil(eventList.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displaySuperAdminEvents(i, eventList);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

//need to fix possible issue when calculating number of events(issue caused by avoiding unapproved events)
function displayUnapprovedEvents(page) {
     displaySuperAdminEvents(currentPage, unapprovedEvents);

}

function approveEvent(eventId){
     const event = events.find(e => e.name.replace(/\s+/g, '-') === eventId);
 
     if (event) {
          let approval = confirm(`Are you sure you would like to approve "${event.name}"?`);
          if (approval) {
              alert(`${event.name} has been approved.`);
              event.approved = true;
  
              // Recalculate the sublists
              approvedEvents = getApprovedEvents(events);
              unapprovedEvents = getUnapprovedEvents(events);
  
              // Re-render the updated events (with the new approved event)
              displayEvents(currentPage, approvedEvents);
          }
     } else {
         alert("Event not found.");
     }
}

//simple prompt to add a University to the database. 
function addUniversity(){
     const container = document.getElementById("main_space");
     container.innerHTML = 
     `
          <h4 >Create New Location</h4>
          <div id = eventInput>
               <div class="eventTypeStyling">
                    <label>University (abbreviated):</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="university" >
               </div>
               <div class="eventTypeStyling">
                    <label>Full Name:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="name">
               </div>            
               <div class="eventTypeStyling">
                    <label>Latitude:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="latitude" placeholder="12.34567">
               </div>
               <div class="eventTypeStyling">
                    <label>Longitude:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="longitude" placeholder="76.54321">
               </div>
               <div class="eventTypeStyling">
                    <label >Location:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="address">
               </div>
               
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "createLocation" >Create Location</button>
          </div>
     `;
}

document.addEventListener("click", function(event) {
     if (event.target && event.target.id === "createLocation") {
          createLocation();
     }
});

function createLocation(){
     // grab & trim all inputs
     const university = document.getElementById("university").value.trim();
     const name       = document.getElementById("name").value.trim();
     const latitude   = document.getElementById("latitude").value.trim();
     const longitude  = document.getElementById("longitude").value.trim();
     const address    = document.getElementById("address").value.trim();
   
     // client‐side validation
     if (!university || !name || !latitude || !longitude || !address) {
       return alert("Please fill in all fields");
     }
   
     // build the payload exactly as PHP expects
     const payload = {
       action:     "createLocation",
       university: university,
       name:       name,
       address:    address,
       latitude:   latitude,
       longitude:  longitude
     };
   
     // send it off
     $.ajax({
       type: "POST",
       url: apiUrl,
       data: payload,
       dataType: "json"
     })
     .done(function(response) {
       if (response.success) {
         alert("Location added successfully!");
         // you can either clear the form:
         document.getElementById("university").value = "";
         document.getElementById("name").value       = "";
         document.getElementById("latitude").value   = "";
         document.getElementById("longitude").value  = "";
         document.getElementById("address").value    = "";
         // …or redirect back to your superAdmin home:
         window.location.href = "superAdmin_home.html";
       } else {
         alert("Error: " + response.message);
       }
     })
     .fail(function(jqXHR, textStatus) {
       alert("Request failed: " + textStatus);
     });
}

function promptStudentRSOCreate() {
     const name = prompt("Enter a name for your new RSO:");
     if (!name || !name.trim()) {
       return alert("RSO creation cancelled.");
     }
     const uid = localStorage.getItem("uid");
     if (!uid) {
       return alert("You must be logged in to create an RSO.");
     }
     // generate a new RSOID however you like; for example:
     const rsoid = Date.now().toString().slice(-6); // or use a counter like eventIdMaker
   
     $.post(apiUrl, {
         action: "studentRSOCreate",
         uid: uid,
         rsoid: rsoid,
         name: name.trim()
       }, function(resp) {
         if (resp.success) {
           alert(resp.message);
           window.location.href = "/Event_Planner/admin_home.html";
           // TODO: refresh any RSO‑lists or dropdowns
         } else {
           alert("Error: " + resp.message);
         }
       }, "json")
       .fail((_, status) => alert("Request failed: " + status));
   }

//functions for sidebar (all users)
function deleteAccount(){
     const confirmation = confirm("Are You Sure?");
     if(confirmation){
          alert("user deleted!")
          window.location.href = "index.html";
     }
}

//use functions to change the contents of main_space to simulate a page change while keeping the Side Menu
function openSettings(){
     const container = document.getElementById("main_space");
     //you can apply ids and classes to these tags for styling (including bootstrap styles)
     container.innerHTML = 
     `
          <h3>Settings</h3>
          <p>This is the settings page</p>
          <button id="deleteUser" onClick = "deleteAccount()">Delete Account</button>
     `;
     
};
