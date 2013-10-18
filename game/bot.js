var util = require('util');
var EventEmitter2 = require('eventemitter2').EventEmitter2;
var uuid = require('node-uuid');
var Action = require('./action');

module.exports = Bot;

function Bot(botID) {

  EventEmitter2.call(this);

  // Private variables;
  var _arenaState;
  var _botID = botID || uuid.v4();
  var _actions = [];

  // Privileged methods

  this.setArenaState = function(arenaState) {
    _arenaState = arenaState;
  };

  // Status accessors

  this.getHP = function() {
    if(_arenaState) {
      return _arenaState.getBotHP(_botID);
    } else {
      return this._hp;
    }
  };

  this.getPosition = function() {
    if(_arenaState) {
      return _arenaState.getBotPosition(_botID);
    } else {
      return this._position;
    }
  };

  this.getDirection = function() {
    if(_arenaState) {
      _arenaState.getBotDirection(_botID);
    } else {
      return this._direction;
    }
  };

  this.getVisibleOpponents = function() {
    var visibleOpponents = [];
    if(_arenaState) {
      var position = _arenaState.getBotPosition(_botID);
      var direction = _arenaState.getBotDirection(_botID);
      // TODO
    } else {

    }
    return visibleOpponents;
  };

  this.getID = function() {
    return _botID;
  };

  this.addAction = function(action) {
    _actions.push(action);
    return this;
  };

  this.getActions = function() {
    return _actions;
  };

  this.clearActions = function() {
    _actions.length = 0;
    return this;
  };

}

util.inherits(Bot, EventEmitter2);

var p = Bot.prototype;

p.toJSON = function() {
  return {
    _hp: this.getHP(),
    _position: this.getPosition(),
    _direction: this.getDirection()
  };
};

// "Server" side methods

p.extend = function(data) {
  for(var key in data) {
    if(data.hasOwnProperty(key)) {
      this[key] = data[key];
    }
  }
};

p.setHP = function(hp) {
  this._hp = hp;
  return this;
};

p.setPosition = function(x, y) {
  this._position.x = x;
  this._position.y = y;
};

p.setDirection = function(ew, ns) {
  this._direction.ew = ew;
  this._direction.ns = ns;
};

// "Client" side methods

// Actions

p.moveTo = function(x, y) {
  var action = Action.create('moveTo');
  action.setArgs(x, y);
  this.addAction(action);
  return this;
};

p.fireAt = function(x, y) {
  var action = Action.create('fireAt');
  action.setArgs(x, y);
  this.addAction(action);
  return this;
};

p.faceToward = function(x, y) {
  var action = Action.create('faceToward');
  action.setArgs(x, y);
  this.addAction(action);
  return this;
};