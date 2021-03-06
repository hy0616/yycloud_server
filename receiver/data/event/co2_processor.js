var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  EventProcessor = require('./event_processor'),
  Co2State = require('../../config/event_config/state_config').co2_sensor_state,
  datetime = require('../../utils/datetime'),
  MyRedis = require('../../my_redis/my_redis'),
  EVENTCONFIG = require('../../config/event_config/event_config'),
  eventUtil = require('./event_base'),
  db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  EventList = require('./events'),
  MetaConfig = require('../../config/event_config/meta_config');

var Co2Processor = function () {
  EventProcessor.call(this);
};

util.inherits(Co2Processor, EventProcessor);
module.exports = new Co2Processor();

Co2Processor.prototype.handleData = function (oldState, newState, attachedInfo) {
  var myEvent = {};
  myEvent.user_name = attachedInfo.owner;
  myEvent.smartgate_sn = attachedInfo.info.owner;
  myEvent.device_sn = attachedInfo.info.sn;
  myEvent.event_state = EVENTCONFIG.event_state.UNREAD;
  myEvent.sn = myEvent.device_sn;


  if (oldState.online_state !== newState.online_state) {
    switch (newState.online_state) {
      case Co2State.online_state.online:
        MyRedis.myRedis.aodc();
        myEvent.event_name = EVENTCONFIG.event_name_config.DEVICE_ONLINE;
        myEvent.event_type = EVENTCONFIG.event_type_config.NOTICE;
        myEvent.event_level = EVENTCONFIG.event_level_config.NOTICE.NOTICE_LEVEL_1;
        myEvent.detail = eventUtil.co2Data(Co2State.online_state.online, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.online_state.offline:
        MyRedis.myRedis.sodc();
        myEvent.event_name = EVENTCONFIG.event_name_config.DEVICE_OFFLINE;
        myEvent.event_type = EVENTCONFIG.event_type_config.NOTICE;
        myEvent.event_level = EVENTCONFIG.event_level_config.NOTICE.NOTICE_LEVEL_1;
        myEvent.detail = eventUtil.co2Data(Co2State.online_state.offline, attachedInfo);
        generateEvent(myEvent);
        break;
      default:
        break;
    }
  }

  if (oldState.charge_state !== newState.charge_state) {
    myEvent.event_name = EVENTCONFIG.event_name_config.CHARGE_ALARM;
    myEvent.event_type = EVENTCONFIG.event_type_config.ALARM;
    switch (newState.charge_state) {
      case Co2State.charge_state.low_1:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_1;
        myEvent.detail = eventUtil.co2Data(Co2State.charge_state.low_1, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.charge_state.low_2:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_2;
        myEvent.detail = eventUtil.co2Data(Co2State.charge_state.low_2, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.charge_state.normal:
        EventList.eventList.removeEvent(myEvent.device_sn, myEvent.event_name);
        break;
      default :
        break;
    }
  }

  if (oldState.co2_ppm_state != newState.co2_ppm_state) {
    myEvent.event_name = EVENTCONFIG.event_name_config.CO2_PPM_ALARM;
    myEvent.event_type = EVENTCONFIG.event_type_config.ALARM;
    switch (newState.co2_ppm_state) {
      case Co2State.co2_ppm_state.high_1:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_1;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.high_1, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.high_2:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_2;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.high_2, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.high_3:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_3;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.high_3, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.low_1:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_1;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.low_1, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.low_2:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_2;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.low_2, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.low_3:
        myEvent.event_level = EVENTCONFIG.event_level_config.ALARM.ALARM_LEVEL_3;
        myEvent.detail = eventUtil.co2Data(Co2State.co2_ppm_state.low_3, attachedInfo);
        generateEvent(myEvent);
        break;
      case Co2State.co2_ppm_state.normal:
        EventList.eventList.removeEvent(myEvent.device_sn, myEvent.event_name);
        break;
      default :
        break;
    }
  }
};

function generateEvent(myEvent) {
  myEvent.event_date = new Date();
  getSmartGateInfo(myEvent.smartgate_sn)
    .then(function (smartgate) {
      if (null === smartgate.dev_alias || undefined === smartgate.dev_alias || 'undefined' === smartgate.dev_alias || '' === smartgate.dev_alias) {
        myEvent.smartgate_name = smartgate.dev_name;
      } else {
        myEvent.smartgate_name = smartgate.dev_alias;
      }
      db.create(TableNames.MYEVENT, myEvent)
        .then(function (record) {
          if (undefined !== record) {
            var addedEvent = {};
            _.forEach(_.keys(MetaConfig.myEventMeta), function (keyName) {
              addedEvent[keyName] = record[keyName];
            });
            // add the new unread-event to the redis-buffer
            MyRedis.myRedis.addUserEvent(addedEvent);
            // publish the event
            MyRedis.myRedis.pubNewEvent(addedEvent);
            EventList.eventList.addNewEvent(addedEvent);
          }
        })
    })
};

function getSmartGateInfo(smartGateSn) {
  return new Promise(function (resolve, reject) {
    MyRedis.myRedis.getSmartGateInfoAnyway(smartGateSn)
      .then(function (smartgate) {
        resolve(smartgate);
      })
  })
}