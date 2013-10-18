var Transform = require('stream').Transform;
var util = require('util');

// Serializer
function JSONSerializer() {
  Transform.call(this, {objectMode: true});
}

util.inherits(JSONSerializer, Transform);

JSONSerializer.prototype._transform = function(data, encoding, done) {
  this.push(JSON.stringify(data), 'utf8');
  setImmediate(done);
};

module.exports = JSONSerializer;