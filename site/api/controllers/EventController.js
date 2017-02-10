/**
 * EventController
 *
 * @description :: Server-side logic for managing Events
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  getUserEvent: function (req, res) {
    var limit = ParamService.getPageLimit(req),
      page = ParamService.getPageNum(req),
      paginate = {page: page, limit: limit};

    var readState = req.param('read_state'),
      beginDate = req.param('begin_date'),
      endDate = req.param('end_date');
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === readState || null === beginDate || null === endDate) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          if ('read' === readState) {
            MyEvent.getUserReadEvent(username, beginDate, endDate, paginate)
              .then(function (models) {
                EventService.parseEvents(models)
                  .then(function (events) {
                    res.json(200, events);
                  })
              });
          } else if ('unread' === readState) {
              MyEvent.getUserUnReadEvent(username, beginDate, endDate, paginate)
                  .then(function (models) {
                      EventService.parseEvents(models)
                          .then(function (events) {
                              res.json(200, events);
                          })
                  });

              //2017.01.13修改，查询未读事件依然走mongo
            /*RedisService.getUserEvent(username)
              .then(function (events) {
                EventService.parseEvents(events)
                  .then(function (events) {
                    res.json(200, events);
                  })
              });*/
          } else if ('all' === readState) {
            MyEvent.getUserEvent(username, beginDate, endDate, paginate)
              .then(function (models) {
                EventService.parseEvents(models)
                  .then(function (events) {
                    res.json(200, events);
                  })
              });
          }
        }
      });
  },

  setEventRead: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var eventIdStr = req.body.event_id_arr;
          if (undefined !== eventIdStr && null !== eventIdStr) {
            EventService.setEventRead(username, eventIdStr)
              .then(function (result) {
                res.json(200, result);
              })
          } else {
            var result = {
              result: 'Failed',
              msg: 'event_id list is required.'
            }
            res.json(200, result);
          }
        }
      });
  }
};

