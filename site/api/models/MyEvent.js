/**
 * MyEvent.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var uuid = require('node-uuid');

module.exports = {

  tableName: 'my_event',

  attributes: {
    event_id: {
      type: 'string',
      primaryKey: true,
      index: true,
      defaultsTo: function () {
        return uuid.v4();
      }
    },

    event_name: {
      type: 'string'
    },

    event_type: {
      type: 'string'
    },

    event_level: {
      type: 'string'
    },

    event_date: {
      type: 'date'
    },

    user_name: {
      type: 'string'
    },

    smartgate_sn: {
      type: 'string'
    },

    smartgate_name: {
      type: 'string'
    },

    device_sn: {
      type: 'string'
    },

    event_state: {
      type: 'string'
    },

    detail: {
      type: 'text'
    },

    toJSON: function () {
      var obj = this.toObject();

      delete obj.createAt;
      delete obj.updateAt;
      delete obj.id;

      return obj;
    }
  },

  getUserEvent: function (username, beginDate, endDate, paginate) {
    if ('' === beginDate && '' === endDate) {
      return MyEvent.find()
        .where({user_name: username})
        .paginate(paginate)
        .then(function (events) {
          return events;
        });
    } else {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .paginate(paginate)
        .then(function (events) {
          return events;
        });
    }

  },
//2017.01.13修改，查询未读事件依然走mongo
  getUserUnReadEvent: function (username, beginDate, endDate, paginate) {
      if ( '' === beginDate || '' === endDate || undefined === beginDate  ||  undefined === endDate) {
          return MyEvent.find()
              .where({user_name: username})
              .where({event_state: 'unread'})
              .sort({event_date: -1})
              .paginate(paginate)
              .then(function (events) {
                  sails.log.debug("----------> getUserUnReadEvent: ",events);
                  return events;
              });
      } else {
          return MyEvent.find()
              .where({user_name: username})
              .where({event_state: 'unread'})
              .where({event_date: {'>=': beginDate, '<=': endDate}})
              .paginate(paginate)
              .then(function (events) {
                  return events;
              });
      }
  },
  getUserReadEvent: function (username, beginDate, endDate, paginate) {
    if ('' === beginDate || '' === endDate || undefined === beginDate  ||  undefined === endDate) {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'read'})
        .sort({event_date: -1})
        .paginate(paginate)
        .then(function (events) {
            sails.log.debug("----------> getUserReadEvent: ",events);
          return events;
        });
    } else {
      return MyEvent.find()
        .where({user_name: username})
        .where({event_state: 'read'})
        .where({event_date: {'>=': beginDate, '<=': endDate}})
        .paginate(paginate)
        .then(function (events) {
          return events;
        });
    }
  }
};

