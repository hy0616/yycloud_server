var connection = require('./connection');

module.exports = {
  identity: 'smartgate',
  connection: connection,

  attributes: {
    sn: {
      type: 'string',
      required: true,
      primaryKey: true,
      index: true
    },
    dev_name: {
      type: 'string'
    },
    dev_alias: {
      type: 'string'
    },
    dev_location: {
      type: 'string'
    },
    lat: {
      type: 'float'
    },
    lng: {
      type: 'float'
    },
    contact_name: {
      type: 'string'
    },
    contact_number: {
      type: 'string'
    },
    area: {
      type: 'float'
    },
    plant_name: {
      type: 'string'
    },
    expectation: {
      type: 'float'
    },
    plant_time:{
      type: 'integer'
    },
    harvest_time: {
      type: 'integer'
    },
    harvest_weight: {
      type: 'float'
    },
    owner: {
      model: 'user'
    },
    devices: {
      collection: 'device',
      via: 'owner'
    },

    geogroup: {
      model: 'geogroup'
    },

    version:{
      type:'string'
    }
  }
}