#服务器端与PAD端的字段对应

##remote\_address
|pad端|服务器端|
|--|--|
|ra|remote_address|


##body
|pad端|服务器端|
|--|--|
|sn|dev_uuid|
|na|notify_action|
|dt|dev_type|
|ct|ccp_token|
|mm|meta_msg|

##body.header==>body.h
|pad端|服务器端|
|--|--|
|bl|bodylen|
|sv|subversion|
|v|version|
|sc|sync|
|seq|seq|

##body.common==>body.c
|pad端|服务器端|
|--|--|
|ut|utc_timestamp|
|uo|utc_offset|
|dn|dev_name|
|dl|dev_location|
|lat|lat|
|lng|lng|
|pn|plant_name|
|ar|area|
|ep|expectation|
|pt|plant_time|
|ht|harvest_time|
|hw|harvest_weight|
|cna|contact_name|
|cnu|contact_number|


##body.components==>body.cs
|pad端|服务器端|
|--|--|
|sn|ieee|
|da|default_alias|
|dt|device_type|
|det|device_extend_type|
|ch|charge|
|tp|temperature|
|hm|humidity|
|co|co_ppm|
|co2|co2_ppm|
|lux|lux|
|st|status|
|ca|camera|
|user|user|
|pw|password|
|on|online|
