/**
 * Device.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

Promise = require('bluebird');

module.exports = {

  tableName: 'device',

  attributes: {
    sn: {
      type: 'string',
      required: true,
      primaryKey: true,
      index: true
    },
    // smartgate which owns the device
    owner: {
      model: 'smartgate'
    },
    dev_name: {
      type: 'string'
    },
    dev_type: {
      type: 'string'
    },
    user: {
      type: 'string'
    },
    password: {
      type: 'string'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.updatedAt;
      delete obj.createdAt;

      return obj;
    }
  },

  getOwner: function (deviceSn) {
    return new Promise(function (resolve, reject) {
      Device.findOne()
        .where({sn: deviceSn})
        .then(function (model) {
          if (null === model || undefined === model)
            resolve(undefined);
          else
            resolve(model['owner']);
        })
    })
  }

};

