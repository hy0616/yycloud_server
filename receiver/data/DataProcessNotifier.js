var fs = require('fs');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('lodash');
var devTypeList = require('../config/device').dev_type;
require('../utils/log_entrance/cmlog');

var DataProcessNotifier = function() {
  EventEmitter.call(this);

  var self = this;

  this.dataProcessors = {};

  _.forEach(devTypeList, function(devType) {
    var devDataProcessor = __dirname + '/' + devType + 'DataProcessor';
    fs.exists(devDataProcessor + '.js', function(exists) {
      if (exists) {
        self.dataProcessors[devType] = require(devDataProcessor);
        self.dataProcessors[devType].on('data', function(data, action, tcpsocket, remote, clients, sockets) {
          self.dataProcessors[devType].processData(data, action, tcpsocket, remote, clients, sockets);
        });
      }
    });
  });
}

util.inherits(DataProcessNotifier, EventEmitter);

module.exports = DataProcessNotifier;

DataProcessNotifier.prototype.notifyData = function(devType, data, action, tcpsocket, remote, clients, sockets) {
  if (this.dataProcessors[devType] != undefined)
    this.dataProcessors[devType].emit('data', data, action, tcpsocket, remote, clients, sockets);

}


