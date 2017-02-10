var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var UpdateSaProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(UpdateSaProcessor, DataProcessor);
module.exports = new UpdateSaProcessor();

UpdateSaProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};
    db.update(TableNames.SMARTGATE, {dev_alias:data.data.alias}, {sn: data.data.smartGateSn})
      .then(function (record) {
        if (undefined !== record) {
          MyRedis.myRedis.updateSmartGateAlias(data.data.smartGateSn, data.data.alias)
            .then(function () {
              result.result = 'OK';
              result.alias = data.data.alias;
              resolve(result);
            });
        } else {
          result.result = 'Failed';
          resolve(result);
        }
      });
  });

};