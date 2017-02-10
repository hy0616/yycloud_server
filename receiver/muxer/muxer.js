var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    _ = require('lodash'),
    Promise = require('bluebird'),
    datetime = require('../utils/datetime');

require('../utils/log_entrance/cmlog');

var Muxer = function() {
  EventEmitter.call(this);
  var self = this;
};

util.inherits(Muxer, EventEmitter);
module.exports = Muxer;

function validMeta(body) {
  if (body.sn  === undefined )
    return false;
  else 
    return true;
}

Muxer.prototype.validKeepAlive = function(body) {
  if (body.ccp_token === undefined ||
      body.dev_uuid === undefined)
    return false;

  return true;
};

Muxer.prototype.parseData = function(data) {
  try {
    json_data = JSON.parse(data);
    header    = json_data.header;
    body      = json_data.body;
    bodylen   = JSON.stringify(body).length;

    if (header.sync === 'imccim' && 
        bodylen === header.bodylen &&
        body.cmd != undefined
        ) {
      return json_data;
    } else {
      return null;
    }
  } catch (e) {
    return null;
  }
};

Muxer.prototype.parseDataNotifyier = function(data) {
  var result = {};

  if (validMeta(data.body)) {
    if (data.body.dt === undefined) {
      result.dev_type = 'rs200';
    } else {
      result.dev_type = data.body.dt;
    }

    if (data.body.na === undefined) {
      result.action = 'processParaMeta';
    } else {
      result.action = data.body.na;
    }
  }

  return result;
};




