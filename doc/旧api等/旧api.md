<head>
    <title>APIs for test</title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
    <!--<link rel="stylesheet" media="all" href="http://wowubuntu.com/markdown/stylesheets/main.css">-->
    <link rel="stylesheet" media="all" href="wiki.css">
</head>
<body>
<div class="wikistyle">


[TOC]
#API 通用参数说明

-该文档还在调整当中，可能会增加一些参数，在开发过程中随时沟通

##默认返回说明

- 对于返回列表类的请求，请求时没有指定个数，将默认返回20个
- 对于返回列表类的请求，请求时没有指定页值，将默认返回第0页

##特殊参数说明

- common参数
    * 当不传common参数时，将会返回所有设备的通用属性的键值
    * 当common的参数值为null时，则表示不需要common值, 不会返回common的作何信息
    * common参数传入时，后面的参数值为字符串，字符串值为设备通用属性的键值，用逗号分开
        
            示例: 返回共同属性中的online，devname的键值属性
            参数键值: common 
            参数值: online,devname 
            参数值语法说明：将设备通用属性的键值用逗号分开即可，不要有空格

- components参数
    * 当不传components参数时，将会返回所有components的键值，如果指定component_id则会返回指定的component_id的组件
    * 当需要指定component_id时，如果要求所有components返回相同的键值，用以下示例方式返回
      
            示例: 返回组件id 为1,2,3的键值为charge,online
            参数键值: components
            参数值: [1,2,3],[charge,online]
            参数值语法说明:将component_id号用逗号分隔并用[]括起来，再将所有componet_id的相同键值用逗号分隔再用[]括起来，最后前后用逗号分隔
            其它说明: 中间的作何逗号不要有空格; 如果指定了不存在的key将不会返回该值 

- date参数
    * 当不传入时，默认返回当前天的信息
    * 传入时的语法，用以下示例方式返回 

            示例: 返回日期为2015/02/19到2015/2/21号的信息
            参数键值: date 
            参数值: [2015-02-19 00:00:00, 2015-02-22 00:00:00]
            其它说明: 由于要21号全天，所以选择的22号00:00:00
    
###用户的session_token的作用 

    session_token为客户端需要保存在本地的令牌，表示登录状态，在任何需要登录的操作中需要在http的header字段中加入一个标准的Authorization字段

    字段键名为Authorization, 键值为bearer加上一个空格再加上session_token的值，如下：

    Authorization: bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImxseiIsImNyZWF0ZWRBdCI6IjIwMTUtMDMtMTlUMDc6Mzc6NDMuNzA2WiIsImlhdCI6MTQyNjc1MDY2M30.dGZOC_ihogDLtoXyWovUCieWnsIGK5ENmH84FdcOsLk

    下面在api中会要求此api是否需要session_token, 如需要请在http header中加入Authorization字段

#API 定义 


##用户手机注册(RegisterPage)
第一步: 请求短信验证码

方法: POST 

URL: /api/user/send_smscode

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|phone                |1                   |string             |

返回值:

成功: 则http返回200, 消息为{'message': 'sms code already send'}

第二步: 用验证码，帐户密码，帐户名进行注册(如果参数不带帐户名，帐户名将自动用手机号代替)

方法: POST 

URL: /api/user/signup_with_phone

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|username             |0                   |string             |如果不带username，则将创建帐户的帐户为设为手机号
|password             |1                   |string             |暂时未对密码的长短等做要求，前端先控制
|phone                |1                   |string             |
|sms_code             |1                   |string             |

返回值:

成功: 则http返回为200, 返回值为

        {
            username: xxxx,
            phone: xxxx,
            session_token: xxxxxxxxxxxxxxxxx
        }
    
       注册成功后会自动变为登录状态，会返回给客户端session_token， 在以后的请求中如需登录状态的都需要在http header中加入此token

       本地帐户如果需要退出登录，把存储session_token的cookie或者storage删除即可，另外，以后在登录时可以用username, password来登录

失败: 为400, 401等错误码


##用户登录(LoginPage)

方法: POST 

URL: /api/user/login

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|username             |1                   |string             |如果在注册时没有填username，则帐户名即为手机号，如添写了就用帐户名
|password             |1                   |string             |

返回值:

成功: 则http返回200, 返回消息为
        {
            username: xxxx,
            session_token: xxxxxxxxxxxxxxxxx
        }


##用户第三方注册(RegisterThird)
方法: POST 

URL: /api/user/signup_with_third

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|username             |1                   |string             | 第三方注册后让用户设定用户名
|password             |1                   |string             | 用户密码
|type                 |1                   |string             | qq, weixin, sina
|open_id              |1                   |string             | 第三方的open_id或者uid
|access_token         |1                   |string             | 第三方的access_token

返回值:

成功: 则http返回200, 并返回用户相关信息 


##用户第三方登录(LoginThird)
方法: POST 

URL: /api/user/login_with_third

用户通过第三方登录sdk获取到access_token, open_id后将这些参数传到服务器，服务器返回session_token

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|type                 |1                   |string             | qq, weixin, sina
|open_id              |1                   |string             | 第三方的open_id或者uid
|access_token         |1                   |string             | 第三方的access_token

返回值:

成功: 则http返回200, 并返回用户相关信息 



##用户修改密码

方法: POST 

URL: /api/user/change_password
     (需要登录状态下完成，http header中要带session_token)

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|username             |1                   |string             |如果在注册时没有填username，则帐户名即为手机号，如添写了就用帐户名
|password             |1                   |string             |
|password_new         |1                   |string             |

返回值:

成功: 则http返回200, 消息为{'message': 'update password success'}


##获取用户帐号信息(MyAccountPage)

方法: GET 

URL: /api/user/info
     (需要登录状态下完成，http header中要带session_token)

参数: 无

返回值:

成功: 则http返回200, 消息为

    {
        username: xxxx,
        phone: xxxx,
        nickname: xxxx,
        contacts: [{name: xxx, phone:xxx}, {...}, ...]
    }


##更新用户昵称(MyAccountPage)

方法: POST 

URL: /api/user/nickname
     (需要登录状态下完成，http header中要带session_token)

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|nickname             |1                   |string             |

返回值:

成功: 则http返回200, 消息为{message: 'update nickname ok'}


##用户添加需要查看的设备 (MainPage右边添加想要查询的设备)

方法: POST 

URL: /api/user/add_device
     (需要登录状态下完成，http header中要带session_token)

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |如果在注册时没有填username，则帐户名即为手机号，如添写了就用帐户名
|alias                |1                   |string             |请一定要给设备取一个别名

返回值:

成功: 则http返回200, 消息为{'message': 'add device ok'}


##用户删除需要查看的设备 (MainPage右边添加想要查询的设备)

方法: POST 

URL: /api/user/rm_device
     (需要登录状态下完成，http header中要带session_token)

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |如果在注册时没有填username，则帐户名即为手机号，如添写了就用帐户名

返回值:

成功: 则http返回200, 消息为{'message': 'remove device ok'}



##用户添加报警手机(MyAccountPage)
方法: POST 

URL: /api/user/add_contact
要求在登录状态下调用

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|contact_name         |1                   |string             |联系人名字
|contact_number       |1                   |string             |联系人的电话号码

返回:

如果成功, 消息为{message: 'add contact ok'}, 以后调用/api/user/info获取用户信息时会有相应的联系人信息


##用户删除报警手机(MyAccountPage)
方法: POST 

URL: /api/user/rm_contact
要求在登录状态下调用

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|contact_number       |1                   |string             |联系人的电话号码

注：由于在存储时要求电话号码是唯一的，而人名没有要求唯一，所以要求传入电话号码

返回:

如果成功, 消息为{message: 'rm contact ok'}, 再调用/api/user/info获取用户信息时会有相应的联系人信息已被删除


##（注意：目前为了测试和演示时方便，获取设备信息时不用登录状态，以后的api可能会根据不同的权限限制某些api的功能而调整api）
##获取所有设备列表 (暂时在手机端发现没有需要该api的页面)
方法: GET

URL: /api/device/list

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|common               |0                   |string             |不带参数默认返回全部, 不需要则传null,详见通用参数说明
|components           |0                   |string             |不带参数默认返回全部，不需要则传null,详见通用参数说明
|page                 |0                   |int                |如不带则默认为0
|limit                |0                   |int                |如不带则默认为20

###示例1(不带参数):

    request: 
    get localhost:1337/api/device/list

    response:
    [
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "common": {
                "dev_name": "yydev1-chengdu-0",
                "dev_location": "chengdu",
                "utc_timestamp": 1425970581,
                "utc_offset": 28800,
                "online": true,
                "groups": [],
                "alarm_list": []
            },
            "components": [
            {
                "component_token": "component_token-humtemp-20150201",
                "component_id": 1,
                "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                "device_type": "humidity",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 90,
                "humidity": 4.68,
                "temperature": 11.62
            },
            {
                "component_token": "component_token-erelay-20150201",
                "component_id": 2,
                "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                "device_type": "erelay",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 50,
                "status": 1
            },
            {
                "component_token": "component_token-camera-20150201",
                "component_id": 3,
                "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                "device_type": "camera",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 92,
                "camera": "dfsfdsafdafdafdsafdaeeeerr"
            }
            ]
        },
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-2",
            "common": {
                "dev_name": "yydev1-chengdu-2",
                "dev_location": "chengdu",
                "utc_timestamp": 1425970581,
                "utc_offset": 28800,
                "online": true,
                "groups": [],
                "alarm_list": []
            },
            "components": [
            {
                "component_token": "component_token-humtemp-20150201",
                "component_id": 1,
                "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                "device_type": "humidity",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 90,
                "humidity": 4.57,
                "temperature": 2.87
            },
            {
                "component_token": "component_token-erelay-20150201",
                "component_id": 2,
                "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                "device_type": "erelay",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 50,
                "status": 1
            },
            {
                "component_token": "component_token-camera-20150201",
                "component_id": 3,
                "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                "device_type": "camera",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 92,
                "camera": "dfsfdsafdafdafdsafdaeeeerr"
            }
            ]
        },
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-1",
            "common": {
                "dev_name": "yydev1-chengdu-1",
                "dev_location": "chengdu",
                "utc_timestamp": 1425970581,
                "utc_offset": 28800,
                "online": true,
                "groups": [],
                "alarm_list": []
            },
            "components": [
            {
                "component_token": "component_token-humtemp-20150201",
                "component_id": 1,
                "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                "device_type": "humidity",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 90,
                "humidity": 20.38,
                "temperature": 11.04
            },
            {
                "component_token": "component_token-erelay-20150201",
                "component_id": 2,
                "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                "device_type": "erelay",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 50,
                "status": 1
            },
            {
                "component_token": "component_token-camera-20150201",
                "component_id": 3,
                "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                "device_type": "camera",
                "update_at": "2015-03-10 22:56:21",
                "online": 1,
                "charge": 92,
                "camera": "dfsfdsafdafdafdsafdaeeeerr"
            }
            ]
        }


    ]


###示例2(指定common参数, 不带components参数):

    request: 
    get localhost:1337/api/device/list?common=online,dev_name&components=null

    response:
    [
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "common": {
                "online": true,
                "alarm_list": []
            }
        },
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-2",
            "common": {
                "online": true,
                "alarm_list": []
            }
        },
        {
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-1",
            "common": {
                "online": true,
                "alarm_list": []
            }
        }
    ]


##获取指定设备的信息 (MainPage, 发送指定dev_uuid, 返回该pad设备下传回的大棚信息)
方法: GET

URL: /api/device/info

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |
|common               |0                   |string             |
|components           |0                   |string             |

其他:
components中的charge即为电量的百分比，alias即为该传感器的别名, status即为开关状态

###示例(不带参数, common和components参数用法同上):
    request:
    get localhost:1337/api/device/info/?dev_uuid=yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "common": {
                "dev_name": "yydev1-chengdu-0",
                "dev_location": "chengdu",
                "utc_timestamp": 1426397672,
                "utc_offset": 28800,
                "online": true,
                "location": {
                    "address": "四川省成都市青羊区王家塘街84号",
                    "country": "中国",
                    "province": "四川省",
                    "city": "成都市",
                    "city_code": "75",
                    "district": "青羊区",
                    "street": "王家塘街",
                    "street_number": "84号",
                    "lat": 30.67994285,
                    "lng": 104.06792346,
                    "devcurdata": "5502fff03acfc37d5270d506"
                }
            },
            "components": [
            {
                "component_token": "component_token-humtemp-20150201",
                "component_id": 1,
                "alias": "humidiy1",
                "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                "device_type": "humidity-temperature",
                "update_at": "2015-03-15 21:34:32",
                "online": 1,
                "charge": 90,
                "humidity": 12.24,
                "temperature": 5.88
            },
            {
                "component_token": "component_token-erelay-20150201",
                "component_id": 2,
                "alias": "haha",
                "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                "device_type": "erelay",
                "update_at": "2015-03-15 21:34:32",
                "online": 1,
                "charge": 50,
                "status": 1
            },
            {
                "component_token": "component_token-camera-20150201",
                "component_id": 3,
                "alias": "haha",
                "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                "device_type": "camera",
                "update_at": "2015-03-15 21:34:32",
                "online": 1,
                "charge": 92,
                "camera": "dfsfdsafdafdafdsafdaeeeerr"
            }
        ]
    }


##获取指定设备的图片信息(MainPage, 发送指定dev_uuid, 返回该pad设备下传回的大棚对应的图片信息列表)
方法: GET

URL: /api/picture/list

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |指定大棚设备
|start_date           |1                   |string             |指定日期，按 YYYY-MM-DD来传
|page                 |0                   |int                |限定传第几页的图片, 默认为0
|limit                |0                   |int                |限定传几张图片

返回结果将由降底排列，即最新的图片将在列表的最前



##获取指定设备的统计分析信息 (目前手机端无需用此api)
方法: GET

URL: /api/analysis/result

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |
|component_id         |1                   |string             |为设备中该下挂组件的id
|date_mode            |1                   |string             |请固定添写为server
|date                 |1                   |string             |
|scope                |1                   |string             |可选为hour, min, day
|type                 |1                   |string             |为想要的类型，为humidity, temperature


###示例1(以小时为例):

    注: 返回的结果中的data即为统计分析的平均数据，data数组的个数由date的起止时间除以scope得到，

        比如以下24个小时的时间中，scope为hour, 则返回的数组为24个, 如果为min则为24*60个

    request:
    get localhost:1337/api/analysis/result?date_mode=server&scope=hour&type=humidity&dev_uuid=yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0&date=[2015-03-10 00:00:00,2015-03-11 00:00:00]&component_id=1

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "component_id": 1,
            "date": "[2015-03-10 00:00:00,2015-03-11 00:00:00]",
            "type": "humidity",
            "scope": "hour",
            "data": [
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            12.09,
            12.75
                ]
    }


###示例2(以天为例):

    request:
    get localhost:1337/api/analysis/result?date_mode=server&scope=day&type=humidity&dev_uuid=yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0&date=[2015-03-10 00:00:00,2015-03-11 00:00:00]&component_id=1

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "component_id": 1,
            "date": "[2015-03-10 00:00:00,2015-03-11 00:00:00]",
            "type": "humidity",
            "scope": "day",
            "data": [
                12.67
            ]
    }


###示例3(以分为例):

    request:
    localhost:1337/api/analysis/result?date_mode=server&scope=min&type=humidity&dev_uuid=yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0&date=[2015-03-10 23:10:00,2015-03-10 23:16:00]&component_id=1

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "component_id": 1,
            "date": "[2015-03-10 23:10:00,2015-03-10 23:16:00]",
            "type": "humidity",
            "scope": "min",
            "data": [
                13.34,
                12.43,
                14.73,
                10.74,
                10.8,
                13.29
            ]
    }



##更新设备的别名 (手机端在用户编辑设备页可用此api)
方法: POST 

URL: /api/device/dev_alias

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |
|alias                |1                   |string             |


###示例:
    request:
    post 114.215.149.129:1337/api/device/dev_alias
    参数:
    dev_uuid: yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0
    alias: 大棚(西红柿)

    返回的是更新后的设备信息，在dev_alias中名字已经改变

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
            "dev_type": "yydev1",
            "remote_address": {
                "ip": "127.0.0.1",
                "port": 51084
            },
            "online": true,
            "content": {
                "header": {
                    "version": 1,
                    "subversion": 0,
                    "sync": "imccim"
                },
                "body": {
                    "dev_uuid": "76c13393-6b5f-49ed-8850-5b77e879264e-0",
                    "ccp_token": "ccp_token-yydev1-20150201",
                    "dev_type": "yydev1",
                    "notify_action": "processParaMeta",
                    "common": {
                        "dev_name": "yydev1-chengdu-0",
                        "dev_location": "chengdu",
                        "utc_timestamp": 1426398016,
                        "utc_offset": 28800
                    },
                    "components": [
                    {
                        "component_token": "component_token-humtemp-20150201",
                        "component_id": 1,
                        "alias": "humidiy1",
                        "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                        "device_type": "humidity-temperature",
                        "update_at": "2015-03-15 21:40:16",
                        "online": 1,
                        "charge": 90,
                        "humidity": 12,
                        "temperature": 5.76
                    },
                    {
                        "component_token": "component_token-erelay-20150201",
                        "component_id": 2,
                        "alias": "haha",
                        "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                        "device_type": "erelay",
                        "update_at": "2015-03-15 21:40:16",
                        "online": 1,
                        "charge": 50,
                        "status": 1
                    },
                    {
                        "component_token": "component_token-camera-20150201",
                        "component_id": 3,
                        "alias": "haha",
                        "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                        "device_type": "camera",
                        "update_at": "2015-03-15 21:40:16",
                        "online": 1,
                        "charge": 92,
                        "camera": "dfsfdsafdafdafdsafdaeeeerr"
                    }
                    ]
                }
            },
            "location": "55057493137e41c3598b11b7",
            "dev_alias": "大棚(西红柿)",
            "isgeogrouped": true
    }
    



##更新设备的组件(传感器等)的别名
方法: POST 

URL: /api/device/dev_component_alias

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |
|component_id         |1                   |int                |
|alias                |1                   |string             |


###示例:
    request:
    post 114.215.149.129:1337/api/device/dev_component_alias
    参数:
    dev_uuid: yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0
    component_id: 1
    alias: 传感器1 

    更新的时间表在设备信息的component_alias中

    response:
    {
        "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
        "dev_type": "yydev1",
        "remote_address": {
            "ip": "127.0.0.1",
            "port": 51084
        },
        "online": true,
        "content": {
            "header": {
                "version": 1,
                "subversion": 0,
                "sync": "imccim"
            },
            "body": {
                "dev_uuid": "76c13393-6b5f-49ed-8850-5b77e879264e-0",
                "ccp_token": "ccp_token-yydev1-20150201",
                "dev_type": "yydev1",
                "notify_action": "processParaMeta",
                "common": {
                    "dev_name": "yydev1-chengdu-0",
                    "dev_location": "chengdu",
                    "utc_timestamp": 1426398695,
                    "utc_offset": 28800
                },
                "components": [
                {
                    "component_token": "component_token-humtemp-20150201",
                    "component_id": 1,
                    "ieee": "56c13393-6aaf-49ed-8850-5b77e879264e",
                    "device_type": "humidity-temperature",
                    "update_at": "2015-03-15 21:51:35",
                    "online": 1,
                    "charge": 90,
                    "humidity": 17.59,
                    "temperature": 5.57
                },
                {
                    "component_token": "component_token-erelay-20150201",
                    "component_id": 2,
                    "alias": "haha",
                    "ieee": "56c13393-6ccf-49ed-8850-5b77e879264e",
                    "device_type": "erelay",
                    "update_at": "2015-03-15 21:51:35",
                    "online": 1,
                    "charge": 50,
                    "status": 1
                },
                {
                    "component_token": "component_token-camera-20150201",
                    "component_id": 3,
                    "alias": "haha",
                    "ieee": "56c13393-6ddf-49ed-8850-5b77e879264e",
                    "device_type": "camera",
                    "update_at": "2015-03-15 21:51:35",
                    "online": 1,
                    "charge": 92,
                    "camera": "dfsfdsafdafdafdsafdaeeeerr"
                }
                ]
            }
        },
        "location": "55057493137e41c3598b11b7",
        "dev_alias": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-0",
        "isgeogrouped": true,
        "component_alias": {
           "1": "传感器1"
        }
           
    }



##远程控制继电机的开关状态(ShedPage)
方法: POST 

URL: /api/remote/do_cmd

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|ccp_token            |1                   |string             |请固定填为'ccp_token-yydev1-20150201'
|dev_uuid             |1                   |string             |请添为pad设备的dev_uuid
|component_id         |1                   |int                |请添为继电器设备的组件id
|params               |1                   |json               |此参数很重要，为json格式

params的参数为json格式，请按{"cmd": "set_eralay_switch","component_id":1,"status":1} 格式添加

其中component_id为你在获取设备信息时得知的该继电器所在组件的id编号， status为0表示关闭该设备，1为打开


##远程控制继电机的前进后退操作(ShedPage, 如果该继电器支持该操作)
方法: POST 

URL: /api/remote/do_cmd

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|ccp_token            |1                   |string             |请固定填为'ccp_token-yydev1-20150201'
|dev_uuid             |1                   |string             |请添为pad设备的dev_uuid
|component_id         |1                   |int                |请添为继电器设备的组件id
|params               |1                   |json               |此参数很重要，为json格式

params的参数为json格式，请按{"cmd": "set_eralay_action","component_id":1,"action":"forward"} 格式添加

其中component_id为你在获取设备信息时得知的该继电器所在组件的id编号，action为forward表示前进，back表示后退 



##获取设备中组件的自动化时间表(SchedulePage)
方法: GET 

URL: /api/device/component_schedule

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |请添为pad设备的dev_uuid
|component_id         |1                   |int                |请添为继电器设备的组件id

返回:

返回的结果为一个字符串，该字符串即为时间表数组用JSON字符序列化后的字符串，在前端用JSON.parse(schedule)后

即为数组

该数组的定义可以前端自行确定，服务器只是认为是一个字符串进行储存，推荐方式如下：

[
    {
        time: '07:00:00',
        action: 'open'
    },
    {
        time: '08:00:00',
        action: 'close'
    },
]

JSON.stringify()字符序列化后为: '[{"time":"07:00:00","action":"open"},{"time":"08:00:00","action":"close"}]'

服务器上即储存该字符串

如果给定的组件没有时间表则反回401, 消息为{err: 'no schedule'}


##上传时间表给设备中的组件(SchedulePage)
方法: POST 

URL: /api/device/component_schedule

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |请添为pad设备的dev_uuid
|component_id         |1                   |int                |请添为继电器设备的组件id
|schedule             |1                   |string             |一个时间表数组用json字符串序列化后的字符串

返回:

如果成功, 消息为{message: 'update schedule ok'}

更新的时间表在设备信息的component_schedule中


##获取农作物名称列表(SchedulePage)
方法: GET 

URL: /api/plunt_list

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|

返回:

如果成功, 消息为列表

###示例：
    request:
    get 114.215.149.129:1337/api/plunt_list

    response: 
    [
        {
            "id": 1,
            "name": "小麦",
            "category": "粮食作物",
            "class": "被子植物",
            "gang": "单子叶植物",
            "ke": "禾本科植物",
            "other": "大田作物、谷类作物、禾谷类作物、小粒谷类作物"
        },
        {
            "id": 2,
            "name": "大麦",
            "category": "粮食作物",
            "class": "被子植物",
            "gang": "单子叶植物",
            "ke": "禾本科植物",
            "other": "大田作物、谷类作物、禾谷类作物、小粒谷类作物"
        },
        {
            "id": 3,
            "name": "黑麦",
            "category": "粮食作物",
            "class": "被子植物",
            "gang": "单子叶植物",
            "ke": "禾本科植物",
            "other": "大田作物、谷类作物、禾谷类作物、小粒谷类作物"
        },

        ...
    ]


##获取指定省市和农作物的总体统计信息(InfomationPage)
方法: GET 

URL: api/devgeogroup/info

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|province_name        |1                   |string             |请按设备信息中给定的省市名称来填写
|city_name            |0                   |string             |可以指定市，未指定将为'all', 如果添'all',将统计所有市
|plant_name           |1                   |string             |农作物名称，请按plant农作物列表获取接口中的名称来填写

返回:

###示例 
   request: 
   get 114.215.149.129:1337/api/devgeogroup/info?city_name=all&province_name=四川省&plant_name=蕃茄

   response:
    {
        "count": 20,
            "area": 6000,
            "expectation": 6000,
            "harvest": [
            {
                "month": 4,
                "weight": 60000
            }
        ]
    }

    其中，count为大棚个数，area单位为平方米，expectation为年预估产量，harvest中为各个大棚的总和，month单位为月，weight为这个月的所有大棚预估产量


##获取指定省市和农作物的总体地位位置经纬度坐标信息(InfomationPage)
方法: GET 

URL: api/devgeogroup/info

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|province_name        |1                   |string             |请按设备信息中给定的省市名称来填写
|city_name            |0                   |string             |可以指定市，未指定将为'all', 如果添'all',将统计所有市
|plant_name           |1                   |string             |农作物名称，请按plant农作物列表获取接口中的名称来填写

返回:

###示例 
   request: 
   get 114.215.149.129:1337/api/devgeogroup/location_info?city_name=all&province_name=四川省&plant_name=蕃茄

   response:
   [
    {
        "lat": 30.67994285,
            "lng": 104.06792346
    },
    {
        "lat": 30.67994285,
        "lng": 104.06792346
    },
    {
        "lat": 30.67994285,
        "lng": 104.06792346
    },
    {
        "lat": 30.67994285,
        "lng": 104.06792346
    },
    {
        "lat": 30.67994285,
        "lng": 104.06792346
    },
    {
        "lat": 30.67994285,
        "lng": 104.06792346
    },
    ]



##获取大棚设备报警列表(ShedPage)
方法: GET 

URL: /api/alarm/list

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|dev_uuid             |1                   |string             |
|component_id         |1                   |string             |
|dev_type             |1                   |string             |请固定添 yydev1
|start_date           |0                   |string             |按 YYYY-MM-DD HH:MM:SS格式
|end_date             |0                   |string             |同上
|page                 |0                   |string             |指定第几页
|limit                |0                   |string             |限定个数

注：在返回结果中按降底排，即最新的报警在列表数组的第一个

返回:

###示例 
   request: 
   get 114.215.149.129:1337/api/alarm/list?dev_uuid=yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-4&component_id=1&dev_type=yydev1

   response:
   [
        {
            "date": "2015-03-27T09:58:40.656Z",
            "dev_type": "yydev1",
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-4",
            "alarm_type": "上下线",
            "alarm_val": "设备上线"
        },
        {
            "date": "2015-03-27T09:55:04.846Z",
            "dev_type": "yydev1",
            "dev_uuid": "yydev1-76c13393-6b5f-49ed-8850-5b77e879264e-4",
            "alarm_type": "上下线",
            "alarm_val": "设备上线"
        }
    ]



##上传用户返馈信息(MorePage)
方法: POST 

URL: /api/advice

参数:

|名称                 |必须                |类型               |备注                       |
|---------------------|:-------------------|:------------------|:--------------------------|
|advice               |1                   |string             |意见







