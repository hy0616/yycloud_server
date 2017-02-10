var EventEmitter = require('events').EventEmitter;
var util = require('util');
var Promise = require('bluebird');
var _ = require('lodash');
var S = require('string');
var db = require('../db/db').db,
  TableNames = require('../db/table_name');
var ErrorCode = require('../config/error_code');
var eventProcessNotifier = require('../data/event/event_process_notifier');
var DeviceTypeConfig = require('../config/device_type_config').device_type;
var StateConfig = require('../config/event_config/state_config');
var MetaConfig = require('../config/event_config/meta_config');
var DeviceValueConfig = require('../config/event_config/device_value_config');
var Histroy = require('../data/history/history');
require('../utils/log_entrance/cmlog');
var redis = require('redis');
var redis_config = require('../config/redis_config');
var client = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options);
var pubSubClient = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options);

var MyRedis = function () {
  EventEmitter.call(this);
};
util.inherits(MyRedis, EventEmitter);
var myRedisGlobal = new MyRedis();
module.exports = MyRedis;
module.exports.myRedis = myRedisGlobal;

MyRedis.prototype.init = function () {
  initSubscribe();
  initSmartGateCount();
  initDeviceCount();
  initOnlineSmartGateCount();
  initOnlineDeviceCount();
  initUserSmartGatePair();
  //initSmartGateDevicePair();
  loadAllStrategies();
  initSmartGateAlarmStrategyPair();
  initUserInfo();
  loadAllUnReadEvents();
};

MyRedis.prototype.asc = function () {
  client.incr('smartgate_total_num');
}

MyRedis.prototype.adc = function () {
  client.incr('device_total_num');
}

MyRedis.prototype.aosgc = function () {
  client.incr('current_online_smartgate_count');
};

MyRedis.prototype.sosgc = function () {
  client.decr('current_online_smartgate_count');
};

MyRedis.prototype.aodc = function () {
  client.incr('current_online_device_count');
};

MyRedis.prototype.sodc = function () {
  client.decr('current_online_device_count');
};

MyRedis.prototype.filtreFunc = function (meta) {
  client.hgetall(redis_config.key_config.smartgateinfos + meta.info.sn, function (err, obj) {
    if (null === obj || undefined === obj) {
      var temp1 = '';
      db.findOne(TableNames.SMARTGATE, {sn: meta.info.sn})
        .then(function (smartgate) {
          if (undefined === smartgate) {
            db.create(TableNames.SMARTGATE, meta.info)
              .then(function (newSmartGate) {
                myRedisGlobal.asc();
              });
          } else {
            var temps1 = {},
              temps2 = {};
            temp1 = smartgate.dev_alias;
            _.assign(temps1, smartgate, meta.info);
            _.assign(temps2, smartgate);
            if (!_.isEqual(temps1, temps2)) {
              db.update(TableNames.SMARTGATE, temps1, {sn: temps1.sn})
                .then(function (smartgate) {
                });

              smartgate = _.omit(smartgate, 'id');
            }
          }
        }).then(function () {

          var sgs = {};
          _.assign(sgs, meta.state, meta.info, meta.last_value);

          sgs.dev_alias = temp1;

          client.hmset(redis_config.key_config.smartgateinfos + sgs.sn, sgs, function (err, res) {

          });

          var ai = {
            deviceType: DeviceTypeConfig.smartgate,
            info: meta.info
          };
          client.hget('smartgate_user', sgs.sn, function (err, res) {
            if (null != res && undefined != res) {
              ai.owner = res;
            } else {
              ai.owner = 'unknown';
            }
            eventProcessNotifier.notifyData({}, meta.state, ai);
          });
        });
    } else {

      var os = {};
      var tempResult = true;
      _.forEach(_.keys(StateConfig.smartgate_state), function (keyName) {
        if ((obj[keyName] === undefined) || obj[keyName] != meta.state[keyName])
          tempResult = false;
        os[keyName] = obj[keyName];
      });

      if (!tempResult) {
        var ai = {
          deviceType: DeviceTypeConfig.smartgate,
          info: meta.info
        };
        client.hget('smartgate_user', meta.info.sn, function (err, res) {
          if (null != res && undefined != res) {
            ai.owner = res;
          } else {
            ai.owner = 'unknown';
          }
          eventProcessNotifier.notifyData({}, meta.state, ai);
        });
      }
      ;

      var oi = {};
      var tempResult1 = true;
      _.forEach(_.keys(MetaConfig.smartgateMeta), function (attributeName) {
        if ((obj[attributeName] === undefined) || obj[attributeName] != meta.info[attributeName]) {
          tempResult1 = false;
        }
        oi[attributeName] = obj[attributeName];
      })

      if (!tempResult1) {
        db.update(TableNames.SMARTGATE, meta.info, {sn: meta.info.sn})
          .then(function (updatedSmartgate) {
            if (undefined === updatedSmartgate)
              cmlog.warn(ErrorCode.warning.W0003.warning_msg);
          });
      }
      ;

      var sgs = {};
      _.assign(sgs, meta.state, meta.info, meta.last_value);
      client.hmset(redis_config.key_config.smartgateinfos + sgs.sn, sgs, function (err, res) {

      });
    }
  });
};

MyRedis.prototype.baseFunc = function (meta) {
  return new Promise(function (resolve, reject) {
    client.hgetall(redis_config.key_config.deviceinfos + meta.info.sn, function (err, obj) {
      var ds = {};
      if (err)
        cmlog.error(ErrorCode.error.E0002.error_msg);
      if (null === obj || undefined === obj) {
        var temp1 = '';
        db.findOne(TableNames.DEVICE, {sn: meta.info.sn})
          .then(function (device) {
            if (undefined === device) {
              cmlog.warn(ErrorCode.warning.W0001.warning_msg);
              cmlog.warn(meta.info.sn);
              db.create(TableNames.DEVICE, meta.info)
                .then(function (device) {
                  if (undefined === device)
                    cmlog.warning(ErrorCode.warning.W0002.warning_msg);
                  else
                    myRedisGlobal.adc();
                });
            } else {
              var tempm = {};
              temp1 = device.dev_alias;
              _.assign(tempm, device, meta.info);
              if (!_.isEqual(device, tempm)) {
                db.update(TableNames.DEVICE, meta.info, {sn: meta.info.sn})
                  .then(function (updatedDevice) {
                    if (undefined === updatedDevice)
                      cmlog.warn(ErrorCode.warning.W0003.warning_msg);
                  });
              }
            }
            ds = {};
            _.assign(ds, meta.state, meta.info, meta.last_value);
            ds.dev_alias = temp1;
            ds = elimateSingularPoint(ds.dev_type, {}, ds);
            client.hmset(redis_config.key_config.deviceinfos + ds.sn, ds, function (err, res) {

            });
            client.hset('device_smartgate', ds.sn, ds.owner, function (err, res) {
              if (err)
                cmlog.error(ErrorCode.error.E0001.error_msg);
            });

            client.hset(redis_config.key_config.smartgatedevice + ds.owner, ds.sn, ds.dev_type, function (err, res) {

            });

            var ai = {
              deviceType: meta.info.dev_type,
              info: meta.info,
              strategy: meta.strategy,
              last_value: meta.last_value
            };
            client.hget('smartgate_user', meta.info.owner, function (err, res) {
              if (null != res && undefined != res) {
                ai.owner = res;
              } else {
                ai.owner = 'unknown';
              }
              eventProcessNotifier.notifyData({}, meta.state, ai);
            });
          });


        var td1 = {};
        var td2 = {};
        td2.deviceType = meta.info.dev_type;
        meta.last_value = elimateSingularPoint(meta.info.dev_type, {}, meta.last_value);
        td2.lastValue = meta.last_value,
          td2.serverTime = meta.serverTime,
          td2.sn = meta.info.sn,
          td2.owner = meta.info.owner;
        var tempResult = Histroy.history.receiveMsg(td1, td2);
        resolve(tempResult);
      } else {

        var os = {},
          tempResult1 = true,
          tempArr = getStateKeyArray(meta.info.dev_type);

        _.forEach(tempArr, function (keyName) {

          if ((obj[keyName] === undefined) || obj[keyName] != meta.state[keyName])
            tempResult1 = false;
          os[keyName] = obj[keyName];
        })

        if (!tempResult1) {
          var ai = {
            deviceType: meta.info.dev_type,
            info: meta.info,
            strategy: meta.strategy,
            last_value: meta.last_value
          };

          client.hget('smartgate_user', meta.info.owner, function (err, res) {
            if (null != res && undefined != res) {
              ai.owner = res;
            } else {
              ai.owner = 'unknown';
            }
            eventProcessNotifier.notifyData(os, meta.state, ai);
          });
        }

        var oi = {},
          tempResult3 = true;

        _.forEach(_.keys(MetaConfig.deviceMeta), function (keyName) {
          if ((obj[keyName] === undefined) || obj[keyName] != meta.info[keyName])
            tempResult3 = false;
          oi[keyName] = obj[keyName];
        })

        if (!tempResult3) {
          db.update(TableNames.DEVICE, meta.info, {sn: meta.info.sn})
            .then(function (updatedDevice) {
              if (undefined === updatedDevice)
                cmlog.warn(ErrorCode.warning.W0003.warning_msg);
            });

          if (oi['owner'] != meta.info.owner) {
            client.hset('device_smartgate', meta.info.sn, meta.info.owner, function (err, res) {
              if (err)
                cmlog.error(ErrorCode.error.E0001.error_msg);
            });
            client.hdel(redis_config.key_config.smartgatedevice + oi['owner'], meta.info.sn, function (err, res) {

            });

            client.hset(redis_config.key_config.smartgatedevice + meta.info.owner, meta.info.sn, meta.info.dev_type, function (err, res) {

            });
          }
        }

        ds = {};
        _.assign(ds, meta.state, meta.info, meta.last_value);

        var data1 = {};
        data1.lastValue = {};
        var arr2 = getValueKeyArray(meta.info.dev_type);
        _.forEach(arr2, function (keyName) {
          data1.lastValue[keyName] = obj[keyName];
        });
        data1.deviceType = meta.info.dev_type,
          data1.serverTime = obj['server_time'],
          data1.sn = meta.info.sn,
          data1.owner = meta.info.owner;

        ds = elimateSingularPoint(ds.dev_type, data1.lastValue, ds);
        client.hmset(redis_config.key_config.deviceinfos + ds.sn, ds, function (err, res) {
        });
        var data3 = {};
        data3.deviceType = meta.info.dev_type;
        data3.lastValue = {};
        _.forEach(arr2, function (keyName) {
          data3.lastValue[keyName] = ds[keyName];
        });
        data3.serverTime = meta.serverTime,
          data3.sn = meta.info.sn,
          data3.owner = meta.info.owner;
        var tempResult = Histroy.history.receiveMsg(data1, data3);
        resolve(tempResult);
      }
    });
  })
};

MyRedis.prototype.setSmartGateDeviceOffline = function (smartgateSn) {
  client.hgetall(redis_config.key_config.smartgatedevice + smartgateSn, function (err, res) {
    if (err)
      cmlog.error(ErrorCode.error.E0002.error_msg);
    if (null !== res && undefined != res) {
      _.forEach(_.keys(res), function (deviceSn) {
        client.hget(redis_config.key_config.deviceinfos + deviceSn, 'online_state', function (err, res1) {
          if (err)
            cmlog.error(ErrorCode.error.E0002.error_msg);
          if (null !== res1 && undefined != res1) {
            if (res1 != StateConfig.smartgate_state.online_state.offline) {
              client.hset(redis_config.key_config.deviceinfos + deviceSn, 'online_state', StateConfig.smartgate_state.online_state.offline, function (err, res) {

              });
              myRedisGlobal.sodc();
            }
          }
        });
      });
    }
  });
};

MyRedis.prototype.updateAlarmStrategy = function (model, action, criteria, strategy) {
  return new Promise(function (resolve, reject) {
    var keyName = '';
    switch (model) {
      case 'default_alarm_strategy':
        keyName = redis_config.key_config.default_alarm_strategies;
        break;
      case 'customer_alarm_strategy':
        keyName = redis_config.key_config.custom_alarm_strategies;
        break;
      case 'temp_alarm_strategy':
        keyName = redis_config.key_config.temp_alarm_strategies;
        break;
    }

    switch (action) {
      case 'add':
        client.hmset(keyName + strategy.strategy_id, parseAlarmStrategy(strategy), function (err, res) {
          resolve();
        });
        break;
      case 'update':
        client.hmset(keyName + strategy.strategy_id, parseAlarmStrategy(strategy), function (err, res) {
          resolve();
        });
        break;
      case 'delete':
        client.del(keyName + strategy.strategy_id, function (err, res) {
          resolve();
        });
        break;
    }
  });
};

MyRedis.prototype.assignAlarmStrategy = function (smartGateAlarmStrategy) {
  return new Promise(function (resolve, reject) {
    var tempObj = {
      strategy_type: smartGateAlarmStrategy.strategy_type,
      strategy_id: smartGateAlarmStrategy.strategy_id
    };
    client.hmset(redis_config.key_config.smartgatealarmstrategies + smartGateAlarmStrategy.smartgate_sn, tempObj, function (err, res) {
      resolve();
    });
  });
};

MyRedis.prototype.deleteSmartGateAlarmStrategy = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    client.del(redis_config.key_config.smartgatealarmstrategies + smartGateSn, function (err, res) {
      resolve();
    });
  });
};

MyRedis.prototype.setSmartGateOffline = function (smartGateSn, tag) {
  client.hgetall(redis_config.key_config.smartgateinfos + smartGateSn, function (err, obj) {
    if (err)
      cmlog.error(ErrorCode.error.E0002.error_msg);
    if (null != obj && undefined != obj && (obj['online_state'] != StateConfig.smartgate_state.online_state.offline)) {

      var attachedInfo = {
        deviceType: DeviceTypeConfig.smartgate,
        tag: tag
      };
      attachedInfo.info = {};
      _.forEach(_.keys(MetaConfig.smartgateMeta), function (attributeName) {
        attachedInfo.info[attributeName] = obj[attributeName];
      });

      var oldState = {},
        newState = {};
      _.forEach(_.keys(StateConfig.smartgate_state), function (keyName) {
        oldState[keyName] = obj[keyName];
      });
      newState = _.clone(oldState);
      newState['online_state'] = StateConfig.smartgate_state.online_state.offline;
      client.hget('smartgate_user', obj.sn, function (err, res) {
        if (null != res && undefined != res) {
          attachedInfo.owner = res;
        } else {
          attachedInfo.owner = 'unknown';
        }
        eventProcessNotifier.notifyData(oldState, newState, attachedInfo);
      });


      client.hset(redis_config.key_config.smartgateinfos + smartGateSn, 'online_state', StateConfig.smartgate_state.online_state.offline, function (err, res) {

      });
    }
  });
};

MyRedis.prototype.getSmartGateAlarmStrategyWithType = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    var result = {};
    client.hgetall(redis_config.key_config.smartgatealarmstrategies + smartGateSn, function (err, obj) {
      if (err)
        cmlog.error(ErrorCode.error.E0002.error_msg);
      if (null != obj && undefined != obj) {
        switch (obj.strategy_type) {
          case 'default':
            client.hgetall(redis_config.key_config.default_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special default-alarm-strategy');
              if (null != res1 && undefined != res1) {
                result.strategy_type = 'default';
                result.strategy = res1;
                resolve(result);
              } else
                resolve('Failed');
            });
            break;
          case 'customer':
            client.hgetall(redis_config.key_config.custom_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special customer-alarm-strategy');
              if (null != res1 && undefined != res1) {
                result.strategy_type = 'customer';
                result.strategy = res1;
                resolve(result);
              } else
                resolve('Failed');
            });
            break;
          case 'temp':
            client.hgetall(redis_config.key_config.temp_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special temp-alarm-strategy');
              if (null != res1 && undefined != res1) {
                result.strategy_type = 'temp';
                result.strategy = res1;
                resolve(result);
              } else
                resolve('Failed');
            });
            break;
          default :
            resolve('Failed');
            break;
        }
      } else {
        resolve('Failed');
      }
    });
  });
};

MyRedis.prototype.getsasgy = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    client.hgetall(redis_config.key_config.smartgatealarmstrategies + smartGateSn, function (err, obj) {
      if (err)
        cmlog.error(ErrorCode.error.E0002.error_msg);
      if (null != obj && undefined != obj) {
        switch (obj.strategy_type) {
          case 'default':
            client.hgetall(redis_config.key_config.default_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special default-alarm-strategy');
              if (null != res1 && undefined != res1) {
                resolve(res1);
              } else
                resolve('Failed');
            });
            break;
          case 'customer':
            client.hgetall(redis_config.key_config.custom_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special customer-alarm-strategy');
              if (null != res1 && undefined != res1) {
                resolve(res1);
              } else
                resolve('Failed');
            });
            break;
          case 'temp':
            client.hgetall(redis_config.key_config.temp_alarm_strategies + obj.strategy_id, function (err1, res1) {
              if (err1)
                cmlog.warn('Can not find the special temp-alarm-strategy');
              if (null != res1 && undefined != res1) {
                resolve(res1);
              } else
                resolve('Failed');
            });
            break;
          default :
            resolve('Failed');
            break;
        }
      } else {
        resolve('Failed');
      }
    });
  });
};
//2017.01.13修改事件不存redis
MyRedis.prototype.addUserEvent = function (newEvent) {
  /*client.hset(redis_config.key_config.events + newEvent.user_name, newEvent.event_id, JSON.stringify(newEvent), function (err, res) {

  });*/
};
//2017.01.13修改事件不存redis
MyRedis.prototype.pubNewEvent = function (newEvent) {
  //client.publish(redis_config.buffer_redis.notice_channel_config.server_to_site_channel, JSON.stringify(newEvent));
};

MyRedis.prototype.getUnparsedAlarmStrategy = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    myRedisGlobal.getSmartGateAlarmStrategyWithType(smartGateSn)
      .then(function (parsedAlarmStrategy) {
        if ('Failed' === parsedAlarmStrategy) {
          resolve('Failed');
        } else {
          unParseAlarmStrategy(parsedAlarmStrategy.strategy)
            .then(function (alarmStrategy) {
              var result = {};
              result.strategy_type = parsedAlarmStrategy.strategy_type;
              result.strategy = alarmStrategy;
              resolve(result);
            });
        }
      });
  });
};

MyRedis.prototype.deleteUserEvent = function (username, eventId) {
  return new Promise(function (resolve, reject) {
    client.hdel(redis_config.key_config.events + username, eventId, function (err, res) {
      if (!err) {
        resolve(res);
      }
    });
  });
};

MyRedis.prototype.updateUserSmartGate = function (action, username, smartGateSn) {
  return new Promise(function (resolve, reject) {
    switch (action) {
      case 'add':
        client.hset(redis_config.key_config.usersmartgate + username, smartGateSn, DeviceTypeConfig.smartgate, function (err, res) {
          client.hset('smartgate_user', smartGateSn, username, function (err, res) {
            resolve();
          });
        });
        break;
      case 'delete':
        client.hdel(redis_config.key_config.usersmartgate + username, smartGateSn, function (err, res) {
          client.hdel('smartgate_user', smartGateSn, function (err, res) {
            resolve();
          });
        });
        break;
    }
  });
};

MyRedis.prototype.updateSmartGateAlias = function (smartGateSn, alias) {
  return new Promise(function (resolve, reject) {
    client.hset(redis_config.key_config.smartgateinfos + smartGateSn, 'dev_alias', alias, function (err, res) {
      resolve();
    });
  });
};

MyRedis.prototype.updateDeviceAlias = function (deviceSn, alias) {
  return new Promise(function (resolve, reject) {
    client.hset(redis_config.key_config.deviceinfos + deviceSn, 'dev_alias', alias, function (err, res) {
      resolve();
    })
  })
};

MyRedis.prototype.checkDeletedDevices = function (smartGateSn) {
  client.smembers(redis_config.key_config.deleteddevices + smartGateSn, function (err, res) {

    _.forEach(res, function (deviceSn) {
      client.hexists(redis_config.key_config.smartgatedevice + smartGateSn, deviceSn, function (err, res) {
        if (res === 1) {
          deleteEndDevice(smartGateSn, deviceSn);
        } else {
          client.exists(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
            if (res === 1) {
              deleteEndDevice(smartGateSn, deviceSn);
            } else {
              client.hexists('device_smartgate', deviceSn, function (err, res) {
                if (res === 1) {
                  deleteEndDevice(smartGateSn, deviceSn);
                } else {
                  deleteDeletedDeviceFromBuffer(smartGateSn, deviceSn);
                }
              })
            }
          })
        }
      })
    })
  })
};

MyRedis.prototype.getSmartGateInfo = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    client.hgetall(redis_config.key_config.smartgateinfos + smartGateSn, function (err, res) {
      resolve(res);
    })
  })
};

MyRedis.prototype.getSmartGateInfoAnyway = function (smartGateSn) {
  return new Promise(function (resolve, reject) {
    client.hgetall(redis_config.key_config.smartgateinfos + smartGateSn, function (err, res) {
      if (null === res || undefined === res || undefined === res.sn) {
        db.find(TableNames.SMARTGATE, {sn: smartGateSn})
          .then(function (smartgate) {
            resolve(smartgate);
          })
      } else {
        resolve(res);
      }
    })
  })
};

function initSubscribe() {
  pubSubClient.subscribe(redis_config.buffer_redis.notice_channel_config.site_to_server_channel);
  pubSubClient.on('message', function (channel, message) {
    handleSubMsg(channel, message);
  });
};

function initOnlineSmartGateCount() {
  client.set('current_online_smartgate_count', 0);
};

function initOnlineDeviceCount() {
  client.set('current_online_device_count', 0);
};

function initSmartGateCount() {
  return new Promise(function (resolve, reject) {
    db.getCount(TableNames.SMARTGATE)
      .then(function (count) {
        client.set('smartgate_total_num', count);
        resolve();
      });
  })
};

function initDeviceCount() {
  return new Promise(function (resolve, reject) {
    db.getCount(TableNames.DEVICE)
      .then(function (count) {
        client.set('device_total_num', count);
        resolve();
      });
  });
};

function initUserSmartGatePair() {
  db.populate(TableNames.USER, 'smartgates', {})
    .then(function (users) {
      _.forEach(users, function (user) {
        _.forEach(user.smartgates, function (smartgate) {
          client.hset('smartgate_user', smartgate.sn, user.username, function (err, res) {

          });
          client.hset(redis_config.key_config.usersmartgate + user.username, smartgate.sn, DeviceTypeConfig.smartgate, function (err, res) {

          });
        });
      });
    });
};

function initSmartGateDevicePair() {
  db.populate(TableNames.SMARTGATE, 'devices', {})
    .then(function (smartgates) {
      _.forEach(smartgates, function (smartgate) {
        _.forEach(smartgate.devices, function (device) {
          client.hset('device_smartgate', device.sn, smartgate.sn, function (err, res) {

          });
          client.hset(redis_config.key_config.smartgatedevice + smartgate.sn, device.sn, device.dev_type, function (err, res) {

          });
        });
      });
    });
};

function initSmartGateAlarmStrategyPair() {
  db.find(TableNames.SMARTGATE_ALARM_STRATEGY, {})
    .then(function (records) {
      _.forEach(records, function (smartgateStrategy) {
        var tempObj = {
          strategy_type: smartgateStrategy.strategy_type,
          strategy_id: smartgateStrategy.strategy_id
        };
        client.hmset(redis_config.key_config.smartgatealarmstrategies + smartgateStrategy.smartgate_sn, tempObj, function (err, res) {

        });
      });
    });
};

function initUserInfo() {
  db.find(TableNames.USER, {})
    .then(function (users) {
      _.forEach(users, function (user) {
        client.hmset(redis_config.key_config.userinfos + user.username, user, function (err, res) {

        })
      })
    })
};

function loadAllStrategies() {
  db.find(TableNames.DEFAULT_ALARM_STRATEGY, {})
    .then(function (records) {
      _.forEach(records, function (defaultStrategy) {
        client.hmset(redis_config.key_config.default_alarm_strategies + defaultStrategy.strategy_id, parseAlarmStrategy(defaultStrategy), function (err, res) {
        });
      });
    });

  db.find(TableNames.CUSTOMER_ALARM_STRATEGY, {})
    .then(function (records) {
      _.forEach(records, function (customerStrategy) {
        client.hmset(redis_config.key_config.custom_alarm_strategies + customerStrategy.strategy_id, parseAlarmStrategy(customerStrategy), function (err, res) {
        });
      });
    });

  db.find(TableNames.TEMP_ALARM_STRATEGY, {})
    .then(function (records) {
      _.forEach(records, function (tempStrategy) {
        client.hmset(redis_config.key_config.temp_alarm_strategies + tempStrategy.strategy_id, parseAlarmStrategy(tempStrategy), function (err, res) {
        });
      });
    });
};

function loadAllUnReadEvents() {
  db.find(TableNames.MYEVENT, {event_state: 'unread'})
    .then(function (records) {
      _.forEach(records, function (event) {
        var addedEvent = {};
        _.forEach(_.keys(MetaConfig.myEventMeta), function (keyName) {
          addedEvent[keyName] = event[keyName];
        });
        client.hset(redis_config.key_config.events + event.user_name, event.event_id, JSON.stringify(addedEvent), function (err, res) {
        })
      })
    })
};

function parseAlarmStrategy(strategy) {
  var strategyPlain = {};

  _.forEach(strategy, function (value, key) {
    if ('strategy_id' === key)
      strategyPlain.strategy_id = strategy.strategy_id;
    if ('strategy_name' === key)
      strategyPlain.strategy_name = strategy.strategy_name;
    if ('username' === key)
      strategyPlain.username = strategy.username;
    if ('charge_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['charge_' + key] = strategy.charge_config[key];
      });
    }
    if ('air_temperature_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['air_t_' + key] = strategy.air_temperature_config[key];
      });
    }
    if ('air_humidity_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['air_h_' + key] = strategy.air_humidity_config[key];
      });
    }
    if ('soil_temperature_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['soil_t_' + key] = strategy.soil_temperature_config[key];
      });
    }
    if ('soil_humidity_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['soil_h_' + key] = strategy.soil_humidity_config[key];
      });
    }

    if ('co_ppm_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['co_ppm_' + key] = strategy.co_ppm_config[key];
      });
    }
    if ('co2_ppm_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['co2_ppm_' + key] = strategy.co2_ppm_config[key];
      });
    }
    if ('lux_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['lux_' + key] = strategy.lux_config[key];
      });
    }
    if ('smoke_config' === key) {
      _.forEach(strategy[key], function (value, key) {
        strategyPlain['smoke_' + key] = strategy.smoke_config[key];
      });
    }
  });

  return strategyPlain;
};

function unParseAlarmStrategy(parsedAlarmStrategy) {
  return new Promise(function (resolve, reject) {
    var alarmStrategy = {};
    alarmStrategy.charge_config = {},
      alarmStrategy.air_temperature_config = {},
      alarmStrategy.air_humidity_config = {},
      alarmStrategy.soil_temperature_config = {},
      alarmStrategy.soil_humidity_config = {},
      alarmStrategy.co_ppm_config = {},
      alarmStrategy.co2_ppm_config = {},
      alarmStrategy.lux_config = {},
      alarmStrategy.smoke_config = {};

    Promise.map(_.keys(parsedAlarmStrategy), function (strategyMeta) {
      return new Promise(function (resolve, reject) {
        if (S(strategyMeta).startsWith('strategy_id')) {
          alarmStrategy.strategy_id = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('strategy_name')) {
          alarmStrategy.strategy_name = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('username')) {
          alarmStrategy.username = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('charge_')) {
          alarmStrategy.charge_config[S(strategyMeta).right(strategyMeta.length - 7).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('air_t_')) {
          alarmStrategy.air_temperature_config[S(strategyMeta).right(strategyMeta.length - 6).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('air_h_')) {
          alarmStrategy.air_humidity_config[S(strategyMeta).right(strategyMeta.length - 6).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('soil_t_')) {
          alarmStrategy.soil_temperature_config[S(strategyMeta).right(strategyMeta.length - 7).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('soil_h_')) {
          alarmStrategy.soil_humidity_config[S(strategyMeta).right(strategyMeta.length - 7).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('co_ppm_')) {
          alarmStrategy.co_ppm_config[S(strategyMeta).right(strategyMeta.length - 7).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('co2_ppm_')) {
          alarmStrategy.co2_ppm_config[S(strategyMeta).right(strategyMeta.length - 8).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('lux_')) {
          alarmStrategy.lux_config[S(strategyMeta).right(strategyMeta.length - 4).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        if (S(strategyMeta).startsWith('smoke_')) {
          alarmStrategy.smoke_config[S(strategyMeta).right(strategyMeta.length - 6).toString()] = parsedAlarmStrategy[strategyMeta];
        }
        resolve();
      });
    })
      .then(function () {
        resolve(alarmStrategy);
      });
  })
};

function getStateKeyArray(devType) {
  var keyArray = [];
  switch (devType) {
    case DeviceTypeConfig.humidity_temperature:
      keyArray = _.keys(StateConfig.air_th_sensor_state);
      break;
    case DeviceTypeConfig.camera:
      keyArray = _.keys(StateConfig.camera_state);
      break;
    case DeviceTypeConfig.cameraip:
      keyArray = _.keys(StateConfig.cameraip_state);
      break;
    case DeviceTypeConfig.co:
      keyArray = _.keys(StateConfig.co_sensor_state);
      break;
    case DeviceTypeConfig.co2:
      keyArray = _.keys(StateConfig.co2_sensor_state);
      break;
    case DeviceTypeConfig.erelay:
      keyArray = _.keys(StateConfig.erelay_state);
      break;
    case DeviceTypeConfig.erelay2:
      keyArray = _.keys(StateConfig.erelay2_state);
      break;
    case DeviceTypeConfig.illumination:
      keyArray = _.keys(StateConfig.illumination_sensor_state);
      break;
    case DeviceTypeConfig.soil_th:
      keyArray = _.keys(StateConfig.soil_th_sensor_state);
      break;
    case DeviceTypeConfig.smoke:
      keyArray = _.keys(StateConfig.smoke_sensor_state);
      break;
  }
  return keyArray;
};

function getValueKeyArray(devType) {
  var keyArray = [];
  switch (devType) {
    case DeviceTypeConfig.humidity_temperature:
      keyArray = _.values(DeviceValueConfig.air_th_sensor_value);
      break;
    case DeviceTypeConfig.soil_th:
      keyArray = _.values(DeviceValueConfig.soil_th_sensor_value);
      break;
    case DeviceTypeConfig.co:
      keyArray = _.values(DeviceValueConfig.co_sensor_value);
      break;
    case DeviceTypeConfig.co2:
      keyArray = _.values(DeviceValueConfig.co2_sensor_value);
      break;
    case DeviceTypeConfig.illumination:
      keyArray = _.values(DeviceValueConfig.illumination_sensor_value);
      break;
    case DeviceTypeConfig.smoke:
      keyArray = _.values(DeviceValueConfig.smoke_sensor_value);
      break;
  }
  return keyArray;
};

function handleSubMsg(channel, message) {
  console.log(message);
};

function elimateSingularPoint(devType, lastValue, deviceState) {
  var isEmpty = _.isEmpty(lastValue);
  switch (devType) {
    case DeviceTypeConfig.humidity_temperature:
      if (deviceState.temperature > 90 || deviceState.temperature < -20) {
        if (isEmpty) {
          deviceState[DeviceValueConfig.air_th_sensor_value.temperature] = 20;
          deviceState[DeviceValueConfig.air_th_sensor_value.humidity] = 34;
        } else {
          deviceState[DeviceValueConfig.air_th_sensor_value.temperature] = lastValue[DeviceValueConfig.air_th_sensor_value.temperature];
          deviceState[DeviceValueConfig.air_th_sensor_value.humidity] = lastValue[DeviceValueConfig.air_th_sensor_value.humidity];
        }
      }
      break;
    case DeviceTypeConfig.co:
      break;
    case DeviceTypeConfig.co2:
      break;
    case DeviceTypeConfig.illumination:
      if (deviceState[DeviceValueConfig.illumination_sensor_value.lux] > 200000) {
        if (isEmpty) {
          deviceState[DeviceValueConfig.illumination_sensor_value.lux] = 0;
        } else {
          deviceState[DeviceValueConfig.illumination_sensor_value.lux] = lastValue[DeviceValueConfig.illumination_sensor_value.lux];
        }
      }
      break;
    case DeviceTypeConfig.soil_th:
      break;
  }
  return deviceState;
};

function deleteEndDevice(smartGateSn, deviceSn) {
  client.hdel(redis_config.key_config.smartgatedevice + smartGateSn, deviceSn, function (err, res) {
    client.del(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
      if (res === 1) {
        client.decr('current_online_device_count');
      }
      client.hdel('device_smartgate', deviceSn, function (err, res) {
        client.sadd(redis_config.key_config.deleteddevices + smartGateSn, deviceSn, function (err, res) {      //add the deleted device to the deleted-devices set.
          db.destroy(TableNames.DEVICE, {sn: deviceSn})
            .then(function () {

            })
        });
      });
    });
  });
};

function deleteDeletedDeviceFromBuffer(smartGateSn, deviceSn) {
  client.srem(redis_config.key_config.deleteddevices + smartGateSn, deviceSn, function (err, res) {

  })
};


