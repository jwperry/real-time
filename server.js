const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const server = http.createServer(app);
const socketIo = require('socket.io');
const io = socketIo(server);
const countVotes = require('./lib/count-votes');
const pollId = require('./lib/poll-id');

app.locals.title = 'CrowdSource'
app.locals.votes = {};

server.listen(port, function() {
  console.log('Listening on port ' + port + '.');
});

app.use(express.static('public'));

app.get('/', function(req, res){
  res.sendFile(__dirname + '/public/welcome.html');
});

app.get('/new', function(req, res){
  res.sendFile(__dirname + '/public/new.html');
});

io.on('connection', function(socket) {
  console.log('A user has connected. Active users: ' + io.engine.clientsCount + '.');
  io.sockets.emit('connectedUsers', io.engine.clientsCount);
  socket.emit('statusMessage', 'You have connected.');
  socket.emit('voteCount', countVotes(app.locals.votes));

  socket.on('disconnect', function() {
    console.log('A user has disconnected. Active users: ' + io.engine.clientsCount + '.');
    io.sockets.emit('connectedUsers', io.engine.clientsCount);
  });

  socket.on('message', function(channel, message) {
    if (channel === 'voteCast') {
      app.locals.votes[socket.id] = message;
      var confirmMessage = 'You have cast your vote for: ' + message + '.';
      io.sockets.emit('voteCount', countVotes(app.locals.votes));
      socket.emit('voteConfirm', confirmMessage);
    }
  });
});

module.exports = server;
