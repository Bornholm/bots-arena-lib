var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2

module.exports = GameState;

function GameState() {
  EventEmitter2.call(this);
}

util.inherits(GameState, EventEmitter2);

var p = GameState.prototype;
