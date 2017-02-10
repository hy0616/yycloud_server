module.exports.redis_config = {

  buffer_redis: {
    host: '127.0.0.1',
    port: 6379,
    options:{
      connect_timeout: 1000,
      max_attempts:2
    },

    notice_channel_config:{
      server_to_site_channel:'server-to-site-channel',      
      site_to_server_channel:'site-to-server-channel'
    },
  },

  key_config:{
    userinfos: 'userinfos:',
    smartgateinfos:'smartgateinfos:',
    deviceinfos:'deviceinfos:',
    default_alarm_strategies:'default_as:',
    custom_alarm_strategies:'custom_as:',
    temp_alarm_strategies:'temp_as:',
    events:'events:',
    usersmartgate:'usersmartgate:',
    smartgatedevice:'smartgatedevice:',
    smartgatealarmstrategies:'smartgate_as:',
    deleteddevices:'deleteddevices:',
    userleancloud:'userleancloud:',
    leanclouduser:'leanclouduser:'
  }
}