var util = require('util');
var DataProcessor = require('./DataProcessor');
var _ = require('lodash');
require('../utils/log_entrance/cmlog');

var smartGateDataProcessor = function() {
  DataProcessor.call(this);
};

util.inherits(smartGateDataProcessor, DataProcessor);
module.exports = new smartGateDataProcessor();


