var Arena = require('../../game/arena');
var util = require('util');

module.exports = BasicArena;

util.inherits(BasicArena, Arena);

function BasicArena(opts) {
  Arena.call(this, opts);
  this._size = {
    width: 20,
    height: 20
  }
}

var p = BasicArena.prototype;

// Set random position when bot entering the arena
p.onBotAdd = function(botID, bot) {

  var x, y;

  do {
    x = Math.floor(Math.random() * this.getWidth());
    y = Math.floor(Math.random() * this.getHeight()); 
  } while( this.isOccupied(x, y) || !this.isWalkable(x, y) )

  bot.setPosition(x, y);

};

p.onNewTurn = function(turn) {
  console.log('Arena:', 'New turn:', turn);
};

p.onNextBot = function(botID) {
  console.log('Arena:', 'Bot playing:', botID);
};