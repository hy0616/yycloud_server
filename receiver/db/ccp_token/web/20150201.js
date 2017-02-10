module.exports = {
  ccp_token: "ccp_token-web-20150201",
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
      }
    }
  }
}

