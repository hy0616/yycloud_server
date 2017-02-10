var EventEmitter = require('events').EventEmitter,
  _ = require('lodash'),
  util = require('util'),
  Promise = require('bluebird'),
  StateConfig = require('../../config/event_config/state_config'),
  MyRedis = require('../../my_redis/my_redis'),
  DeviceType = require('../../config/device_type_config').device_type,
  datetime = require('../../utils/datetime'),
  History = require('../history/history'),
  GeoGroupData = require('../group_data/geogroup_data');

var PACKET_TOKEN = {
  FIRST: 'first',
  PART: 'part',
  LAST: 'last'
}

require('../../utils/log_entrance/cmlog');

var EventFilterChain = function () {
  EventEmitter.call(this);
  this.needStoreList = {};
};

util.inherits(EventFilterChain, EventEmitter);
module.exports = new EventFilterChain();

EventFilterChain.prototype.eventFilter = function (data) {
  var self = this;
  var sn1 = data.body.sn;
  var seq = data.h.seq;

  var isLast = false, isFirst = false;
  if (seq === PACKET_TOKEN.LAST) {
    isLast = true;
  } else if (seq === PACKET_TOKEN.FIRST) {
    isFirst = true;
  }

  assignMeta(data.body.c, sn1)
    .then(function (meta) {
      var time = datetime.getUTCTimeStamp();
      if (isFirst) {
        meta.last_value.server_time = time;
        MyRedis.myRedis.filtreFunc(meta);

        var geoData = {};
        geoData.sn = sn1,
          geoData.remote_address = data.ra,
          geoData.lat = meta.info.lat,
          geoData.lng = meta.info.lng;
        GeoGroupData.geoGroupData.autoGeoGroup(geoData);
      }

      MyRedis.myRedis.getsasgy(sn1).then(function (asgy) {
        if (undefined === self.needStoreList[sn1]) {
          self.needStoreList[sn1] = false;
        }
        Promise.map(data.body.cs, function (device) {
          return new Promise(function (resolve, reject) {
            assignDMeta(device, sn1, asgy)
              .then(function (data1) {
                data1.last_value.server_time = time;
                data1.strategy = {};
                data1.strategy = asgy;
                data1.serverTime = time;
                MyRedis.myRedis.baseFunc(data1)
                  .then(function (result) {
                    self.needStoreList[sn1] = (self.needStoreList[sn1] || result);
                    resolve();
                  })

              });
          });
        }).then(function () {
          if (isLast) {
            History.history.handleSmartGate(sn1, time, self.needStoreList[sn1]);
            MyRedis.myRedis.checkDeletedDevices(sn1);
            self.needStoreList[sn1] = false;
          }
        });
      }, function () {
        cmlog.warn('Can not find the special alarm-stragety for the smartgate ' + sn1);
      });
    });
};

function assignMeta(data, sn) {
  return new Promise(function (resolve, reject) {
    var data1 = {};
    var data2 = {};
    var data3 = {};
    data2.dev_name = data.dn;
    data2.dev_location = data.dl;
    data2.lat = data.lat;
    data2.lng = data.lng;
    data2.plant_name = data.pn;
    data2.area = data.ar;
    data2.expectation = data.ep;
    data2.plant_time = data.pt;
    data2.harvest_time = data.ht;
    data2.harvest_weight = data.hw;
    data2.contact_name = data.cna;
    data2.contact_number = data.cnu;
    data2.sn = sn;
    data2.version = data.version;

    data1.info = data2;

    data3.utc_timestamp = data.ut;
    data3.utc_offset = data.uo;

    data1.last_value = data3;

    data1.state = {
      online_state: StateConfig.smartgate_state.online_state.online
    };
    resolve(data1);
  });
};

function assignDMeta(device, sn, sgy) {
  return new Promise(function (resolve, reject) {
    var data = {};
    assignInfo(device, sn)
      .then(function (tempData) {
        return _.assign(data, tempData);
      }).then(function (tempData) {
        assignState(device.dt, device.on, tempData.last_value, sgy)
          .then(function (tempData1) {
            _.assign(tempData, tempData1);
            resolve(tempData);
          });
      });
  }).then(function (value) {
      return value;
    });
};

function assignInfo(data, sn) {
  return new Promise(function (resolve, reject) {
    var value = {};
    value.info = {};
    value.last_value = {};
    value.info.sn = data.sn;
    value.info.owner = sn;
    value.info.dev_name = data.da;
    value.info.dev_type = data.dt;
    value.info.dev_extend_type = data.det;
    value.info.user = '';
    value.info.password = '';
    value.last_value.charge = data.ch;

    switch (value.info.dev_type) {
      case DeviceType.humidity_temperature:
        value.last_value.air_temperature = data.tp;
        value.last_value.air_humidity = data.hm;
        break;
      case DeviceType.co:
        value.last_value.co_ppm = data.co;
        break;
      case DeviceType.co2:
        value.last_value.co2_ppm = data.co2;
        break;
      case DeviceType.soil_th:
        value.last_value.soil_temperature = data.stp;
        value.last_value.soil_humidity = data.shm;
        break;
      case DeviceType.illumination:
        value.last_value.lux = data.lux;
        break;
      case DeviceType.smoke:
        value.last_value.smoke = data.smk;
        break;
      case DeviceType.erelay:
        value.last_value.status = data.st;
        break;
      case DeviceType.erelay2:
        value.last_value.status = data.st;
        break;
      case DeviceType.camera:
        value.last_value.camera = data.ca;
        break;
      case DeviceType.cameraip:
        value.info.user = data.user;
        value.info.password = data.pw;
        break;
      default :
        break;
    }

    resolve(value);
  });
};

function assignState(type, online, value, sgy) {
  return new Promise(function (resolve, reject) {
    var state = {};
    var state1 = {};
    state1.online_state = (online === 1) ? StateConfig.smartgate_state.online_state.online : StateConfig.smartgate_state.online_state.offline;
    _.assign(state1, chargeAnalysis(value, sgy));

    switch (type) {
      case DeviceType.humidity_temperature:
        _.assign(state1, airTHAnalysis(value, sgy));
        break;
      case DeviceType.co:
        _.assign(state1, coAnalysis(value, sgy));
        break;
      case DeviceType.co2:
        _.assign(state1, co2Analysis(value, sgy));
        break;
      case DeviceType.soil_th:
        _.assign(state1, soilTHAnalysis(value, sgy));
        break;
      case DeviceType.illumination:
        _.assign(state1, illuminationAnalysis(value, sgy));
        break;
      case DeviceType.smoke:
        _.assign(state1, smokeAnalysis(value, sgy));
        break;
      case DeviceType.erelay:
        _.assign(state1, erelayAnalysis(value, sgy));
        break;
      case DeviceType.erelay2:
        _.assign(state1, erelay2Analysis(value, sgy));
        break;
      case DeviceType.camera:
        _.assign(state1, cameraAnalysis(value, sgy));
        break;
      case DeviceType.cameraip:
        _.assign(state1, cameraipAnalysis(value, sgy));
        break;
      default :
        break;
    }
    state.state = state1;

    resolve(state);
  });
};

function chargeAnalysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    charge_state: StateConfig.air_th_sensor_state.charge_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.charge_state = StateConfig.air_th_sensor_state.charge_state.normal;
    return deviceCurrentState;
  }

  var chargeOk = false;
  if (!chargeOk && alarmStrategy.charge_enable_l_1) {
    if (inLRange(lastValue.charge, alarmStrategy.charge_l_value_2, alarmStrategy.charge_l_value_1)) {
      deviceCurrentState.charge_state = StateConfig.air_th_sensor_state.charge_state.low_1;
      chargeOk = true;
    }
  }

  if (!chargeOk && alarmStrategy.charge_enable_l_2) {
    if (inLRange(lastValue.charge, -10000, alarmStrategy.charge_l_value_2)) {
      deviceCurrentState.charge_state = StateConfig.air_th_sensor_state.charge_state.low_2;
      chargeOk = true;
    }
  }

  return deviceCurrentState;
};

function airTHAnalysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    temperature_state: StateConfig.air_th_sensor_state.temperature_state.normal,
    humidity_state: StateConfig.air_th_sensor_state.humidity_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.normal,
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.normal;
    return deviceCurrentState;
  }

  var tOK = false,
    hOK = false;
  // temperature
  if (!tOK && alarmStrategy.air_t_enable_h_3) {
    if (inHRange(lastValue.temperature, alarmStrategy.air_t_h_value_3, 10000)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.high_3;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.air_t_enable_h_2) {
    if (inHRange(lastValue.temperature, alarmStrategy.air_t_h_value_2, alarmStrategy.air_t_h_value_3)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.high_2;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.air_t_enable_h_1) {
    if (inHRange(lastValue.temperature, alarmStrategy.air_t_h_value_1, alarmStrategy.air_t_h_value_2)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.high_1;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.air_t_enable_l_1) {
    if (inLRange(lastValue.temperature, alarmStrategy.air_t_h_value_2, alarmStrategy.air_t_h_value_1)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.low_1;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.air_t_enable_l_2) {
    if (inLRange(lastValue.temperature, alarmStrategy.air_t_l_value_3, alarmStrategy.air_t_l_value_2)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.low_2;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.air_t_enable_l_3) {
    if (inLRange(lastValue.temperature, -10000, alarmStrategy.air_t_l_value_3)) {
      deviceCurrentState.temperature_state = StateConfig.air_th_sensor_state.temperature_state.low_3;
      tOK = true;
    }
  }

  // humidity
  if (!hOK && alarmStrategy.air_h_enable_h_3) {
    if (inHRange(lastValue.humidity, alarmStrategy.air_h_h_value_3, 10000)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.high_3;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.air_h_enable_h_2) {
    if (inHRange(lastValue.humidity, alarmStrategy.air_h_h_value_2, alarmStrategy.air_h_h_value_3)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.high_2;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.air_h_enable_h_1) {
    if (inHRange(lastValue.humidity, alarmStrategy.air_h_h_value_1, alarmStrategy.air_h_h_value_2)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.high_1;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.air_h_enable_l_1) {
    if (inLRange(lastValue.humidity, alarmStrategy.air_h_l_value_2, alarmStrategy.air_h_l_value_1)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.low_1;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.air_h_enable_l_2) {
    if (inLRange(lastValue.humidity, alarmStrategy.air_h_l_value_3, alarmStrategy.air_h_l_value_2)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.low_2;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.air_h_enable_l_3) {
    if (inLRange(lastValue.humidity, -10000, alarmStrategy.air_h_l_value_3)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.low_3;
      hOK = true;
    }
  }
  return deviceCurrentState;
};

function coAnalysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    co_ppm_state: StateConfig.co_sensor_state.co_ppm_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.normal;
    return deviceCurrentState;
  }

  var coOk = false;
  // co
  if (!coOk && alarmStrategy.co_ppm_enable_h_3) {
    if (inHRange(lastValue.co, alarmStrategy.co_ppm_h_value_3, 10000)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.high_3;
      coOk = true;
    }
  }

  if (!coOk && alarmStrategy.co_ppm_enable_h_2) {
    if (inHRange(lastValue.co, alarmStrategy.co_ppm_h_value_2, alarmStrategy.co_ppm_h_value_3)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.high_2;
      coOk = true;
    }
  }

  if (!coOk && alarmStrategy.co_ppm_enable_h_1) {
    if (inHRange(lastValue.co, alarmStrategy.co_ppm_h_value_1, alarmStrategy.co_ppm_h_value_2)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.high_1;
      coOk = true;
    }
  }

  if (!coOk && alarmStrategy.co_ppm_enable_l_1) {
    if (inLRange(lastValue.co, alarmStrategy.co_ppm_l_value_2, alarmStrategy.co_ppm_l_value_1)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.low_1;
      coOk = true;
    }
  }

  if (!coOk && alarmStrategy.co_ppm_enable_l_2) {
    if (inLRange(lastValue.co, alarmStrategy.co_ppm_l_value_3, alarmStrategy.co_ppm_l_value_2)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.low_2;
      coOk = true;
    }
  }

  if (!coOk && alarmStrategy.co_ppm_enable_l_3) {
    if (inLRange(lastValue.co, -10000, alarmStrategy.co_ppm_l_value_3)) {
      deviceCurrentState.co_ppm_state = StateConfig.co_sensor_state.co_ppm_state.low_3;
      coOk = true;
    }
  }

  return deviceCurrentState;
};

function co2Analysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    co2_ppm_state: StateConfig.co2_sensor_state.co2_ppm_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.normal;
    return deviceCurrentState;
  }

  var co2Ok = false;
  // co2
  if (!co2Ok && alarmStrategy.co2_ppm_enable_h_3) {
    if (inHRange(lastValue.co2, alarmStrategy.co2_ppm_h_value_3, 10000)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.high_3;
      co2Ok = true;
    }
  }

  if (!co2Ok && alarmStrategy.co2_ppm_enable_h_2) {
    if (inHRange(lastValue.co2, alarmStrategy.co2_ppm_h_value_2, alarmStrategy.co2_ppm_h_value_3)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.high_2;
      co2Ok = true;
    }
  }

  if (!co2Ok && alarmStrategy.co2_ppm_enable_h_1) {
    if (inHRange(lastValue.co2, alarmStrategy.co2_ppm_h_value_1, alarmStrategy.co2_ppm_h_value_2)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.high_1;
      co2Ok = true;
    }
  }

  if (!co2Ok && alarmStrategy.co2_ppm_enable_l_1) {
    if (inLRange(lastValue.co2, alarmStrategy.co2_ppm_l_value_2, alarmStrategy.co2_ppm_l_value_1)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.low_1;
      co2Ok = true;
    }
  }

  if (!co2Ok && alarmStrategy.co2_ppm_enable_l_2) {
    if (inLRange(lastValue.co2, alarmStrategy.co2_ppm_l_value_3, alarmStrategy.co2_ppm_l_value_2)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.low_2;
      co2Ok = true;
    }
  }

  if (!co2Ok && alarmStrategy.co2_ppm_enable_l_3) {
    if (inLRange(lastValue.co2, -10000, alarmStrategy.co2_ppm_l_value_3)) {
      deviceCurrentState.co2_ppm_state = StateConfig.co2_sensor_state.co2_ppm_state.low_3;
      co2Ok = true;
    }
  }

  return deviceCurrentState;
};

function soilTHAnalysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    temperature_state: StateConfig.soil_th_sensor_state.temperature_state.normal,
    humidity_state: StateConfig.soil_th_sensor_state.humidity_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.normal,
      deviceCurrentState.humidity_state = StateConfig.soil_th_sensor_state.humidity_state.normal;
    return deviceCurrentState;
  }

  var tOK = false,
    hOK = false;
  if (!tOK && alarmStrategy.soil_t_enable_h_3) {
    if (inHRange(lastValue.temperature, alarmStrategy.soil_t_h_value_3, 10000)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.high_3;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.soil_t_enable_h_2) {
    if (inHRange(lastValue.temperature, alarmStrategy.soil_t_h_value_2, alarmStrategy.soil_t_h_value_3)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.high_2;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.soil_t_enable_h_1) {
    if (inHRange(lastValue.temperature, alarmStrategy.soil_t_h_value_1, alarmStrategy.soil_t_h_value_2)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.high_1;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.soil_t_enable_l_1) {
    if (inLRange(lastValue.temperature, alarmStrategy.soil_t_l_value_2, alarmStrategy.soil_t_l_value_1)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.low_1;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.soil_t_enable_l_2) {
    if (inLRange(lastValue.temperature, alarmStrategy.soil_t_l_value_3, alarmStrategy.soil_t_l_value_2)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.low_2;
      tOK = true;
    }
  }

  if (!tOK && alarmStrategy.soil_t_enable_l_3) {
    if (inLRange(lastValue.temperature, -10000, alarmStrategy.soil_t_l_value_3)) {
      deviceCurrentState.temperature_state = StateConfig.soil_th_sensor_state.temperature_state.low_3;
      tOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_h_3) {
    if (inHRange(lastValue.humidity, alarmStrategy.soil_h_h_value_3, 10000)) {
      deviceCurrentState.humidity_state = StateConfig.soil_th_sensor_state.humidity_state.high_3;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_h_2) {
    if (inHRange(lastValue.humidity, alarmStrategy.soil_h_h_value_2, alarmStrategy.soil_h_h_value_3)) {
      deviceCurrentState.humidity_state = StateConfig.soil_th_sensor_state.humidity_state.high_2;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_h_1) {
    if (inHRange(lastValue.humidity, alarmStrategy.soil_h_h_value_1, alarmStrategy.soil_h_h_value_2)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.high_1;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_l_1) {
    if (inLRange(lastValue.humidity, alarmStrategy.soil_h_l_value_2, alarmStrategy.soil_h_l_value_1)) {
      deviceCurrentState.humidity_state = StateConfig.air_th_sensor_state.humidity_state.low_1;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_l_2) {
    if (inLRange(lastValue.humidity, alarmStrategy.soil_h_l_value_3, alarmStrategy.soil_h_l_value_2)) {
      deviceCurrentState.humidity_state = StateConfig.soil_th_sensor_state.humidity_state.low_2;
      hOK = true;
    }
  }

  if (!hOK && alarmStrategy.soil_h_enable_l_3) {
    if (inLRange(lastValue.humidity, -10000, alarmStrategy.soil_h_l_value_3)) {
      deviceCurrentState.humidity_state = StateConfig.soil_th_sensor_state.humidity_state.low_3;
      hOK = true;
    }
  }

  return deviceCurrentState;
};

function illuminationAnalysis(lastValue, alarmStrategy) {
  var deviceCurrentState = {
    lux_state: StateConfig.illumination_sensor_state.lux_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.normal;
    return deviceCurrentState;
  }

  var luxOk = false;
  // co
  if (!luxOk && alarmStrategy.lux_enable_h_3) {
    if (inHRange(lastValue.lux, alarmStrategy.lux_h_value_3, 10000)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.high_3;
      luxOk = true;
    }
  }

  if (!luxOk && alarmStrategy.lux_enable_h_2) {
    if (inHRange(lastValue.lux, alarmStrategy.lux_h_value_2, alarmStrategy.lux_h_value_3)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.high_2;
      luxOk = true;
    }
  }

  if (!luxOk && alarmStrategy.lux_enable_h_1) {
    if (inHRange(lastValue.lux, alarmStrategy.lux_h_value_1, alarmStrategy.lux_h_value_2)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.high_1;
      luxOk = true;
    }
  }

  if (!luxOk && alarmStrategy.lux_enable_l_1) {
    if (inLRange(lastValue.lux, alarmStrategy.lux_l_value_2, alarmStrategy.lux_l_value_1)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.low_1;
      luxOk = true;
    }
  }

  if (!luxOk && alarmStrategy.lux_enable_l_2) {
    if (inLRange(lastValue.lux, alarmStrategy.lux_l_value_3, alarmStrategy.lux_l_value_2)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.low_2;
      luxOk = true;
    }
  }

  if (!luxOk && alarmStrategy.lux_enable_l_3) {
    if (inLRange(lastValue.lux, -10000, alarmStrategy.lux_l_value_3)) {
      deviceCurrentState.lux_state = StateConfig.illumination_sensor_state.lux_state.low_3;
      luxOk = true;
    }
  }

  return deviceCurrentState;
};

function smokeAnalysis(lastValue, alarmStrategy){
  var deviceCurrentState = {
    smoke_state: StateConfig.smoke_sensor_state.smoke_state.normal
  };

  if ('Failed' === alarmStrategy) {
    deviceCurrentState.smoke_state = StateConfig.smoke_sensor_state.smoke_state.normal;
    return deviceCurrentState;
  }

  var smokeOk = false;

  if (!smokeOk && alarmStrategy.smoke_enable_h_2) {
    if (inHRange(lastValue.smoke, alarmStrategy.smoke_h_value_2, alarmStrategy.smoke_h_value_3)) {
      deviceCurrentState.smoke_state = StateConfig.smoke_sensor_state.smoke_state.high_2;
      smokeOk = true;
    }
  }

  if (!smokeOk && alarmStrategy.smoke_enable_h_1) {
    if (inHRange(lastValue.smoke, alarmStrategy.smoke_h_value_1, alarmStrategy.smoke_h_value_2)) {
      deviceCurrentState.smoke_state = StateConfig.illumination_sensor_state.smoke_state.high_1;
      smokeOk = true;
    }
  }

  return deviceCurrentState;
};

function erelayAnalysis(lastValue, alarmStrategy) {
  return {};
};

function erelay2Analysis(lastValue, alarmStrategy) {
  return {};
};

function cameraAnalysis(lastValue, alarmStrategy) {
  return {};
};

function cameraipAnalysis(lastValue, alarmStrategy) {
  return {};
};

function inHRange(value, leftValue, rightValue) {
  return (value >= leftValue && value < rightValue) ? true : false;
}

function inLRange(value, leftValue, rightValue) {
  return (value > leftValue && value <= rightValue) ? true : false;
}