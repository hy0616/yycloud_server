var later = require('later'),
  EventEmitter = require('events').EventEmitter,
  util = require('util');

var HistoryTask = function () {
  EventEmitter.call(this);
};

util.inherits(HistoryTask, EventEmitter);
module.exports = new HistoryTask();

HistoryTask.prototype.start = function (func1, func2) {
  start1(func1);
  start2(func2);
}

function start1(func) {
  later.setInterval(function () {
    func();
  }, later.parse.recur().on(0,20,40).minute());
};

function start2(func) {
  later.setInterval(function () {
    func();
  }, later.parse.recur().on(1).minute());
};