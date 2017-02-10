var env = require('./config/env');
var util = require('util');
var SmartGateTask = require('./tasks/task/smartgate_task');
var EventTask = require('./tasks/task/event_task');
var HistoryTask = require('./tasks/task/history_task');
var CMServer = require('./cmserver');
var History = require('./data/history/history');
var Events = require('./data/event/events');
var server_ports = require('./config/server');
var HOST = '0.0.0.0';
var later = require('later');
var EventEmitter = require('events').EventEmitter;

var cmServer = new CMServer(HOST, server_ports.port);
cmServer.start();

var MyRedis = require('./my_redis/my_redis');

setTimeout(function () {

  SmartGateTask.start(function () {
    cmServer.checkTcpOnline();
  });

  EventTask.start(function () {
    Events.eventList.start();
  });

  MyRedis.myRedis.init();

  HistoryTask.start(function () {
    History.history.handleData1();
  }, function () {
    History.history.handleData2();
  });
}, 1000);
