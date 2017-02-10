var http = require('http');
var Promise = require('bluebird');

var options = {
  hostname: sails.config.server_config.receiver_server_ip,
  port: sails.config.server_config.receiver_server_port,
  path: null,
  method: 'POST',
  headers: {'Content-Type': 'application/json'}
};

module.exports = {
  createHttpClient: function (req_data) {
    return new Promise(function (resolve, reject) {
      var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        var buffers = "";
        res.on('data', function (chunk) {
          buffers += chunk;
        }).on('end', function () {
          resolve(JSON.parse(buffers));
        });
      });
      req.write(JSON.stringify(req_data));
      req.end();
    });
  }
};
