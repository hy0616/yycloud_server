var connection = require('./connection');

module.exports = {
  identity:'role',
  connection:connection,

  attributes:{
    name: {
      type: 'string',
      primaryKey: true,
      index: true,
      required: true
    },

    members: {
      collection: 'user',
      via: "role"
    }
  }
}