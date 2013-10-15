var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var RPCStream = require('rpc-stream').RPCStream;
var Arena = require('./game/arena');

module.exports = GameServer;

function GameServer() {
  EventEmitter2.call(this);
  this._streams = [];
  this._arenas = {};
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
    join: unshiftArgs(this.join, this),
    leave: unshiftArgs(this.leave, this),
    getArenasList: unshiftArgs(this.getArenasList, this)
  };
};

p.findArenaByID = function(arenaID) {
  return this._arenas[arenaID];
};

p.join = function(gameServer, botID, arenaID, done) {
  var rpcStream = this;
  var arena = gameServer.findArenaByID(arenaID);
  if(arena) {
    arena.addBot(botID, rpcStream);
    return done();
  } else {
    return done(new Error('Invalid Arena ID !'));
  }
};

p.leave = function(gameServer, botID, arenaID, done) {
  // TODO
};

p.getArenasList = function(gameServer, done) {
  var arenas = Object.keys(gameServer._arenas);
  done(null, arenas);
};

p.openArena = function(arena) {
  this._arenas[arena.getID()] = arena;
  arena.start();
  this.emit('arena.open', arena);
};

p.closeArena = function(arena) {
  //TODO
};


// Helpers

var slice = Array.prototype.slice;

function unshiftArgs(fn) {
  var unshiftedArgs = slice.call(arguments, 1);
  return function partial() {
    var args = slice.call(arguments);
    args.unshift.apply(args, unshiftedArgs);
    fn.apply(this, args);
  };
};