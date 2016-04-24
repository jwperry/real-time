const socket = io();

var connections = document.getElementById('connections');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var voteConfirm = document.getElementById('vote-confirm');
var aVotes = document.getElementById('a-votes');
var bVotes = document.getElementById('b-votes');
var cVotes = document.getElementById('c-votes');
var dVotes = document.getElementById('d-votes');
var pollId = document.getElementById('poll-id');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    socket.send('voteCast', { voteName: this.name, pollId: pollId.innerText });
  });
}

socket.on('connectedUsers', function(count) {
  connections.innerText = 'Connected Users: ' + count + '.';
});

socket.on('statusMessage', function(message) {
  statusMessage.innerText = message;
});

socket.on('voteCount', function(voteObj) {
  debugger;
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
