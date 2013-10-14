var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');

module.exports = Bot;

function Bot(botID) {

  EventEmitter2.call(this);

  // Private variables;
  var _arenaState;
  var _botID = botID || uuid.v4();

  // Privileged methods
  this.getHealthPoints = function() {
    return _arenaState.getBotHP(_botID);
  };

  this.setArenaState = function(arenaState) {
    if(!(arenaState instanceof ArenaState)) {
      arenaState = new ArenaState(arenaState);
    }
    _arenaState = gameState;
  };

  this.getPosition = function() {
    return _arenaState.getBotPosition(_botID);
  };

  this.getVisibleOpponents = function() {
    var position = _arenaState.getBotPosition(_botID);
    var direction = _arenaState.getBotDirection(_botID);
    var visibleOpponents = [];
    // TODO
    return visibleOpponents;
  };

  this.getID = function() {
    return _botID;
  };

}

util.inherits(Bot, EventEmitter2);

var p = Bot.prototype;

p.moveTo = function(position) {
  // TODO
};

p.fireAt = function(position) {
 // TODO
};