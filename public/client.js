const socket = io();

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
var pollId = document.getElementById('poll-id');
var pollOpen = document.getElementById('poll-open');
var endTime = document.getElementById('poll-end-time');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    checkForExpiration();
    if (pollOpen.innerText === 'true') {
      socket.send('voteCast', { voteName: this.name, pollId: pollId.innerText });
    }
    else {
      for (var i = 0; i < allVoteButtons.length; i++) {
        allVoteButtons[i].style.display = 'none';
        voteMessage.innerText = "No further votes allowed, poll has closed!";
      }
    }
  });
}

socket.on('connectedUsers', function(count) {
  connections.innerText = 'Connected Users: ' + count + '.';
});

socket.on('statusMessage', function(message) {
  statusMessage.innerText = message;
});

socket.on('pollClosed', function(message) {
  if (message === pollId.innerText) {
    for (var i = 0; i < allVoteButtons.length; i++) {
      allVoteButtons[i].style.display = 'none';
      voteMessage.innerText = "No further votes allowed, poll has closed!";
    }
  }
});

socket.on('voteCount', function(voteObj) {
  if (voteObj.msgPollId === pollId.innerText) {
    aVotes.innerText = voteObj.votes["A"];
    bVotes.innerText = voteObj.votes["B"];
    cVotes.innerText = voteObj.votes["C"];
    dVotes.innerText = voteObj.votes["D"];
  }
});

socket.on('voteConfirm', function(confirm) {
  voteConfirm.innerText = confirm;
});

if (document.getElementById('admin-id')) {
  var showResults = document.getElementById('show-results-button');
  var closePoll = document.getElementById('close-poll-button');

  showResults.addEventListener('click', function() {
    socket.send('voteCast', { voteName: this.name, pollId: pollId.innerText });
  });

  closePoll.addEventListener('click', function() {
    socket.send('closePoll', { pollId: pollId.innerText });
  });
}

function checkForExpiration() {
  var date = new Date();
  var currentTime = date.getTime();
  if (currentTime > endTime.innerText) {
    pollOpen.innerText = 'false';
  }
}
