var debug = require('debug')('compeer:command');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var slice = Array.prototype.slice;
var Packet = require('./packet');

module.exports = Command;

function Command () {
  if (!(this instanceof Command)) {
    debug('build %j', arguments);
    if (arguments.length === 1 && arguments[0] instanceof Command) {
      return arguments[0];
    }
    var c = new Command();
    Command.init.apply(Command, [c].concat(slice.call(arguments)));
    return c;
  }
  debug('new %j', arguments);
  EventEmitter.call(this);
  if (arguments.length) {
    Command.init.apply(Command, [this].concat(slice.call(arguments)));
  }
}

util.inherits(Command, EventEmitter);

/*
 * Make the class an EventEmitter too
 */

EventEmitter.call(Command);

/**
 * Initialize a Command
 *
 * @param {Command} command
 * @param {String} name
 * @param {Array} args
 */

Command.init = function () {
  debug('init %j', arguments);
  var args = slice.call(arguments);
  var command = args.shift();
  if (!this.isCommand(command)) throw new TypeError('command must be a Command');
  var len = args.length;
  var name = args.shift() || 'unknown', params = args.shift() || [];
  debug('name %j, params %j', name, params);
  switch(len) {
    default:
    case 2:
      command.name = ('string' === typeof name ? name : String(name)) || 'unknown';
      command.args = ('object' === typeof params ? (util.isArray(params) ? params : [params]) : ([params])) || []; 
      break;
    case 1:
      if (this.isCommand(name) || typeof name === 'object') {
        command.name = name.name;
        command.args = name.args;
      }
      else {
        command.name = String(name);
        command.args = args;
      }
      break;
    case 0:
      command.name = name;
      command.args = args
      break;
  }
  debug('command.name %j, command.args %j', command.name, command.args);
  return command;
};

/**
 * Checks if the Object is a Command
 *
 * @param {mixed} command
 * @return Boolean
 */

Command.isCommand = function (command) {
  if (!command) return false;
  if ('object' !== typeof command) return false;
  if (command instanceof Command) return true;
  if (command.c === true &&
      typeof command.name === 'string' &&
      typeof command.args === 'object' &&
      command.args instanceof Array) return true;
  return false;
};

/**
 * Parses a resource into a Command
 *
 * @param {mixed} data
 */

Command.parse = function (data) {
  debug('parse %j', data);
  if (!data) return null;
  if (this.isCommand(data)) return Command(data);
  if (Packet.isPacket(data)) return this.parse(Packet(data).body);
  if ('string' === typeof data) {
    debug('is string');
    try {
      var o = JSON.parse(data);
      debug('parsed json %j', o);
      if (o && util.isArray(o) && o.length >= 2 && o[0] === 1 && typeof o[1] === 'string') {
        return Command(o.shift(), o); 
      }
      else {
        return this.parse(o);
      }
    }
    catch(e) { 
      return null;
    }
  }
  return null;
}

/**
 * Converts the Command to a String
 *
 * @see Command.prototype.toPacket()
 * @return String
 */

Command.prototype.toString = function () {
  return this.toPacket().toString();
};

/**
 * Converts the Command into a Packet
 *
 * @return Packet
 */

Command.prototype.toPacket = function () {
  return Packet({}, this.toJSON(), null, 1);
};

/**
 * Converts the Command to a JSON String
 *
 * @return String
 */

Command.prototype.toJSON = function () {
  return JSON.stringify([ 1, this.name || 'unknown'].concat(this.args || []));
};

