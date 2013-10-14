var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');

module.exports = TurnManager;

function TurnManager() {
  EventEmitter2.call(this);
  this._currentTurn = 0;
  this._actors = [];
  this._waitingActors = [];
}

var p = TurnManager.prototype;

p.getCurrentTurn = function() {
  return this._currentTurn;
};

p.nextTurn = function() {
  var waitingActors = this._waitingActors;
  this._currentTurn++;
  waitingActors.length = 0;
  waitingActors.push.apply(waitingActors, this._actors);
  return this;
};

p.nextActor = function() {
  return this._waitingActors.shift();
};

p.addActor = function(actorID) {
  var index = this._actors.indexOf(actorID);
  if(index === -1) {
    this._actors.push(actorID);
  }
  return this;
};