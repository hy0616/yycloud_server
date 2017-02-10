var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis');

var GetSasProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(GetSasProcessor, DataProcessor);
module.exports = new GetSasProcessor();

GetSasProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var result = {};

    MyRedis.myRedis.getUnparsedAlarmStrategy(data.data.shed_id)
      .then(function (strategy) {

        if('Failed' === strategy){
          result.result = 'Failed';
        }else{
          result.result = 'OK';
          result.strategy_type = strategy.strategy_type
          result.strategy = strategy.strategy;
        }
        resolve(result);
      });
  });
};