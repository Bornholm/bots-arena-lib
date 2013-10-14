var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var RPCStream = require('rpc-stream').RPCStream;
var Arena = require('./game/arena');

module.exports = GameServer;

function GameServer() {
  EventEmitter2.call(this);
  this._streams = [];
  this._arenas = [];
  this._initServerApi();
}

util.inherits(GameServer, EventEmitter2);

var p = GameServer.prototype;

p.getNewRPCStream = function() {
  var stream = new RPCStream();
  stream.expose(this._api);
  this._streams.push(stream);
  return stream;
};

p._initServerApi = function() {
  this._api = {
    join: this.join.bind(this),
    leave: this.leave.bind(this),
    getArenasList: this.getArenasList.bind(this)
  };
};

p.findArenaByID = function(arenaID) {
  var arenas = this._arenas;
  var i, len, arena;
  for(i = 0, len = arenas.length; i < len; ++i) {
    arena = arenas[i];
    if(arena.getID() === arenaID) {
      return arena;
    }
  }
};

p.join = function(botID, arenaID, done) {
  var arena = this.findArenaByID(arenaID);
  if(arena) {
    arena.addBot(botID);
    return done();
  } else {
    return done(new Error('Invalid Arena ID !'));
  }
};

p.leave = function(botID, arenaID, done) {
  // TODO
};

p.getArenasList = function(done) {
  var arenas = this._arenas.map(function(a) {
    return a.getID();
  });
  done(null, arenas);
};

p.openArena = function(arena) {
  this._arenas.push(arena);
  arena.start();
  this.emit('arena.open', arena);
};

p.closeArena = function(arena) {
  //TODO
};