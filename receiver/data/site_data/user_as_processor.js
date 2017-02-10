var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var UserAsProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(UserAsProcessor, DataProcessor);
module.exports = new UserAsProcessor();

UserAsProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};
    var owner = data.data.owner,
      smartGateSn = data.data.smartgate_sn,
      action = data.data.action;
    var newOwner = owner;

    if ('delete' === action) {
      newOwner = 'unknown';

      db.destroy(TableNames.SMARTGATE_ALARM_STRATEGY, {smartgate_sn:smartGateSn})
        .then(function (record) {
          MyRedis.myRedis.deleteSmartGateAlarmStrategy(smartGateSn)
            .then(function () {
            })
        })
    }

    db.update(TableNames.SMARTGATE, {owner: newOwner}, {sn: smartGateSn})
      .then(function (record) {
        if (undefined !== record) {
          result.result = 'OK';
          MyRedis.myRedis.updateUserSmartGate(action, owner, smartGateSn)
            .then(function () {
              resolve(result);
            });
        } else {
          result.result = 'Failed';
          result.msg = 'handle database fail.';
          resolve(result);
        }
      });
  });

};
