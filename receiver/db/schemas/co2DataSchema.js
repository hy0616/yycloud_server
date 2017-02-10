var connection = require('./connection');

module.exports = {
  identity: 'co2_data',
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

    //server time
    update_date: {
      type: 'date'
    }
  }
}