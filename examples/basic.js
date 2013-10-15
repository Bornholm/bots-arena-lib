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

var arena = new Arena({
  interval: 1000
});

var player1Context = client1.getPlayerContext();

player1Context.onBotTurn = function(bot) {
  console.log('------', 'Turn', bot.getCurrentTurn(), '|', 'Bot', bot.getID(), '------')
  console.log('Position', bot.getPosition());
  bot.moveTo(1, 1);
};

arena.onNewTurn = function(turn) {
  console.log('Arena:', 'New turn:', turn);
};

arena.onNextBot = function(botID) {
  console.log('Arena:', 'Bot playing:', botID);
};

arena.onBotActions = function(botID, actions) {
  console.log('Arena:', 'Bot Actions', botID, actions);
};

server.openArena(arena);

client1.join(arena.getID(), function(err) {
  console.log('Client:', client1.getBot().getID(), 'joined arena !')
});

client2.join(arena.getID(), function(err) {
  console.log('Client:', client2.getBot().getID(), 'joined arena !')
});


