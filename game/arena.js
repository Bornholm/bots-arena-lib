var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');
var TurnManager = require('./turn-manager');
var Bot = require('./bot');
var async = require('async');
var _ = require('lodash');
var Action = require('./action');

var slice = Array.prototype.slice;

module.exports = Arena;

Arena.State = ArenaState;

function Arena(options) {

  this._options = options || {};

  EventEmitter2.call(this);

  this._bots = {};
  this._rpcStreams = {};
  this._turnManager = new TurnManager();
  this._keepRunning = false;
  this._grid = {};
  this._size = {
    width: 10,
    height: 10
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

p.addBot = function(botID, rpc) {
  var bot = this._bots[botID];
  if(!bot) {
    bot = new Bot(botID);
    bot.extend(this._getDefaultBotData());
    this._bots[botID] = bot;
    this._rpcStreams[botID] = rpc;
    this._callHook('onBotAdd', botID, bot);
    this._turnManager.addActor(botID);
  }
  return this;
};

p.removeBot = function(botID) {
  // TODO
};

p.getArenaState = function() {
  return new ArenaState(this);
};

p.getRPCStream = function(botID) {
  return this._rpcStreams[botID];
};

/* Common methods */

var commonMethods = {

  getBot: function(botID) {
    return this._bots[botID];
  },

  getBotDirection: function(botID) {
    var bot = this.getBot(botID);
    if(bot) {
      return _.clone(bot._direction);
    }
  },

  getBotPosition: function(botID) {
    var bot = this.getBot(botID);
    if(bot) {
      return _.clone(bot._position);
    }
  },

  getBotHP: function(botID) {
    var bot = this.getBot(botID);
    if(bot) {
      return bot._hp;
    }
  },

  getWidth: function() {
    return this._size.width;
  },

  getHeight: function() {
    return this._size.height;
  },

  getSize: function() {
    return _.clone(this._size);
  },

  isOccupied: function(x, y) {
    var bots = this._bots;
    var p;
    for(botID in bots) {
      if(bots.hasOwnProperty(botID)) {
        p = bots[botID].getPosition();
        if(p.x === x && y === p.y) {
          return botID;
        }
      }
    }
  },

  isWalkable: function(x, y) {
    var size = this.getSize();
    var isInsideBounds = 
      x >= 0 && 
      y >= 0 && 
      y < size.width &&
      x < size.height;
    return isInsideBounds;
  }

};

_.extend(p, commonMethods);

p.start = function() {
  var arena = this;
  arena._keepRunning = true;
  async.whilst(
    function() {
      return arena._keepRunning;
    },
    this._next.bind(this),
    function(err) {
      if(err) {
        return arena.emit('error', err);
      }
      //TODO
      console.log('Arena stopped !');
    }
  );
};

p.pause = function() {
  this._keepRunning = false;
};

p.reset = function() {
  // TODO
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
    _hp: 50,
    _direction: {
      x: 1,
      y: 1
    },
    _position: {
      x: 0,
      y: 0
    }
  };
  this._callHook('onNewBotData', data);
  return data;
};

p.broadcastUpdate = function() {
  var arena = this;
  var rpcIDs = Object.keys(this._rpcStreams);
  rpcIDs.forEach(function(rpcID) {
    var rpc = arena.getRPCStream(rpcID);
    rpc.call('updateArenaState', arena.getArenaState());
  });
};

p._next = function(done) {

  var interval = this._options.interval || 5000;
  var arena = this;
  var turnManager = this._turnManager;
  var botID = turnManager.nextActor();

  if(botID) {
    this._callHook('onNextBot', botID);
    arena._executeTurn(botID, function(err) {
      if(err) {
        return done(err);
      }
      arena.broadcastUpdate();
      return setTimeout(done, interval);
    });
  } else {
    turnManager.nextTurn();
    arena._callHook('onNewTurn', turnManager.getCurrentTurn());
    return setTimeout(done, interval);
  }

};

p._executeTurn = function(botID, done) {
  var arena = this;
  var rpc = arena.getRPCStream(botID);
  rpc.call('executeBotTurn', arena.getArenaState(), function(err, actions) {
    if(err) {
      return done(err);
    }
    actions = actions || [];
    var i, len, action, correctlyExecuted;
    arena._callHook('onBotActions', botID, actions);
    for(i = 0, len = actions.length; i < len; ++i) {
      action = new Action(actions[i]);
      correctlyExecuted = Action.execute(botID, action, arena);
      if(!correctlyExecuted) {
        // TODO send action error to player
        return done();
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
  this._bots = _.clone(arena._bots);
  this._currentTurn = arena._turnManager.getCurrentTurn();
  this._size = arena.getSize();
};

p.fromRawData = function(raw) {
  this._bots = _.reduce(raw._bots, function(bots, rawBot, botID) {
    var bot = bots[botID] = new Bot(botID);
    bot.extend(rawBot);
    return bots;
  }, {});
  this._currentTurn = raw._currentTurn;
  this._size = raw._size;
};

_.extend(p, commonMethods);

p.getCurrentTurn = function() {
  return this._currentTurn;
};



