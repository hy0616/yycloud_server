var DeviceTypeConfig = require('./device_type_config');

module.exports = {
  env: 'develop',

  connection: {
    //rs
    //production: 'localMongo',
    //develop: 'localMongoDev',

    //yy
    production: 'yyMongo',
    develop: 'yyMongoDev',
  },

  schedule_task_cycle: {
    smartgateCheckCycle: 10,
    smartGateOfflineTimeStamp: 20,

    eventListTraversalCycle: 3,

    averageCycle: {
      scope1: 'scope1',
      scope2: 'scope2'
    }

  },

  store_timespan: 5 * 60,
  store_timespan_new: 3 * 60,

  data_cache_timespan: 24 * 60 * 60,

  monitoring_value_float_threshold: {
    'air_th_sensor_t': 0.5,
    'air_th_sensor_h': 0.5,
    'soil_th_sensor_t': 0.5,
    'soil_th_sensor_h': 0.5,
    'co_sensor_ppm': 0.5,
    'co2_sensor_ppm': 0.5,
    'illumination_sensor_lux': 1.0,
    'smoke_sensor_ppm': 100.0
  }
};
