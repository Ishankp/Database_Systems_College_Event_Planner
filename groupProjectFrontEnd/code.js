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

//use functions to change the contents of main_space to simulate a page change while keeping the Side Menu
function openSettings(){
     const container = document.getElementById("main_space");
     //you can apply ids and classes to these tags for styling (including bootstrap styles)
     container.innerHTML = 
     `
          <h3>Settings</h3>
          <p>This is the settings page</p>
          <button id="tester" onClick = "deleteAccount()">Delete Account</button>
     `;
     
};

function expandEvent(eventId){
     alert("user want to know more about this event: " + eventId);
}


function deleteAccount(){
     const confirmation = confirm("Are You Sure?");
     if(confirmation){
          alert("user deleted!")
          window.location.href = "index.html";
     }
}


//holds simple event data
const data = [
     { name: "Chess Tournament", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 2", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 3", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 4", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 5", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 6", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 7", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 8", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 9", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 10", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 11", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},
     { name: "Event 12", date: "12/31/1999", time: "8:00 am - 5:00 pm", location: "123 test rd orlando FL, 12345"},

 ];

 const rowsPerPage = 8;
 let currentPage = 1;

 function displayTable(page) {
     const table = document.getElementById("availableEvents");
     const startIndex = (page - 1) * rowsPerPage;
     const endIndex = startIndex + rowsPerPage;
     const slicedData = data.slice(startIndex, endIndex);

     // Clear existing table rows
     table.innerHTML = `
 <tr>
     <th>Name</th>
     <th>Date</th>
     <th>Time</th>
     <th>Location</th>
 </tr>
`;

     // Add new rows to the table
     slicedData.forEach(item => {
         const row = table.insertRow();
         const nameCell = row.insertCell(0);
         const dateCell = row.insertCell(1);
         const timeCell = row.insertCell(2);
         const locationCell = row.insertCell(3);
         //need to fix issue with grabbing name for the id
         //id only grabs the first word stops once a space is reached
         nameCell.innerHTML = '<a id = '+ item.name + ' onClick = "expandEvent(this.id)">' + item.name + '</a>';
         dateCell.innerHTML = item.date;
         timeCell.innerHTML = item.time;
         locationCell.innerHTML = item.location;
     });

     // Update pagination
     updatePagination(page);
 }

 function updatePagination(currentPage) {
     const pageCount = Math.ceil(data.length / rowsPerPage);
     const paginationContainer = document.getElementById("pagination");
     paginationContainer.innerHTML = "";

     for (let i = 1; i <= pageCount; i++) {
         const pageLink = document.createElement("a");
         pageLink.href = "#";
         pageLink.innerText = i;
         pageLink.onclick = function () {
             displayTable(i);
         };
         if (i === currentPage) {
             pageLink.style.fontWeight = "bold";
         }
         paginationContainer.appendChild(pageLink);
         paginationContainer.appendChild(document.createTextNode(" "));
     }
 }

 // Initial display
 displayTable(currentPage);