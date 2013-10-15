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
    return _arenaState.getBotHP(_botID);
  };

  this.getPosition = function() {
    return _arenaState.getBotPosition(_botID);
  };

  this.getDirection = function() {
    return _arenaState.getBotDirection(_botID);
  };

  this.getVisibleOpponents = function() {
    var position = _arenaState.getBotPosition(_botID);
    var direction = _arenaState.getBotDirection(_botID);
    var visibleOpponents = [];
    // TODO
    return visibleOpponents;
  };

  this.getCurrentTurn = function() {
    return _arenaState.getCurrentTurn();
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

// Actions

p.moveTo = function(x, y) {
  var action = new Action('moveTo', {x: y, y: y});
  this.addAction(action);
  return this;
};

p.fireAt = function(x, y) {
  var action = new Action('fireAt', {x: y, y: y});
  this.addAction(action);
  return this;
};

p.faceToward = function(x, y) {
  var action = new Action('faceToward', {x: y, y: y});
  this.addAction(action);
  return this;
};