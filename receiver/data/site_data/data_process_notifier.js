var util = require('util');
var _ = require('lodash');
var EventEmitter = require('events').EventEmitter;
var fs = require('fs');
var protocolProcessorMap = require('../../config/site_config/protocol_config').protocol_processor;

var DataProcessNotifier = function(){
  EventEmitter.call(this);

  var self = this;

  this.dataProcessors = {};
  _.forEach(protocolProcessorMap, function(value, key){
    var dataProcessor = value;
    fs.exists(dataProcessor + '.js', function(isExists) {
      if(isExists){
        self.dataProcessors[key] = require(dataProcessor);
        self.dataProcessors[key].on('data', function(data, connection){
          self.dataProcessors[key].processData(data, connection);
        });
      }else{

      }
    });
  });
}

util.inherits(DataProcessNotifier, EventEmitter);
module.exports = DataProcessNotifier;

DataProcessNotifier.prototype.notifyData = function(data, response){
  var protocol_type = data.meta.type;
  if(undefined != this.dataProcessors[protocol_type]){
    this.dataProcessors[protocol_type].emit('data', data, response);
  }else{

    response.end('Fail');
  }
};
