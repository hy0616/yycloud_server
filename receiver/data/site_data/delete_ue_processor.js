var EventEmitter = require('events').EventEmitter;
var util = require('util');
var _ = require('lodash');
var Promise = require('bluebird');
var DataProcessor = require('./data_processor');
var db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  MyRedis = require('../../my_redis/my_redis'),
  EventList = require('../event/events');
  EVENTCONFIG = require('../../config/event_config/event_config');

var DeleteUeProcessor = function () {
  DataProcessor.call(this);
};

util.inherits(DeleteUeProcessor, DataProcessor);
module.exports = new DeleteUeProcessor();

DeleteUeProcessor.prototype.processData = function (data, response) {
  generateResData(data)
    .then(function (result) {
      response.end(JSON.stringify(result));
    });
};

function generateResData(data) {
  return new Promise(function (resolve, reject) {
    var eventIdArr = data.data.event_id_str.split(',');
    var username = data.data.username;
    var result = {};
    var error = false;
    
    Promise.map(eventIdArr, function (eventId) {
      return new Promise(function (resolve, reject) {
        MyRedis.myRedis.deleteUserEvent(username, eventId)
          .then(function () {
            db.update(TableNames.MYEVENT, {event_state: EVENTCONFIG.event_state.READ}, {event_id: eventId})
              .then(function (record) {
                if(undefined === record){
                  error = true;
                }else{
                  EventList.eventList.removeEventById(record.sn, eventId);
                }
                resolve();
              });
          });
      });
    }).then(function () {
      if(error){
        result.result = 'Failed';
        result.msg = 'update the database failed.';
      }else{
        result.result = 'OK';
      }
      resolve(result);
    });
  });
};