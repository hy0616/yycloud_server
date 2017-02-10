var util = require('util'),
  EventEmitter = require('events').EventEmitter,
  later = require('later'),
  server_ports = require('./config/server'),
  TcpServer = require('./server/TcpServer'),
  UdpServer = require('./server/UdpServer'),
  HttpServer = require('./server/http_server'),
  DataProcessNotifierSite = require('./data/site_data/data_process_notifier'),
  DataProcessNotifier = require('./data/DataProcessNotifier'),
  Muxer = require('./muxer/muxer'),
  puts = require('./utils/puts'),
  _ = require('lodash'),
  env = require('./config/env'),
  MyRedis = require('./my_redis/my_redis');

require('./utils/log_entrance/cmlog');

var CMServer = function (host, port, opts) {
  EventEmitter.call(this);

  this.host = host;
  this.port = port;
  this.http_port =
    this.opts = opts;

  this.clients = {};
  this.sockets = {};
  this.httpServers = {};
  this.loginfos = {};
};

util.inherits(CMServer, EventEmitter);
module.exports = CMServer;

var notifyRemoteControl = function (self, socket, json_data, keep_connection) {
  if (_.has(self.clients, json_data.body.ccp_token)) {
    if (_.has(self.clients[json_data.body.ccp_token], json_data.body.dev_uuid)) {
      cmlog.debug('in tcp server, do remote control' + self.clients[json_data.body.ccp_token][json_data.body.dev_uuid]);
      cmlog.warn('in tcp server, do remote control--' + self.clients[json_data.body.ccp_token][json_data.body.dev_uuid]);
      var remote_ccp_token = json_data.body.remote_control.body.ccp_token;
      var dev_type = remote_ccp_token.split('-')[1];
      var remote_smartgate_sn = json_data.body.remote_smartgate_sn;

      if (!_.has(self.clients, remote_ccp_token)) {
        socket.send(JSON.stringify({
          type: 'response',
          ret: 'fail, not this dev_uuid or device offline',
          keep_connection: false
        }));
        return;
      }

      var remote_id = self.clients[remote_ccp_token][remote_smartgate_sn];

      if (remote_id === undefined)
        socket.send(JSON.stringify({type: 'response', ret: 'fail, not this dev_uuid', keep_connection: false}));
      else {
        self.sockets[remote_id]['socket'].send(JSON.stringify(json_data.body.remote_control));
        socket.send(JSON.stringify({type: 'response', ret: 'success', keep_connection: keep_connection}));
        cmlog.warn('in tcp server, do remote control--' + self.clients[json_data.body.ccp_token][json_data.body.dev_uuid]+'  sn:'+remote_smartgate_sn);
      }
    } else {
      socket.send(JSON.stringify({type: 'response', ret: 'fail, not this dev_uuid', keep_connection: false}));
    }
  } else {
    socket.send(JSON.stringify({type: 'response', ret: 'fail, not this ccp_token', keep_connection: false}));
  }
}

CMServer.prototype.startHttpServerSite = function (host, port, opts, callback) {
  var self = this;
  this.httpServerSite = new HttpServer(host, port, opts);
  this.httpServerSite.start(callback);

  if (!_.has(self.httpServers, 'site')) {
    self.httpServers['site'] = this.httpServerSite;
  }

  this.dataProcessNotifieSite = new DataProcessNotifierSite();

  this.httpServerSite.on('data', function (data, response) {
    try {
      var json_data = JSON.parse(data);
      self.dataProcessNotifieSite.notifyData(json_data, response);
    } catch (e) {
      response.end();
    }
  });
}

CMServer.prototype.stopHttpServerBurn = function (callback) {
  this.httpServerSite.stop(callback);
  if (_.has(this.httpServers, 'site')) {
    delete this.httpServers['site'];
  }
}

CMServer.prototype.stopAllHttpServer = function (callback) {
  _.forEach(this.httpServers, function (value, key) {
    value.stop(callback);
  });
  this.httpServers = {};
}

CMServer.prototype.startTcpServer = function (cb) {
  var self = this;
  this.tcpServer.start(cb);

  this.tcpServer.on('data', function (socket, data) {
    try {
      var json_data = self.muxer.parseData(data);
      var body = json_data.body;
      var cmd = json_data.body.cmd;
      if (cmd == 'keep_alive') {
        if (self.muxer.validKeepAlive(body)) {

          self.updateClients(socket, body.dev_type, body.ccp_token, body.dev_uuid);
        }
      } else {
        self.updateClients(socket, body.dev_type, body.ccp_token, body.dev_uuid, body.rt_info);


        notifyRemoteControl(self, socket, json_data,
          (body.rt_info === undefined) ? false : body.rt_info.keep_connection);
      }
    } catch (e) {
    }
  });

  this.tcpServer.on('end', function (socket) {
    try {
      self.deleteClient(socket, 1);
    } catch (e) {
    }
  });

  this.tcpServer.on('toobusy', function () {
  });
}

CMServer.prototype.startUdpServer = function (cb) {
  var self = this;
  this.udpServer.start(cb);

  this.udpServer.on('data', function (data, remote) {

    try {
      var json_data = JSON.parse(data);
      var notifier = self.muxer.parseDataNotifyier(json_data);
      if (_.has(self.clients, json_data.body.ct)) {
        if (_.has(self.clients[json_data.body.ct], json_data.body.sn)) {
          //cmlog.warn('in udp server, recv data, belong to clients:' + "  ccp_token:"+json_data.body.ct +"  dev_uuid:"+ json_data.body.sn);
          cmlog.debug('in udp server, recv data, belong to clients:' + self.clients[json_data.body.ct][json_data.body.sn]);
          var id = self.clients[json_data.body.ct][json_data.body.sn];

          self.dataProcessNotifier.notifyData(notifier.dev_type, json_data, notifier.action,
            self.sockets[id]['socket'], remote,
            self.clients, self.sockets);
        } else {
          cmlog.warn('in udp server, detect ccp_token package and dev_uuid, ccp_token=' + json_data.body.ct +
            ',dev_uuid=' + json_data.body.sn +
            ', but the tcpserver maybe not recv the keep alive data now, should wait');
        }
      } else {
        cmlog.warn('in udp server, detect ccp_token package, ccp_token=' + json_data.body.ct +
          ', but the tcpserver maybe not recv the keep alive data now, should wait');
      }
    } catch (e) {
      cmlog.error('in udp server, exception happen' + e + ', err stack is :' + e.stack);
    }
  });

}

CMServer.prototype.updateClients = function (socket, dev_type, ccp_token, dev_uuid, rt_info) {
  if (this.clients[ccp_token] === undefined)
    this.clients[ccp_token] = {};
  var data_date = new Date();
  if (dev_type != 'web') {
    if (this.clients[ccp_token][dev_uuid] === undefined) {
    }
  }

  this.clients[ccp_token][dev_uuid] = socket.id;
  this.loginfos[dev_uuid] = data_date;

  if (this.sockets[socket.id] === undefined)
    this.sockets[socket.id] = {};
  this.sockets[socket.id]['socket'] = socket;
  this.sockets[socket.id]['ccp_token'] = ccp_token;
  this.sockets[socket.id]['dev_type'] = dev_type;
  this.sockets[socket.id]['dev_uuid'] = dev_uuid;
  this.sockets[socket.id]['timestamp'] = new Date();
  this.sockets[socket.id]['rt_info'] = rt_info;

}

CMServer.prototype.getClientsNum = function () {
  return _.size(this.clients);
}

CMServer.prototype.stop = function (cb) {
  this.tcpServer.close();
  this.udpServer.close();
  this.clients = {};

  if (cb != undefined) process.nextTick(cb);
}

CMServer.prototype.deleteClient = function (socket, tag) {
  try {
    var dev_type = this.sockets[socket.id]['dev_type'];
    var ccp_token = this.sockets[socket.id]['ccp_token'];
    var dev_uuid = this.sockets[socket.id]['dev_uuid'];

    MyRedis.myRedis.setSmartGateOffline(dev_uuid, tag);


    delete this.clients[ccp_token][dev_uuid];
  } catch (e) {

  }
}

CMServer.prototype.checkTcpOnline = function () {
  var self = this;
  var ccp_tokens = _.keys(this.clients);

  _.forEach(ccp_tokens, function (ccp_token) {
    var dev_uuids = _.keys(self.clients[ccp_token]);
    _.forEach(dev_uuids, function (dev_uuid) {
      var curTime = new Date();
      var id = self.clients[ccp_token][dev_uuid];
      var diff = self.sockets[id]['timestamp'] - curTime;
      if (Math.abs(diff) > env.schedule_task_cycle.smartGateOfflineTimeStamp * 1000) {
        self.deleteClient(self.sockets[id]['socket'], 0);
      }
    });
  });
};

CMServer.prototype.start = function (cb) {
  var self = this;

  this.muxer = new Muxer();
  this.tcpServer = new TcpServer(this.host, this.port);
  this.udpServer = new UdpServer(this.host, this.port);
  this.dataProcessNotifier = new DataProcessNotifier();

  this.startTcpServer(cb);
  this.startUdpServer(cb);
  this.startHttpServerSite(this.host, server_ports.port_for_site, this.opts, cb);

  if (cb != undefined) process.nextTick(cb);
};
