var _ = require('lodash');
var WebCmd = require('../cmd/webcmd');
var rs200Cmd = require('../cmd/rs200cmd');
var yydev1Cmd = require('../cmd/smartgatecmd');


module.exports = {
  getCmdList: function(req, res) {
    DevCurData.getCurInfo(req)
    .then(function(record) {
      eval('var cmdList = ' + record.dev_type + 'Cmd.getCmdList(record)');
      res.json(cmdList);
    })
  },


  getCmd: function(req, res) {
    DevCurData.getCurInfo(req)
    .then(function(record) {
      eval("var cmd = " + record.dev_type + "Cmd.getCmd(record, req.param('cmd_name'), req.param('lang'))");
      res.json(cmd);
    })
  },


  doCmd: function(req, res) {
    var webCmd = new WebCmd();

    webCmd.doCmd(req.param("ccp_token"), req.param("smartgate_sn"), req.param("params"), req.param("rt_info"));
        
    webCmd.on('data', function(data) {
      var realData = JSON.parse(data);
      if (realData.type == 'response') {
        res.json({ret: realData.ret});
      }else if (realData.type == 'data') {
        var rtData = realData.data;
        console.log('--------------->rtdata', JSON.stringify(rtData));
        req.socket.emit('rtdata', JSON.stringify(rtData));
      }
    });

    webCmd.on('error', function(data) {
      res.json(401, {err: 'connect cmd server fail'});
    });

  },

};



