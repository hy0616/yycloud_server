var util = require('util'),
    fs = require('fs'),
    Promise = require('bluebird'),
    Waterline = require('waterline'),
    later = require('later'),
    EventEmitter = require('events').EventEmitter,
    datetime = require('../utils/datetime'),
    connections = require('../config/connections'),
    tokenList = require('../config/device').token,
    dbutils = require('./dbutils'),
    jf = require('jsonfile'),
    _ = require('lodash');
require('../utils/log_entrance/cmlog');

var loadORMSchema = function(orm) {
  var locationSchema       = Waterline.Collection.extend(require('./schemas/locationSchema'));
  var roleSchema = Waterline.Collection.extend(require('./schemas/roleSchema'));
  var userSchema = Waterline.Collection.extend(require('./schemas/userSchema'));
  var contactSchema = Waterline.Collection.extend(require('./schemas/contactSchema'));
  var smartGateSchema = Waterline.Collection.extend(require('./schemas/smartGateSchema'));
  var deviceSchema = Waterline.Collection.extend(require('./schemas/deviceSchema'));
  var defaultAlarmStrategySchema = Waterline.Collection.extend(require('./schemas/defaultAlarmStrategySchema'));
  var customerAlarmStrategySchema = Waterline.Collection.extend(require('./schemas/customerAlarmStrategySchema'));
  var tempAlarmStrategySchema = Waterline.Collection.extend(require('./schemas/tempAlarmStrategySchema'));
  var smartGateAlarmStrategySchema = Waterline.Collection.extend(require('./schemas/smartgateAlarmStrategySchema'));
  var myEventSchema = Waterline.Collection.extend(require('./schemas/myEventSchema'));
  var airTHDataSchema = Waterline.Collection.extend(require('./schemas/airTHDataSchema'));
  var airTHAverageDataSchema = Waterline.Collection.extend(require('./schemas/airTHAverageDataSchema'));
  var soilTHDataSchema = Waterline.Collection.extend(require('./schemas/soilTHDataSchema'));
  var soilTHAverageDataSchema = Waterline.Collection.extend(require('./schemas/soilTHAverageDataSchema'));
  var coDataSchema = Waterline.Collection.extend(require('./schemas/coDataSchema'));
  var coAverageDataSchema = Waterline.Collection.extend(require('./schemas/coAverageDataSchema'));
  var co2DataSchema = Waterline.Collection.extend(require('./schemas/co2DataSchema'));
  var co2AverageDataSchema = Waterline.Collection.extend(require('./schemas/co2AverageDataSchema'));
  var luxDataSchema = Waterline.Collection.extend(require('./schemas/luxDataSchema'));
  var luxAverageDataSchema = Waterline.Collection.extend(require('./schemas/luxAverageDataSchema'));
  var smartGateDataSchema = Waterline.Collection.extend(require('./schemas/smartGateDataSchema'));
  var smartGateAverageDataSchema = Waterline.Collection.extend(require('./schemas/smartGateAverageDataSchema'));
  var geoGroupSchema = Waterline.Collection.extend(require('./schemas/geoGroupSchema'));
  var ownerVisitorSchema = Waterline.Collection.extend(require('./schemas/ownerVisitorSchema'));
  var smokeDataSchema = Waterline.Collection.extend(require('./schemas/smokeDataSchema'));
  var smokeAverageDataSchema = Waterline.Collection.extend(require('./schemas/smokeAverageDataSchema'));

  orm.loadCollection(locationSchema);

  orm.loadCollection(roleSchema);
  orm.loadCollection(userSchema);
  orm.loadCollection(contactSchema);
  orm.loadCollection(smartGateSchema);
  orm.loadCollection(deviceSchema);
  orm.loadCollection(defaultAlarmStrategySchema);
  orm.loadCollection(customerAlarmStrategySchema);
  orm.loadCollection(tempAlarmStrategySchema);
  orm.loadCollection(smartGateAlarmStrategySchema);
  orm.loadCollection(myEventSchema);
  orm.loadCollection(airTHDataSchema);
  orm.loadCollection(airTHAverageDataSchema);
  orm.loadCollection(soilTHDataSchema);
  orm.loadCollection(soilTHAverageDataSchema);
  orm.loadCollection(coDataSchema);
  orm.loadCollection(coAverageDataSchema);
  orm.loadCollection(co2DataSchema);
  orm.loadCollection(co2AverageDataSchema);
  orm.loadCollection(luxDataSchema);
  orm.loadCollection(luxAverageDataSchema);
  orm.loadCollection(smartGateDataSchema);
  orm.loadCollection(smartGateAverageDataSchema);
  orm.loadCollection(geoGroupSchema);
  orm.loadCollection(ownerVisitorSchema);
  orm.loadCollection(smokeDataSchema);
  orm.loadCollection(smokeAverageDataSchema);
}

var loadORMDefinedToken = function(db, orm) {
  var loadTokenList = [];

  _.forEach(tokenList, function(token) {
    var temp = token.split('-');
    var loadToken = {};
    loadToken.token_name = token;
    loadToken.token_type = temp[0];
    loadToken.dev_type   = temp[1];
    loadToken.token_date = temp[2];
    loadTokenList.push(loadToken);
  });

  var china_json = jf.readFileSync(__dirname+ '/' + 'china.json');

  cmlog.debug('begin initialize orm models');
  db.orm.initialize(connections, function(err, models) {
    cmlog.debug('orm initialize call back');
    if(err) cmlog.error('db orm initialize error: ', err);

    //load all models
    db.models = models.collections;
    db.connections = models.connections;

    db.ccpTokens = {};
    db.componentTokens = {};
  });
}


var DB = function() {
  var self = this;
  EventEmitter.call(this);

  this.orm = new Waterline();

  loadORMSchema(this.orm);

  loadORMDefinedToken(this, this.orm);
}

util.inherits(DB, EventEmitter);

var dbAll = new DB();
module.exports = DB;
module.exports.db = dbAll;

DB.prototype.create = function(model, record) {
  return eval('dbutils.create(this.models.'+ model + ', record);');
}

DB.prototype.update = function(model, data, criteria) {
  return eval('dbutils.update(this.models.'+ model +', data, criteria);');
};

DB.prototype.destroy = function (model, criteria) {
  return eval('dbutils.destroy(this.models.' + model + ', criteria);');
}

DB.prototype.findOne = function(model, criteria) {
  return eval('dbutils.findOne(this.models.'+ model + ', criteria);');
};

DB.prototype.updateOnline = function(model, devUUID, online) {
  return eval('dbutils.updateOnline(this.models.'+ model + ', devUUID, online);');
};

DB.prototype.getOne = function(model, devType, devUUID) {
  return eval('dbutils.getOne(this.models.'+ model +', devType, devUUID);');
};

DB.prototype.getCount = function(model) {
  return eval('dbutils.getCount(this.models.'+ model + ');');
};

DB.prototype.getPageRecords = function(model, pageIndex, listCount) {
  return eval('dbutils.getPageRecords(this.models.'+ model + ', pageIndex, listCount);');
};

DB.prototype.find = function (model, criteria) {
  return eval('dbutils.find(this.models.' + model + ', criteria);');
};

DB.prototype.populate = function (model, attribute, criteria) {
  return eval('dbutils.populate(this.models.' + model + ', attribute, criteria);');
}


