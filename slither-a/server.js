var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/src',express.static(__dirname + '/src'));
app.use('/asset',express.static(__dirname + '/asset'));

var skinNum = 0;
app.get('/game',function(req, res){
  skinNum = req.query.skin;
  console.log('skinNumber: '+ skinNum);

  res.sendFile('index.html', { root: __dirname });
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 9000,function(){
  console.log('Listening on '+server.address().port);
});

io.on('connection', function(socket){
  socket.on('getSkin', function(){
    socket.emit('skinHere', skinNum);
  })
});