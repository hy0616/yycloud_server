var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var UpdateDaProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(UpdateDaProcessor, DataProcessor);
module.exports = new UpdateDaProcessor();

UpdateDaProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};
    db.update(TableNames.DEVICE, {dev_alias:data.data.alias}, {sn: data.data.deviceSn})
      .then(function (record) {
        if (undefined !== record) {
          MyRedis.myRedis.updateDeviceAlias(data.data.deviceSn, data.data.alias)
            .then(function () {
              result.result = 'OK';
              result.alias = record.dev_alias;
              resolve(result);
            });
        } else {
          result.result = 'Failed';
          resolve(result);
        }
      });
  });

};