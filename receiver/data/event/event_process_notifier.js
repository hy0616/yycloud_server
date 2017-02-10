var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  fs = require('fs'),
  _ = require('lodash'),
  ErrorCode = require('../../config/error_code'),
  eventProcessorMap = require('../../config/event_config/event_processor_config').event_processor_config;
require('../../utils/log_entrance/cmlog');

var EventProcessNotifier = function () {
  EventEmitter.call(this);

  var self = this;

  this.eventProcessors = {};
  _.forEach(eventProcessorMap, function (value, key) {
    var eventProcessor = value;
    fs.exists(eventProcessor + '.js', function (isExists) {
      if(isExists){
        self.eventProcessors[key] = require(eventProcessor);
        self.eventProcessors[key].on('state', function (oldState, newState, attachedInfo) {
          self.eventProcessors[key].handleData(oldState, newState, attachedInfo);
        });
      }else{
        cmlog.warn(ErrorCode.warning.W0004.warning_msg + key);
      }
    });
  });
}

util.inherits(EventProcessNotifier, EventEmitter);
module.exports = new EventProcessNotifier();
EventProcessNotifier.prototype.notifyData = function (oldState, newState, attachedInfo) {
  if(undefined != this.eventProcessors[attachedInfo.deviceType]){
    this.eventProcessors[attachedInfo.deviceType].emit('state', oldState, newState, attachedInfo);
  }else{
    cmlog.warn(ErrorCode.warning.W0004.warning_msg + attachedInfo.deviceType);
  }
}