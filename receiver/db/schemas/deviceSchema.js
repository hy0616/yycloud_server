var connection = require('./connection');

module.exports = {
  identity: 'device',
  connection: connection,

  attributes: {
    sn: {
      type: 'string',
      required: true,
      primaryKey: true,
      index: true
    },
    owner: {
      model: 'smartgate'
    },
    dev_name: {
      type: 'string'
    },
    dev_alias: {
      type: 'string'
    },
    dev_type: {
      type: 'string'
    },
    dev_extend_type: {
      type: 'string'
    },
    user: {
      type: 'string'
    },
    password: {
      type: 'string'
    }
  }
}