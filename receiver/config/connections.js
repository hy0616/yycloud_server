var mongoAdapter = require('sails-mongo');

module.exports = {
  adapters: {
    'default': mongoAdapter,
    mongo: mongoAdapter
  },

  connections: {
    localMongo: {
      adapter: 'mongo',
      host: 'localhost',
      database: 'cmdevice' 
    },

    localMongoDev: {
      adapter: 'mongo',
      host: 'localhost',
      database: 'cmdevicedev' 
    },

    yyMongo: {
      adapter: 'mongo',
      host: 'localhost',
      database: 'yys_db'
    },

    yyMongoDev: {
      adapter: 'mongo',
      host: 'localhost',
      database: 'yysdev_db'
    },


  },

  defaults: {
//    migrate: 'alter'
   migrate: 'safe'
  }

};


