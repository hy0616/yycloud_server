var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var DeleteSasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(DeleteSasProcessor, DataProcessor);
module.exports = new DeleteSasProcessor();

DeleteSasProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var smartGateSn = data.data.shed_id;

    db.destroy(TableNames.SMARTGATE_ALARM_STRATEGY, {smartgate_sn: smartGateSn})
      .then(function (record) {
        if (record.length === 0) {
          resolve('Failed');
        } else {
          MyRedis.myRedis.deleteSmartGateAlarmStrategy(smartGateSn)
            .then(function () {
              resolve('OK');
            });
        }
      });
  });
};