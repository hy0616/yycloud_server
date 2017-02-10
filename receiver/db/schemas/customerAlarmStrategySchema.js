var connection = require('./connection');
var uuid = require('node-uuid');

module.exports = {
  identity: 'customer_alarm_strategy',
  connection: connection,

  attributes: {
    strategy_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    strategy_name: {
      type: 'string'
    },

    username: {
      type: 'string'
    },

    charge_config: {
      type: 'json'
    },

    air_temperature_config: {
      type: 'json'
    },

    air_humidity_config: {
      type: 'json'
    },

    co_ppm_config: {
      type: 'json'
    },

    co2_ppm_config: {
      type: 'json'
    },

    soil_temperature_config: {
      type: 'json',
    },

    soil_humidity_config: {
      type: 'json'
    },

    soil_moisture_config: {
      type: 'json'
    },

    lux_config: {
      type: 'json'
    },

    rain_config: {
      type: 'json'
    },

    windvelocity_config: {
      type: 'json'
    },

    pm2_5_ppm_config:{
      type:'json'
    },

    smoke_ppm_config:{
      type:'json'
    }
  }
}