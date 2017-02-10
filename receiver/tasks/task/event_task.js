var later = require('later'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  CheckCycle = require('../../config/env').schedule_task_cycle.eventListTraversalCycle;

var EventTask = function () {
  EventEmitter.call(this);
};

util.inherits(EventTask, EventEmitter);
module.exports = new EventTask();

EventTask.prototype.start = function (func) {
  later.setInterval(function () {
    func();
  }, later.parse.text('every ' + CheckCycle + ' seconds'));
};

