var later = require('later'),
  EventEmitter = require('events').EventEmitter,
  util = require('util'),
  CheckCycle = require('../../config/env').schedule_task_cycle.smartgateCheckCycle,
  CMServer = require('../../cmserver');

var SmartGateTask = function () {
  EventEmitter.call(this);
};

util.inherits(SmartGateTask, EventEmitter);
module.exports = new SmartGateTask();

SmartGateTask.prototype.start = function (func) {
  later.setInterval(function () {
    func();
  }, later.parse.text('every ' + CheckCycle + ' seconds'));
};

