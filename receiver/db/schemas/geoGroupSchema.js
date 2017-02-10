var connection = require('./connection'),
  uuid = require('node-uuid');

module.exports = {
  identity: 'geogroup',
  connection: connection,

  attributes: {

    geogroup_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    country: {
      type: 'string'
    },

    province: {
      type: 'string'
    },

    city: {
      type: 'string'
    },

    district: {
      type: 'string'
    },

    lat:{
      type:'float'
    },

    lng:{
      type:'float'
    },

    smartgates: {
      collection: 'smartgate',
      via: 'geogroup'
    }
  }
};