var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  create: function (model, record) {
    return new Promise(function (resolve, reject) {
      model.create(record, function (err, record) {
        if (err) reject(err);
        resolve(record);
      });
    });
  },

  update: function (model, data, criteria) {
    return new Promise(function (resolve, reject) {
      model.update(criteria, data)
        .then(function (record) {
          if (record.length == 0) {
            model.create(data)
              .then(function (record) {
                resolve(record);
              });
          } else {
            resolve(record[0]);
          }
        })
        .fail(function (err) {
          reject(err);
        })
        .catch(function (e) {
          cmlog.error('when update, error happen: ' + e.stack);
          reject(e);
        });
    });
  },

  destroy: function (model, criteria) {
    return new Promise(function (resolve, reject) {
      model.destroy(criteria)
        .then(function (record) {
          resolve(record);
        })
    })
  },

  updateOnline: function (model, devUUID, online) {
    return new Promise(function (resolve, reject) {
      model.update({dev_uuid: devUUID}, {online: online})
        .then(function (record) {
          if (record.length > 0 && record[0] != undefined)
            resolve(record[0]);
          else
            reject('record error');
        })
        .catch(function (e) {
          cmlog.error('update online info, err happen:' + e.stack);
        });
    });
  },

  findOne: function (model, criteria) {
    return new Promise(function (resolve, reject) {
      model.findOne(criteria)
        .then(function (record) {
          resolve(record);
        })
        .catch(function (e) {
          cmlog.error('can not find coresponding when findOne, err is:' + e.stack);
          reject(e);
        });
    });
  },

  getOne: function (model, devType, devUUID) {
    return new Promise(function (resolve) {
      model.findOne({dev_uuid: devType + '-' + devUUID})
        .then(function (record) {
          resolve(_.assign({}, record));
        })
        .catch(function (e) {
          cmlog.error('can not find coresponding when getOne, using devtype and dev_uuid, err is:' + e.stack);
          reject(e);
        });
    });
  },

  getCount: function (model) {
    return new Promise(function (resolve) {
      model.count(function (err, num) {
        if (err)
          resolve(0);
        else
          resolve(num);
      });
    });
  },

  getPageRecords: function (model, pageIndex, listCount) {
    return new Promise(function (resolve) {
      model.find()
        .paginate({page: pageIndex, limit: listCount})
        .then(function (records) {
          resolve(records);
        });
    });
  },

  find: function (model, criteria) {
    return new Promise(function (resolve, reject) {
      model.find(criteria)
        .then(function (records) {
          resolve(records);
        })
        .catch(function (e) {
          cmlog.error('can not find coresponding when find, err is: ' + e.stack);
          reject(e);
        });
    });
  },

  populate: function (model, attribute, criteria) {
    return new Promise(function (resolve, reject) {
      model.find()
        .populate(attribute, criteria)
        .then(function (records) {
          resolve(records);
        }).catch(function (e) {
          cmlog.error('can not find coresponding when populate, err is: ' + e.stack);
          reject(e);
        });
    });
  },
};
