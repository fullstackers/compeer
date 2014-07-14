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
 * @param {object} head
 * @param {mixed} body
 * @param {string} id
 * @param {number} type
 * @return Packet
 */

Packet.init = function () {
  debug('init %j', arguments);
  var args = slice.call(arguments);
  var pack = args.shift();
  if (!this.isPacket(pack)) throw new TypeError('pack must be a Packet');
  switch (args.length) {
  case 1:
    var data = args.shift();
    if (typeof data === 'object') {
      ['head', 'body', 'type', 'id'].forEach(function (k) { pack[k] = data[k]; });
    }
    break;
  case 4:
  case 3:
  case 2:
  case 0:
  default:
    var head = args.shift(), body = args.shift(), id = args.shift(), type = args.shift();
    pack.id = id;
    pack.type = type;
    pack.head = head || {};
    pack.body = body || null;
    pack.id = id || uuid.v1();
    pack.type = 'undefined' !== type ? (Number(pack.type) ? Number(pack.type) : 0) : 0;
  }
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
  if ('object' !== typeof pack) return false;
  if (pack instanceof Packet) return true;
  debug('typeof p %s head %s body %s id %s type %s', typeof pack.p, typeof pack.head, typeof pack.body, typeof pack.id, typeof pack.type);
  if (pack.p === true && 
    typeof pack.head === 'object' && 
    typeof pack.body !== 'undefined' && 
    typeof pack.id === 'string' && 
    typeof pack.type === 'number') return true;
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
  if (this.isPacket(data) || 'object' === typeof data) return Packet(data);
  try {
    var o = JSON.parse(data);
    debug('parsed %j', o);
    if (o && typeof o.body === 'string') {
      debug('has body');
      try {
        o.body = Buffer(o.body,'hex').toString('utf8')
        debug('parsed hex body');
      }
      catch(e) { }
    }
    return Packet(o);
  }
  catch(e) { }
  return null;
}

/**
 * Convert the packet to a string
 */

Packet.prototype.toString = function () {
  return JSON.stringify({
    p: true,
    id: this.id,
    type: this.type,
    head: this.head,
    body: Buffer(String(this.body),'utf8').toString('hex')
  });
};
