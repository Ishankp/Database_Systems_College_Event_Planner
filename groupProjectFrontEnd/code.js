const urlBase = '';
const extension = 'php'; 

//insert javascript here for website


//grabs the input from the username and password text boxes
$('#loginButton').click(function checkCredentials(){

     var login = document.getElementById("username").value;
	var password = document.getElementById("password").value;
     
     if(login === '' || password === '' ){
          $('#errorBoxLogin').html("Error: please fill in all boxes");
          $('#errorBoxLogin').show();
     }else{
          //add function to check database for existing user and log them in.
	     //currently the page just shows the inputed username and password but doesn't redirect
          $('#errorBoxLogin').html("Error: Username and Password incorrect");
          $('#errorBoxLogin').show();
          alert("username: " + login + "\npassword: " + password);
     }
     
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
          //add function for create new user
          alert("First Name: " + firstName + "\nLast Name: " + lastName + "\nEmail: " + email + "\nPhone: " + phone +"\nUsername: " + username + "\nPassword: " + password);
     }
     
});



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

//holds event data
//still need to add a expand button for full event info
const events = [
     { name: "Chess Tournament", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 2", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 3", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 4", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 5", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 6", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 7", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 8", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 9", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 10", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 11", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},
     { name: "Event 12", description: "interesting things", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345", University: "College", RSO: "none"},

 ];

 const rowsPerPage = 6;
 let currentPage = 1;

 function displayEvents(page) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     const slicedData = events.slice(startIndex, endIndex);

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
         expandButton.innerHTML = '<button id = '+ item.name.replace(/\s+/g, '-') + ' onClick = "expandEvent(this.id)">Expand</button>';
     });

     // Update pagination
     updatePagination(page);
 }

 function updatePagination(currentPage) {
     const pageCount = Math.ceil(events.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayEvents(i);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

 // Initial display for event table
displayEvents(currentPage);

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

 function displayAllRSOEvents(page) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     const slicedData = RSOs.slice(startIndex, endIndex);

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
     updateRSOPagination(page);
 }

 function updateRSOPagination(currentPage) {
     const pageCount = Math.ceil(RSOs.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayEvents(i);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

 function expandRSO(RSOid) {
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
               
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "joinRSO" >Join</button>
          `;
     } else {
         alert("Event not found.");
     }
 }

 // Initial display for RSO table
function showRSOs(){
     const container = document.getElementById("main_space");
     container.innerHTML = 
     `
     <h2>RSOs</h2>
     <div class="input-group mb-3">
          <input type="text" class="form-control" id="RSOsearchBar" placeholder="Search RSOs" aria-label="Search RSOs" aria-describedby="basic-addon2">
          <div class="input-group-append">
               <button class="btn btn-outline-secondary" type="button" onClick="searchRSOs()">Search</button>
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
     `;
     displayAllRSOEvents(currentRSOPage);
}

function searchRSOs(){
     const input = document.getElementById("RSOsearchBar");
     const searchTerm = input.value.trim();
     alert(`User would like to search for: ${searchTerm}`);
}

function showUserRSOs(){
     alert("function has been called");

}

function inputEventInfo(){
     const container = document.getElementById("main_space");
     container.innerHTML = 
     `
          <h4 >Create New Event</h4>
          <div id = eventInput>
               <div class="eventTypeStyling">
                    <label>Event Name:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="eventName" >
               </div>
               <div class="eventTypeStyling">
                    <label>Event Type:</label>
                    <select name="eventType" class="form-control" data-bs-theme="dark" id="eventType">
                         <option value="public">Public</option>
                         <option value="private">Private</option>
                         <option value="RSO">RSO</option>
                    </select>
               </div>
               <div class="eventTypeStyling">
                    <label>RSO Name (Only for RSO Events):</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="RSO_Name">
               </div>
               
               <div class="eventTypeStyling">
                    <label>Date and Time:</label>
                    <div class="input-group mb-3 ">
                         <input type="date" class="form-control" data-bs-theme="dark" id="eventDate">
                         <input type="time" class="form-control" data-bs-theme="dark" id="eventTime">
                    </div>
               </div>
               <div class="eventTypeStyling">
                    <label >Location:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="eventLocation">
               </div>
               <div class="eventTypeStyling">
                    <label >University:</label>
                    <input type="text" class="form-control" data-bs-theme="dark" id="eventUniversity">
               </div>
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "grabEventInfo" >Continue</button>
          </div>
     `;
}

//using an event listener fixes issues when linking functions to dynamically added elements
document.addEventListener("click", function(event) {
     if (event.target && event.target.id === "grabEventInfo") {
          grabEventInfo();
     }else if(event.target && event.target.id === "createEvent"){
          createEvent();
     }
});

function grabEventInfo(){
     // Grab info
     var name = document.getElementById("eventName").value;
     var type = document.getElementById("eventType").value;
     var RSO_Name = document.getElementById("RSO_Name").value;
     var date = document.getElementById("eventDate").value;
     var time = document.getElementById("eventTime").value;
     var location = document.getElementById("eventLocation").value;
     var university = document.getElementById("eventUniversity").value;

     // Check for missing values
     if(name === '' || type === '' || date === '' || time === '' || location === '' || university === ''){
          alert("Please fill in all required areas");
          return;
     } 
     if(type === 'RSO' && RSO_Name === ''){
          alert("RSO Name is required for RSO events");
          return;
     }else{
          const container = document.getElementById("main_space");
          container.innerHTML = 
          `
               <h4 >Create New Event</h4>
               <div class="mb-3">
                    <label for="eventDescription" class="form-label eventTypeStyling">Please provide a short description of the event:</label>
                    <textarea class="form-control eventTypeStyling" data-bs-theme="dark" id="eventDescription" rows="10"></textarea>
               </div>
               <button class = "btn btn-large btn-dark eventTypeStyling" id = "createEvent" >Create Event</button>
          `;
          //if the statement below is true then the admin has given all neccessary information to create an event
          document.getElementById('createEvent').addEventListener('click', function() {
               //description can be empty 
               const description = document.getElementById("eventDescription").value;
               /*
                code for creating event would be here. (variable names for each piece of info is below for reference) 

                Event Name = name
                Event Type = type
                Event RSO = RSO_Name (Only required for RSO Events)
                Event Date = date
                Event Time = time
                Event Location = location
                Event University = university
               */ 
          });
     }

     
}

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
