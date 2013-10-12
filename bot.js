var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');


module.exports = Bot;

function Bot() {

  EventEmitter.call(this);

  // Private variables;
  var _gameState;
  var _botID = uuid.v4();

  // Privileged methods
  this.getHealthPoints = function() {
    return _gameState.getBotHP(_botID);
  };

  this.setGameState = function(gameState) {
    _gameState = gameState;
  };

  this.getPosition = function() {
    return _gameState.getBotPosition(_botID);
  };

  this.getVisibleOpponents = function() {
    var position = _gameState.getBotPosition(_botID);
    var direction = _gameState.getBotDirection(_botID);
    var visibleOpponents = [];
    // TODO
    return visibleOpponents;
  };


}

util.inherits(Bot, EventEmitter);

var p = Bot.prototype;

p.moveTo = function(position) {
  // TODO
};

p.fireAt = function(position) {
 // TODO
};