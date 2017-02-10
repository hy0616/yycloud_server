var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {

  addCustomAlarmStrategy: function (newStrategy) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'add_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy: newStrategy
      }

      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  },

  updateCustomAlarmStrategy: function (newStrategy) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'update_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy: newStrategy
      }

      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  deleteCustomAlarmStrategy: function (strategyId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'delete_custom_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        strategy_id: strategyId
      }

      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  getShedAlarmStrategy: function (shedId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'get_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: shedId
      }

      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  assignShedAlarmStrategy: function (metaData) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'assign_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: metaData.shed_id,
        strategy_type: metaData.strategy_type,
        strategy_id: metaData.strategy_id,
        username:metaData.username,
        strategy: metaData.strategy
      }

      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  },

  deleteShedAlarmStrategy: function (shedId) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'delete_shed_alarm_strategy',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        shed_id: shedId
      }

      HttpClient.createHttpClient(req_data).then(function (values) {
        resolve(values);
      });
    });
  }
}