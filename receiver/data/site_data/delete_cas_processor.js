var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis'),
  Promise = require('bluebird');

var DeleteCasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(DeleteCasProcessor, DataProcessor);
module.exports = new DeleteCasProcessor();

DeleteCasProcessor.prototype.processData = function (data, response) {
  generateResData(data.data.strategy_id)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {

    var result = {};
    result.usingShed = [];
    result.msg = '';
    db.find(TableNames.SMARTGATE_ALARM_STRATEGY, {strategy_type: 'customer', strategy_id: data})
      .then(function (records) {
        if(records.length > 0){
          result.result = 'Failed';
          result.msg = '该策略正在被使用.'
          Promise.map(records, function (record) {
            return new Promise(function (resolve, reject) {
              resolve(result.usingShed.add(record));
            })
          }).then(function () {
            resolve(result);
          })
        }else{
          result.result = 'Failed';
          db.destroy(TableNames.CUSTOMER_ALARM_STRATEGY, {strategy_id: data})
            .then(function (record) {
              if (record.length === 0){
                result.result = 'Failed';
                result.msg = '删除失败，请重试.';
                resolve(result);
              }
              else {
                result.result = 'OK';
                MyRedis.myRedis.updateAlarmStrategy('customer_alarm_strategy', 'delete', {}, record[0])
                  .then(function () {
                    resolve(result);
                  });
              }
            });
        }
      });
  });
};