module.exports = {
  component_token: 'component_token-cameraip-20150201',
  content: {
    component_token: {
      attr_type: 'string',
      attr_required: true,
      attr_usage: 'cache'
    },

    component_id: {
      attr_type: 'int',
      attr_required: true,
      attr_usage: 'cache'
    },

    alias: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    default_alias: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    ieee: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    device_type: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    vendor: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    user: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    password: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    update_at: {
      attr_type: 'string',
      attr_required: false,
      attr_usage: 'cache'
    },

    online: {
      attr_type: 'int',
      attr_required: true,
      attr_usage: 'cache',
      alarm: {
        default_min: [1],
        default_max: null,
        custom_min: null, 
        custom_max: null
      }


    },

    charge: {
      attr_type: 'int',
      attr_required: true,
      attr_usage: 'cache'
    },

  }

};



