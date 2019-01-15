var path = require('path');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);

app.use('/src',express.static(__dirname + '/src'));
app.use('/asset',express.static(__dirname + '/asset'));

app.get('/',function(req, res){
  var name = req.query.name;
  var skin = req.query.skin;
  
  res.sendFile('index.html', { root: __dirname });
});

server.lastPlayderID = 0;

server.listen(process.env.PORT || 9000,function(){
  console.log('Listening on '+server.address().port);
});