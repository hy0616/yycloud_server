var connection = require('./connection');

module.exports = {
  identity: 'co2_average_data',
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

    co2_ppm: {
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