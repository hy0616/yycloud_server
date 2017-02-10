module.exports = {
  smartgate_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    }
  },

  cameraip_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    }
  },

  // temperatue & humidity sensor
  air_th_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    // temperature levels
    temperature_state: {
      normal: 'normal',
      high_1: 't_high_1',
      high_2: 't_high_2',
      high_3: 't_high_3',
      low_1: 't_low_1',
      low_2: 't_low_2',
      low_3: 't_low_3',
    },

    // humidity levels
    humidity_state: {
      normal: 'normal',
      high_1: 'h_high_1',
      high_2: 'h_high_2',
      high_3: 'h_high_3',
      low_1: 'h_low_1',
      low_2: 'h_low_2',
      low_3: 'h_low_3'
    }
  },

  co_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    // co levels
    co_ppm_state: {
      normal: 'normal',
      high_1: 'co_high_1',
      high_2: 'co_high_2',
      high_3: 'co_high_3',

      low_1: 'co_low_1',
      low_2: 'co_low_2',
      low_3: 'co_low_3'
    }
  },

  co2_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    // co2 3 high levels
    co2_ppm_state: {
      normal: 'normal',
      high_1: 'co2_high_1',
      high_2: 'co2_high_2',
      high_3: 'co2_high_3',

      low_1: 'co2_low_1',
      low_2: 'co2_low_2',
      low_3: 'co2_low_3'
    }
  },

  soil_th_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    // temperature levels
    temperature_state: {
      normal: 'normal',
      high_1: 't_high_1',
      high_2: 't_high_2',
      high_3: 't_high_3',
      low_1: 't_low_1',
      low_2: 't_low_2',
      low_3: 't_low_3',
    },

    // humidity levels
    humidity_state: {
      normal: 'normal',
      high_1: 'h_high_1',
      high_2: 'h_high_2',
      high_3: 'h_high_3',
      low_1: 'h_low_1',
      low_2: 'h_low_2',
      low_3: 'h_low_3'
    }
  },

  illumination_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    // lux 3 high levels
    lux_state: {
      normal: 'normal',
      high_1: 'lux_high_1',
      high_2: 'lux_high_2',
      high_3: 'lux_high_3',

      low_1: 'lux_low_1',
      low_2: 'lux_low_2',
      low_3: 'lux_low_3'
    }
  },

  smoke_sensor_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    },

    smoke_state: {
      normal: 'normal',
      high_1: 'smoke_high_1',
      high_2: 'smoke_high_2'
    }
  },

  erelay_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    }

    /*switch_state: {
     on: 'on',
     off: 'off'
     }*/
  },

  erelay2_state: {
    online_state: {
      online: 'online',
      offline: 'offline'
    },

    // charge levels
    charge_state: {
      normal: 'normal',
      low_1: 'charge_low_1',
      low_2: 'charge_low_2'
    }

    /*rolling_state: {
     forward: 'forward',
     stop: 'stop',
     backward: 'backward'
     }*/
  }
}