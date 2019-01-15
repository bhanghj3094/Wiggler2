var Client ={};
Client.socket = io.connect();

Client.getSkin = function(){
  console.log('getSkin');
  Client.socket.emit('getSkin');
};

Client.socket.on('skinHere', function(skinNumber){
  console.log('client skinnum'+skinNumber);
  Game.loadImages(skinNumber);
  console.log('client skinnum'+skinNumber);
});