var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');
var TurnManager = require('./turn-manager');
var Bot = require('./bot');
var async = require('async');

module.exports = Arena;

function Arena() {

  EventEmitter2.call(this);

  this._bots = [];
  this._turnManager = new TurnManager();
  this._keepRuning = false;

  // Private
  var _arenaID = uuid.v4();

  // Privileged methods
  this.getID = function() {
    return _arenaID;
  };

}

util.inherits(Arena, EventEmitter2);

var p = Arena.prototype;

p.getArenaState = function() {
  return new ArenaState(this);
};

p.addBot = function(botID) {
  var bot = new Bot(botID);
  this._turnManager.addActor(botID);
  return this;
};

p.removeBot = function(botID) {
  // TODO
};

p.start = function() {
  var arena = this;
  arena._keepRuning = true;
  async.whilst(
    function() {
      return arena._keepRuning;
    },
    this._next.bind(this),
    function(err) {
      console.log('whilst', arguments);
    }
  );
};

p.pause = function() {
  this._keepRuning = false;
};

p.reset = function() {
  
};

p._next = function(cb) {

  var turnManager = this._turnManager;
  var botID = turnManager.nextActor();

  if(botID) {
    console.log('Bot playing:', botID);
    this._executeTurn(botID, function(err) {
      if(err) {
        return cb(err);
      }
      return setTimeout(cb, 5000);
    });
  } else {
    turnManager.nextTurn();
    console.log('New turn:', turnManager.getCurrentTurn());
    return setTimeout(cb, 5000);
  }
};

p._executeTurn = function(botID, cb) {
  return cb();
};

/* Arena State */

function ArenaState(arenaOrState) {
  if(arenaOrState instanceof Arena) {
    this.snapshot(arenaOrState);
  } else {
    this.fromRawData(arenaOrState);
  }
}

p = ArenaState.prototype;

p.snapshot = function(arena) {

};

p.fromRawData = function(raw) {

};

p.toJSON = function() {

};