var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2

module.exports = GameState;

function GameState() {
  EventEmitter.call(this);
}

util.inherits(GameState, EventEmitter);

var p = GameState.prototype;
