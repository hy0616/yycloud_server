var env = require('../../config/env');
var realConnection = env.connection[env.env];

module.exports = realConnection;


