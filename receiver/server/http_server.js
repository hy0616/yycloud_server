var http = require('http');
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');

var HttpServer = function (host, port, opts) {
  EventEmitter.call(this);

  this.host = host;
  this.port = port;
  this.opts = opts;
}

util.inherits(HttpServer, EventEmitter);
module.exports = HttpServer;

HttpServer.prototype.start = function (callback) {
  var self = this;

  this.httpServer = http.createServer();
  this.httpServer.on('request', function (request, response) {
    response.writeHead(200, {'Content-Type': 'text/plain'});

    var buffers = [];
    request.on('data', function (data) {
      buffers.push(data);
    }).on('end', function () {
      var buffer = Buffer.concat(buffers);
      self.emit('data', buffer.toString(), response);
      buffers = null;
    });
  });

  if (undefined != callback) {
    process.nextTick(callback);
  }

  this.httpServer.listen(this.port, this.host);
};

HttpServer.prototype.stop = function (callback) {
  this.httpServer.close();

  if(undefined != callback){
    process.nextTick(callback);
  }
};