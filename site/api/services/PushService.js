var url = require("url");
var request = require('request');
var Q = require('q');

var leancloud_config = sails.config.leancloud_config;


module.exports = {

  pushSpecialUser: function (installationId, channels, title, msg) {
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'where': {
          installationId: installationId
        },
        'data':{
          action:'com.itserv.shed.NEW_EVENT',
          alert: msg,
          title: title
        },
        channels: channels
      },
      json:true
    };

    return _doRequest(options);
  },

  pushSpecialUserWeb: function (username, title, msg) {
    var channels = ['web_channel_' + username];
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'data':{
          alert: msg,
          title: title
        },
        channels: channels
      },
      json:true
    };

    return _doRequest(options);
  },

  pushSpecialUserCmd: function (installationId, channels, cmd, content) {
    var options = {
      url: leancloud_config.api_rootpath + '/push',
      method: 'POST',
      headers: {
        'X-LC-Id': leancloud_config.app_id,
        'X-LC-Key': leancloud_config.app_key
      },
      body: {
        'where': {
          installationId: installationId
        },
        'data':{
          action:'com.itserv.shed.NEW_CMD',
          content: content,
          cmd:cmd,
          title:'New Command From Server.'
        },
        channels: channels
      },
      json:true
    };

    return _doRequest(options);
  }
}

function _doRequest(options){
  return new Promise(function (resolve, reject) {
    request(options, function (err, res, body) {

      if (!err && res.statusCode == 200) {
        resolve(body);
      } else {
        if (_.isUndefined(res)) {
        }

        reject(body);
      }
    });
  })
}
