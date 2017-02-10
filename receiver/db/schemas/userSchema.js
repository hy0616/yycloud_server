var connection = require('./connection');

module.exports = {
  identity: 'user',
  connection: connection,

  attributes: {
    username: {
      type: 'string',
      unique: true,
      primaryKey: true,
      index:true
    },

    nickname: {
      type: 'string'
    },

    sessionToken: {
      type: 'string'
    },

    email: {
      type: 'string',
      unique: true
    },

    emailVerified: {
      type: 'boolean',
      defaultsTo: false
    },

    emailVerifyToken: {
      type: 'string'
    },

    mobilePhoneNumber: {
      type: 'string',
      unique: true
    },

    mobilePhoneVerified: {
      type: 'boolean',
      defaultsTo: false
    },

    role: {
      model: 'role'
    },

    password: {
      type: "string"
    },

    resetPasswordToken: {
      type: 'string'
    },

    smartgates: {
      collection: 'smartgate',
      via: 'owner'
    },

    contacts: {
      collection: 'contact',
      via: 'owner'
    },

    weixin_open_id: {
      type: 'string',
      unique: true
    },

    qq_open_id: {
      type: 'string',
      unique: true
    },

    sina_open_id: {
      type: 'string',
      unique: true
    }
  }
}