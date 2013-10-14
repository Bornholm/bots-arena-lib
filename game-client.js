var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var RPCStream = require('rpc-stream').RPCStream;
var Bot = require('./game/bot');

module.exports = GameClient;

function GameClient() {
  EventEmitter2.call(this);
  this.stream = new RPCStream();
  this._bot = new Bot();
}

util.inherits(GameClient, EventEmitter2);

var p = GameClient.prototype;

p.join = function(arenaID, done) {
  this.stream.call('join', this._bot.getID(), arenaID, done);
  return this;
};

p.leave = function(arenaID, done) {
  this.stream.call('leave', this._bot.getID(), arenaID, done);
  return this;
};

p.getArenasList = function(done) {
  this.stream.call('getArenasList', done);
  return this;
};