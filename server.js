//Server/Socket Initialization
const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const countVotes = require('./lib/count-votes');
const pollId = require('./lib/poll-id');
app.set('view engine', 'ejs');
app.use(express.static('public'));

server.listen(port, function() {
  console.log('Listening on port ' + port + '.');
});


//Data Store Objects
var votes = {};
var polls = {};


//Routes
app.get('/', function(req, res){
  res.render('welcome');
});

app.get('/new', function(req, res){
  var pollLinks = constructNewPoll(req);
  res.render('new', { adminLink: pollLinks.adminLink, voterLink: pollLinks.voterLink });
});

app.get('/polls/:id', function(req, res){
  res.render('voter-poll', { poll: polls[req.params.id],
                             pollId: req.params.id
                           });
});

app.get('/polls/:id/admin/:adminId', function(req, res){
  res.render('admin-poll', { poll: polls[req.params.id],
                             pollId: req.params.id,
                             adminId: req.params.adminId
                           });
});


//Socket Event Listener Initialization
io.on('connection', function(socket) {
  console.log('A user has connected. Active users: ' + io.engine.clientsCount + '.');
  io.sockets.emit('connectedUsers', io.engine.clientsCount);
  socket.emit('statusMessage', 'You have connected.');

  socket.on('disconnect', function() {
    console.log('A user has disconnected. Active users: ' + io.engine.clientsCount + '.');
    io.sockets.emit('connectedUsers', io.engine.clientsCount);
  });

  socket.on('message', function(channel, message) {
    closePollMessage(channel, message);
    voteCastMessage(channel, message, socket);
  });
});


//Helper Functions
function sendConfirmMessage(voteName, socket) {
  if (voteName !== 'resultsOnly') {
    var confirmMessage = 'You have cast your vote for: ' + voteName + '.';
    socket.emit('voteConfirm', confirmMessage);
  }
  else {
    var confirmMessage = 'You abstain from voting.';
    socket.emit('voteConfirm', confirmMessage);
  }
}

function constructNewPoll(req){
  var newPollId = pollId();
  var newAdminId = pollId();
  var anonymous = req.query['anonymous'] ? true : false;
  polls[newPollId] = { adminId: newAdminId,
                       pollOpen: true,
                       anonymous: anonymous,
                       endTime: calculateTime(req.query['end-time']),
                       description: req.query['poll-description'],
                       optionA: req.query['option-a'],
                       optionB: req.query['option-b'],
                       optionC: req.query['option-c'],
                       optionD: req.query['option-d'],
                       A: 0,
                       B: 0,
                       C: 0,
                       D: 0 
                     };

  adminLink = req.headers.host + '/polls/' + newPollId + '/admin/' + newAdminId 
  voterLink = req.headers.host + '/polls/' + newPollId
  return { adminLink: adminLink, voterLink: voterLink };
}

function calculateTime(reqQueryEndTime) {
  var endTime = new Date(reqQueryEndTime);
  var timeOffset = endTime.getTimezoneOffset() * 60 * 1000;
  return endTime.getTime() + timeOffset;
}

function closePollMessage(channel, message) {
  if (channel === 'closePoll') {
    polls[message['pollId']]['pollOpen'] = false;
    io.sockets.emit('pollClosed', message['pollId']);
  }
}

function voteCastMessage(channel, message, socket) {
  if (channel === 'voteCast') {
    votes[message['pollId']] = votes[message['pollId']] || {};
    votes[message['pollId']][socket.id] = votes[message['pollId']][socket.id] || {};
    votes[message['pollId']][socket.id] = message['voteName'];
    io.sockets.emit('voteCount', { votes: countVotes(votes, message['pollId'], socket.id), msgPollId: message['pollId'] });
    
    sendConfirmMessage(message['voteName'], socket);      
  }
}


//Exports
module.exports = server;
