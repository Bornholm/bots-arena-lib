var _ = require('lodash');

module.exports = Action;

var slice = Array.prototype.slice;
var _registeredActions = {};

function Action(actionType) {
  this.type = actionType;
  this.args = [];
}

Action.register = function(actionType, run, validate) {
  _registeredActions[actionType] = {
    run: run,
    validate: validate
  };
};

Action.create = function(actionType) {
  var action = _registeredActions[actionType];
  if(action) {
    return new Action(actionType);
  } else {
    throw new Error('Unknown action type !');
  }
};

Action.run = function(botID, action, arena) {
  var registered = _registeredActions[action.type];
  console.log(registered)
  if(registered && typeof registered.run === 'function') {
    registered.run.call(arena, botID, action.args);
  } else {
    throw new Error('Invalid action type !');
  }
};

Action.register('moveTo', function(action, arena) {
 // TODO
 // this == arena
 console.log('moveTo', arguments)
});

Action.register('faceToward', function(action, arena) {
 // TODO
 // this == arena
});

Action.register('fireAt', function(action, arena) {
 // TODO
 // this == arena
});

var p = Action.prototype;

p.setArgs = function() {
  this.args = slice.call(arguments);
};