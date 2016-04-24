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
var votes = {};
var polls = {};

server.listen(port, function() {
  console.log('Listening on port ' + port + '.');
});

app.use(express.static('public'));

app.get('/', function(req, res){
  res.render('welcome');
});

app.get('/new', function(req, res){
  console.log(req.query['poll-title']);
  console.log(req.query['option-a']);
  var newPollId = pollId();
  var newAdminId = pollId();

  polls[newPollId] = { adminId: newAdminId,
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
  res.render('new', { adminLink: adminLink, voterLink: voterLink });
});

app.get('/polls/:id', function(req, res){
  res.render('voter-poll', { pollId: req.params.id });
});

app.get('/polls/:id/admin/:adminId', function(req, res){
  res.render('admin-poll', { pollId: req.params.id, adminId: req.params.adminId });
});

io.on('connection', function(socket) {
  console.log('A user has connected. Active users: ' + io.engine.clientsCount + '.');
  io.sockets.emit('connectedUsers', io.engine.clientsCount);
  socket.emit('statusMessage', 'You have connected.');
  socket.emit('voteCount', countVotes(votes));

  socket.on('disconnect', function() {
    console.log('A user has disconnected. Active users: ' + io.engine.clientsCount + '.');
    io.sockets.emit('connectedUsers', io.engine.clientsCount);
  });

  socket.on('message', function(channel, message) {
    if (channel === 'voteCast') {
      votes[socket.id] = message;
      var confirmMessage = 'You have cast your vote for: ' + message + '.';
      io.sockets.emit('voteCount', countVotes(votes));
      socket.emit('voteConfirm', confirmMessage);
    }
  });
});

module.exports = server;
