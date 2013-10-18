function onError(err) {
  console.error(err.stack);
  if(err.error) {
    console.error(err.error.stack);
  }
}

process.on('uncaughtException', onError);

var JSONStream = require('JSONStream');
var net = require('net');
var GameClient = require('../../game-client');
var JSONSerializer = require('../../util/json-serializer');

var serializer = new JSONSerializer();
var parser = JSONStream.parse();
var gameClient = new GameClient();
var tcpClient = net.connect(1337);

tcpClient
  .pipe(parser)
  .pipe(gameClient.stream)
  .pipe(serializer)
  .pipe(tcpClient);

var playerContext = gameClient.getPlayerContext();

// "Player" code
playerContext.onBotTurn = function(currentTurn, bot) {
  // Random movement every turn
  bot.moveTo( Math.round(-1 + Math.random() * 2) , Math.round(-1 + Math.random() * 2));
};

gameClient.getArenasList(function(err, list) {

  if(err) {
    throw err;
  }

  if(list.length > 0) {

    gameClient.join(list[0], function(err, arena) {
      if(err) {
        throw err;
      }
      console.log('Entered arena !')
    });

  } else {
    console.log('No arena !')
  }

});

gameClient.on('update', function(arenaState)  {
  console.log('\033[2J');
  printGrid(arenaState);
  console.log('Turn:', arenaState.getCurrentTurn());
  var botID = gameClient.getBot().getID();
  console.log('HP:', arenaState.getBotHP(botID));
  console.log('Position:', arenaState.getBotPosition(botID));
});

var cursorSaved = false;
function printGrid(arenaState) {
  if(!cursorSaved) {
    console.log('\033[s');
    cursorSaved = true;
  }
  console.log('\033[u');
  var width = arenaState.getWidth();
  var height = arenaState.getHeight();
  var botID = gameClient.getBot().getID();
  var i, j, line, occupant;
  console.log('\033[' + (height + 5) + 'A'); // Move up cursor grid height + 5 lines
  for(i = 0; i < height; ++i) {
    line = '';
    for(j = 0; j < width; ++j) {
      occupant = arenaState.isOccupied(i, j);
      if(occupant) {
        line += (occupant === botID ? '\033[32m' : '\033[31m') + '[o]' + '\033[0m';
      } else {
        line += '[ ]';
      }
      
    }
    console.log(line);
  }
};