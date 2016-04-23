const socket = io();

var connections = document.getElementById('connections');
var statusMessage = document.getElementById('status-message');
var buttons = document.querySelectorAll('#choices button');
var voteConfirm = document.getElementById('vote-confirm');
var votes = document.getElementById('all-votes');
var aVotes = document.getElementById('a-votes');
var bVotes = document.getElementById('b-votes');
var cVotes = document.getElementById('c-votes');
var dVotes = document.getElementById('d-votes');

for (var i = 0; i < buttons.length; i++) {
  buttons[i].addEventListener('click', function() {
    socket.send('voteCast', this.innerText);
  });
}

socket.on('connectedUsers', function(count) {
  connections.innerText = 'Connected Users: ' + count + '.';
});

socket.on('statusMessage', function(message) {
  statusMessage.innerText = message;
});

socket.on('voteCount', function(votes) {
  aVotes.innerText = 'A: ' + votes["A"];
  bVotes.innerText = 'B: ' + votes["B"];
  cVotes.innerText = 'C: ' + votes["C"];
  dVotes.innerText = 'D: ' + votes["D"];
});

socket.on('voteConfirm', function(confirm) {
  voteConfirm.innerText = confirm;
});
