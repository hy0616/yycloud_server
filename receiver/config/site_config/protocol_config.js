var path = require('path');
var dirname = path.dirname(path.dirname(__dirname)) + '/data/site_data/';
module.exports = {
  protocol_processor: {
    'add_custom_alarm_strategy': dirname + 'add_cas_processor',
    'update_custom_alarm_strategy': dirname + 'update_cas_processor',
    'delete_custom_alarm_strategy': dirname + 'delete_cas_processor',
    'assign_shed_alarm_strategy': dirname + 'assign_sas_processor',
    'delete_shed_alarm_strategy': dirname + 'delete_sas_processor',
    'get_shed_alarm_strategy': dirname + 'get_sas_processor',
    'delete_unread_event': dirname + 'delete_ue_processor',
    'user_assign_smartgate':dirname + 'user_as_processor',
    'update_smartgate_alias':dirname + 'update_sa_processor',
    'update_device_alias':dirname + 'update_da_processor'
  },
}