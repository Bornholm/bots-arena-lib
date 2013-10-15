var _ = require('lodash');

module.exports = Action;

function Action(type, data) {
  this.type = type;
  this.data = {};
  _.extend(this.data, data);
}

var p = Action.prototype;