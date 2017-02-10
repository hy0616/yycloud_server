var connection = require('./connection');

module.exports = {
  identity: 'smartgate_average_data',
  connection: connection,

  attributes: {
    sn: {
      type: 'string',
      required: true,
      index: true
    },

    device_type: {
      type: 'string'
    },

    air_temperature: {
      type: 'float'
    },

    air_humidity: {
      type: 'float'
    },

    soil_temperature: {
      type: 'float'
    },

    soil_humidity: {
      type: 'float'
    },

    co_ppm: {
      type: 'float'
    },

    co2_ppm: {
      type: 'float'
    },

    lux: {
      type: 'float'
    },

    scope: {
      type: 'string'
    },

    update_date: {
      type: 'date'
    }
  }
}