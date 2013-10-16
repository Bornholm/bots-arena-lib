var _ = require('lodash');

module.exports = Action;

var slice = Array.prototype.slice;
var _registeredActions = {};

function Action(actionTypeOrRaw) {
  if(typeof actionTypeOrRaw == 'string') {
    this.type = actionTypeOrRaw;
    this.args = [];
  } else {
    this.type = actionTypeOrRaw.type;
    this.args = actionTypeOrRaw.args || [];
  }
}

Action.register = function(actionType, fn) {
  _registeredActions[actionType] = fn;
};

Action.create = function(actionType) {
  var action = _registeredActions[actionType];
  if(action) {
    return new Action(actionType);
  } else {
    throw new Error('Unknown action type !');
  }
};

Action.execute = function(botID, action, arena) {
  var registered = _registeredActions[action.type];
  if(registered && typeof registered === 'function') {
    return registered.call(arena, botID, action);
  } else {
    throw new Error('Invalid action type !');
  }
}

Action.register('moveTo', function moveTo(botID, action) {

    var bot = this.getBot(botID);
    var position = bot.getPosition();
    var actionArgs = action.getArgs();

    var destX = actionArgs[0];
    var destY = actionArgs[1];

    if(!(destX^2 === 1 || destY^2 === 1 || destY === 0 || destX === 0)) {
      return false
    }

    destX += position.x;
    destY += position.y;

    if(!this.isWalkable(destX, destY) || this.isOccupied(destX, destY)) {
      return false;
    }

    bot.setPosition(destX, destY);

    return true;

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

p.getArgs = function() {
  return this.args.slice();
};