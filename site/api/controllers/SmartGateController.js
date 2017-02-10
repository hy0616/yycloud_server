/**
 * SmartGateController
 *
 * @description :: Server-side logic for managing Smartgates
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');

module.exports = {
  updateAlias: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else if (null === req.params['id']) {
          res.json(sails.config.errorcode.E505.code, sails.config.errorcode.E505.detail);
        } else {
          var alias = req.body.alias,
            smartGateSn = req.params['id'];
          SmartGateService.updateAlias(smartGateSn, alias)
            .then(function (result) {
              res.json('200', result);
            });
        }
      });
  },

  getTotal: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getTotal()
            .then(function (result) {
              result.smartgate_total_num = Number(result.smartgate_total_num) + 260;
              result.online_smartgate_num = Number(result.online_smartgate_num) + 260;
              res.json(200, result);
            });
        }
      });
  },

  getTotalByUser: function (req, res) {
    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getTotalByUser(username)
            .then(function (result) {
              res.json(200, result);
            })
        }
      })
  },

  getInfo: function (req, res) {
    var startTime = new Date();
    //sails.log.debug("----------> request info: ",'获取详情页:'+req.url);
    UserUtilService.currentUser(req)
      .then(function (username) {
          //sails.log.debug("----------> request username: ",username);
          if (null === username) {
            res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
          } else if (null === req.params['id']) {
            res.json(sails.config.errorcode.E502.code, sails.config.errorcode.E502.detail);
          } else {
            var smartGateSn = req.params['id'];
            RedisService.getLatestSmartGateData(smartGateSn)
              .then(function (data) {
                  res.json(200, data);
                  var endTime = new Date();
                  var timeDiff = endTime-startTime;
                  //sails.log.debug("----------> resopnse info: ",username+'  '+'sn:'+smartGateSn+'  '+'timeDiff:'+timeDiff+' resInfo: '+ JSON.stringify(data).length);
            });
        }
      });
  },

  getAllSmartGate: function (req, res) {

    var limit = ParamService.getPageLimit(req);
    var page = ParamService.getPageNum(req);


    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          var result = [];
          SmartGate.find()
            .paginate({page: page, limit: limit})
            .then(function (records) {
              Promise.map(records, function (smartgate) {
                return new Promise(function (resolve, reject) {
                  RedisService.getLatestSmartGateData(smartgate.sn)
                    .then(function (data) {
                      result.push(data);
                      resolve();
                    })
                })
              }).then(function () {
                res.json(200, result);
              });
            })
        }
      });
  },

  deleteEndDevice: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      endDeviceSn = req.params['device_sn'],
      result = {};

    if (undefined === smartGateSn || undefined === endDeviceSn){
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and device_sn';
      res.json(200, result);
    }

    UserUtilService.currentUser(req)
      .then(function (username) {
        if (null === username) {
          res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
        } else {
          RedisService.getSmartGateSnsByUser(username)
            .then(function (smartgates) {
              if (_.includes(smartgates, smartGateSn)) {
                RedisService.getDeviceSnsBySmarGate(smartGateSn)
                  .then(function (devices) {
                    if(_.includes(devices, endDeviceSn)){
                      RedisService.deleteDevice(smartGateSn,endDeviceSn)
                        .then(function () {     //delete from the db
                          Device.destroy()
                            .where({sn:endDeviceSn})
                            .then(function (record) {
                              result.result = 'OK',
                                result.msg = 'Delete OK.';
                              res.json(200,result)
                            })
                        })
                    }else{
                      result.result = 'Failed';
                      result.msg = 'The device does not belong to the smartgate.'
                      res.json(200, result);
                    }
                  })
              }else{
                result.result = 'Failed';
                result.msg = 'The smartgate does not belong to you.'
                res.json(200, result);
              }
            }
          )
        }
      }
    );
  },

  checkEndDeviceLegal: function (req, res) {
    var smartGateSn = req.params['smartgate_sn'],
      endDeviceSn = req.params['device_sn'],
      result = {};

    if (undefined === smartGateSn || undefined === endDeviceSn){
      result.result = 'Failed';
      result.msg = 'need both smartgate_sn and device_sn';
      res.json(200, result);
    }

    Device.getOwner(endDeviceSn)
      .then(function (oldSn) {
        if(undefined === oldSn || 'unknown' === oldSn || smartGateSn === oldSn){
          result.result = 'OK';
        }else{
          result.result = 'Failed';
          result.msg = '请从主机' + oldSn + '上将该设备删除，然后再次尝试配对！';
        }
        res.json(200, result);
      })

  }
};

