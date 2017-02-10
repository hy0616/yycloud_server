var connection = require('./connection'),
  uuid = require('node-uuid');

module.exports = {
  identity: 'owner_visitor',
  connection: connection,

  attributes: {

    owner: {
      type: 'string',
      required: true
    },
    visitor: {
      type: 'string',
      required: true
    }
  }
};