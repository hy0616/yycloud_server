var util = require('util');
var _ = require('lodash');

module.exports = function () {
  var str = '';

  _.forEach(arguments, function (arg) {
    if (_.isString(arg))
      str += arg;
    else
      str += String(JSON.stringify(arg, null, 2));
  });

  console.log(str);
};



