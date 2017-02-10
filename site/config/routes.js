/**
 * Routes
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.routes = {

  // Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, etc. depending on your
  // default view engine) your home page.
  // (Alternatively, remove this and add an `index.html` file in your `assets` directory)

//  'get /': 'HomeController.index',
  'get /': 'HomeController.login',
  'get /login': 'HomeController.login',
    'get  /reset': "HomeController.reset",
  'get /main': 'HomeController.index',

  'get  /api/plunt_list': 'PluntController.getList',

  //'post /api/user/signup_or_login_with_phone': "UserController.signUpOrlogInWithPhone",

  // http://120.27.47.4:xxx/admin
  'get  /admin': 'HomeController.index',

  //'post /api/devices': 'DevCurDataController.create',           -----------------------------------------unused
  //'post /api/devices/component_schedule': 'DevCurDataController.updateSchedule',        // unused
  //'get  /api/devices/component_schedule': 'DevCurDataController.getSchedule',           // unused
  //'post /api/devices/update_location': 'DevCurDataController.updateLocation',           // unused

  'get  /api/analysis/bind_key_list': 'Devanalysiscontroller.getBindKeysListByDate',
  //'get  /api/analysis/result': 'DevanalysisController.getAnalysisResult',

  //'post /api/location': 'LocationController.create',                                    // unused
  //'get  /api/location/coor': "LocationController.getCoorByIp",                          // unused
  //'get  /api/location/address': "LocationController.getAddressByCoor",                  // unused

  //devgroup
  'post /api/devgroup': 'DevgroupController.create',                                 //unused    2016.12.21
  'put  /api/devgroup': 'DevgroupController.destroy',                                 //unused    2016.12.21
//  'delete /api/devgroup': 'DevgroupController.destroy',
//  'post /api/devgroup': 'DevgroupController.destroy',
  'get  /api/devgroup': 'DevgroupController.index',                                  //unused    2016.12.21
  'post /api/devgroup/add_device': 'DevgroupController.addDevice',                    //unused    2016.12.21
  'post /api/devgroup/add_device_list': 'Devgroupcontroller.addDeviceList',            //unused    2016.12.21
  'post /api/devgroup/rm_device': 'DevgroupController.rmDevice',                       //unused    2016.12.21
  'get  /api/devgroup/device_list': 'DevgroupController.getDeviceList',                //unused    2016.12.21

  'get  /api/devgeogroup': 'DevGeoGroupController.index',                               //unused    2016.12.21
  //'get  /api/devgeogroup/province_list': 'DevGeoGroupController.getProvinceList',
  //'get  /api/devgeogroup/province_city_list': 'DevGeoGroupController.getProvinceCityList',
  //'get  /api/devgeogroup/city_list': 'DevGeoGroupController.getCityList',
  'get  /api/devgeogroup/pad_list': 'DevGeoGroupController.getPadList',       // unused
  'get  /api/devgeogroup/info': 'DevGeoGroupController.getProvinceSumInfo',     // unused
  'get  /api/devgeogroup/location_info': 'DevGeoGroupController.getProvinceLocation',       //unused

  //remote control
  //'post /api/remote/do_cmd': 'RemoteController.doCmd',
  'get  /api/remote/get_cmd_list': 'RemoteController.getCmdList',                     //unused    2016.12.21
  'get  /api/remote/get_cmd': 'RemoteController.getCmd',                              //unused    2016.12.21

  'post /api/devices': 'AdviceController.create',

  //alarm strategies
  'get /api/default_alarmstrategies': 'AlarmStrategyController.getDefaultAlarmStrategies',

  'get /api/users/custom_alarmstrategies': 'AlarmStrategyController.getCustomAlarmStrategies',
  'post /api/users/custom_alarmstrategies': 'AlarmStrategyController.addCustomAlarmStrategy',
  'put /api/users/custom_alarmstrategies/:id': 'AlarmStrategyController.updateCustomAlarmStrategy',
  'delete /api/users/custom_alarmstrategies/:id': 'AlarmStrategyController.deleteCustomAlarmStrategy',

  //'get /api/users/temp_alarmstrategies': 'AlarmStrategyController.getTempAlarmStrategies',

  'get /api/users/smartgates/:shedId/alarmstrategy_settings': 'AlarmStrategyController.getShedAlarmStrategy',
  'post /api/users/smartgates/:shedId/alarmstrategy_settings': 'AlarmStrategyController.assignShedAlarmStrategy',
  'delete /api/users/smartgates/:shedId/alarmstrategy_settings': 'AlarmStrategyController.deleteShedAlarmStrategy',

  // alarm events
  'get /api/users/alarmevents': 'EventController.getUserEvent',
  'put /api/users/alarmevents': 'EventController.setEventRead',


  //sessions
  'post /api/sessions': 'UserController.logIn',
  //'get /api/sessions/': 'UserController.getUserSession',        // get the user's session     to do...
  //'put /api/sessions/': 'UserController.updateUserSession',       // update the user's session    to do...
  //'delete /api/sessions/': 'UserController.deleteUserSession',    // log out    to do...
  'post /api/thirdsessions': 'UserController.logInWithThird',

  //users
  'post /api/users': 'UserController.signUp',
  'get /api/users': 'UserController.getUser',         // info without the smartgates
  //'put /api/users/:id': 'UserController.updateUser',            // update the user's info  to do...
  //'delete /api/users/:id': 'UserController.deleteUser'    // delete a user    to do...

  'post /api/users/phones': "UserController.signUpWithPhone",

  'post /api/users/nicknames': 'Usercontroller.updateNickname',
  'post /api/users/contacts': 'Usercontroller.addContact',
  'delete /api/users/contacts': 'Usercontroller.deleteContact',
  'put /api/users/passwords': "UserController.changePassword",
  'post /api/users/passwords': "UserController.resetPassword",          //through the email or something else

  'get /api/users/exists': 'UserController.checkExsit',
  'post /api/thirdusers': 'UserController.signUpWithThird',

  'get /api/users/infos': 'UserController.getUserInfo',         // info with smartgates

  'get /api/users/smartgates': 'UserController.getSmartGateByUser',
  'post /api/users/smartgates': 'UserController.addSmartGate',
  'delete /api/users/smartgates/:id': 'UserController.rmSmartGate',

  'get /api/users/smartgates/sns': 'UserController.getSmartGateSnsByUser',

  'get /api/users/smscodes': "UserController.sendSmsCode",
  'get /api/users/emails': "UserController.sendResetEmail",     //邮箱重置密码接口

  'get /api/users/smartgates/count': 'SmartGateController.getTotalByUser',

  //web users
  'get /api/webusers/smartgates': 'UserController.getSmartGateByWebUser',   //获取所有大棚及设备信息策略

  // leancloud avi message push
  'post /api/avoscloud/installations': 'UserController.setUserInstallationId',

  //user-visitors
  'get /api/users/visitors':'UserController.getVisitors',
  'post /api/users/visitors':'UserController.bindVisitor',
  'delete /api/users/visitors/:visitorId':'UserController.unbindVisitor',
  'get /api/visitors/smartgates':'UserController.getVisiableSmartGates',

  // smartgates
  'put /api/smartgates/:id/alias': 'SmartGateController.updateAlias',
  'get /api/smartgates/count': 'SmartGateController.getTotal', //获取大棚及设备数量接口
  'get /api/smartgates/:id/infos': 'SmartGateController.getInfo',   //根据大棚sn获取指定大棚及设备信息
  //'get /api/enddevices/list': 'DevCurDataController.getDevInfoList',
  'get /api/smartgates': 'SmartGateController.getAllSmartGate',         //unused    /api/smartgates?page=&limit=

  'delete /api/smartgates/:smartgate_sn/enddevices/:device_sn': 'SmartGateController.deleteEndDevice',

  'get /api/smartgates/:smartgate_sn/enddevices/:device_sn' :'SmartGateController.checkEndDeviceLegal',

  //enddevices
  'put /api/enddevices/:id/alias': 'DeviceController.updateAlias',

  'get /api/enddevices/:id/infos': 'DeviceController.getDeviceInfo',


  //geogroups
  'get /api/geogroups/provinces' : 'GeoGroupController.getProvinceList',
  'get /api/geogroups/provinces/cities': 'GeoGroupController.getProvinceCityList',
  'get /api/geogroups/provinces/cities/districts': 'GeoGroupController.getProvinceCityDistictList',
  'get /api/geogroups/provinces/cities/districts/smartgates': 'GeoGroupController.getSmartGateList',


  //analyses
  'get /api/analyses/histories': 'AnalysisController.getHistories',
  'get /api/analyses/histories/excelexport': 'AnalysisController.excelexport',  //导出excel


  //remote control
  'post /api/remotes/erelays/actions': 'RemoteController.doCmd',


  //test
  //'get /api/test': 'SmartGateController.test',
};
