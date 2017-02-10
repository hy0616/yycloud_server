var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var UpdateCasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(UpdateCasProcessor, DataProcessor);
module.exports = new UpdateCasProcessor();

UpdateCasProcessor.prototype.processData = function (data, response) {
  generateResData(data.data.strategy)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};
    db.update(TableNames.CUSTOMER_ALARM_STRATEGY, data, {strategy_id: data.strategy_id})
      .then(function (record) {
        if (undefined !== record) {
          MyRedis.myRedis.updateAlarmStrategy('customer_alarm_strategy', 'update', {}, record)
            .then(function () {
              result.result = 'OK';
              result.strategy_id = record.strategy_id;
              resolve(result);
            });
        } else {
          result.result = 'Failed';
          result.strategy_id = data.strategy_id;
          resolve(result);
        }
      });
  });

};
