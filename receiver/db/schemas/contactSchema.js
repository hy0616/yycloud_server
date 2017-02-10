var connection = require('./connection');

module.exports = {
  identity: 'contact',
  connection: connection,

  attributes: {
    name: {
      type: 'string',
      index:true
    },

    phone: {
      type: 'string',
      unique: true
    },

    owner: {
      model: 'user'
    }
  }
}