var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  _ = require('lodash'),
  Promise = require('bluebird'),
  EventProcessor = require('./event_processor'),
  ErelayState = require('../../config/event_config/state_config').erelay_state,
  datetime = require('../../utils/datetime'),
  MyRedis = require('../../my_redis/my_redis'),
  EVENTCONFIG = require('../../config/event_config/event_config'),
  eventUtil = require('./event_base'),
  db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  EventList = require('./events'),
  MetaConfig = require('../../config/event_config/meta_config');

var ErelayProcessor = function () {
  EventProcessor.call(this);
};

util.inherits(ErelayProcessor, EventProcessor);
module.exports = new ErelayProcessor();

ErelayProcessor.prototype.handleData = function (oldState, newState, attachedInfo) {
  var myEvent = {};
  myEvent.user_name = attachedInfo.owner;
  myEvent.smartgate_sn = attachedInfo.info.owner;
  myEvent.device_sn = attachedInfo.info.sn;
  myEvent.event_state = EVENTCONFIG.event_state.UNREAD;
  myEvent.sn = myEvent.device_sn;

  if (oldState.online_state !== newState.online_state) {
    switch (newState.online_state) {
      case ErelayState.online_state.online:
        MyRedis.myRedis.aodc();
        myEvent.event_name = EVENTCONFIG.event_name_config.DEVICE_ONLINE;
        myEvent.event_type = EVENTCONFIG.event_type_config.NOTICE;
        myEvent.event_level = EVENTCONFIG.event_level_config.NOTICE.NOTICE_LEVEL_1;
        myEvent.detail = eventUtil.erelayData(ErelayState.online_state.online, attachedInfo);
        generateEvent(myEvent);
        break;
      case ErelayState.online_state.offline:
        MyRedis.myRedis.sodc();
        myEvent.event_name = EVENTCONFIG.event_name_config.DEVICE_OFFLINE;
        myEvent.event_type = EVENTCONFIG.event_type_config.NOTICE;
        myEvent.event_level = EVENTCONFIG.event_level_config.NOTICE.NOTICE_LEVEL_1;
        myEvent.detail = eventUtil.erelayData(ErelayState.online_state.offline, attachedInfo);
        generateEvent(myEvent);
        break;
      default:
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
            MyRedis.myRedis.addUserEvent(addedEvent);
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