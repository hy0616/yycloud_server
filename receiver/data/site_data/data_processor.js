var EventEmitter = require('events').EventEmitter;
var util = require('util');

var DataProcessor = function(){
  EventEmitter.call(this);
};

util.inherits(DataProcessor, EventEmitter);
module.exports = DataProcessor;

DataProcessor.prototype.processData = function(data, response){
  response.end();
};