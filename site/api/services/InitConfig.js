var Promise = require('bluebird'),
  datetime = require('./datetime'),
  _ = require('lodash');

module.exports = {
  init: function () {
    RedisService.init();
    PushWebService.init();
  }
}