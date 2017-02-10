var util = require('util');
var EventEmitter = require('events').EventEmitter;
var dgram = require('dgram'); 

var UdpServer = function(host, port, opts) {
  EventEmitter.call(this);

  this.host = host;
  this.port = port;
};

util.inherits(UdpServer, EventEmitter);
module.exports = UdpServer;

UdpServer.prototype.start = function(cb) {
  var self = this;

  this.udpServer = dgram.createSocket('udp4');
  this.udpServer.bind(this.port, this.host);

  this.udpServer.on('message', function(message, remote) {
    self.emit('data', message, remote);
  });

  if (cb != undefined) process.nextTick(cb);

};

UdpServer.prototype.stop = function(cb) {
  this.udpServer.close();

  if (cb != undefined) process.nextTick(cb);
}
