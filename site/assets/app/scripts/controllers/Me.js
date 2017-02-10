/**
 * Created by xieyiming on 15-1-11.
 */

(function () {
    'use strict'
    angular
        .module('page.me', [])
        // todo: rename the module or controller
        .controller('MeController', ['$scope', 'UtilService', 'DevService', 'NotifyService', '$global', '$rootScope', "DashboardMapService", "HighchartService",
            "$timeout", "$interval", "AuthService",
            function ($scope, UtilService, DevService, NotifyService, $global, $rootScope, DashboardMapService,
                      HighchartService, $timeout, $interval, AuthService) {
                var self = $scope

                $global.set('rightbarCollapsed', false);

                $rootScope.curPage = "me"

                self.optsionPool = {}

                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar analysis")
                })

                self.chartConfig = {}

                /*query data and assignment chartConfig*/
                var doQueryChartData = function (query) {

                    DevService.queryAnalysissData(query).then(function (data) {

                        if (data.msg.data.air_temperature !== undefined) {

                            var charData_temperature = processing(data.msg.data.air_temperature);
                            self.chartConfig[query.sn + "temperature"].series[0].data = charData_temperature
                            self.chartConfig[query.sn + "temperature"].series[0].color = "rgb(174, 213, 106)"
                            self.chartConfig[query.sn + "temperature"].yAxis.labels.format = '{value} ℃'
                            self.chartConfig[query.sn + "temperature"].series[0].name = "温度"
                        }
                        if (data.msg.data.air_humidity !== undefined) {
                            //humidity
                            var charData_humindity = processing(data.msg.data.air_humidity);
                            self.chartConfig[query.sn + "humidity"].series[0].data = charData_humindity
                            self.chartConfig[query.sn + "humidity"].series[0].color = "rgb(134, 179, 174)"
                            self.chartConfig[query.sn + "humidity"].yAxis.labels.format = '{value} %RH'
                            self.chartConfig[query.sn + "humidity"].series[0].name = "湿度"
                        }
                        if (data.msg.data.lux !== undefined) {
                            //lux
                            var charData_lux = processing(data.msg.data.lux);
                            self.chartConfig[query.sn + "illumination"].series[0].data = charData_lux
                            self.chartConfig[query.sn + "illumination"].series[0].color = "#9BCD9B"
                            self.chartConfig[query.sn + "illumination"].yAxis.labels.format = '{value} lux'
                            self.chartConfig[query.sn + "illumination"].series[0].name = "光照"
                        }

                    })
                }

                /* to update data*/
                self.refreshUserInfo = function () {
                    self.refreshing = true
                    getUserInfo()
                }

                self.curUserData = {};//用户及大棚相关数据
                self.curUserData.username = AuthService.getUsername();//获取用户名

                var getUserInfo = function () {
                    DevService.getUserDev().then(function (data) {
                        self.curUserData = data;
                        self.curUserData.username = AuthService.getUsername();
                        console.log("curUserData", self.curUserData);

                        _.forEach(self.curUserData.smartgates, function (dev) {

                            self.optsionPool[dev.smartgate.sn] = {
                                'chartDate': 'today',
                                'chartSize': 'scope2',
                                'chartType': "line",
                                'startDate': UtilService.today(),
                                'endDate': UtilService.tomorrow(),
                            }

                            var tempQuery = {
                                sn: dev.smartgate.sn,
                                date: "[" + UtilService.today() + "," + UtilService.tomorrow() + "]",
                                scope: "scope2",
                                device_type: 'smartgate'
                            }

                            doQueryChartData(tempQuery);
                            HighchartService.initUserChartConfig(dev.smartgate.sn, "temperature")
                            HighchartService.initUserChartConfig(dev.smartgate.sn, "humidity")
                            HighchartService.initUserChartConfig(dev.smartgate.sn, "illumination")
                        })

                        self.refreshing = false
                        self.chartConfig = HighchartService.getAllUserChartConfig()
                    })
                }

                getUserInfo()

                self.chartResize = function () {
                    $(window).resize();
                }


                /*
                 * 根据时间查询历史数据'*/
                self.selectDate = function (Datetype, dev_uuid) {
                    self.optsionPool[dev_uuid].chartDate = Datetype;

                    var dateQuery = ''

                    if ('today' == Datetype) {
                        dateQuery = "[" + UtilService.today() + "," + UtilService.tomorrow() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.today()
                        self.optsionPool[dev_uuid].endDate = UtilService.tomorrow()
                    } else if ('week' == Datetype) {
                        self.optsionPool[dev_uuid].chartSize = "scope2"
                        dateQuery = "[" + UtilService.weekAgo() + "," + UtilService.today() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.weekAgo()
                        self.optsionPool[dev_uuid].endDate = UtilService.today()
                    } else if ('month' == Datetype) {
                        self.optsionPool[dev_uuid].chartSize = "scope2"
                        dateQuery = "[" + UtilService.monthAgo() + "," + UtilService.today() + "]"
                        self.optsionPool[dev_uuid].startDate = UtilService.monthAgo()
                        self.optsionPool[dev_uuid].endDate = UtilService.today()
                    }

                    var tempQuery = {
                        sn: dev_uuid,
                        date: dateQuery,
                        scope: self.optsionPool[dev_uuid].chartSize, // first time use hour as default
                        device_type: 'smartgate'
                    }

                    doQueryChartData(tempQuery)
                }

                /*
                 * 根据力度查询历史数据
                 */
                self.selectSize = function (size, dev_uuid) {
                    self.optsionPool[dev_uuid].chartSize = size

                    var tempQuery = {
                        sn: dev_uuid,
                        date: "[" + self.optsionPool[dev_uuid].startDate + "," + self.optsionPool[dev_uuid].endDate + "]",
                        scope: size, // first time use hour as default
                        device_type: 'smartgate'
                    }

                    doQueryChartData(tempQuery)
                }

                /*
                 * 用户选择显示图标样式类型*/
                self.selectType = function (chartType, dev_uuid) {
                    self.optsionPool[dev_uuid].chartType = chartType

                    self.chartConfig[dev_uuid + 'temperature'].options.chart.type = chartType
                    self.chartConfig[dev_uuid + 'humidity'].options.chart.type = chartType
                    self.chartConfig[dev_uuid + 'illumination'].options.chart.type = chartType
                }


                //processing date
                var processing = function (el) {
                    var air_temperature_data = [];
                    var air_temperature = [];
                    _.forEach(el, function (data) {

                        //历史时间由世界时转换为东八区时间
                        var oldTime = (new Date(data.time.substr(0, 4) + "/" + data.time.substr(5, 2) + "/" + data.time.substr(8, 2) + " " + data.time.substr(11, 2)
                                + ":" + data.time.substr(14, 2))).getTime() + 8 * 60 * 60 * 1000;

                        var newTime = new Date(oldTime);

                        //query curve time and historical data
                        air_temperature = [Date.UTC(newTime.getFullYear(), newTime.getUTCMonth(), newTime.getDate(), newTime.getHours(), newTime.getMinutes()), data.value]
                        air_temperature_data.push(air_temperature);

                    })
                    return air_temperature_data;
                }


                /*
                 * 设备控制返回状态
                 * ret：success 正确
                 * ret: fail, not this dev_uuid or device offline 大棚下找不到该设备
                 * ret: fail, not this dev_uuid 找不到该大棚
                 */

                self.switchBtns = {} //设备状态显示
                self.switchBtnsLoading = {} //加载状态显示
                var ccp_token = "ccp_token-smartgate-20150201";
                var token = AuthService.gettoken(); //用户token

                //单继电器控制
                self.OneToggleSwitch = function (dev_uuid, component_id, type, active) {

                    self.switchBtnsLoading[dev_uuid + component_id] = true;

                    var parameter = {
                        ccp_token: ccp_token,
                        smartgate_sn: dev_uuid,  //大棚sn
                        params: {
                            cmd: type,  //单/双继电器类型
                            action: active,  // 0关闭 1开启
                            sn: component_id  //设备sn
                        }
                    }

                    DevService.remotesActions(parameter, token).then(function (data) {

                        if (data.ret === "success") {
                            self.switchBtnsLoading[dev_uuid + component_id] = false;
                            updateState();
                            if (active == 0) {
                                alert("设备成功关闭!")
                            } else {
                                alert("设备成功开启!");
                            }
                        } else {
                            alert("操作失败!")
                        }

                    })

                }

                //双继电器控制
                self.twoToggleSwitch = function (dev_uuid, component_id, type, active, ventilation) {

                    self.switchBtnsLoading[dev_uuid + component_id] = true;//开启加载

                    var parameter = {
                        ccp_token: ccp_token,
                        smartgate_sn: dev_uuid,
                        params: {
                            cmd: type,
                            action: active, // 0上行 1下行 2停止
                            sn: component_id
                        }
                    }

                    //防风机命令
                    if(ventilation == "erelay-ventilation"){
                        if(active == "0"){
                            parameter.params.action = "ventilationone11forward";
                        } if(active == "1"){
                            parameter.params.action = "ventilationone11back";
                        }if(active == "2"){
                            parameter.params.action = "ventilationone11stop";
                        }

                    }

                    DevService.remotesActions(parameter, token).then(function (data) {

                        if (data.ret === "success") {
                            self.switchBtnsLoading[dev_uuid + component_id] = false;
                            updateState();
                            alert("操作成功!")
                        } else {
                            alert("操作失败!")
                        }

                    })
                }

                //定时器 定时查询设备状态
                /*$interval(function(){
                 updateState()
                },5000)*/

                //更新设备状态
                function updateState(){
                    DevService.getUserDev().then(function (data) {
                        self.curUserData = data;
                    })
                }


                self.layers = {
                    baselayers: DashboardMapService.getBaselayer(),
                    overlays: {}
                }

                self.center = DashboardMapService.getCenter()


            }
        ])


})();



