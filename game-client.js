var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var RPCStream = require('rpc-stream').RPCStream;
var Bot = require('./game/bot');
var ArenaState = require('./game/arena').State;

module.exports = GameClient;

function GameClient() {
  EventEmitter2.call(this);
  this.stream = new RPCStream();
  this._bot = new Bot();
  this._playerContext = {};
  this._initClientApi();
}

util.inherits(GameClient, EventEmitter2);

var p = GameClient.prototype;

p.getBot = function() {
  return this._bot;
};

p.getPlayerContext = function() {
  return this._playerContext;
};

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

p._updateArenaState = function(rawArenaState) {
  var arenaState = new ArenaState(rawArenaState);
  this.emit('update', arenaState);
};

p._initClientApi = function() {
  this._api = {
    executeBotTurn: this._executeBotTurn.bind(this),
    updateArenaState: this._updateArenaState.bind(this)
  };
  this.stream.expose(this._api);
};

p._executeBotTurn = function(rawArenaState, done) {
  var bot = this._bot;
  var arenaState = new ArenaState(rawArenaState);
  bot.setArenaState(arenaState);
  var playerContext = this.getPlayerContext();
  try {
    bot.clearActions();
    if(typeof playerContext.onBotTurn === 'function') {
      playerContext.onBotTurn(arenaState.getCurrentTurn(), bot);
    }
    var actions = bot.getActions();
    done(null, actions);
  } catch(err) {
    return done(err);
  }
};