/**
 * AlarmStrategyController
 *
 * @description :: Server-side logic for managing Alarmstrategies
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  getDefaultAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          DefaultAlarmStrategy.getAll()
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  getCustomAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          CustomerAlarmStrategy.getCustomAlarmStrategy(username)
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  addCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);

          var newStrategy = JSON.parse(obj);
          newStrategy = _.omit(newStrategy, 'strategy_id');
          newStrategy.username = username;
          AlarmStrategyService.addCustomAlarmStrategy(newStrategy)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  updateCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E503.code, sails.config.errorcode.E503.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);
          var newStrategy = JSON.parse(obj);
          newStrategy.username = username;
          AlarmStrategyService.updateCustomAlarmStrategy(newStrategy)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  deleteCustomAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E503.code, sails.config.errorcode.E503.detail);
        } else {
          var strategyId = req.params['id'];
          AlarmStrategyService.deleteCustomAlarmStrategy(strategyId)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  getTempAlarmStrategies: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          TempAlarmStrategy.getTempAlarmStrategy(username)
            .then(function (models) {
              res.json(models);
            });
        }
      });
  },

  getShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var shedId = req.params['shedId'];

          AlarmStrategyService.getShedAlarmStrategy(shedId)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  assignShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var obj = parseToString(req.body.alarm_strategy);
          var metaData = {
            shed_id: req.params['shedId'],
            strategy_type: req.body.strategy_type,
            strategy_id: req.body.strategy_id,
            username: username,
            strategy: obj === undefined ? undefined : JSON.parse(obj)
          };

          AlarmStrategyService.assignShedAlarmStrategy(metaData)
            .then(function (result) {
              res.json('200', {'result': result});
            });
        }
      });
  },

  deleteShedAlarmStrategy: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['shedId']) {
          res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
        } else {
          var shedId = req.params['shedId'];

          AlarmStrategyService.deleteShedAlarmStrategy(shedId)
            .then(function (result) {
              res.json('200', {'result': result});
            });
        }
      });
  }

};

function parseToString(oldValue){
  var returnValue;
  if(typeof(oldValue) === 'object'){
    returnValue = JSON.stringify(oldValue);
  }else{
    returnValue = oldValue;
  }
  return returnValue;
}

