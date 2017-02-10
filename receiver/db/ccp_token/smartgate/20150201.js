module.exports = {
  ccp_token: "ccp_token-smartgate-20150201",
  content: {
    header: {
      attributes: {
        version: {
          attr_type : "int",
          attr_required: true,
          attr_usage: "cache"
        },

        subversion: {
          attr_type : "int",
          attr_required: true,
          attr_usage: "cache"
        },

        sync: {
          attr_type: 'string',
          attr_required: true,
          attr_usage: 'cache'
        }
      }
    },

    body: {
      attributes: {
        dev_uuid: {
          attr_type : "string",
          attr_required: true,
          attr_usage: "cache"
        },

        ccp_token: {
          attr_type : "string",
          attr_required: true,
          attr_usage: "cache"
        },

        dev_type: {
          attr_type: 'string',
          attr_required: true,
          attr_attr_usage: 'cache'
        },

        notify_action: {
          attr_type: 'string',
          attr_required: true,
          attr_attr_usage: 'cache'
        },

        common: {
          attributes: {
            dn: {
              attr_type: "string",
              attr_required: true,
              attr_usage: "cache"
            },

            dl: {
              attr_type: 'string',
              attr_required: true,
              attr_usage: 'cache'
            },

            lat: {
              attr_type: 'float',
              attr_required: true,
              attr_usage: 'cache'
            },

            lng: {
              attr_type: 'float',
              attr_required: true,
              attr_usage: 'cache'
            },

            ut: {
              attr_type: 'int',
              attr_required: true,
              attr_usage: 'cache'
            },

            uo: {
              attr_type: 'int',
              attr_required: true,
              attr_usage: 'cache'
            },

            pn: {
              attr_type: 'string',
              attr_required: false,
              attr_usage: 'cache'
            },

            area: {
              attr_type: 'int',
              attr_required: false,
              attr_usage: 'cache'
            },

            ep: {
              attr_type: 'int',
              attr_required: false,
              attr_usage: 'cache'
            },

            ht: {
              attr_type: 'int',
              attr_required: false,
              attr_usage: 'cache'
            },

            hw: {
              attr_type: 'int',
              attr_required: false,
              attr_usage: 'cache'
            },

            cna: {
              attr_type: 'string',
              attr_required: false,
              attr_usage: 'cache'
            },

            cnu: {
              attr_type: 'string',
              attr_required: false,
              attr_usage: 'cache'
            },
          }
        },

        components: {
          attributes: ['component_token-humidity-20150201', 
                       'component_token-temperature-20150201', 
                       'component_token-humtemp-20150201', 
                       'component_token-erelay-20150201',
                       'component_token-camera-20150201',
                       'component_token-cameraip-20150201']
        }
      }
    }

  }

};


