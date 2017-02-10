var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var AssignSasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(AssignSasProcessor, DataProcessor);
module.exports = new AssignSasProcessor();

AssignSasProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var newData = {
      smartgate_sn: data.data.shed_id,
      strategy_type: data.data.strategy_type,
      strategy_id: data.data.strategy_id
    };

    if (newData.strategy_type === 'temp') {
      var username = data.data.username;
      var strategy = data.data.strategy;
      strategy = _.omit(strategy,'strategy_id');
      db.update(TableNames.TEMP_ALARM_STRATEGY, strategy, {username: newData.smartgate_sn})
        .then(function (record) {
          if (undefined !== record) {

            MyRedis.myRedis.updateAlarmStrategy('temp_alarm_strategy', 'update', {}, record)
              .then(function () {
                newData.strategy_id = record.strategy_id;
                db.update(TableNames.SMARTGATE_ALARM_STRATEGY, newData, {smartgate_sn: newData.smartgate_sn})
                  .then(function (record) {
                    if (undefined === record) {
                      resolve('Failed');
                    } else {
                      MyRedis.myRedis.assignAlarmStrategy(record)
                        .then(function () {
                          resolve('OK');
                        });
                    }
                  });
              });
          } else {
            resolve('Failed');
          }
        });
    } else {
      db.update(TableNames.SMARTGATE_ALARM_STRATEGY, newData, {smartgate_sn: newData.smartgate_sn})
        .then(function (record) {
          if (undefined === record) {
            resolve('Failed');
          } else {
            MyRedis.myRedis.assignAlarmStrategy(record)
              .then(function () {
                resolve('OK');
              });
          }
        });
    }
  });
};