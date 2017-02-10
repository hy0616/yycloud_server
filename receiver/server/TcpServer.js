var util = require('util');
var EventEmitter = require('events').EventEmitter;
var net = require('net');
var uuid = require('node-uuid');
var _ = require('lodash');

var TcpSocket = require('./TcpSocket');


var temp = 200;

var TcpServer = function(host, port, opts) {
  EventEmitter.call(this);

  this.ma = temp || opts.ma;
  this.host = host;
  this.port = port;

  this.sockets = {};
};

util.inherits(TcpServer, EventEmitter);
module.exports = TcpServer;

TcpServer.prototype.start = function(cb) {
  var self = this;

  var genTcpSocket = function(socket) {
    var id = uuid.v4();
    var tcpsocket = new TcpSocket(id, socket);

    tcpsocket.once('close', self.emit.bind(self, 'close', tcpsocket));

    tcpsocket.on('timeout', function() {
      if (self.sockets[tcpsocket.id] != undefined) delete self.sockets[id];
      self.emit('timeout', tcpsocket);
    });

    tcpsocket.on('error', function() {
      if (self.sockets[tcpsocket.id] != undefined) delete self.sockets[id];
      self.emit('error', tcpsocket);
    });

    tcpsocket.on('end', function() {
      delete self.sockets[id];
      self.emit('end', tcpsocket);
    });

    tcpsocket.on('data', function(data) {
      self.emit('data', tcpsocket, data);
    });

    self.sockets[id] = tcpsocket;
    self.emit('connection', tcpsocket);
  }

  this.tcpServer = net.createServer();
  this.tcpServer.on('connection', function(socket) {
    if (self.getSocketsNum() >= temp) {
      self.emit('toobusy');
      socket.end();
      socket.destroy();
    } else {
      genTcpSocket(socket);
    }
  });

  this.tcpServer.listen(this.port, this.host);

  if (cb != undefined) process.nextTick(cb);

};


TcpServer.prototype.getSocketsNum = function() {
  return _.size(this.sockets);
}

TcpServer.prototype.getSocket = function(id) {
  return this.sockets[id];
}

TcpServer.prototype.stop = function(cb) {
  this.tcpServer.close();
  this.sockets = {};

  if (cb != undefined) process.nextTick(cb);
}
