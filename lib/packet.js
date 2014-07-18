var debug = require('debug')('compeer:packet');
var uuid = require('node-uuid');
var slice = Array.prototype.slice;

module.exports = Packet;

/**
 * A packet represents a chunk of data that will be delivered to and from Peers
 */

function Packet () {
  if (!(this instanceof Packet)) {
    debug('build %j', arguments);
    if (arguments.length === 1 && arguments[0] instanceof Packet) {
      return arguments[0];
    }
    var pack = new Packet();
    Packet.init.apply(Packet, [pack].concat(slice.call(arguments)));
    return pack;
  }
  debug('new %j', arguments);
  this.p = true;
  if (arguments.length) {
    Packet.init.apply(Packet, [this].concat(slice.call(arguments)));
  }
}

/**
 * Initializes the packet
 *
 * @param {Packet} pack
 * @param {Number} type
 * @param {String} id
 * @param {Object} head
 * @param {mixed} body
 * @return Packet
 */

Packet.init = function () {
  debug('init %j', arguments);
  var args = slice.call(arguments);
  var pack = args.shift();
  if (!this.isPacket(pack)) throw new TypeError('pack must be a Packet');
  var head, body, type, id;
  if (args.length > 4) args = args.slice(0, 4);
  switch(args.length) {
  case 4:
    id = args.pop();
    debug('have an id %s', id);
  case 3:
    type = args.pop();
    debug('have a type %s', type);
  case 2:
    body = args.pop();
    debug('have a body %s', body);
  case 1:
    if ('object' === typeof args[0]) {
      debug('first item is an object');
      if (args[0] instanceof Array) {
        debug('item is an array');
        return this.init.apply(this, [pack].concat(args));
      }
      head = args.shift(); 
      debug('have a head %s', head);
    }
  }
  pack.type = Number(type || pack.type || 0);
  pack.id = String(id || pack.id || uuid.v1());
  pack.head = head || pack.head || {}; 
  pack.body = body || pack.body || null;
  return pack;
}

/**
 * Check if the "pack" is a Packet instance.
 *
 * @param {Packet} pack
 * @return Boolean
 */

Packet.isPacket = function (pack) {
  debug('isPacket %j', pack);
  if (!pack) return false;
  if ('object' !== typeof pack) return false;
  if (pack instanceof Packet) return true;
  return false;
};

/**
 * parse a packet
 *
 * @param {mixed} data
 */

Packet.parse = function (data) {
  debug('parse typeof %s', typeof data);
  if (!data) return null;
  return null;
}

/**
 * Convert the packet to a string
 *
 * @return String
 */

Packet.prototype.toString = function () {
};
