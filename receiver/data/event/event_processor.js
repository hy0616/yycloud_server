var EventEmitter = require('events').EventEmitter;
var util = require('util');

var EventProcessor = function(){
  EventEmitter.call(this);
};

util.inherits(EventProcessor, EventEmitter);
module.exports = EventProcessor;

EventProcessor.prototype.handleData = function(oldState, newState, other){

};

