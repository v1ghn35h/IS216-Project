// ----------------------------------------
// CALENDAR FIREBASE

// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_sRHAqy76KR30qfWTT1HjahFEN0IN4Q",
  authDomain: "calendaready-g7t7.firebaseapp.com",
  databaseURL: "https://calendaready-g7t7-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "calendaready-g7t7",
  storageBucket: "calendaready-g7t7.appspot.com",
  messagingSenderId: "544037155570",
  appId: "1:544037155570:web:c7e3ca7a1c55beaea8966b",
  measurementId: "G-03K9PHBX7D"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

/* CONNECT TO DATABASE */
// Import functions needed to read from realtime database
import { getDatabase, ref, onValue, child, get, set, remove, push, update, query, orderByChild } from
"https://www.gstatic.com/firebasejs/9.13.0/firebase-database.js"

// Connect to the realtime database
const db = getDatabase();

var all_tasks = []
var new_db_size = 0
var new_id = 0

var all_events = []
// let current_user = "user1" // change according to user logged in

import ResolvedUID from "./login-common.js";
let current_user = ResolvedUID // change according to user logged in


// ----------------------------------------
// TO DO LIST

let task_list_div = document.getElementById("taskList")

// fetch data from db and populate tasks
const dbRef = ref(getDatabase());
get(child(dbRef, `users/${current_user}/user_tasks/`)).then((snapshot) => {
  if (snapshot.exists()) {
    let tasks = snapshot.val();
    all_tasks = tasks
    new_id = Object.keys(all_tasks).length

    // clear previous data
    task_list_div.innerHTML = ""

    for (var task in tasks) {
      let output = ``

      let task_info = tasks[task]

      let task_id = task_info.id
      let task_title = task_info.title
      let task_completion = task_info.status

      if (task_completion == "done") {
        output += `<li class="list-group-item done" id=${task_id}>`
      }
      else {
        output += `<li class="list-group-item" id=${task_id}>`
      }

      output += `<i class="far fa-square done-icon"></i>
                  <i class="far fa-check-square done-icon"></i>
                  <span class="todo-text"> ${task_title} </span>
                  <i class="far fa-trash-alt"></i>
                </li>`

      task_list_div.innerHTML += output
    }
  } 
})


// Define all UI variable
const todoList = document.querySelector('.list-group');
const form = document.querySelector('#form');
const todoInput = document.querySelector('#todo');
const clearBtn = document.querySelector('#clearBtn');
const search = document.querySelector('#search');

// Load all event listners
allEventListners();


// Functions of all event listners
function allEventListners() {
    // Add todo event
    form.addEventListener('submit', addTodo);
    // Remove and complete todo event
    todoList.addEventListener('click', removeTodo);
}

// TO-DO ADD TO DB
function to_do_addDB(id, title, status) {
  set(ref(db, 'users/' + current_user + '/user_tasks/task_' + id), 
    {
      id: id,
      title: title,
      status: status
    }
  )

  // add to task obj
  all_tasks[`task_${id}`] = {"title": title, "status": status}
}

// TO-DO FETCH FROM DB
function to_do_fetchDB() {
  let num_ele = 0
  const dbRef = ref(getDatabase());
  get(child(dbRef, `users/${current_user}/user_tasks/`)).then((snapshot) => {
    if (snapshot.exists()) {
      let tasks = snapshot.val();
      
      // update all_tasks arr
      all_tasks = tasks
    }
  })
}

// set text alert to empty string (remove alert)
function textAlertSetEmpty() {
  let alert_msg_div = document.getElementById("alertText")
  alert_msg_div.innerHTML = ``
}

// Add todo item function
function addTodo(e) {

  let alert_msg_div = document.getElementById("alertText")
  alert_msg_div.innerHTML = ``

  // display alert message
  textAlertSetEmpty()

    // fetch from database
    to_do_fetchDB()

    if (todoInput.value !== '') {
        // Create li element
        const li = document.createElement('li');
        // Add class
        li.className = 'list-group-item';
        // Add complete and remove icon
        li.innerHTML = `<i class="far fa-square done-icon"></i>
                        <i class="far fa-check-square done-icon"></i>
                        <i class="far fa-trash-alt"></i>
                        `;
        // Create span element
        const span = document.createElement('span');
        // Add class
        span.className = 'todo-text';
        // Create text node and append to span
        span.appendChild(document.createTextNode(todoInput.value));
        // Append span to li
        li.appendChild(span);

        // Append li to ul (todoList)
        todoList.appendChild(li);

        // add to database
        new_id += 1
        let task_id = new_id
        let task_title = todoInput.value
        let task_status = ""

        to_do_addDB(task_id, task_title, task_status) 

        // add id to task li element
        li.id = new_id
        
        // Clear input
        todoInput.value = '';

        // display alert message
        alert_msg_div.innerHTML = `<div class="alert alert-success d-flex align-items-center" role="alert">
                                    <i class="bi bi-check-circle-fill pe-2"></i>
                                    <div>
                                      Successfully added!
                                    </div>
                                  </div>
                                  `

        setTimeout(textAlertSetEmpty, 5000);

        // refetch from database (to update contents)
        to_do_fetchDB()

    } else {
        // prompt them to add
        alert_msg_div.innerHTML = `<div class="alert alert-warning d-flex align-items-center" role="alert" data-mdb-delay="1000">
                                    <i class="bi bi-exclamation-triangle-fill pe-2"></i>
                                    Please enter a to-do item!
                                  </div>
                                  `

        setTimeout(textAlertSetEmpty, 5000);
    }

    e.preventDefault();
}


// Remove and complete todo item function
function removeTodo(e) {

    // fetch from database
    to_do_fetchDB()

    let event = e.target.parentElement
    let event_id = event.id

    let event_title = event.getElementsByClassName("todo-text")[0].innerHTML

    // Complete todo
    if (e.target.classList.contains('done-icon')) {
        e.target.parentElement.classList.toggle('done');

        let check = event.classList.contains('done')
        let status = ""
        
        // task completed
        if (check) {
          status = "done"
        }

        // task not completed
        else {
          status = ""
        }

        // re add data to DB
        to_do_addDB(event_id, event_title, status)

        // refetch from database (to update contents)
        to_do_fetchDB()

  }

    // Remove todo
    if (e.target.classList.contains('fa-trash-alt')) {

      let event = e.target.parentElement
      let event_id = event.id
      let event_title = event.getElementsByClassName("todo-text")[0].innerHTML

      // prompt user to double confirm

      // get the modal
      var confirm_delete_modal = document.getElementById("confirmDeleteTaskModal");
      let cancel_button = document.getElementById("cancelDeleteTaskButton");
      let confirm_delete_button = document.getElementById("confirmDeleteTaskButton");
      let modal_body = document.getElementById("confirmDeleteTaskBody")

      // when the user clicks on the button, open the modal
      confirm_delete_modal.style.display = "block";

      // populate event title into modal body
      modal_body.innerHTML = `Delete task: <b> ${event_title} </b>`

      // when cancel_button user clicks on cancel, close the modal
      cancel_button.onclick = function() {
        confirm_delete_modal.style.display = "none";
      }

      confirm_delete_button.onclick = function() {
        e.target.parentElement.remove();


        // fetch from db
        to_do_fetchDB()

        // delete from db
        const tasksRef = ref(db, 'users/' + current_user + '/user_tasks/task_' + event_id);
        remove(tasksRef).then(() => {
        });

        // refetch from database (to update contents)
        to_do_fetchDB()

        // autoclose modal
        confirm_delete_modal.style.display = "none";
      }

    }
}

// ---------------------------------------
// POMODORO TIMER

let background_images = {"forest": "img/pomodoro-bg/forest.png",
                          "ocean": "img/pomodoro-bg/ocean.png",
                          "rainy": "img/pomodoro-bg/rainy.png",
                          "peace": "img/pomodoro-bg/peace.png",
                          "cafe": "img/pomodoro-bg/cafe.png",
                          "none": "img/pomodoro-bg/none.png"
                        } 

$(() => {

  let $audio = $("audio"), // from https://tide.moreless.io/en/
      $theme = $(".theme"),
      $title = $("#title"),
      $controls = $("#controls"),
      $options = $("#options"),
      $minutes = $("#minutes"),
      $seconds = $("#seconds"),
      $start = $("#start"),
      $pause = $("#pause"),
      $reset = $("#reset"),
      $incrSession = $("#incrSession"),
      $sessionInput = $("#sessionInput"),
      $decrSession = $("#decrSession"),
      $incrBreak = $("#incrBreak"),
      $breakInput = $("#breakInput"),
      $decrBreak = $("#decrBreak"),
      breakLength = 5 * 60,
      breakMax = 10,
      breakMin = 1,
      sessionLength = 30 * 60,
      sessionMax = 60,
      sessionMin = 5,
      sessionNum = 0,
      countdown,
      countType,
      remainingTime = sessionLength;

  init();

  function init(){
    $audio.prop("volume", 0);
    $incrSession.click(() => incrSession());
    $decrSession.click(() => decrSession());
    $incrBreak.click(() => incrBreak());
    $decrBreak.click(() => decrBreak());
    $sessionInput.on("change", e => updateSession(e.target.value));
    $breakInput.on("change", e => updateBreak(e.target.value));
    $start.click(() => { if (countType === "break"){ startBreak(); } else { startSession(); } });
    $pause.click(() => pause());
    $reset.click(() => reset());
    $theme.click(e => audioSelect(e));
  }
  function startSession(){
    sessionNum++;
    countType = "session";
    $options.slideUp(143);
    $controls.removeClass().addClass("started");
    $title.fadeOut(43, function(){
      $(this).html("Session " + sessionNum).fadeIn();
    });
    $audio.animate({volume: 1}, 1000);
    start(remainingTime || sessionLength);
  }
  function startBreak(){
    countType = "break";
    $title.fadeOut(43, function(){
      $(this).html("Break " + sessionNum).fadeIn();
    });
    $audio.animate({volume: 0}, 5000);
    start(remainingTime || breakLength);
  }
  function start(timeLeft){
    clearInterval(countdown);
    countdown = setInterval(() => {
      timeLeft--;
      remainingTime = timeLeft;
      let minLeft = Math.floor(timeLeft / 60),
          secLeft = timeLeft - minLeft * 60;
      updateMinutes(minLeft);
      updateSeconds(secLeft < 10 ? "0" + secLeft : secLeft);
      if (timeLeft < 1){
        if (countType === "session"){
          startBreak(breakLength);
        } else {
          startSession();
        }
      }
    }, 1000);
  }
  function pause(){
    sessionNum--;
    $audio.animate({volume: 0}, 1000);
    clearInterval(countdown);
    $options.slideDown(143);
    $controls.removeClass().addClass("paused");
    $title.fadeOut(43, function(){
      $(this).html("Paused").fadeIn();
    });
  }
  function reset(){
    clearInterval(countdown);
    updateMinutes(sessionLength / 60);
    updateSeconds("00");
    countType = undefined;
    $controls.removeClass().addClass("reset");
    $title.html("Ready?");
    remainingTime = sessionLength;
  }
  function incrSession(){
    let num = Number($sessionInput.val());
    num = num + (num === sessionMax ? 0 : 1);
    sessionLength = num * 60;
    updateSession(num);
    updateMinutes(num);
    updateSeconds("00");
    reset();
  }
  function decrSession(){
    let num = Number($sessionInput.val());
    num = num - (num === sessionMin ? 0 : 1);
    sessionLength = num * 60;
    updateSession(num);
    updateMinutes(num);
    updateSeconds("00");
    reset();
  }
  function incrBreak(){
    let num = Number($breakInput.val());
    num = num + (num === breakMax ? 0 : 1);
    breakLength = num * 60;
    updateBreak(num);
    reset();
  }
  function decrBreak(){
    let num = Number($breakInput.val());
    num = num - (num === breakMin ? 0 : 1);
    breakLength = num * 60;
    updateBreak(num);
    reset();
  }
  function updateMinutes(num){
    $minutes.text(num);
  }
  function updateSeconds(num){
    $seconds.text(num);
  }
  function updateSession(num){
    num = num < sessionMin ? sessionMin : num > sessionMax ? sessionMax : num;
    $sessionInput.val(num).blur();
    updateMinutes(num);
    updateSeconds("00");
    sessionLength = num * 60;
    reset();
  }
  function updateBreak(num){
    $breakInput.val(num < breakMin ? breakMin : num > breakMax ? breakMax : num).blur();
    breakLength = num * 60;
    reset();
  }
  function audioSelect(e){
    $theme.removeClass("selected");
    $(e.target).addClass("selected");

    switch(e.target.id){
      case "forest": $audio.attr("src", "https://joeweaver.me/codepenassets/freecodecamp/challenges/build-a-pomodoro-clock/forest.mp3"); break;
      case "ocean": $audio.attr("src", "https://joeweaver.me/codepenassets/freecodecamp/challenges/build-a-pomodoro-clock/ocean.mp3"); break;
      case "rainy": $audio.attr("src", "https://joeweaver.me/codepenassets/freecodecamp/challenges/build-a-pomodoro-clock/rain.mp3"); break;
      case "peace": $audio.attr("src", "https://joeweaver.me/codepenassets/freecodecamp/challenges/build-a-pomodoro-clock/peace.mp3"); break;
      case "cafe": $audio.attr("src", "https://joeweaver.me/codepenassets/freecodecamp/challenges/build-a-pomodoro-clock/cafe.mp3"); break;
      case "none": $audio.attr("src", ""); break;
      }

    // change background image
    let selected_element_id = e.target.id
    let new_background_image = background_images[selected_element_id]
    let background_image = document.getElementById("clock")
    background_image.style.backgroundImage = `url("${new_background_image}")`;
  }

});


// ---------------------------------------
// SEARCH EVENTS
let search_results = document.getElementById("search_results")

// Vue Instance
const app = Vue.createApp({

    // Element
    el: "#searchtab",

    // Data
    data() {
        return {
            search_query: "",
            search_results: ""
        }
    },

    // Method
    methods: {
        searchForEvents() {

          // clear previously populated events
          this.search_results = ""

          var search_val = this.search_query.toLowerCase()
          
          let this_search_query_events = []

          for (var thing of all_events){
            var ref = thing.title.toLowerCase()

            if (ref.includes(search_val) && this.search_query != "") {

              // thing is an object

              let category = thing.category
              let end = thing.end
              let id = thing.id
              let photo_url = thing.photo_url
              let start = thing.start
              let start_date = Date.parse(thing.start)
              let title = thing.title
              
              this_search_query_events.push({"category": category, 
                                            "end": end,
                                            "id": id,
                                            "photo_url": photo_url,
                                            "start": start,
                                            "start_date": start_date,
                                            "title": title
                                            })

            }
          }
          
          // sort this_search_query_events
          let sorted_events_by_date = this_search_query_events.sort((a,b) => a.start_date - b.start_date)

          for (let curr_event of sorted_events_by_date) {

            let event_title = curr_event.title

            // format date time
            let event_start = curr_event.start
            let event_end = curr_event.end

            let formatted_start = ""
            let formatted_end = ""

            if (event_start.includes("T")) { // if there is time
              let e_start = event_start.split("T")
              let e_start_date = e_start[0]
              let e_start_time = e_start[1].slice(0,5)
              formatted_start = `${e_start_date} (${e_start_time})`
            }
            else {
              formatted_start = `${event_start} (All Day)`
            }

            if (event_end.includes("T")) { // if there is time
              let e_end = event_end.split("T")
              let e_end_date = e_end[0]
              let e_end_time = e_end[1].slice(0,5)
              formatted_end = `${e_end_date} (${e_end_time})`
            }
            else {
              formatted_end = `${event_end} (All Day)`
            }

            let event_category = curr_event.category
            if (event_category == "") {
              event_category = "Default"
            }
            let find_object = colors.find(o => o.name === event_category); 
            let event_color = find_object.hex

            // add new events
            this.search_results += `<div class="card" style="width: 100%">
                                        <div class="card-body" style="color: white; background-color: ${event_color}">
                                          <h5 class="card-title" style="word-wrap: break-word;
                                          white-space: normal;"> ${event_title} </h5>
                                          <p class="card-text">
                                            <b> Start: </b> ${formatted_start}
                                            <br>
                                            <b> End: </b> ${formatted_end}
                                          </p>
                                        </div>
                                      </div>
                                        `

            // this.search_results += "hi"
            
          }
          
        }
    },

});

app.mount("#searchtab")

// ----------------------------------------
// CALENDAR

// event icons & pictures
// {'category': [color, icon, image], ...}
let event_media = {'Adventure': ['#ffb700', 'icons/adventure.png', 'event-img/adventure.jpg'], 
                    'Arts & Culture': ['#ffc2d1', 'icons/artsculture.png', 'event-img/artsculture.jpg'],
                    'Community': ['#ffd81a', 'icons/community.png', 'event-img/community.jpg'],
                    'Global Culture': ['#ecbcfd', 'icons/globalculture.png', 'event-img/globalculture.jpg'],
                    'School Society': ['#adc178', 'icons/schoolsociety.png', 'event-img/schoolsociety.jpg'],
                    'Sports': ['#01497c', 'icons/sports.png', 'event-img/sports.jpg'],
                    'Student Bodies': ['#8ecae6', 'icons/studentbodies.png', 'event-img/studentbodies.jpg'],
                    'Academics': ['#ff8fab', 'icons/academics.png', 'event-img/academics.jpg'],
                    'Miscellaneous': ['#ced4da', 'icons/miscellaneous.png', 'event-img/miscellaneous.jpg'],
                    'Default': ['#4d4d4d', 'icons/default.png', 'event-img/default.jpg']
                  }

/* colour picker */
var colors = [
  {
    name: 'Adventure',
    hex: '#ffb700',
  },
  {
    name: 'Arts & Culture',
    hex: '#ffc2d1',
  },
  {
    name: 'Community',
    hex: '#ffd81a',
  },
  {
    name: 'Global Culture',
    hex: '#ecbcfd',
  },
  {
    name: 'School Society',
    hex: '#adc178',
  },
  {
    name: 'Sports',
    hex: '#01497c',
  },
  {
    name: 'Student Bodies',
    hex: '#8ecae6',
  },
  {
    name: 'Academics',
    hex: '#ff8fab'
  },
  {
    name: 'Miscellaneous',
    hex: '#ced4da'
  },
  {
    name: 'Default',
    hex: '#4d4d4d'
  },
];

let event_class = ""
let event_color = ""

// Vue Instance
var apps = Vue.createApp({
    // Element
    el: "#category",

    // Data
    data() {
        return {
          selectedColor: '',
          selectedColorName: '',
          colors: colors
        }
    },

    // Methods
    methods: {

      selector: 
        function() {
          if(!this.selectedColor) {
            return 'Select a category';
          }
          else {
            return '<span style="background: ' + this.selectedColor + '"></span>' + this.selectedColorName;
          }
      },

      setColor: 
        function(color, colorName) {
          this.selectedColor = color;
          this.selectedColorName = colorName;
          this.active = false;

          // set global event class & color
          event_class = colorName
          event_color = color
      },
    }
})

apps.mount("#category")



var calendarEl = document.getElementById('calendar');

var calendar = new FullCalendar.Calendar(calendarEl, {
  height: 700,

  views: {
    eventLimit: 2, // for all non-TimeGrid views
  },

  customButtons: {
    // Click + button to add event
    addEvent: {
      text: '+',
      click: 
        function() {
          // get the modal
          var modal = document.getElementById("myModal");
          var add_success_modal = document.getElementById("addSuccessModal");

          // get the <span> element that closes the modal
          var span = document.getElementsByClassName("close")[0];
        
          // when the user clicks on the button, open the modal
          modal.style.display = "block";
        
          // when the user clicks on <span> (x), close the modal
          span.onclick = function() {
            modal.style.display = "none";
          }
        
          // modal dropdown
          let ele = document.getElementById("selectElements")
        
          // when button is clicked
          document.getElementById('addEventButton').addEventListener("click", function() {

            // fetch title
            let title = document.getElementById('event_title').value
        
            // fetch start
            let start = document.getElementById('startDate').value
            let start_time = document.getElementById('startTime').value
            if (start_time != "") { // add start time if it's stated
              start += `T${start_time}:00`
            }
        
            // fetch end
            let end = ""
            let end_date = document.getElementById('endDate').value
            if (end_date != "") { // add end date if it is stated
              end += end_date
            }
            let end_time = document.getElementById('endTime').value
            if (end_time != "") { // add end time if it's stated
              end += `T${end_time}:00`
            }

            // if form fields are valid
            if (title != "" && start != "" && end != "") {
              // fetch items from db
              const dbRef = ref(getDatabase());
              get(child(dbRef, `users/${current_user}/user_events/`)).then((snapshot) => {
                if (snapshot.exists()) {
                  var db_values = snapshot.val();

                  // empty and readd items
                  all_events = Object.entries(db_values)
                  new_db_size = all_events.length + 2
                } 
                else {
                  new_db_size = all_events.length
                }
                // add event to array
                set(ref(db, 'users/' + current_user + '/user_events/event_' + new_db_size), 
                  {
                    title: title,
                    start: start,
                    end: end,
                    category: event_class,
                    id: new_db_size
                  },
                )

                // empty and readd items
                all_events.push(db_values)

                // display added successfully
                add_success_modal.style.display = "block";

                // force page to reload
                setTimeout(function(){
                  window.location.reload();
                }, 2000);
            
                // reset modal 
                modal.style.display = "none";
                document.getElementById("addEvent").reset();
              }).catch((error) => {
              });
          }
          
          // there are errors
          else  {

            var errors = []
          
            // get the modal
            let error_modal = document.getElementById("formValidationModal")

            // get the <span> element that closes the modal
            var error_span = document.getElementsByClassName("close")[1];

            let error_output = document.getElementById("form_errors")

            // check for empty fields
            if (title == "") {
              errors.push("Missing event title")
            }
            if (start == "") {
              errors.push("Missing start date")
            }
            if (end == "") {
              errors.push("Missing end date")
            }
            if (new Date(end) < new Date(start)) {
              errors.push("End date cannot be before start date")
            }

            // add errors
            error_output.innerHTML = '<ul>'
            for (let err of errors) {
              error_output.innerHTML += `<li> ${err} </li>`
            }
            error_output.innerHTML += '</ul>'

            error_modal.style.display = "block"

              // when the user clicks on <span> (x), close the modal
            error_span.onclick = function() {
              error_modal.style.display = "none";
            }
          }




          }
        )}
      }
    },

  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'addEvent dayGridMonth,listYear',
  },

  buttonText: {
      today:    'Today',
      month:    'Month',
      week:     'Week',
      day:      'Day',
      list:     'List'
  },

  themeSystem: 'bootstrap5',

  displayEventTime: true,

  firstDay: 1, // set first day of week to monday

  // Click on date (to add event)
  dateClick: 
    function (info) {

      // get the modal
      var modal = document.getElementById("myModal");
      var add_success_modal = document.getElementById("addSuccessModal");
      // get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[0];

      // when the user clicks on the button, open the modal
      modal.style.display = "block";
      add_success_modal.style.display = "none";

      // when the user clicks on <span> (x), close the modal
      span.onclick = function() {
        modal.style.display = "none";
      }

      // modal dropdown
      let ele = document.getElementById("selectElements")

      var dateStr = info.dateStr

      // set HTML input value as date selected
      let date_selected = document.getElementById("startDate")
      date_selected.value = dateStr

      // when button is clicked
      document.getElementById('addEventButton').addEventListener("click", function() {

        // fetch start
        var start = document.getElementById('startDate').value
        var start_time = document.getElementById('startTime').value
        if (start_time != "") { // add start time if it's stated
          start += `T${start_time}:00`
        }

        // fetch end
        var end = ""
        var end_date = document.getElementById('endDate').value
        if (end_date != "") { // add end date if it is stated
          end += end_date
        }
        var end_time = document.getElementById('endTime').value
        if (end_time != "") { // add end time if it's stated
          end += `T${end_time}:00`
        }
        
        // fetch title
        var title = document.getElementById('event_title').value
    
        // fetch start
        var start = document.getElementById('startDate').value
        var start_time = document.getElementById('startTime').value
        if (start_time != "") { // add start time if it's stated
          start += `T${start_time}:00`
        }
    
        // fetch end
        var end = ""
        var end_date = document.getElementById('endDate').value
        if (end_date != "") { // add end date if it is stated
          end += end_date
        }
        var end_time = document.getElementById('endTime').value
        if (end_time != "") { // add end time if it's stated
          end += `T${end_time}:00`
        }

        // if form fields are valid
        if (title != "" && start != "" && end != "") {
          // fetch items from db
        const dbRef = ref(getDatabase());
        get(child(dbRef, `users/${current_user}/user_events/`)).then((snapshot) => {
          if (snapshot.exists()) {
            var db_values = snapshot.val();

            // empty and readd items
            all_events = Object.entries(db_values)
            new_db_size = all_events.length + 2
          } 

          else {
            new_db_size = all_events.length
          }
          // add event to array
          set(ref(db, 'users/' + current_user + '/user_events/event_' + new_db_size), 
            {
              title: title,
              start: start,
              end: end,
              category: event_class,
              id: new_db_size
            },
          )

          // empty and readd items
          all_events.push(db_values)

          // display added successfully
          add_success_modal.style.display = "block";

          // force page to reload
          setTimeout(function(){
            window.location.reload();
          }, 2000);
      
          // reset modal 
          modal.style.display = "none";
          document.getElementById("addEvent").reset();
        }).catch((error) => {
        });
        }
      
      // there are errors
      else  {

        var errors = []
      
        // get the modal
        let error_modal = document.getElementById("formValidationModal")

        // get the <span> element that closes the modal
        var error_span = document.getElementsByClassName("close")[1];

        let error_output = document.getElementById("form_errors")

        // check for empty fields
        if (title == "") {
          errors.push("Missing event title")
        }
        if (start == "") {
          errors.push("Missing start date")
        }
        if (end == "") {
          errors.push("Missing end date")
        }
        if (new Date(end) < new Date(start)) {
          errors.push("End cannot be before start")
        }

        // add errors
        error_output.innerHTML = '<ul>'
        for (let err of errors) {
          error_output.innerHTML += `<li> ${err} </li>`
        }
        error_output.innerHTML += '</ul>'

        error_modal.style.display = "block"

          // when the user clicks on <span> (x), close the modal
        error_span.onclick = function() {
          error_modal.style.display = "none";
        }
      }
        
    }
  )},

  // API Key
  googleCalendarApiKey: 'AIzaSyC4IyTr17PyenYfQSiFD3mI3xCGIV0LsOk',
  // old: AIzaSyBLxGXn-ZzMfSKIobD-6C4chf4qI8XXRn8

  // display events
  events: 
    function(info, successCallback, failureCallback) {

      // Get a reference to the data 'title'
      const users = ref(db, 'users') 

      // Update user's calendar
      onValue(users, (snapshot => {
        const data = snapshot.val(); // get the new value

        // empty all past data fetched
        all_events = []

        let all_users = data
        let user = data[current_user]

        let upcoming_events = user.user_events

        for (let event in upcoming_events) {
          let new_event_obj = upcoming_events[event]
          
          // set event color by category
          let new_event_category = new_event_obj.category

          if (new_event_category == "") {
            new_event_category = "Default"
          }

          try {
            let find_object = colors.find(o => o.name === new_event_category); // find object with the name == new_event_category
            let new_event_color = find_object.hex

            // add color to event object
            new_event_obj["color"] = new_event_color
          }

          catch(error) {
          }
          
          all_events.push(new_event_obj)
        }

      successCallback(all_events)

    }));

  },

  // When the user clicks on an event
  eventClick: 
    function(info) {

      let event_info = info.event._def

      // get the modal
      var modal = document.getElementById("myOtherModal");
      var delete_success_modal = document.getElementById("deleteSuccessModal");

      // get the <span> element that closes the modal
      var span = document.getElementsByClassName("close")[2]

      // when the user clicks on the button, open the modal
      modal.style.display = "block";
      delete_success_modal.style.display = "none";

      // when the user clicks on <span> (x), close the modal
      span.onclick = function() {
        modal.style.display = "none";
      }

      // --- DISPLAY EVENT DETAILS ---
      // for events that the user add
      let event_id = event_info.publicId

      let event_category = info.event._def.extendedProps.category

      // if event_category is selected, set icon based on category
      if (event_category == "") {
        event_category = "Default"
      }

      // if category is valid, set color based on category
      try {
        let obj = colors.find(o => o.name === event_category); // find object with the name == new_event_category
      
        let event_colour = obj.hex
        let dot = document.getElementById("eventColor")
        dot.style.background = event_colour

        // set icon based on category
        let event_icon = event_media[event_category][1]
        let icon = document.getElementById("eventIcon")
        icon.innerHTML = `<img src="img/${event_icon}" style='height: 50px;'>`
      }

      catch (error) {
      }

      // set event picture
      let eventPicture = document.getElementById("eventPicture")
      let photo = info.event._def.extendedProps.photo_url

      // if picture retrieved from database
      if (photo != undefined) {
        eventPicture.innerHTML = `<img src=${photo} style="max-width: 100%; padding-bottom: 10px;">`
      }

      // else show default image
      else {
        let eventCategory = document.getElementById("eventCategory")

        // event category is set
        if (event_category != "") {
          let event_pic = event_media[event_category][2]
          eventPicture.innerHTML = `<img src="img/${event_pic}" style="width: 100%; padding-bottom: 10px;">`
        }
      }

      // set event title
      let eventTitle = document.getElementById("eventTitle")
      eventTitle.innerHTML = info.event._def.title

      // set event start details
      let eventStart = document.getElementById("eventStart")
      let start = info.event.start
      let start_string = String(start)
      let start_arr = start_string.split(" ")
      let start_day = start_arr[0]
      let start_month = start_arr[1]
      let start_date = start_arr[2]
      let start_year = start_arr[3]
      let start_time = start_arr[4].slice(0,5)
      let start_output = `${start_date} ${start_month} ${start_year} (${start_day}), ${start_time}`
      eventStart.innerHTML = start_output

      // set event end details
      let eventEnd = document.getElementById("eventEnd")
      let end = info.event.end
      let end_output = "-"
      if (end != null) { // if end date is specified
        let end_string = String(end)
        let end_arr = end_string.split(" ")
        let end_day = end_arr[0]
        let end_month = end_arr[1]
        let end_date = end_arr[2]
        let end_year = end_arr[3]
        let end_time = end_arr[4].slice(0,5)
        end_output = `${end_date} ${end_month} ${end_year} (${end_day}), ${end_time}`
      }
      eventEnd.innerHTML = end_output

      // set event category
      let eventCategory = document.getElementById("eventCategory")
      if (event_category != undefined) {
        eventCategory.innerHTML = event_category
      }
      else {
        eventCategory = "Not specified"
      }

      // --- DELETE EVENT ---
      document.getElementById('deleteEventButton').onclick = 
      function() {

        // Fetch event
        let event_to_delete = calendar.getEventById(event_id)

        // Delete event
        const tasksRef = ref(db, 'users/' + current_user + '/user_events/event_' + event_id);

        remove(tasksRef).then(() => {

          // display deleted successfully
          delete_success_modal.style.display = "block";

          // force page to reload
          setTimeout(function(){
            window.location.reload();
            }, 2000);
        });

    };
  }

});

calendar.render();