//Socket Initialization
const socket = io();


//Hidden Data Fields
var pollId = document.getElementById('poll-id');
var pollOpen = document.getElementById('poll-open');
var endTime = document.getElementById('poll-end-time');
var anonymous = document.getElementById('anonymous');


//DOM Elements
var connections = document.getElementById('connections');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var allVoteButtons = document.querySelectorAll('.vote-button');
var voteMessage = document.getElementById('vote-message');
var voteConfirm = document.getElementById('vote-confirm');
var aVotes = document.getElementById('a-votes');
var bVotes = document.getElementById('b-votes');
var cVotes = document.getElementById('c-votes');
var dVotes = document.getElementById('d-votes');


//On Document Loading Complete
document.addEventListener("DOMContentLoaded", function(event) {
  console.log(pollOpen.innerText);
  checkForExpiration();
  addButtonEventListeners();
  hideResultsIfAnonymous();
  hideVoteButtonsIfClosed();
  addButtonListenersIfAdmin();
});


//Base Socket Listeners
socket.on('connectedUsers', function(count) {
  if (connections) { connections.innerText = 'Connected Users: ' + count + '.'; }
});

socket.on('statusMessage', function(message) {
  if (statusMessage) { statusMessage.innerText = message; }
});

socket.on('pollClosed', function(message) {
  closePollIfIdMatches(message);
});

socket.on('voteCount', function(voteObj) {
  setVoteDisplay(voteObj);
});

socket.on('voteConfirm', function(confirm) {
  voteConfirm.innerText = confirm;
});


//Helper Functions
function checkForExpiration() {
  var date = new Date();
  var currentTime = date.getTime();
  if (endTime && currentTime > parseInt(endTime.innerText)) {
    pollOpen.innerText = 'false';
    socket.send('closePoll', { pollId: pollId.innerText });
  }
}

function addButtonEventListeners() {
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function() {
      checkForExpiration();
      if (pollOpen.innerText === 'true') {
        socket.send('voteCast', { voteName: this.name, pollId: pollId.innerText });
      }
    });
  }
}

function hideResultsIfAnonymous() {
  if (anonymous && anonymous.innerText === 'true' && !isAdmin()) {
    voteMessage.innerText = "Poll results are hidden.";
    document.getElementById('all-votes').style.display = 'none';
  }
}

function hideVoteButtonsIfClosed() {
  if (pollOpen && pollOpen.innerText === 'false') {
    for (var i = 0; i < allVoteButtons.length; i++) {
      allVoteButtons[i].style.display = 'none';
    }
    voteMessage.innerText = "No further votes allowed, poll has closed!";
  }
}

function addButtonListenersIfAdmin() {
  if (isAdmin()) {
    var showResults = document.getElementById('show-results-button');
    var closePoll = document.getElementById('close-poll-button');

    showResults.addEventListener('click', function() {
      socket.send('voteCast', { voteName: this.name, pollId: pollId.innerText });
    });

    closePoll.addEventListener('click', function() {
      socket.send('closePoll', { pollId: pollId.innerText });
    });
  }
}

function closePollIfIdMatches(message) {
  if (message === pollId.innerText) {
    for (var i = 0; i < allVoteButtons.length; i++) {
      allVoteButtons[i].style.display = 'none';
      voteMessage.innerText = "No further votes allowed, poll has closed!";
    }
  }
}

function setVoteDisplay(voteObj) {
  if (voteObj && voteObj.msgPollId === pollId.innerText) {
    aVotes.innerText = voteObj.votes["A"];
    bVotes.innerText = voteObj.votes["B"];
    cVotes.innerText = voteObj.votes["C"];
    dVotes.innerText = voteObj.votes["D"];
  }
}

function isAdmin() {
  return document.getElementById('admin-id') ? true : false;
}
