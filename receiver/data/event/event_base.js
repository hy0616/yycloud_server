var StateConfig = require('../../config/event_config/state_config');
var eventBase = module.exports;

eventBase.smartgateData = function (state, attachedInfo) {
  var msg = '';
  switch (state) {
    case StateConfig.smartgate_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线。';
      break;
    case StateConfig.smartgate_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线。';
      break;
    default :
      break;
  }
  return msg;
};

eventBase.airTHData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.air_th_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.air_th_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.air_th_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.air_th_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.high_1:
      msg = '[空气高温度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.air_t_h_value_1 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.high_2:
      msg = '[空气高温度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.air_t_h_value_2 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.high_3:
      msg = '[空气高温度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.air_t_h_value_3 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.low_1:
      msg = '[空气低温度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.air_t_l_value_1 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.low_2:
      msg = '[空气低温度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.air_t_l_value_2 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.temperature_state.low_3:
      msg = '[空气低温度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.air_t_l_value_3 + '℃.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.high_1:
      msg = '[空气高湿度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.air_h_h_value_1 + 'RH.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.high_2:
      msg = '[空气高湿度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.air_h_h_value_2 + 'RH.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.high_3:
      msg = '[空气高湿度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.air_h_h_value_3 + 'RH.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.low_1:
      msg = '[空气低湿度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.air_h_l_value_1 + 'RH.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.low_2:
      msg = '[空气低湿度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.air_h_l_value_2 + 'RH.';
      break;
    case StateConfig.air_th_sensor_state.humidity_state.low_3:
      msg = '[空气低湿度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.air_h_l_value_3 + 'RH.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.soilTHData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.soil_th_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.soil_th_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.soil_th_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.soil_th_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.high_1:
      msg = '[土壤高温度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.soil_t_h_value_1 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.high_2:
      msg = '[土壤高温度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.soil_t_h_value_2 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.high_3:
      msg = '[土壤高温度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度高于 ' + strategy.soil_t_h_value_3 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.low_1:
      msg = '[土壤低温度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.soil_t_l_value_1 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.low_2:
      msg = '[土壤低温度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.soil_t_l_value_2 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.temperature_state.low_3:
      msg = '[土壤低温度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前温度为 ' + attachedInfo.last_value.temperature + '℃, 温度低于 ' + strategy.soil_t_l_value_3 + '℃.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.high_1:
      msg = '[土壤高湿度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.soil_h_h_value_1 + 'RH.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.high_2:
      msg = '[土壤高湿度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.soil_h_h_value_2 + 'RH.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.high_3:
      msg = '[土壤高湿度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度高于 ' + strategy.soil_h_h_value_3 + 'RH.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.low_1:
      msg = '[土壤低湿度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.soil_h_l_value_1 + 'RH.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.low_2:
      msg = '[土壤低湿度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.soil_h_l_value_2 + 'RH.';
      break;
    case StateConfig.soil_th_sensor_state.humidity_state.low_3:
      msg = '[土壤低湿度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前湿度为 ' + attachedInfo.last_value.humidity + 'RH, 湿度低于 ' + strategy.soil_h_l_value_3 + 'RH.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.coData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.co_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.co_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.co_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.co_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.high_1:
      msg = '[一氧化碳浓度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度高于 ' + strategy.co_ppm_h_value_1 + 'ppm.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.high_2:
      msg = '[一氧化碳浓度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度高于 ' + strategy.co_ppm_h_value_2 + 'ppm.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.high_3:
      msg = '[一氧化碳浓度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度高于 ' + strategy.co_ppm_h_value_3 + 'ppm.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.low_1:
      msg = '[一氧化碳浓度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度低于 ' + strategy.co_ppm_l_value_1 + 'ppm.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.low_2:
      msg = '[一氧化碳浓度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度低于 ' + strategy.co_ppm_l_value_2 + 'ppm.';
      break;
    case StateConfig.co_sensor_state.co_ppm_state.low_3:
      msg = '[一氧化碳浓度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co + 'ppm, 浓度低于 ' + strategy.co_ppm_l_value_3 + 'ppm.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.co2Data = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.co2_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.co2_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.co2_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.co2_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.high_1:
      msg = '[二氧化碳浓度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度高于 ' + strategy.co2_ppm_h_value_1 + 'ppm.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.high_2:
      msg = '[二氧化碳浓度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度高于 ' + strategy.co2_ppm_h_value_2 + 'ppm.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.high_3:
      msg = '[二氧化碳浓度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度高于 ' + strategy.co2_ppm_h_value_3 + 'ppm.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.low_1:
      msg = '[二氧化碳浓度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度低于 ' + strategy.co2_ppm_l_value_1 + 'ppm.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.low_2:
      msg = '[二氧化碳浓度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度低于 ' + strategy.co2_ppm_l_value_2 + 'ppm.';
      break;
    case StateConfig.co2_sensor_state.co2_ppm_state.low_3:
      msg = '[二氧化碳浓度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.co2 + 'ppm, 浓度低于 ' + strategy.co2_ppm_l_value_3 + 'ppm.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.luxData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.illumination_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.illumination_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.illumination_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.illumination_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.high_1:
      msg = '[光照强度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度高于 ' + strategy.lux_h_value_1 + 'lux.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.high_2:
      msg = '[光照强度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度高于 ' + strategy.lux_h_value_2 + 'lux.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.high_3:
      msg = '[光照强度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度高于 ' + strategy.lux_h_value_3 + 'lux.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.low_1:
      msg = '[光照强度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度低于 ' + strategy.lux_l_value_1 + 'lux.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.low_2:
      msg = '[光照强度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度低于 ' + strategy.lux_l_value_2 + 'lux.';
      break;
    case StateConfig.illumination_sensor_state.lux_state.low_3:
      msg = '[光照强度3级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前强度为 ' + attachedInfo.last_value.lux + 'lux, 强度低于 ' + strategy.lux_l_value_3 + 'lux.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.smokeData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.smoke_sensor_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.smoke_sensor_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.smoke_sensor_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.smoke_sensor_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    case StateConfig.smoke_sensor_state.smoke_state.high_1:
      msg = '[烟雾浓度1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.smoke + 'ppm, 浓度高于 ' + strategy.smoke_h_value_1 + 'ppm.';
      break;
    case StateConfig.smoke_sensor_state.smoke_state.high_2:
      msg = '[烟雾浓度2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前浓度为 ' + attachedInfo.last_value.smoke + 'ppm, 浓度高于 ' + strategy.smoke_h_value_2 + 'ppm.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.erelayData = function (state, attachedInfo) {
  var msg = '';
  switch (state) {
    case StateConfig.erelay_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线。';
      break;
    case StateConfig.erelay_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线。';
      break;
    default :
      break;
  }
  return msg;
};

eventBase.erelay2Data = function (state, attachedInfo) {
  var msg = '';
  switch (state) {
    case StateConfig.erelay2_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线。';
      break;
    case StateConfig.erelay2_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线。';
      break;
    default :
      break;
  }
  return msg;
};

eventBase.cameraData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.camera_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.camera_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.camera_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.camera_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    default :
      break;
  }

  return msg;
};

eventBase.cameraipData = function (state, attachedInfo) {
  var msg = '';
  var strategy = attachedInfo.strategy;
  switch (state) {
    case StateConfig.cameraip_state.online_state.online:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '上线.';
      break;
    case StateConfig.cameraip_state.online_state.offline:
      msg = attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' + '下线.';
      break;
    case StateConfig.cameraip_state.charge_state.low_1:
      msg = '[电量1级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_1 + '%.';
      break;
    case StateConfig.cameraip_state.charge_state.low_2:
      msg = '[电量2级报警] ' + attachedInfo.info.dev_name + '(' + attachedInfo.info.sn + ') ' +
        '当前电量为 ' + attachedInfo.last_value.charge + '% ,电量低于 ' + strategy.charge_l_value_2 + '%.';
      break;
    default :
      break;
  }

  return msg;
};

