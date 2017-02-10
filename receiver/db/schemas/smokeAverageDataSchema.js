var connection = require('./connection');

module.exports = {
  identity: 'smoke_average_data',
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

    smoke: {
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