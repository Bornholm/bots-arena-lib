function onError(err) {
  console.error(err.stack);
  if(err.error) {
    console.error(err.error.stack);
  }
}

process.on('uncaughtException', onError);

var JSONStream = require('JSONStream');
var net = require('net');
var GameServer = require('../../game-server');
var JSONSerializer = require('../../util/json-serializer');
var BasicArena = require('./basic-arena');

var game = new GameServer();

var arena = new BasicArena({
  interval: 250
});

game.openArena(arena);

function handleConnection(connection) {

  console.log('New client !');

  var serializer = new JSONSerializer();
  var parser = new JSONStream.parse();
  var gameStream = game.getNewRPCStream();

  connection
    .pipe(parser)
    .pipe(gameStream)
    .pipe(serializer)
    .pipe(connection);

}

var tcpServer = net.createServer(handleConnection);

tcpServer.listen(1337, function() {
  console.log('Server listening !');
});