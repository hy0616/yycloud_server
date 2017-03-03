var Promise = require('bluebird'),
  datetime = require('./datetime'),
  _ = require('lodash'),
  redis = require('redis'),
  redis_config = sails.config.redis_config,
  pubSubClient = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options),
  client = redis.createClient(redis_config.buffer_redis.port, redis_config.buffer_redis.host, redis_config.buffer_redis.options),
  leancloud_config = sails.config.leancloud_config;

var smartGateState = {};

module.exports = {
  init: function () {
    initSubscribe();
  },

  getUserEvent: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.events + username, function (err, obj) {
        if (null !== obj && undefined !== obj) {
          var returnValue = [];
          _.forEach(_.values(obj), function (value) {
            returnValue.push(JSON.parse(value));
          })
          resolve(returnValue);
        } else {
          resolve({});
        }
      });
    })
  },

  getLatestSmartGateData: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      var result = {};
      result.components = [];
      if('undefined' === smartGateSn){
        resolve(result);
        return;
      }
      client.hgetall(redis_config.key_config.smartgateinfos + smartGateSn, function (err, res) {
        if (null === res || undefined === res || undefined === res.sn) {
          SmartGate.findWithDevice(smartGateSn)
            .then(function (smartGate) {
              result.smartgate = _.omit(smartGate, _.isFunction);
              result.smartgate = _.omit(result.smartgate, 'devices');
              result.smartgate.plant_time = result.smartgate.plant_time + '';
              result.smartgate.harvest_time = result.smartgate.harvest_time + '';
              result.components = smartGate.devices;
              _.forEach(result.components, function (device) {
                device.online_state = 'offline';
              })
              resolve(result);
            });
        } else {
          result.smartgate = res;
          client.hgetall(redis_config.key_config.smartgatedevice + smartGateSn, function (err, res) {
            Promise.map(_.keys(res), function (deviceSn) {

              if(deviceSn !== null && deviceSn !== undefined ){

                  return new Promise(function (resolve, reject) {
                      client.hgetall(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
                          //console.log('------------->res',res);
                          if(res !== null && res !== undefined && res !== '') {
                              if(res.dev_type !== null && res.dev_type !== undefined && res.dev_type !== ''){
                                  if(res.dev_type ==='relaybox'){
                                      //console.log('------------->res.pool_list',res.pool_list);
                                      res.pool_list = JSON.parse(res.pool_list);
                                      // console.log('------------->JSON.parse(res.pool_list)',res.pool_list);
                                  }
                              }
                              result.components.push(res);
                              resolve();
                          }
                      });
                  });

              }

            }).then(function () {
              resolve(result);
            });
          });
        }
      });
    });
  },

  getTotal: function () {
    return new Promise(function (resolve, reject) {
      Promise.props({
        smartgate_total_num: getValueByKey('smartgate_total_num'),
        device_total_num: getValueByKey('device_total_num'),
        online_smartgate_num: getValueByKey('current_online_smartgate_count'),
        online_device_num: getValueByKey('current_online_device_count')
      }).then(function (result) {
        resolve(result);
      });
    });
  },

  getTotalByUser: function (username) {
    return new Promise(function (resolve, reject) {
      Promise.props({
        smartgate_total_num: getSmartGateNumByUser(username),
        smartgate_online_num: getSmartGateOnlineNumByUser(username)
      }).then(function (result) {
        resolve(result);
      })
    })
  },

  getSmartGateByUser: function (username) {
    return new Promise(function (resolve, reject) {
      var result = [];
      client.hgetall(redis_config.key_config.usersmartgate + username, function (err, res) {
        Promise.map(_.keys(res), function (smartgate) {
          return new Promise(function (resolve, reject) {
            RedisService.getLatestSmartGateData(smartgate)
              .then(function (data) {
                result.push(data);
                resolve();
              })
          })
        }).then(function () {
          resolve(result);
        });
      });
    });
  },

  getAllSmartGate: function () {
    return new Promise(function (resolve, reject) {
      var result = [];

      SmartGate.findAllSns()
        .then(function (record) {
          Promise.map(record, function (singleRecord) {
            return new Promise(function (resolve, reject) {
              RedisService.getLatestSmartGateData(singleRecord.sn)
                .then(function (data) {
                  result.push(data);
                  resolve();
                })
            })
          }).then(function () {
            resolve(result);
          })
        })
    })
  },

  getSmartGateSnsByUser: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.usersmartgate + username, function (err, res) {
        resolve(_.keys(res));
      });
    });
  },

  getDeviceSnsBySmarGate: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.smartgatedevice + smartGateSn, function (err, res) {
        resolve(_.keys(res));
      });
    });
  },

  getLatestDeviceData: function (deviceSn, username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
        var smartGateSn = res.owner;
        if (null === smartGateSn || undefined === smartGateSn) {
          resolve({msg: 'wrong device sn'});
        } else {
          if (client.hexists(redis_config.key_config.usersmartgate + username, smartGateSn, function (err, res1) {
              if (res1 === 1) {
                  if(res.dev_type ==='relaybox'){
                      //console.log('------------->res.pool_list',res.pool_list);
                      res.pool_list = JSON.parse(res.pool_list);
                      // console.log('------------->JSON.parse(res.pool_list)',res.pool_list);
                  }
                resolve(res);
              } else {
                resolve({msg: 'wrong device sn'});
              }
            }));
        }
      });
    });
  },

  deleteDevice: function (smartGateSn, deviceSn) {
    return new Promise(function (resolve, reject) {
      client.hdel(redis_config.key_config.smartgatedevice + smartGateSn, deviceSn, function (err, res) {
        client.del(redis_config.key_config.deviceinfos + deviceSn, function (err, res) {
          if (res === 1) {
            client.decr('current_online_device_count');
          }
          client.hdel('device_smartgate', deviceSn, function (err, res) {
            client.sadd(redis_config.key_config.deleteddevices + smartGateSn, deviceSn, function (err, res) {      //add the deleted device to the deleted-devices set.
              resolve();
            });
          });
        });
      });
    });
  },

  getUserInfo: function (username) {
    return new Promise(function (resolve, reject) {
      client.hgetall(redis_config.key_config.userinfos + username, function (err, res) {
        resolve(res);
      })
    })
  },

  setUserInfo: function (username) {
    User.findOne({username: username})
      .then(function (user) {
        client.hmset(redis_config.key_config.userinfos + user.username, user, function (err, res) {

        })
      })
  },

  setUserInstallationId1: function (username, installationId) {
    return new Promise(function (resolve, reject) {
      client.hmset('user_leancloud', username, installationId, function (err, res) {
        if (err) {
          resolve('Failed');
        } else {
          resolve('OK');
        }
      })
    })
  },

  setUserInstallationId: function (username, installationId) {
    return new Promise(function (resolve, reject) {

      client.hget(redis_config.key_config.userleancloud, username, function (err, res) {
        if (res !== installationId) {
          PushService.pushSpecialUserCmd(res, [leancloud_config.channels.CMD], leancloud_config.cmds.OFFLINE, username);
        }

        client.hget(redis_config.key_config.leanclouduser, installationId, function (err, res) {
          if (null === res) {
            updateLeancloudUser(username, installationId)
              .then(function () {
                updateUserLeancloud(username, installationId)
                  .then(function (updateResult) {
                    resolve(updateResult);
                  });
              });
          } else {
            if (res === username) {
              updateUserLeancloud(username, installationId)
                .then(function (updateResult) {
                  resolve(updateResult);
                });
            } else {
              deleteUserLeancloud(res, installationId)
                .then(function () {
                  updateLeancloudUser(username, installationId)
                    .then(function () {
                      updateUserLeancloud(username, installationId)
                        .then(function (updateRecord) {
                          resolve(updateRecord);
                        });
                    });
                });
            }
          }
        });
      });
    });
  },

  getUserInstallationId: function (username) {
    return new Promise(function (resolve, reject) {
      client.hget(redis_config.key_config.userleancloud, username, function (err, res) {
        resolve(res);
      })
    })
  },

  getSmartGateStateMap: function () {
    return smartGateState;
  },

  getSmartGateOnlineState: function (smartGateSn) {
    return new Promise(function (resolve, reject) {
      client.hget(redis_config.key_config.smartgateinfos + smartGateSn, 'online_state', function (err, res) {
        if ('online' === res) {
          smartGateState[smartGateSn] = 'online';
        } else {
          smartGateState[smartGateSn] = 'offline';
        }
        resolve(smartGateState[smartGateSn]);
      })
    })
  },
};
function initDevSubscribe() {//订阅设备状态改变
    pubSubClient.subscribe(redis_config.buffer_redis.notice_channel_config.server_to_site_dev_channel);
    pubSubClient.on('message', function (channel, message) {
      if(channel === redis_config.buffer_redis.notice_channel_config.server_to_site_dev_channel){
          console.log('订阅设备状态改变message:','channel:'+channel+' '+'message:'+message);
          var msg = JSON.parse(message);
          SmartGate.findInfo(msg.info.owner)
              .then(function (record) {
                  Promise.map(record, function (singleRecord) {
                      console.log('singleRecord',singleRecord);
                      var username = singleRecord.owner;
                      console.log('username',username);
                      if(username !== 'unknown' && username !== undefined && username !== null ){
                          PushWebService.pushDevStatusChangelUserWeb(username,msg);
                      }
                  })
              })
      }

    });
};

function initSubscribe() {//订阅事件
  pubSubClient.subscribe(redis_config.buffer_redis.notice_channel_config.server_to_site_channel);
  pubSubClient.on('message', function (channel, message) {
    if(channel === redis_config.buffer_redis.notice_channel_config.server_to_site_channel ){
       // console.log('订阅事件message:','channel:'+channel+' '+'message:'+message);
        handleSubMsg(channel, message);
    }

  });
};

function handleSubMsg(channel, message) {
  var msg = JSON.parse(message);
  var username = msg.user_name;
  if (null !== username && undefined !== username && 'unknown' !== username) {
    RedisService.getUserInstallationId(username)
      .then(function (installationId) {
        if (null !== installationId && undefined !== installationId) {
          var alarmObj = generateEventObj(msg);
          var channels = ['event'];
          PushService.pushSpecialUser(installationId, channels, alarmObj.title, alarmObj.eventStr);
          PushWebService.pushSpecialUserWebb(username,msg);
        }
      })
  }
};

function getValueByKey(keyName) {
  return new Promise(function (resolve, reject) {
    client.get(keyName, function (err, res) {
      resolve(res);
    });
  });
};

function getSmartGateNumByUser(username) {
  return new Promise(function (resolve, reject) {
    client.hlen(redis_config.key_config.usersmartgate + username, function (err, res) {
      resolve(res);
    })
  })
};

function getSmartGateOnlineNumByUser(username) {
  return new Promise(function (resolve, reject) {
    client.hkeys(redis_config.key_config.usersmartgate + username, function (err, res) {
      var count = 0;
      Promise.map(res, function (smartGateSn) {
        return new Promise(function (resolve, reject) {
          client.hget(redis_config.key_config.smartgateinfos + smartGateSn, 'online_state', function (err, res) {
            if ('online' === res) {
              count++;
              smartGateState[smartGateSn] = 'online';
            }else{
              smartGateState[smartGateSn] = 'offline';
            }
            resolve();
          });
        });
      }).then(function () {
        resolve(count);
      })
    })
  })
};

function generateEventObj(msg) {
  var alarmObj = {},
    preStr = '',
    title = '';

  switch (msg.event_type) {
    case 'notice':
      title = '系统通知';
      preStr = '【通知】';
      break;
    case 'alarm':
      title:'异常报警';
      preStr = '【报警】';
      break;
  }
  alarmObj.title = title;
  alarmObj.eventStr = preStr + msg.detail;
  return alarmObj;
};

function updateLeancloudUser(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hset(redis_config.key_config.leanclouduser, installationId, username, function (err, res) {
      resolve();
    })
  })
};

function updateUserLeancloud(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hmset(redis_config.key_config.userleancloud, username, installationId, function (err, res) {
      if (err) {
        resolve('Failed');
      } else {
        resolve('OK');
      }
    })
  })
};

function deleteUserLeancloud(username, installationId) {
  return new Promise(function (resolve, reject) {
    client.hdel(redis_config.key_config.userleancloud, username, installationId, function (err, res) {
      resolve();
    })
  })
};