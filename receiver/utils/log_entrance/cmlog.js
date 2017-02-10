var logger = require('./../logger');

logger.configure('log');

global.cmlog = logger.getLogger('log', 'info');
