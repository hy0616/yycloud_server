var Promise = require('bluebird');
var datetime = require('./datetime');
var http = require('http');

module.exports = {
  updateAlias: function (smartGateSn, alias) {
    return new Promise(function (resolve, reject) {
      var req_data = {};
      req_data.meta = {
        type: 'update_smartgate_alias',
        time: datetime.getLocalString(),
        version: ''
      };
      req_data.data = {
        alias: alias,
        smartGateSn: smartGateSn
      }

      HttpClient.createHttpClient(req_data).then(function (result) {
        resolve(result);
      });
    });
  }
}