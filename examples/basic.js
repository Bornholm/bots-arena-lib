process.on('uncaughtError', console.error);

var GameClient = require('../game-client');
var GameServer = require('../game-server');
var Arena = require('../game/arena');

var client1 = new GameClient();
var client2 = new GameClient();

var server = new GameServer();

var serverStream1 = server.getNewRPCStream();
var serverStream2 = server.getNewRPCStream();

serverStream1.on('error', onError);
serverStream2.on('error', onError);

// client1 <-> server
client1.stream.pipe(serverStream1).pipe(client1.stream);
// client2 <-> server
client2.stream.pipe(serverStream2).pipe(client2.stream);

function onError(err) {
  console.error(err.stack);
  if(err.error) {
    console.error(err.error.stack);
  }
}

client1.stream.on('error', onError);
client2.stream.on('error', onError);

function onBotTurn(bot) {
  console.log('------', 'Turn', bot.getCurrentTurn(), '|', 'Bot', bot.getID(), '------')
  console.log('Position', bot.getPosition());
  bot.moveTo( Math.round(-1 + Math.random() * 2) , Math.round(-1 + Math.random() * 2));
}

var p1Context = client1.getPlayerContext();
var p2Context = client2.getPlayerContext();

p1Context.onBotTurn = onBotTurn;
p2Context.onBotTurn = onBotTurn;

var arena = new Arena({
  interval: 250
});

arena.on('error', onError);

arena.onBotAdd = function(botID, bot) {
  bot.position.x = Math.floor(Math.random() * arena.getWidth());
  bot.position.y = Math.floor(Math.random() * arena.getHeight()); 
};

arena.onNewTurn = function(turn) {
  console.log('Arena:', 'New turn:', turn);
};

arena.onNextBot = function(botID) {
  console.log('Arena:', 'Bot playing:', botID);
  printGrid();
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

function printGrid() {
  var width = arena.getWidth();
  var height = arena.getHeight();
  var i, j, line, isOccupied;
  console.log('\033[2J'); // Erase screen
  console.log('\033[' + (height + 5) + 'A'); // Move up cursor grid height + 5 lines
  for(i = 0; i < width; ++i) {
    line = '';
    for(j = 0; j < height; ++j) {
      isOccupied = arena.isOccupied(i, j);
      line += isOccupied ? '[o]' : '[ ]';
    }
    console.log(line);
  }
};



