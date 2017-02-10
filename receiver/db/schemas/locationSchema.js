var connection = require('./connection');

module.exports = {
  identity: 'location',
  connection: connection,

  attributes: {
    address: {
      type: 'string',
    }, 

    country: {
      type: 'string',
    },

    province: {
      type: 'string',
    },

    city: {
      type: 'string',
    },

    city_code: {
      type: 'int',
    },

    district: {
      type: 'string',
    },

    street: {
      type: 'string',
    },

    street_number: {
      type: 'string'
    },

    lat: {
      type: 'float',
      required: true
    },

    lng: {
      type: 'float',
      required: true
    },
/*
    devcurdatas: {
      collection: 'devcurdata',
      via: "location"
    },
*/

    devcurdata: {
      model: 'location'
    }

  }
};

