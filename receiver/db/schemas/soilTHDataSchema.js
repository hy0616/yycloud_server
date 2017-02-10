var connection = require('./connection');

module.exports = {
  identity: 'soil_th_data',
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

    temperature: {
      type: 'float'
    },

    humidity: {
      type: 'float'
    },

    update_date: {
      type: 'date'
    }
  }
}
