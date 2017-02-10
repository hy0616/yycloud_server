/**
 * AnalysisController
 *
 * @description :: Server-side logic for managing analyses
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

var Promise = require('bluebird'),
  _ = require('lodash');
var nodeExcel = require('excel-export');
var moment = require('moment');

module.exports = {

  excelexport:function(req,res){
      var sn = req.param('sn'),
          deviceType = req.param('device_type'),  
          date = req.param('date'),
          scope = req.param('scope');

      var startDate = new Date(date.split(',')[0].split('[')[1]),
          endDate = new Date(date.split(',')[1].split(']')[0]);
      var timeDiff = parseInt(Math.abs(endDate - startDate) / 1000);

      var scopeCondition = {};

      if (timeDiff > 7 * 3600 * 24) {
          scopeCondition = {scope: 'scope2'}
          scope = 'scope2';
      } else if (timeDiff > 3600 * 24) {
          if (scope === 'scope0')
              scope = 'scope1';
          scopeCondition = {scope: scope};
      } else {
          scopeCondition = {scope: scope};
      }

      if (scope === 'scope0')
          scopeCondition = {};

      var dateCondition = {update_date: {'>=': startDate, '<=': endDate}};
      var modelName = getDBModelName(deviceType, scope);
      var result = {};
      if (modelName === '') {
          result.result = 'Failed';
          result.msg = "need 'device_type'";
          return res.json(200, result);
      }

      sails.models[modelName].find()
          .where({sn: sn})
          .where(scopeCondition)
          .where(dateCondition)
          .then(function (records) {
              if( null === records || '' === records || undefined === records){
                  var result = {};
                  result.result = 'Failed';
                  result.msg = "this time no data";
                  return res.json(200, result);

              }
             getConfByDeviceType(deviceType,records).then(function (conf) {
                  var result = nodeExcel.execute(conf);
                  res.setHeader('Content-Type', 'application/vnd.openxmlformats');
                  res.setHeader("Content-Disposition", "attachment; filename=" + "test.xlsx");
                  res.end(result, 'binary');

                  return;

              });

          });
  },

  getHistories: function (req, res) {
    var sn = req.param('sn'),
      deviceType = req.param('device_type'),
      date = req.param('date'),
      scope = req.param('scope');


    var startDate = new Date(date.split(',')[0].split('[')[1]),
      endDate = new Date(date.split(',')[1].split(']')[0]);
    var timeDiff = parseInt(Math.abs(endDate - startDate) / 1000);

    var scopeCondition = {};

    if (timeDiff > 7 * 3600 * 24) {
      scopeCondition = {scope: 'scope2'}
      scope = 'scope2';
    } else if (timeDiff > 3600 * 24) {
      if (scope === 'scope0')
        scope = 'scope1';
      scopeCondition = {scope: scope};
    } else {
      scopeCondition = {scope: scope};
    }

    if (scope === 'scope0')
      scopeCondition = {};

    var dateCondition = {update_date: {'>=': startDate, '<=': endDate}};
    var modelName = getDBModelName(deviceType, scope);
    var result = {};
    if (modelName === '') {
      result.result = 'Failed';
      result.msg = "need 'device_type'";
      return res.json(200, result);
    }

    sails.models[modelName].find()
      .where({sn: sn})
      .where(scopeCondition)
      .where(dateCondition)
      .then(function (records) {
        result.result = 'OK';
        result.msg = {
          sn: sn,
          date: date,
          scope: scope,
          device_type: deviceType,
          data: {}
        };

        getDataArrayValue(deviceType, records).then(function (dataValue) {
          result.msg.data = dataValue;
          return res.json(200, result);
        });
      });


    /*UserUtilService.currentUser(req)
     .then(function (username) {
     if (null === username) {
     res.json(sails.config.errorcode.E401.code, sails.config.errorcode.E401.detail);
     } else {
     var sn = req.param('sn'),
     deviceType = req.param('device_type'),
     date = req.param('date'),
     scope = req.param('scope');

     var startDate = new Date(date.split(',')[0].split('[')[1]),
     endDate = new Date(date.split(',')[1].split(']')[0]);
     var timeDiff = parseInt(Math.abs(endDate - startDate) / 1000);
     var scopeCondition = {};

     if (timeDiff > 7 * 3600 * 24) {
     scopeCondition = {scope: 'scope2'}
     scope = 'scope2';
     } else if (timeDiff > 3600 * 24) {
     scopeCondition = {scope: 'scope1'};
     scope = 'scope1';
     } else {
     scopeCondition = {};
     scope = 'scope0';
     }
     var dateCondition = {update_date: {'>=': startDate, '<=': endDate}};
     var modelName = getDBModelName(deviceType, scope);
     var result = {};
     if (modelName === '') {
     result.result = 'Failed';
     result.msg = "need 'device_type'";
     return res.json(200, result);
     }

     sails.models[modelName].find()
     .where({sn: sn})
     .where(scopeCondition)
     .where(dateCondition)
     .then(function (records) {
     console.log(records);
     })
     }
     });*/
  },

};

function getConfByDeviceType(deviceType,records) {
    return new Promise(function (resolve, reject) {

        var conf ={};
        conf.name = "mysheet";
        conf.cols = [];
        conf.rows = [];

            switch (deviceType) {
                case sails.config.device_type_config.device_type.smartgate:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: '空气温度值°C', type: 'number'},
                        {caption: '空气湿度值%HR', type: 'number'},
                        {caption: '土壤温度值°C', type: 'number'},
                        {caption: '土壤湿度值%HR', type: 'number'},
                        {caption: 'co浓度ppm', type: 'number'},
                        {caption: 'co2浓度ppm', type: 'number'},
                        {caption: '光照强度lux', type: 'number'},
                        {caption: '烟雾浓度ppm', type: 'number'},
                        {caption: '时间', type: 'string' },
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = '云洋数据智能网关';
                        row[1] = records[i].sn;
                        row[2] = records[i].air_temperature;
                        row[3] = records[i].air_humidity;
                        row[4] = records[i].soil_temperature;
                        row[5] = records[i].soil_humidity;
                        row[6] = records[i].co_ppm;
                        row[7] = records[i].co2_ppm;
                        row[8] = records[i].lux;
                        row[9] = records[i].smoke;
                        row[10] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);

                    }

                    break;
                case sails.config.device_type_config.device_type.humidity_temperature:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: '空气温度值°C', type: 'number'},
                        {caption: '空气湿度值%HR', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = '空气温湿度传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].air_temperature;
                        row[3] = records[i].air_humidity;
                        row[4] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);

                    }

                    break;
                case sails.config.device_type_config.device_type.soil_th:
                    var _headers = [
                        {caption: '设备类型', type: 'string' ,width:28.71},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: '土壤温度值°C', type: 'number'},
                        {caption: '土壤湿度值%HR', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }
                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = '土壤温湿度传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].temperature;
                        row[3] = records[i].humidity;
                        row[4] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);
                    }

                    break;
                case sails.config.device_type_config.device_type.co:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: 'co浓度ppm', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = 'co传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].co_ppm;
                        row[3] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);
                    }
                    break;
                case sails.config.device_type_config.device_type.co2:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: 'co2浓度ppm', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = 'co2传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].co2_ppm;
                        row[3] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);
                    }
                    break;
                case sails.config.device_type_config.device_type.illumination:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: '光照强度lux', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = '光照传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].lux;
                        row[3] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);
                    }
                    break;
                case sails.config.device_type_config.device_type.smoke:
                    var _headers = [
                        {caption: '设备类型', type: 'string'},
                        {caption: '设备编号sn', type: 'string'},
                        {caption: '烟雾强度ppm', type: 'number'},
                        {caption: '时间', type: 'string'},
                    ];

                    for (var i = 0; i < _headers.length; i++) {
                        var col = {};
                        col.caption = _headers[i].caption;
                        col.type = _headers[i].type;
                        conf.cols.push(col);
                    }

                    for (var i = 0; i < records.length; i++) {
                        var row = [];
                        row[0] = '烟雾传感器';
                        row[1] = records[i].sn;
                        row[2] = records[i].smoke;
                        row[3] = moment(records[i].update_date).utcOffset(+8).format('YYYY-MM-DD HH:mm:ss');
                        conf.rows.push(row);
                    }
                    break;
                default:
                    conf = '';
                    break;
            }
        resolve(conf);
    })


}

function getDBModelName(deviceType, scope) {
  var modelName = '';
  var isDelicate = (scope === 'scope0' ? true : false);

  switch (deviceType) {
    case sails.config.device_type_config.device_type.smartgate:
      if (isDelicate)
        modelName = 'smartgatedata';
      else
        modelName = 'smartgateaveragedata';
      break;
    case sails.config.device_type_config.device_type.humidity_temperature:
      if (isDelicate)
        modelName = 'airthdata';
      else
        modelName = 'airthaveragedata';
      break;
    case sails.config.device_type_config.device_type.soil_th:
      if (isDelicate)
        modelName = 'soilthdata';
      else
        modelName = 'soilthaveragedata';
      break;
    case sails.config.device_type_config.device_type.co:
      if (isDelicate)
        modelName = 'codata';
      else
        modelName = 'coaveragedata';
      break;
    case sails.config.device_type_config.device_type.co2:
      if (isDelicate)
        modelName = 'co2data';
      else
        modelName = 'co2averagedata';
      break;
    case sails.config.device_type_config.device_type.illumination:
      if (isDelicate)
        modelName = 'luxdata';
      else
        modelName = 'luxaveragedata';
      break;
    case sails.config.device_type_config.device_type.smoke:
      if (isDelicate)
        modelName = 'smokedata';
      else
        modelName = 'smokeaveragedata';
      break;
    default:
      modelName = '';
      break;
  }

  return modelName;
}

function getDataArrayValue(deviceType, records) {
  var values = {};
  return new Promise(function (resolve, reject) {
    switch (deviceType) {
      case sails.config.device_type_config.device_type.smartgate:
        values.air_temperature = [];
        values.air_humidity = [];
        values.soil_temperature = [];
        values.soil_humidity = [];
        values.co_ppm = [];
        values.co2_ppm = [];
        values.lux = [];
        values.smoke = [];
        Promise.map(records, function (record) {
          values.air_temperature.push({
            value: record.air_temperature,
            time: record.update_date
          });
          values.air_humidity.push({
            value: record.air_humidity,
            time: record.update_date
          });
          values.soil_temperature.push({
            value: record.soil_temperature,
            time: record.update_date
          });
          values.soil_humidity.push({
            value: record.soil_humidity,
            time: record.update_date
          });
          values.co_ppm.push({
            value: record.co_ppm,
            time: record.update_date
          });
          values.co2_ppm.push({
            value: record.co2_ppm,
            time: record.update_date
          });
          values.lux.push({
            value: record.lux,
            time: record.update_date
          });
          values.smoke.push({
            value: record.smoke,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.humidity_temperature:
        values.air_temperature = [];
        values.air_humidity = [];
        Promise.map(records, function (record) {
          values.air_temperature.push({
            value: record.temperature,
            time: record.update_date
          });
          values.air_humidity.push({
            value: record.humidity,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.soil_th:
        values.soil_temperature = [];
        values.soil_humidity = [];
        Promise.map(records, function (record) {
          values.soil_temperature.push({
            value: record.temperature,
            time: record.update_date
          });
          values.soil_humidity.push({
            value: record.humidity,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.co:
        values.co_ppm = [];
        Promise.map(records, function (record) {
          values.co_ppm.push({
            value: record.co_ppm,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.co2:
        values.co2_ppm = [];
        Promise.map(records, function (record) {
          values.co2_ppm.push({
            value: record.co2_ppm,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.illumination:
        values.lux = [];
        Promise.map(records, function (record) {
          values.lux.push({
            value: record.lux,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      case sails.config.device_type_config.device_type.smoke:
        values.smoke = [];
        Promise.map(records, function (record) {
          values.smoke.push({
            value: record.smoke,
            time: record.update_date
          });
        }).then(function () {
          resolve(values);
        });
        break;
      default:
        resolve(values);
        break;
    }
  })
}

