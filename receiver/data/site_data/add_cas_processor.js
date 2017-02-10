var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var AddCasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(AddCasProcessor, DataProcessor);
module.exports = new AddCasProcessor();

AddCasProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};
    db.create(TableNames.CUSTOMER_ALARM_STRATEGY, data.data.strategy)
      .then(function (record) {
        if (undefined !== record) {
          MyRedis.myRedis.updateAlarmStrategy('customer_alarm_strategy', 'add', {}, record)
            .then(function () {
              result.result = 'OK';
              result.strategy_id = record.strategy_id;
              resolve(result);
            });
        }
        else{
          result.result = 'Failed';
          result.result = '';
          resolve(result);
        }
      });
  });

};
