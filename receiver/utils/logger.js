var log4js = require('log4js');
var path = require('path');

module.exports.configure = function (filename) {

  var categoryName = filename;

  var fileName = path.dirname(__dirname) + '/logs/' + filename + '.log';

  log4js.configure({
    appenders: [
      {type: 'console'},
      {
        type: 'file',
        filename: fileName,
        maxLogSize: 1024 * 1024 * 10,
        category: categoryName
      }
    ]
  });
};

module.exports.getLogger = function (filename, level) {
  var logger = log4js.getLogger(filename);
  logger.setLevel(level);
  return logger;
};