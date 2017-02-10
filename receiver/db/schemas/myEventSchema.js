var connection = require('./connection');
var uuid = require('node-uuid');

module.exports = {
  identity: 'my_event',
  connection: connection,

  attributes: {
    event_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    sn: {
      type: 'string'
    },

    event_name: {
      type: 'string'
    },

    event_type: {
      type: 'string'
    },

    event_level: {
      type: 'string'
    },

    event_date: {
      type: 'date'
    },

    user_name: {
      type: 'string'
    },

    smartgate_sn: {
      type: 'string'
    },

    smartgate_name: {
      type: 'string'
    },

    device_sn: {
      type: 'string'
    },

    event_state: {
      type: 'string'
    },

    detail: {
      type: 'text'
    }

  }
}
