var path = require('path');
var dirname = path.dirname(path.dirname(__dirname)) + '/data/event/';

module.exports = {
  event_processor_config: {
    'smartgate': dirname + 'smartgate_processor',
    'humidity-temperature': dirname + 'air_th_processor',
    'co': dirname + 'co_processor',
    'co2': dirname + 'co2_processor',
    'soil-th': dirname + 'soil_th_processor',
    illumination: dirname + 'illumination_processor',
    'erelay': dirname + 'erelay_processor',
    'erelay2': dirname + 'rolling_processor',
    'cameraip': dirname + 'cameraip_processor',
    'smoke': dirname + 'smoke_processor'
  }
}