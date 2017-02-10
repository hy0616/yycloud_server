var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  _ = require('lodash'),
  datetime = require('../../utils/datetime'),
  EventConfig = require('../../config/event_config/event_config');

var Events = function () {
  EventEmitter.call(this);

  this.myEvents = {};
};

util.inherits(Events, EventEmitter);
var events = new Events();
module.exports = Events;
module.exports.eventList = events;

Events.prototype.addNewEvent = function (newEvent) {
  var eventElement = {};
  eventElement[newEvent.event_name] = newEvent;
  if (undefined === this.myEvents[newEvent.sn]) {
    this.myEvents[newEvent.sn] = {};
  }

  eventElement[newEvent.event_name].utc_timestamp = datetime.getUTCTimeStamp();
  applyStrategy(eventElement[newEvent.event_name]);
  _.assign(this.myEvents[newEvent.sn], eventElement);
};

Events.prototype.removeEvent = function (sn, eventName) {
  if(undefined != this.myEvents[sn] && undefined != this.myEvents[sn][eventName]){
    this.myEvents[sn] = _.omit(this.myEvents[sn], eventName);
  }
};

Events.prototype.removeEventById = function (sn, eventId) {
  var self = this;
  if(undefined != this.myEvents[sn]){
    _.forEach(this.myEvents[sn], function (value, key) {
      if(value.event_id === eventId){
        self.myEvents[sn] = _.omit(self.myEvents[sn], key);
      }
    })
  }
};

Events.prototype.start = function () {
  var self = this;
  _.forEach(this.myEvents, function (eventsCollection, sn) {
    _.forEach(eventsCollection, function (singleEvent, eventName) {
      applyTimeStampCheck(self, singleEvent, sn, eventName);
    });
  });
};

function applyStrategy(singleEvent) {
  switch (singleEvent.event_name){
    case EventConfig.event_name_config.SMARTGATE_ONLINE:
      break;
    case EventConfig.event_name_config.SMARTGATE_OFFLINE:
      break;
    case EventConfig.event_name_config.DEVICE_ONLINE:
      break;
    case EventConfig.event_name_config.AIR_TEMPERATURE_ALARM:
      break;
    case EventConfig.event_name_config.AIR_HUMIDITY_ALARM:
      break;
    case EventConfig.event_name_config.SOIL_TEMPERATURE_ALARM:
      break;
    case EventConfig.event_name_config.SOIL_HUMIDITY_ALARM:
      break;
    case EventConfig.event_name_config.CO_PPM_ALARM:
      break;
    case EventConfig.event_name_config.CO2_PPM_ALARM:
      break;
    case EventConfig.event_name_config.LUX_ALARM:
      break;
    default :
      break;
  }
};

function applyTimeStampCheck(self, singleEvent, sn, eventName){
  var timeStamp = datetime.getUTCTimeStamp();
  var timeSpan = Math.abs(timeStamp - singleEvent.utc_timestamp);
  switch (singleEvent.event_level){
    case EventConfig.event_level_config.NOTICE.NOTICE_LEVEL_1:
      self.removeEvent(sn, eventName);
      break;
    case EventConfig.event_level_config.NOTICE.NOTICE_LEVEL_2:
      if(timeSpan >= EventConfig.event_trigger_timespan_config[EventConfig.event_level_config.NOTICE.NOTICE_LEVEL_2] * 1 * 1000){
        applyStrategy(singleEvent);
        self.myEvents[sn][eventName].utc_timestamp = timeStamp;
      }
      break;
    case EventConfig.event_level_config.ALARM.ALARM_LEVEL_1:
      if(timeSpan >= EventConfig.event_trigger_timespan_config[EventConfig.event_level_config.ALARM.ALARM_LEVEL_1] * 1 * 1000){
        applyStrategy(singleEvent);
        self.myEvents[sn][eventName].utc_timestamp = timeStamp;
      }
      break;
    case EventConfig.event_level_config.ALARM.ALARM_LEVEL_2:
      if(timeSpan >= EventConfig.event_trigger_timespan_config[EventConfig.event_level_config.ALARM.ALARM_LEVEL_2] * 1 * 1000){
        applyStrategy(singleEvent);
        self.myEvents[sn][eventName].utc_timestamp = timeStamp;
      }
      break;
    case EventConfig.event_level_config.ALARM.ALARM_LEVEL_3:
      if(timeSpan >= EventConfig.event_trigger_timespan_config[EventConfig.event_level_config.ALARM.ALARM_LEVEL_3] * 1 * 1000){
        applyStrategy(singleEvent);
        self.myEvents[sn][eventName].utc_timestamp = timeStamp;
      }
      break;
  }
}