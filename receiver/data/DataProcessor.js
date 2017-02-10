var util = require('util'),
    EventEmitter = require('events').EventEmitter,
    datetime = require('../utils/datetime'),
    _ = require('lodash'),
    db = require('../db/db').db,
  EventFilterChain = require('./event/event_filter_chain');

var DataProcessor = function() {
  EventEmitter.call(this);

  this.actionList = _.functions(this);
};

util.inherits(DataProcessor, EventEmitter);
module.exports = DataProcessor;

DataProcessor.prototype.processData = function(data, action, tcpsocket, remote, clients, sockets) {
  var index = this.actionList.indexOf(action);

  if (index != -1) {
    eval(['this.', this.actionList[index], '(data, tcpsocket, remote, clients, sockets)'].join(''));
  }
}

function generateHeader() {
    return { version: 1, subversion: 0, sync: "imccim" }
}

function doSendMetaCmd(socket, ccp_token, meta_msg) {
    var cmd= {};

    cmd.header = generateHeader();
    cmd.body = { ccp_token: ccp_token, cmd: "send_meta", cmd_type: "request", meta_type: "para", meta_msg: meta_msg };

    cmd.header.bodylen = JSON.stringify(cmd.body).length;
    socket.send(JSON.stringify(cmd));
}


DataProcessor.prototype.processParaMeta = function(data, tcpsocket, remote) {

  if (data.body.mm == 'all') {
    doSendMetaCmd(tcpsocket, data.body.ct, 'var');
  }

  EventFilterChain.eventFilter(data);
}


