var util = require('util');
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
      debug('first item is an object %j', args[0]);
      if (util.isArray(args[0])) {
        debug('item is an array');
        if (this.isPacket(args[0])) {
          debug('item is a packet');
          return this.init(pack, args[0][2], args[0][3], args[0][0], args[0][1]);
        }
        else {
          debug('item is not a packet');
          return this.init.apply(this, [pack].concat(args[0]));
        }
      }
      else if (this.isPacket(args[0])) {
        debug('this is a packet?');
        for (var k in args[0]) {
          pack[k] = args[0][k];
        }
      }
      else {
        head = args.shift(); 
      }
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
  if (typeof pack.head === 'object' && typeof pack.type === 'number' && typeof pack.body  !== 'undefined') return true;
  if (util.isArray(pack) && typeof pack[0] === 'number' && typeof pack[1] === 'string' && typeof pack[2] === 'object' && typeof pack[3] !== 'undefined') return true;
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
  if (this.isPacket(data)) {
    var pack = Packet(data);
    try { pack.body = Buffer(pack.body,'hex').toString('utf8'); }
    catch (e) { }
    return pack;
  }
  if ('string' === typeof data) {
    debug('it is a string');
    var o;
    try {o = JSON.parse(data);}
    catch (e) { }
    debug('after parsing %j', o);
    if (!o) return null;
    return this.parse(o);
  }
  return null;
}

/**
 * Convert the packet to a string
 *
 * @return String
 */

Packet.prototype.toString = function () {
  return JSON.stringify([this.type, this.id, this.head, new Buffer(String(this.body),'utf8').toString('hex')]);
};
