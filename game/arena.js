var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');
var TurnManager = require('./turn-manager');
var Bot = require('./bot');
var async = require('async');
var _ = require('lodash');

var slice = Array.prototype.slice;

module.exports = Arena;

Arena.State = ArenaState;

function Arena(options) {

  this._options = options || {};

  EventEmitter2.call(this);

  this._bots = {};
  this._turnManager = new TurnManager();
  this._keepRunning = false;
  this._grid = {};
  this._gridSize = {
    columns: 10,
    rows: 10
  };

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

p.addBot = function(botID, rpc) {
  var bot = this._bots[botID];
  if(!bot) {
    bot = {
      data: this._getDefaultBotData(),
      rpc: rpc
    };
    this._bots[botID] = bot;
    this._turnManager.addActor(botID);
    this._callHook('onBotAdd', botID, bot);
  }
  return this;
};

p.removeBot = function(botID) {
  // TODO
};

p.start = function() {
  var arena = this;
  arena._keepRunning = true;
  async.whilst(
    function() {
      return arena._keepRunning;
    },
    this._next.bind(this),
    function(err) {
      console.log('whilst', arguments);
    }
  );
};

p.pause = function() {
  this._keepRunning = false;
};

p.reset = function() {
  // TODO
};

p.validateAction = function(botID, action) {
  // TODO
  return true;
};

p.applyAction = function(botID, action) {
  // TODO
  return this;
};

p._callHook = function(hookId) {
  var fn = this[hookId];
  var args = slice.call(arguments, 1);
  if(typeof fn === 'function') {
    fn.apply(this, args);
  }
};

p._getDefaultBotData = function() {
  var data = {
    hp: 50,
    direction: {
      x: 1,
      y: 1
    },
    position: {
      x: 0,
      y: 0
    }
  };
  this._callHook('onNewBotData', data);
  return data;
};

p._next = function(done) {

  var interval = this._options.interval || 5000;

  var turnManager = this._turnManager;
  var botID = turnManager.nextActor();

  if(botID) {
    this._callHook('onNextBot', botID);
    this._executeTurn(botID, function(err) {
      if(err) {
        return done(err);
      }
      return setTimeout(done, interval);
    });
  } else {
    turnManager.nextTurn();
    this._callHook('onNewTurn', turnManager.getCurrentTurn());
    return setTimeout(done, interval);
  }
};

p._executeTurn = function(botID, done) {
  var arena = this;
  var bot = arena._bots[botID];
  bot.rpc.call('executeBotTurn', arena.getArenaState(), function(err, actions) {
    if(err) {
      return done(err);
    }
    actions = actions || [];
    var i, len, action;
    arena._callHook('onBotActions', botID, actions);
    for(i = 0, len = actions.length; i < len; ++i) {
      action = actions[i];
      if(arena.validateAction(botID, action)) {
        arena.applyAction(botID, action);
      } else {
        return done(new Error('Invalid action !'));
      }
    }
    return done();
  });
  return arena;
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
  this.bots = _.reduce(arena._bots, function(result, bot, botID) {
    result[botID] = bot.data;
    return result;
  }, {});
  this.currentTurn = arena._turnManager.getCurrentTurn();
  this.gridSize = arena._gridSize;
};

p.fromRawData = function(raw) {
  this.bots = raw.bots;
  this.currentTurn = raw.currentTurn;
};

p.getBot = function(botID) {
  return this.bots[botID];
};

p.getBotPosition = function(botID) {
  var bot = this.getBot(botID);
  if(bot) {
    return _.clone(bot.position);
  }
};

p.getBotDirection = function(botID) {
  var bot = this.getBot(botID);
  if(bot) {
    return _.clone(bot.direction);
  }
};

p.getCurrentTurn = function() {
  return this.currentTurn;
};

p.getBotHP = function(botID) {
  var bot = this.getBot(botID);
  if(bot) {
    return bot.hp;
  }
};