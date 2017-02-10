var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net')
require('../utils/log_entrance/cmlog');

var Socket = function(id, socket) {
  EventEmitter.call(this);

  this.id = id;
  this.socket = socket;

  this.remoteAddress = {
    ip: socket.remoteAddress,
    port: socket.remotePort
  };

  var self = this;

  socket.once('close', this.emit.bind(this, 'close'));
  socket.on('error', this.emit.bind(this, 'error'));
  socket.on('end', this.emit.bind(this, 'end'));
  socket.on('timeout', this.emit.bind(this, 'timeout'));

  socket.on('data', function(data) {
    self.emit('data', data);
  })

};

util.inherits(Socket, EventEmitter);

module.exports = Socket;

Socket.prototype.send = function(data, encode, cb) {
  cmlog.trace('tcp socket send data: ' + data);
  this.socket.write(data, encode, cb);
}

Socket.prototype.close = function() {
  this.socket.end();
  this.socket.destroy();
}



