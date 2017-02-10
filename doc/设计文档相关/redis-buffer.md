#Redis缓存设计

***所有 refer 表示参照项目receiver/config/alarm_config/event_state.js中对应的值***

##1.当前在线的网关smartgate和zigbee设备数
> current_online_smartgate_count：当前在线网关数量
> current_online_device_count：当前在线设备数量
> smartgate_total_num：数据库中的网关数量
> device_total_num：数据库中所有设备数量

##2.所有网关smartgate的状态信息
> hashmap类型
> * key为：'smartgateinfos:' + 设备sn号
> * field和value分别为：属性名和对应的属性值，包括：
> >
```
	online_state: 'refer'，
	sn: '',
    dev_name: '',
    dev_location: '',
    lng: 0.0,
    lat: 0.0,
    contact_name: '',
    contact_number: '',
    area: '',
    plant_name: '',
    expectation: '',
    harvest_time: '',
    harvest_weight: ''
    utc_timestamp: 1439840637		// 时间戳，用于检测是否掉线
    utc_offset: 28800				// 时区
```

##3.所有设备device的状态信息
> hashmap类型
> * key为：'deviceinfos:' + 设备sn号
> * field和value分别为：属性名和对应的属性值，根据不同设备类型，包括

> ###a.空气温湿度传感器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    temperature_state:'refer'
    humidity_state:'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    air_temperature:0.0
    air_humidity:0.0
```
> ###b.土壤温湿度传感器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    temperature_state:'refer'
    humidity_state:'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    soil_temperature:0.0
    soil_humidity:0.0
```
> ###c.光照传感器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    lux_state: 'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    lux: 0.0
```
> ###d.CO传感器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    co_ppm_state: 'refer': 'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    co_ppm:0
```
> ###e.CO2传感器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    co2_ppm_state: 'refer': 'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    co2_ppm:0
```
> ###f.卷帘机控制器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    /*rolling_state: 'refer'*/
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    status: 0 | 1 | 2,			// 0 up 1 down  2 stop
```
> ###g.普通继电器:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    /*itch_state: 'refer'*/
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    status: 0 | 1 ,			//0 up 1 down
```
> ###h.拍照镜头:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
    camera:''
```
> ###h.摄像头:
>
```
	online_state: 'refer'
    charge_state: 'refer'
    sn:''
    owner:''
    dev_name:''
    dev_type:''
    user:''
    password:''
    charge:0
```

##3.网关smartgate和设备device之间的映射关系
> * hashmap类型(网关-设备)
> > * key为：'smartgatedevice:' + 网关SN号
> > * field和value分别为：设备的SN号和设备的类型
> * hashmap类型(设备-网关)
> > * key为：'device_smartgate'
> > * field和value分别为：设备SN号和网关SN号

##4.用户user和网关smartgate之间的映射关系
> * hashmap类型(用户-网关)
> > * key为：'usersmartgate:' + 用户的username(可变)
> > * field和value分别为：网关SN号和网关类型('smartgate')
> * hashmap类型(网关-用户)
> > * key为：'smartgate_user'
> > * field和value分别为：网关SN号和用户username(可变)

##5.报警策略
> * hashmap类型，对应default_alarm_strategy
> > * key为：'default_as:' + strategy_id
> > * field和value分别为：策略属性和对应的属性值
> * hashmap类型，对应customer_alarm_strategy
> > * key为：'custom_as' + strategy_id
> > * field和value分别为：策略属性和对应的属性值
> * hashmap类型，对应temp_alarm_strategy
> > * key为：'temp_as' + strategy_id
> > * field和value分别为：策略属性和对应的属性值

##6.网关smartgate和报警策略的对应关系
> * hashmap类型
> > * key为'smartgate_as:' + smartgate的SN号
> > * field和value分别为：
> >
```
	strategy_type: strategyType,     报警策略类型'default | customer | temp'
    strategy_id: strategyId		   对应的报警策略的id
```

##7.未读的事件
> * hashmap类型
> > * key为'events:' + 用户的user_name
> > * field为事件的event_id，value为事件详细内容
> > * value中添加一个sn属性，为产生event的设备(可为主机，可为其它设备)sn

##8.已经地理分组的网关
> * set类型
> > * key为'geogrouped_smartgate'
> > * 集合元素为smartgate的sn

##9.已经被删除的设备deleted\_devices
> * set类型
> > * key为'deleteddevices:' + smartgate的SN号
> > * 集合元素为被删除的终端设备device的SN号

* 存储被用户删掉的终端设备，防止由于主机上传的UDP包的异步处理导致被删除设备又被重新添加；
* 服务器端在对处理主机发送的UDP包之后需要进行检测，如果：
  > a. redis缓存中存在该设备的记录，则重新执行一次删除设备流程；
  > b. redis缓存中不存在改设备的记录，则从set中删除改设备的记录。

##10.所有用户信息
> * hashmap类型
> > * key为'userinfos:' + 用户的user_name
> > * field为用户的各属性，value为属性值

##11.映射所有用户的用户名和其installationId(leancloud消息推送)
> * hashmap类型(用户-leancloud)
> > * key为'userleancloud:'
> > * field为用户的username，value为用户的installationId
> * hashmap类型(leancloud-用户)
> > * key为'leanclouduer:'
> > * field为用户的installationId，value为用户的username