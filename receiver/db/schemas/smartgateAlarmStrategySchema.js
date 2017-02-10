var connection = require('./connection');

module.exports = {
  identity: 'smartgate_alarm_strategy',
  connection: connection,

  attributes: {
    smartgate_sn: {
      type: 'string',
      index: true
    },

    strategy_type: {
      type: 'string',
      enum: ['default', 'customer', 'temp']
    },

    strategy_id:{
      type:'string'
    }
  }
}