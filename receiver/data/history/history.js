var EventEmitter = require('events').EventEmitter,
  _ = require('lodash'),
  util = require('util'),
  Promise = require('bluebird'),
  db = require('../../db/db').db,
  TableNames = require('../../db/table_name'),
  DeviceTypeConfig = require('../../config/device_type_config').device_type,
  env = require('../../config/env'),
  datetime = require('../../utils/datetime'),
  DeviceValueConfig = require('../../config/event_config/device_value_config');

require('../../utils/log_entrance/cmlog');

var History = function () {
  EventEmitter.call(this);

  this.smartGateData = {};
  this.storeTime = {};
  this.sensorTypeList = [];
  validListInit(this.sensorTypeList);
  this.averageData = {};

};

util.inherits(History, EventEmitter);
var historyGlobal = new History();
module.exports = History;
module.exports.history = historyGlobal;

History.prototype.receiveMsg = function (old, value) {
  var self = this;

  if (!isValid(value.deviceType)) {
    return false;
  }

  handleDevice(self, value);

  if (_.isEmpty(old)) {
    storeData(self, value);
    updateTime(self, value.sn, value.serverTime);
    return true;
  }

  if (undefined === this.storeTime[value.sn]) {
    this.storeTime[value.sn] = {};
    this.storeTime[value.sn]['storeTime'] = 0;
  }
  var diff = value.serverTime - this.storeTime[value.sn]['storeTime'];
  if (Math.abs(diff) >= env.store_timespan * 1000) {
    storeData(self, value);
    updateTime(self, value.sn, value.serverTime);
    return true;
  }

  if (isOver(old, value)) {
    storeData(self, value);
    updateTime(self, value.sn, value.serverTime);
    return true;
  }

  return false;
};

History.prototype.handleSmartGate = function (smartGateSn, serverTime, needStore) {
  var self = this;
  var storeData = {};
  storeData.sn = smartGateSn;

  if (undefined === this.smartGateData[smartGateSn]) {
    this.smartGateData[smartGateSn] = {};
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.temperature]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.temperature]['count']) {
    storeData.air_temperature = this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.temperature]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.temperature]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.temperature] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.humidity]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.humidity]['count']) {
    storeData.air_humidity = this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.humidity]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.humidity]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.air_th_sensor_value.humidity] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.temperature]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.temperature]['count']) {
    storeData.soil_temperature = this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.temperature]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.temperature]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.temperature] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.humidity]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.humidity]['count']) {
    storeData.soil_humidity = this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.humidity]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.humidity]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.soil_th_sensor_value.humidity] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.co_sensor_value.co]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.co_sensor_value.co]['count']) {
    storeData.co_ppm = this.smartGateData[smartGateSn][DeviceValueConfig.co_sensor_value.co]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.co_sensor_value.co]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.co_sensor_value.co] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.co2_sensor_value.co2]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.co2_sensor_value.co2]['count']) {
    storeData.co2_ppm = this.smartGateData[smartGateSn][DeviceValueConfig.co2_sensor_value.co2]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.co2_sensor_value.co2]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.co2_sensor_value.co2] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.illumination_sensor_value.lux]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.illumination_sensor_value.lux]['count']) {
    storeData.lux = this.smartGateData[smartGateSn][DeviceValueConfig.illumination_sensor_value.lux]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.illumination_sensor_value.lux]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.illumination_sensor_value.lux] = undefined;
  }

  if (undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.smoke_sensor_value.smoke]
    && undefined !== this.smartGateData[smartGateSn][DeviceValueConfig.smoke_sensor_value.smoke]['count']) {
    storeData.smoke = this.smartGateData[smartGateSn][DeviceValueConfig.smoke_sensor_value.smoke]['total'] /
      this.smartGateData[smartGateSn][DeviceValueConfig.smoke_sensor_value.smoke]['count'];
    this.smartGateData[smartGateSn][DeviceValueConfig.smoke_sensor_value.smoke] = undefined;
  }

  storeData.update_date = datetime.getUTCTimeFromTimeStamp(serverTime);

  if (needStore) {
    db.create(TableNames.SMARTGATE_DATA, storeData)
      .then(function (newRecord) {
      });
  }

  cacheDataSmartGate(self, storeData);
};

History.prototype.handleData1 = function () {
  var self = this;
  var updateDate = new Date();

  _.forEach(this.averageData, function (data) {
    var storeData = {};
    storeData.update_date = updateDate,
      storeData.scope = env.schedule_task_cycle.averageCycle.scope1;
    var tableName = '';
    var sn = data.sn;
    storeData.sn = sn;

    switch (data.deviceType) {
      case DeviceTypeConfig.humidity_temperature:
        storeData.device_type = DeviceTypeConfig.humidity_temperature;
        tableName = TableNames.AIR_TH_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['t_array2']) {
          self.averageData[sn]['t_array2'] = [];
        }

        if (0 === _.size(self.averageData[sn]['t_array1'])) {
          self.averageData[sn]['t_array1'] = [0];
        }

        var v1 = _.sum(self.averageData[sn]['t_array1']) / _.size(self.averageData[sn]['t_array1']);
        self.averageData[sn]['t_array2'].push(v1);
        self.averageData[sn]['t_array1'] = [];
        storeData.temperature = v1;

        if (undefined === self.averageData[sn]['h_array2']) {
          self.averageData[sn]['h_array2'] = [];
        }

        if (0 === _.size(self.averageData[sn]['h_array1'])) {
          self.averageData[sn]['h_array1'] = [0];
        }

        var v2 = _.sum(self.averageData[sn]['h_array1']) / _.size(self.averageData[sn]['h_array1'])
        self.averageData[sn]['h_array2'].push(v2);
        self.averageData[sn]['h_array1'] = [];
        storeData.humidity = v2;
        break;
      case DeviceTypeConfig.soil_th:
        storeData.device_type = DeviceTypeConfig.soil_th;
        tableName = TableNames.SOIL_TH_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['t_array2']) {
          self.averageData[sn]['t_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['t_array1'])) {
          self.averageData[sn]['t_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['t_array1']) / _.size(self.averageData[sn]['t_array1']);
        self.averageData[sn]['t_array2'].push(v1);
        self.averageData[sn]['t_array1'] = [];
        storeData.temperature = v1;
        if (undefined === self.averageData[sn]['h_array2']) {
          self.averageData[sn]['h_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['h_array1'])) {
          self.averageData[sn]['h_array1'] = [0];
        }
        var v2 = _.sum(self.averageData[sn]['h_array1']) / _.size(self.averageData[sn]['h_array1']);
        self.averageData[sn]['h_array2'].push(v2);
        self.averageData[sn]['h_array1'] = [];
        storeData.humidity = v2;
        break;
      case DeviceTypeConfig.co:
        storeData.device_type = DeviceTypeConfig.co;
        tableName = TableNames.CO_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['co_array2']) {
          self.averageData[sn]['co_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['co_array1'])) {
          self.averageData[sn]['co_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['co_array1']) / _.size(self.averageData[sn]['co_array1']);
        self.averageData[sn]['co_array2'].push(v1);
        self.averageData[sn]['co_array1'] = [];
        storeData.co_ppm = v1;
        break;
      case DeviceTypeConfig.co2:
        storeData.device_type = DeviceTypeConfig.co2;
        tableName = TableNames.CO2_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['co2_array2']) {
          self.averageData[sn]['co2_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['co2_array1'])) {
          self.averageData[sn]['co2_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['co2_array1']) / _.size(self.averageData[sn]['co2_array1']);
        self.averageData[sn]['co2_array2'].push(v1);
        self.averageData[sn]['co2_array1'] = [];
        storeData.co2_ppm = v1;
        break;
      case DeviceTypeConfig.illumination:
        storeData.device_type = DeviceTypeConfig.illumination;
        tableName = TableNames.LUX_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['lux_array2']) {
          self.averageData[sn]['lux_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['lux_array1'])) {
          self.averageData[sn]['lux_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['lux_array1']) / _.size(self.averageData[sn]['lux_array1']);
        self.averageData[sn]['lux_array2'].push(v1);
        self.averageData[sn]['lux_array1'] = [];
        storeData.lux = v1;
        break;
      case DeviceTypeConfig.smoke:
        storeData.device_type = DeviceTypeConfig.smoke;
        tableName = TableNames.SMOKE_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['smoke_array2']) {
          self.averageData[sn]['smoke_array2'] = [];
        }
        //prevent the null
        if (0 === _.size(self.averageData[sn]['smoke_array1'])) {
          self.averageData[sn]['smoke_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['smoke_array1']) / _.size(self.averageData[sn]['smoke_array1']);
        self.averageData[sn]['smoke_array2'].push(v1);
        self.averageData[sn]['smoke_array1'] = [];
        storeData.smoke = v1;
        break;
      case DeviceTypeConfig.smartgate:
        storeData.device_type = DeviceTypeConfig.smartgate;
        tableName = TableNames.SMARTGATE_AVERAGE_DATA;
        if (undefined === self.averageData[sn]['air_t_array2']) {
          self.averageData[sn]['air_t_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['air_t_array1'])) {
          self.averageData[sn]['air_t_array1'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['air_t_array1']) / _.size(self.averageData[sn]['air_t_array1']);
        self.averageData[sn]['air_t_array2'].push(v1);
        self.averageData[sn]['air_t_array1'] = [];
        storeData.air_temperature = v1;

        if (undefined === self.averageData[sn]['air_h_array2']) {
          self.averageData[sn]['air_h_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['air_h_array1'])) {
          self.averageData[sn]['air_h_array1'] = [0];
        }
        var v2 = _.sum(self.averageData[sn]['air_h_array1']) / _.size(self.averageData[sn]['air_h_array1']);
        self.averageData[sn]['air_h_array2'].push(v2);
        self.averageData[sn]['air_h_array1'] = [];
        storeData.air_humidity = v2;

        if (undefined === self.averageData[sn]['soil_t_array2']) {
          self.averageData[sn]['soil_t_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['soil_t_array1'])) {
          self.averageData[sn]['soil_t_array1'] = [0];
        }
        var v3 = _.sum(self.averageData[sn]['soil_t_array1']) / _.size(self.averageData[sn]['soil_t_array1']);
        self.averageData[sn]['soil_t_array2'].push(v3);
        self.averageData[sn]['soil_t_array1'] = [];
        storeData.soil_temperature = v3;

        if (undefined === self.averageData[sn]['soil_h_array2']) {
          self.averageData[sn]['soil_h_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['soil_h_array1'])) {
          self.averageData[sn]['soil_h_array1'] = [0];
        }
        var v4 = _.sum(self.averageData[sn]['soil_h_array1']) / _.size(self.averageData[sn]['soil_h_array1']);
        self.averageData[sn]['soil_h_array2'].push(v4);
        self.averageData[sn]['soil_h_array1'] = [];
        storeData.soil_humidity = v4;

        if (undefined === self.averageData[sn]['co_array2']) {
          self.averageData[sn]['co_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['co_t_array1'])) {
          self.averageData[sn]['co_array1'] = [0];
        }
        var v5 = _.sum(self.averageData[sn]['co_array1']) / _.size(self.averageData[sn]['co_array1']);
        self.averageData[sn]['co_array2'].push(v5);
        self.averageData[sn]['co_array1'] = [];
        storeData.co_ppm = v5;

        if (undefined === self.averageData[sn]['co2_array2']) {
          self.averageData[sn]['co2_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['co2_array1'])) {
          self.averageData[sn]['co2_array1'] = [0];
        }
        var v6 = _.sum(self.averageData[sn]['co2_array1']) / _.size(self.averageData[sn]['co2_array1']);
        self.averageData[sn]['co2_array2'].push(v6);
        self.averageData[sn]['co2_array1'] = [];
        storeData.co2_ppm = v6;

        if (undefined === self.averageData[sn]['lux_array2']) {
          self.averageData[sn]['lux_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['lux_array1'])) {
          self.averageData[sn]['lux_array1'] = [0];
        }
        var v7 = _.sum(self.averageData[sn]['lux_array1']) / _.size(self.averageData[sn]['lux_array1']);
        self.averageData[sn]['lux_array2'].push(v7);
        self.averageData[sn]['lux_array1'] = [];
        storeData.lux = v7;


        if (undefined === self.averageData[sn]['smoke_array2']) {
            self.averageData[sn]['smoke_array2'] = [];
        }
        if (0 === _.size(self.averageData[sn]['smoke_array1'])) {
            self.averageData[sn]['smoke_array1'] = [0];
        }
        var v8 = _.sum(self.averageData[sn]['smoke_array1']) / _.size(self.averageData[sn]['smoke_array1']);
        self.averageData[sn]['smoke_array2'].push(v8);
        self.averageData[sn]['smoke_array1'] = [];
        storeData.smoke = v8;
    }

    db.create(tableName, storeData)
      .then(function (newRecord) {
      })
  });
};

History.prototype.handleData2 = function () {
  var self = this;
  var updateDate = new Date();

  _.forEach(this.averageData, function (data) {

    var storeData = {};
    storeData.update_date = updateDate,
      storeData.scope = env.schedule_task_cycle.averageCycle.scope2;
    var tableName = '';
    var sn = data.sn;
    storeData.sn = sn;

    switch (data.deviceType) {
      case DeviceTypeConfig.humidity_temperature:
        storeData.device_type = DeviceTypeConfig.humidity_temperature;
        tableName = TableNames.AIR_TH_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['t_array2'])) {
          self.averageData[sn]['t_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['t_array2']) / _.size(self.averageData[sn]['t_array2']);
        self.averageData[sn]['t_array2'] = [];
        storeData.temperature = v1;

        if (0 === _.size(self.averageData[sn]['h_array2'])) {
          self.averageData[sn]['h_array2'] = [0];
        }
        var v2 = _.sum(self.averageData[sn]['h_array2']) / _.size(self.averageData[sn]['h_array2'])
        self.averageData[sn]['h_array2'] = [];
        storeData.humidity = v2;
        break;
      case DeviceTypeConfig.soil_th:
        storeData.device_type = DeviceTypeConfig.soil_th;
        tableName = TableNames.SOIL_TH_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['t_array2'])) {
          self.averageData[sn]['t_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['t_array2']) / _.size(self.averageData[sn]['t_array2']);
        self.averageData[sn]['t_array2'] = [];
        storeData.temperature = v1;

        if (0 === _.size(self.averageData[sn]['h_array2'])) {
          self.averageData[sn]['h_array2'] = [0];
        }
        var v2 = _.sum(self.averageData[sn]['h_array2']) / _.size(self.averageData[sn]['h_array2']);
        self.averageData[sn]['h_array2'] = [];
        storeData.humidity = v2;
        break;
      case DeviceTypeConfig.co:
        storeData.device_type = DeviceTypeConfig.co;
        tableName = TableNames.CO_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['co_array2'])) {
          self.averageData[sn]['co_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['co_array2']) / _.size(self.averageData[sn]['co_array2']);
        self.averageData[sn]['co_array2'] = [];
        storeData.co_ppm = v1;
        break;
      case DeviceTypeConfig.co2:
        storeData.device_type = DeviceTypeConfig.co2;
        tableName = TableNames.CO2_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['co2_array2'])) {
          self.averageData[sn]['co2_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['co2_array2']) / _.size(self.averageData[sn]['co2_array2']);
        self.averageData[sn]['co2_array2'] = [];
        storeData.co2_ppm = v1;
        break;
      case DeviceTypeConfig.illumination:
        storeData.device_type = DeviceTypeConfig.illumination;
        tableName = TableNames.LUX_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['lux_array2'])) {
          self.averageData[sn]['lux_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['lux_array2']) / _.size(self.averageData[sn]['lux_array2']);
        self.averageData[sn]['lux_array2'] = [];
        storeData.lux = v1;
        break;
      case DeviceTypeConfig.smoke:
        storeData.device_type = DeviceTypeConfig.smoke;
        tableName = TableNames.SMOKE_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['smoke_array2'])) {
          self.averageData[sn]['smoke_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['smoke_array2']) / _.size(self.averageData[sn]['smoke_array2']);
        self.averageData[sn]['smoke_array2'] = [];
        storeData.smoke = v1;
        break;
      case DeviceTypeConfig.smartgate:
        storeData.device_type = DeviceTypeConfig.smartgate;
        tableName = TableNames.SMARTGATE_AVERAGE_DATA;
        if (0 === _.size(self.averageData[sn]['air_t_array2'])) {
          self.averageData[sn]['air_t_array2'] = [0];
        }
        var v1 = _.sum(self.averageData[sn]['air_t_array2']) / _.size(self.averageData[sn]['air_t_array2']);
        self.averageData[sn]['air_t_array2'] = [];
        storeData.air_temperature = v1;

        if (0 === _.size(self.averageData[sn]['air_h_array2'])) {
          self.averageData[sn]['air_h_array2'] = [0];
        }
        var v2 = _.sum(self.averageData[sn]['air_h_array2']) / _.size(self.averageData[sn]['air_h_array2']);
        self.averageData[sn]['air_h_array2'] = [];
        storeData.air_humidity = v2;

        if (0 === _.size(self.averageData[sn]['soil_t_array2'])) {
          self.averageData[sn]['soil_t_array2'] = [0];
        }
        var v3 = _.sum(self.averageData[sn]['soil_t_array2']) / _.size(self.averageData[sn]['soil_t_array2']);
        self.averageData[sn]['soil_t_array2'] = [];
        storeData.soil_temperature = v3;

        if (0 === _.size(self.averageData[sn]['soil_h_array2'])) {
          self.averageData[sn]['soil_h_array2'] = [0];
        }
        var v4 = _.sum(self.averageData[sn]['soil_h_array2']) / _.size(self.averageData[sn]['soil_h_array2']);
        self.averageData[sn]['soil_h_array2'] = [];
        storeData.soil_humidity = v4;

        if (0 === _.size(self.averageData[sn]['co_array2'])) {
          self.averageData[sn]['co_array2'] = [0];
        }
        var v5 = _.sum(self.averageData[sn]['co_array2']) / _.size(self.averageData[sn]['co_array2']);
        self.averageData[sn]['co_array2'] = [];
        storeData.co_ppm = v5;

        if (0 === _.size(self.averageData[sn]['co2_array2'])) {
          self.averageData[sn]['co2_array2'] = [0];
        }
        var v6 = _.sum(self.averageData[sn]['co2_array2']) / _.size(self.averageData[sn]['co2_array2']);
        self.averageData[sn]['co2_array2'] = [];
        storeData.co2_ppm = v6;

        if (0 === _.size(self.averageData[sn]['lux_array2'])) {
          self.averageData[sn]['lux_array2'] = [0];
        }
        var v7 = _.sum(self.averageData[sn]['lux_array2']) / _.size(self.averageData[sn]['lux_array2']);
        self.averageData[sn]['lux_array2'] = [];
        storeData.lux = v7;

        if (0 === _.size(self.averageData[sn]['smoke_array2'])) {
            self.averageData[sn]['smoke_array2'] = [0];
        }
        var v8 = _.sum(self.averageData[sn]['smoke_array2']) / _.size(self.averageData[sn]['smoke_array2']);
        self.averageData[sn]['smoke_array2'] = [];
        storeData.lux = v8;
    }

    db.create(tableName, storeData)
      .then(function (newRecord) {
      })
  });
};

function storeData(self, data) {
  var storeData = {};
  storeData.sn = data.sn,
    storeData.device_type = data.deviceType,
    storeData.update_date = datetime.getUTCTimeFromTimeStamp(data.serverTime);

  var tableName = '';
  switch (data.deviceType) {
    case DeviceTypeConfig.humidity_temperature:
      tableName = TableNames.AIR_TH_DATA;
      storeData.temperature = data.lastValue[DeviceValueConfig.air_th_sensor_value.temperature];
      storeData.humidity = data.lastValue[DeviceValueConfig.air_th_sensor_value.humidity];
      break;
    case DeviceTypeConfig.soil_th:
      tableName = TableNames.SOIL_TH_DATA;
      storeData.temperature = data.lastValue[DeviceValueConfig.soil_th_sensor_value.temperature];
      storeData.humidity = data.lastValue[DeviceValueConfig.soil_th_sensor_value.humidity];
      break;
    case DeviceTypeConfig.co:
      tableName = TableNames.CO_DATA;
      storeData.co_ppm = data.lastValue[DeviceValueConfig.co_sensor_value.co];
      break;
    case DeviceTypeConfig.co2:
      tableName = TableNames.CO2_DATA;
      storeData.co2_ppm = data.lastValue[DeviceValueConfig.co2_sensor_value.co2];
      break;
    case DeviceTypeConfig.illumination:
      tableName = TableNames.LUX_DATA;
      storeData.lux = data.lastValue[DeviceValueConfig.illumination_sensor_value.lux];
      break;
    case DeviceTypeConfig.smoke:
      tableName = TableNames.SMOKE_DATA;
      storeData.smoke = data.lastValue[DeviceValueConfig.smoke_sensor_value.smoke];
      break;
  }

  db.create(tableName, storeData)
    .then(function (newRecord) {
    });

  cacheData(self, data);
};

function isValid(deviceType) {
  return _.includes(historyGlobal.sensorTypeList, deviceType);
};

function validListInit(sensorTypeList) {
  sensorTypeList.push(DeviceTypeConfig.humidity_temperature);
  sensorTypeList.push(DeviceTypeConfig.soil_th);
  sensorTypeList.push(DeviceTypeConfig.smoke);
  sensorTypeList.push(DeviceTypeConfig.illumination);
  sensorTypeList.push(DeviceTypeConfig.co);
  sensorTypeList.push(DeviceTypeConfig.co2);
};

function cacheDataSmartGate(self, data) {
  var sn = data.sn,
    deviceType = DeviceTypeConfig.smartgate;

  if (undefined === self.averageData[sn]) {
    self.averageData[sn] = {};
  }

  self.averageData[sn].deviceType = deviceType,
    self.averageData[sn].sn = sn;

  if (undefined === self.averageData[sn]['air_t_array1']) {
    self.averageData[sn]['air_t_array1'] = [];
  }
  self.averageData[sn]['air_t_array1'].push(data.air_temperature);
  if (undefined === self.averageData[sn]['air_h_array1']) {
    self.averageData[sn]['air_h_array1'] = [];
  }
  self.averageData[sn]['air_h_array1'].push(data.air_humidity);

  if (undefined === self.averageData[sn]['soil_t_array1']) {
    self.averageData[sn]['soil_t_array1'] = [];
  }
  self.averageData[sn]['soil_t_array1'].push(data.soil_temperature);
  if (undefined === self.averageData[sn]['soil_h_array1']) {
    self.averageData[sn]['soil_h_array1'] = [];
  }
  self.averageData[sn]['soil_h_array1'].push(data.soil_humidity);

  if (undefined === self.averageData[sn]['co_array1']) {
    self.averageData[sn]['co_array1'] = [];
  }
  self.averageData[sn]['co_array1'].push(data.co_ppm);

  if (undefined === self.averageData[sn]['co2_array1']) {
    self.averageData[sn]['co2_array1'] = [];
  }
  self.averageData[sn]['co2_array1'].push(data.co2_ppm);

  if (undefined === self.averageData[sn]['lux_array1']) {
    self.averageData[sn]['lux_array1'] = [];
  }
  self.averageData[sn]['lux_array1'].push(data.lux);

  if (undefined === self.averageData[sn]['smoke_array1']) {
    self.averageData[sn]['smoke_array1'] = [];
  }
  self.averageData[sn]['smoke_array1'].push(data.smoke);
};

function updateTime(self, smartGateSn, updateTime) {
  if (undefined === self.storeTime[smartGateSn]) {
    self.storeTime[smartGateSn] = {};
  }
  self.storeTime[smartGateSn].storeTime = updateTime;
};

function handleDevice(self, data) {
  if (undefined === self.smartGateData[data.owner]) {
    self.smartGateData[data.owner] = {};
  }

  switch (data.deviceType) {
    case DeviceTypeConfig.humidity_temperature:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature]) {
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature] = {};
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature]['total'] += data.lastValue[DeviceValueConfig.air_th_sensor_value.temperature];
      self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.temperature]['count'] += 1;
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity]) {
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity] = {};
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity]['total'] += data.lastValue[DeviceValueConfig.air_th_sensor_value.humidity];
      self.smartGateData[data.owner][DeviceValueConfig.air_th_sensor_value.humidity]['count'] += 1;
      break;
    case DeviceTypeConfig.soil_th:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature]) {
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature] = {};
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature]['total'] += data.lastValue[DeviceValueConfig.soil_th_sensor_value.temperature];
      self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.temperature]['count'] += 1;
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity]) {
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity] = {};
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity]['total'] += data.lastValue[DeviceValueConfig.soil_th_sensor_value.humidity];
      self.smartGateData[data.owner][DeviceValueConfig.soil_th_sensor_value.humidity]['count'] += 1;
      break;
    case DeviceTypeConfig.co:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co]) {
        self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co] = {};
        self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co]['total'] += data.lastValue[DeviceValueConfig.co_sensor_value.co];
      self.smartGateData[data.owner][DeviceValueConfig.co_sensor_value.co]['count'] += 1;
      break;
    case DeviceTypeConfig.co2:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2]) {
        self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2] = {};
        self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2]['total'] += data.lastValue[DeviceValueConfig.co2_sensor_value.co2];
      self.smartGateData[data.owner][DeviceValueConfig.co2_sensor_value.co2]['count'] += 1;
      break;
    case DeviceTypeConfig.illumination:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux]) {
        self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux] = {};
        self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux]['total'] += data.lastValue[DeviceValueConfig.illumination_sensor_value.lux];
      self.smartGateData[data.owner][DeviceValueConfig.illumination_sensor_value.lux]['count'] += 1;
      break;
    case DeviceTypeConfig.smoke:
      if (undefined === self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke]) {
        self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke] = {};
        self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke]['total'] = 0;
        self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke]['count'] = 0;
      }
      self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke]['total'] += data.lastValue[DeviceValueConfig.smoke_sensor_value.smoke];
      self.smartGateData[data.owner][DeviceValueConfig.smoke_sensor_value.smoke]['count'] += 1;
      break;
  }

};

function cacheData(self, data) {
  var sn = data.sn,
    deviceType = data.deviceType;
  if (undefined === self.averageData[sn]) {
    self.averageData[sn] = {};
  }
  self.averageData[sn].deviceType = deviceType,
    self.averageData[sn].sn = sn;

  switch (deviceType) {
    case DeviceTypeConfig.humidity_temperature:
      if (undefined === self.averageData[sn]['t_array1']) {
        self.averageData[sn]['t_array1'] = [];
      }
      self.averageData[sn]['t_array1'].push(data.lastValue[DeviceValueConfig.air_th_sensor_value.temperature]);
      if (undefined === self.averageData[sn]['h_array1']) {
        self.averageData[sn]['h_array1'] = [];
      }
      self.averageData[sn]['h_array1'].push(data.lastValue[DeviceValueConfig.air_th_sensor_value.humidity]);
      break;
    case DeviceTypeConfig.soil_th:
      if (undefined === self.averageData[sn]['t_array1']) {
        self.averageData[sn]['t_array1'] = [];
      }
      self.averageData[sn]['t_array1'].push(data.lastValue[DeviceValueConfig.soil_th_sensor_value.temperature]);
      if (undefined === self.averageData[sn]['h_array1']) {
        self.averageData[sn]['h_array1'] = [];
      }
      self.averageData[sn]['h_array1'].push(data.lastValue[DeviceValueConfig.soil_th_sensor_value.humidity]);
      break;
    case DeviceTypeConfig.co:
      if (undefined === self.averageData[sn]['co_array1']) {
        self.averageData[sn]['co_array1'] = [];
      }
      self.averageData[sn]['co_array1'].push(data.lastValue[DeviceValueConfig.co_sensor_value.co]);
      break;
    case DeviceTypeConfig.co2:
      if (undefined === self.averageData[sn]['co2_array1']) {
        self.averageData[sn]['co2_array1'] = [];
      }
      self.averageData[sn]['co2_array1'].push(data.lastValue[DeviceValueConfig.co2_sensor_value.co2]);
      break;
    case DeviceTypeConfig.illumination:
      if (undefined === self.averageData[sn]['lux_array1']) {
        self.averageData[sn]['lux_array1'] = [];
      }
      self.averageData[sn]['lux_array1'].push(data.lastValue[DeviceValueConfig.illumination_sensor_value.lux]);
      break;
    case DeviceTypeConfig.smoke:
      if (undefined === self.averageData[sn]['smoke_array1']) {
        self.averageData[sn]['smoke_array1'] = [];
      }
      self.averageData[sn]['smoke_array1'].push(data.lastValue[DeviceValueConfig.smoke_sensor_value.smoke]);
      break;
  }
};

function isOver(lastData, currentData) {
  var isExceed = false;
  switch (currentData.deviceType) {
    case DeviceTypeConfig.humidity_temperature:
      var tDiff = Math.abs(lastData.lastValue[DeviceValueConfig.air_th_sensor_value.temperature] - currentData.lastValue[DeviceValueConfig.air_th_sensor_value.temperature]),
        hDiff = Math.abs(lastData.lastValue[DeviceValueConfig.air_th_sensor_value.humidity] - currentData.lastValue[DeviceValueConfig.air_th_sensor_value.humidity]);
      if (tDiff >= env.monitoring_value_float_threshold.air_th_sensor_t || hDiff >= env.monitoring_value_float_threshold.air_th_sensor_h)
        isExceed = true;
      break;
    case DeviceTypeConfig.soil_th:
      var tDiff = Math.abs(lastData.lastValue[DeviceValueConfig.soil_th_sensor_value.temperature] - currentData.lastValue[DeviceValueConfig.soil_th_sensor_value.temperature]),
        hDiff = Math.abs(lastData.lastValue[DeviceValueConfig.soil_th_sensor_value.humidity] - currentData.lastValue[DeviceValueConfig.soil_th_sensor_value.humidity]);
      if (tDiff >= env.monitoring_value_float_threshold.soil_th_sensor_t || hDiff >= env.monitoring_value_float_threshold.soil_th_sensor_h)
        isExceed = true;
      break;
    case DeviceTypeConfig.co:
      var diff = Math.abs(lastData.lastValue[DeviceValueConfig.co_sensor_value.co] - currentData.lastValue[DeviceValueConfig.co_sensor_value.co]);
      if (diff >= env.monitoring_value_float_threshold.co_sensor_ppm)
        isExceed = true;
      break;
    case DeviceTypeConfig.co2:
      var diff = Math.abs(lastData.lastValue[DeviceValueConfig.co2_sensor_value.co2] - currentData.lastValue[DeviceValueConfig.co2_sensor_value.co2]);
      if (diff >= env.monitoring_value_float_threshold.co2_sensor_ppm)
        isExceed = true;
      break;
    case DeviceTypeConfig.illumination:
      var diff = Math.abs(lastData.lastValue[DeviceValueConfig.illumination_sensor_value.lux] - currentData.lastValue[DeviceValueConfig.illumination_sensor_value.lux]);
      if (diff >= env.monitoring_value_float_threshold.illumination_sensor_lux)
        isExceed = true;
      break;
    case DeviceTypeConfig.smoke:
      var diff = Math.abs(lastData.lastValue[DeviceValueConfig.smoke_sensor_value.smoke] - currentData.lastValue[DeviceValueConfig.smoke_sensor_value.smoke]);
      if (diff >= env.monitoring_value_float_threshold.smoke_sensor_ppm)
        isExceed = true;
      break;
  }
  return isExceed;
};