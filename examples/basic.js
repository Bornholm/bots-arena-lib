var GameClient = require('../game-client');
var GameServer = require('../game-server');
var Arena = require('../game/arena');

var client1 = new GameClient();
var client2 = new GameClient();

var server = new GameServer();

var serverStream1 = server.getNewRPCStream();
var serverStream2 = server.getNewRPCStream();

// client1 <-> server
client1.stream.pipe(serverStream1).pipe(client1.stream);
// client2 <-> server
client2.stream.pipe(serverStream2).pipe(client2.stream);

var arena = new Arena();

server.openArena(arena);

client1.join(arena.getID(), function(err) {
  console.log('Client 1 joined arena !')
});

client2.join(arena.getID(), function(err) {
  console.log('Client 2 joined arena !')
});


