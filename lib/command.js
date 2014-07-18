var util = require('util');
var debug = require('debug')('compeer:command');
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
        if (util.isArray(name)) {
          command.name = name.shift();
          var args = name.shift() || [];
          command.args = util.isArray(args) ? (args) : [args];
        }
        else {
          command.name = name.name;
          command.args = util.isArray(name.args) ? (name.args) : (name.args ? [name.args] : []);
        }
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
  debug('isCommand? %j', command);
  if (!command) return false;
  if ('object' !== typeof command) return false;
  if (command instanceof Command) return true;
  if (util.isArray(command) && typeof command[0] === 'string' && (util.isArray(command[1]) || command[1] !== undefined)) return true;
  if (typeof command.name === 'string' && ((typeof command.args === 'object' && util.isArray(command.args)) || command.args !== undefined)) return true;
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
  if (this.isCommand(data)) {
    var command = Command(data);
    debug('parsed %j', command);
    return command;
  }
  if (Packet.isPacket(data)) {
    var o;
    try { o = JSON.parse(data.body) }
    catch (e) { }
    if (!o) return null;
    debug('parsed body %j', o);
    return Command(o);
  }
  if ('string' === typeof data) {
    return this.parse(Packet.parse(data));
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
  return Packet({}, this.toJSON(), 1, null);
};

/**
 * Converts the Command to a JSON String
 *
 * @return String
 */

Command.prototype.toJSON = function () {
  return JSON.stringify([this.name || 'unknown'].concat(this.args || []));
};
