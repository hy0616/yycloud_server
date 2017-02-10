/**
 * SmartGate.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

  tableName: 'smartgate',

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
    plant_time: {
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

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  },

  findInfo: function (smartGateSn) {
    return SmartGate.find()
      .where({sn: smartGateSn})
      .then(function (record) {
        return record;
      })
  },

  findWithDevice: function (smartGateSn) {
    return SmartGate.findOne()
      .where({sn: smartGateSn})
      .populate('devices')
      .then(function (record) {
        return record;
      })
  },

  findAllSns: function () {
    return SmartGate.find()
      .then(function (record) {
        return record;
      })
  }
};

