/**
 * Created by xieyiming on 15-2-3.
 */


/**
 * Created by xieyiming on 15-1-11.
 */

(function () {
    'use strict';
    angular
        .module('page.analysis', [])
        // todo: rename the module or controller
        .controller('AnalysisController', ['$scope', 'HighchartService', 'UtilService', 'DevService', 'NotifyService', '$global', '$rootScope',
            function ($scope, HighchartService, UtilService, DevService, NotifyService, $global, $rootScope) {

                if (typeof String.prototype.startsWith != 'function') {
                    // see below for better implementation!
                    String.prototype.startsWith = function (str) {
                        return this.indexOf(str) == 0;
                    };
                }

                $rootScope.curPage = "analysis";
                $global.set('rightbarCollapsed', false);
                var self = $scope;

                self.$on('$destroy', function () {
                    $global.set('rightbarCollapsed', true);
                    console.error("关闭 sidebar analysis");
                });

                self.range = "today"//判断显示查询时间范围(小时/20分/5分)查询力度
                self.typeModel = 'area'//初始图表类型
                self.dayModel = 'today'//更新查询时间范围(月/日/天)初始显示状态为今天
                self.hourModel = 'scope2'//更新查询时间范围(小时/20分/5分)初始显示状态为小时
                self.curSensorId = "";//储存设备sn
                self.curSensors = null;//储存大棚设备数组
                self.chartSize = "scope2"//储存查询力度
                self.curType = "smartgate";//设备dev_type
                self.showExcel = false//显示导出execl按钮
                self.selectSensorData = null;//选择设备列表

                //查询开始时间--结束时间
                self.startDate = UtilService.today()
                self.endDate = UtilService.tomorrow()

                /*self.devShowcControl = [
                    dev[
                        "humidity-temperature","illumination",
                        "soil-th","smoke"
                    ] ,
                    control{
                        illumination_chartshow: true,
                        humidity_temperature_chartshow: true,
                        soilth_chartshow: true,
                        smoke_chartshow: true
                    }

                ]*/

                //图表显示控制
                self.illumination_chartshow = true;
                self.humidity_temperature_chartshow = true;
                self.soilth_chartshow = true;
                self.smoke_chartshow = true;

                //查询历史数据参数集合
                self.queryChartReq = {
                    curSensors: [],
                    sn: "",
                    date: "[" + UtilService.today() + "," + UtilService.tomorrow() + "]",
                    scope: "scope0",
                    device_type: "smartgate"//设备类型
                }

                //查询历史数据事件
                var doQueryChartData = function () {

                    if (self.selectSensorData === null) {

                       /* _.forEach(self.queryChartReq.curSensors, function (Sensors) {
                            self.queryChartReq.device_type = Sensors.dev_type;
                            self.queryChartReq.sn = Sensors.sn;
                            DevService.queryAnalysissData(self.queryChartReq).then(function (data) {

                                console.log("queryAnalysissData then get: ", data);

                                HighchartService.updateChartData(data.msg.data)

                                //_.extend(chartData, {data: data.msg.data.air_humidity})
                                self.queryChartReq.sn = null;
                            });
                        })*/

                        DevService.queryAnalysissData(self.queryChartReq).then(function (data) {

                            console.log("queryAnalysissData then get: ", data);
                            HighchartService.updateChartData(data.msg.data)

                        });

                    } else {

                        DevService.queryAnalysissData(self.queryChartReq).then(function (data) {

                            console.log("queryAnalysissData then get2: ", data.msg.data);

                            HighchartService.updateChartData(data.msg.data)

                        });
                    }


                }


                //动态更新参数集合
                var queryChartData = function () {
                    _.extend(self.queryChartReq, {curSensors: self.curSensors})
                    _.extend(self.queryChartReq, {date: "[" + self.startDate + "," + self.endDate + "]"})
                    _.extend(self.queryChartReq, {startDate: new Date(self.startDate)}) //for chart
                    _.extend(self.queryChartReq, {sn: self.curSensorId})
                    _.extend(self.queryChartReq, {scope: self.chartSize})
                    _.extend(self.queryChartReq, {device_type: self.curType})

                    HighchartService.setStartDateTime(self.queryChartReq.startDate)
                    doQueryChartData()
                }


                DevService.getProvinceList().then(function (data) {
                    self.geoGroups = data
                })

                self.showGeoGroupDetail = function (group, isopen) {

                    if (isopen) {

                        DevService.getCityList({province: group}).then(function (data) {

                            self.geoCities = data;

                            self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                                return el.name == group;
                            })
                            self.geoGroups[self.curGroupIndex]["geoCities"] = self.geoCities;

                        })
                    }

                } // showGeoGroupDetail

                self.showGeoGityDetail = function (province, city, isopen) {
                    self.curCity = city

                    if (isopen) {

                        self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                            return el.name == province;
                        });

                        self.devinfoLoadding = true;

                        DevService.getDistrictList({province: province, city: city}).then(function (data) {
                            self.geoDistricts = data;

                            self.curCityIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"], function (el) {
                                return el.name == city;
                            });

                            self.devinfoLoadding = false;

                            self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"] = self.geoDistricts;

                        });
                    }

                } // showGeoGityDetail

                self.showGeoDistrictDetail = function (province, city, district, isopen) {

                    self.curDistrict = district;
                    self.curDistrictLocation = {};
                    if (isopen) {

                        self.curGroupIndex = _.findIndex(self.geoGroups, function (el) {
                            return el.name == province;
                        });
                        self.curCityIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"], function (el) {
                            return el.name == city;
                        });

                        self.devinfoLoaddingFlag = true;
                        DevService.getSmartGateByDistrict({
                            province: province,
                            city: city,
                            district: district
                        }).then(function (data) {

                            self.curDistrictIndex = _.findIndex(self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"], function (el) {
                                return el.name == district;
                            });

                            self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"][self.curDistrictIndex]["devinfo"] = data;

                            self.devinfoLoaddingFlag = false;
                            var temp = self.geoGroups[self.curGroupIndex]["geoCities"][self.curCityIndex]["geoDistricts"][self.curDistrictIndex];

                            self.curDistrictLocation[province + city + district] = {
                                lat: temp.lat,
                                lng: temp.lng
                            };

                        });
                    }

                }; // showGeoDistrictDetail

                self.showDevDetail = function ($event, dev_uuid, lat, lng) {

                    self.curDev = dev_uuid

                    self.chartTitle = self.curCity + "-" + self.curDev

                    HighchartService.setTitle(self.chartTitle)

                    //        DevService.curDevuuid = dev_uuid
                    DevService.getDevInfoByUid(dev_uuid).then(function (data) {

                        //self.curDevInfo = data
                        self.curSensorId = data.smartgate.sn;//大棚sn

                        self.curSensor = data.components;//大棚所有设备
                        _.remove(self.curSensor, function (n) {
                            return n == null;
                        });
                        self.curSensors = _.omit(self.curSensor, function (o) {
                            return o.dev_type !== "humidity-temperature" && o.dev_type !== "illumination"
                                && o.dev_type !== "soil-th" && o.dev_type !== "smoke"
                        })

                       // multipleSelect(self.curSensors);
                        console.log("dev", self.curSensors);
                        self.illumination_chartshow = false;
                        self.humidity_temperature_chartshow = false;
                        self.soilth_chartshow = false;
                        self.smoke_chartshow = false;

                        _.findKey(self.curSensors, function (el) {
                            if (el.dev_type === "humidity-temperature") {
                                self.humidity_temperature_chartshow = true;
                            }if (el.dev_type === "illumination") {
                                self.illumination_chartshow = true;
                            }if (el.dev_type === "soil-th") {
                                self.soilth_chartshow = true;
                            }if (el.dev_type === "smoke") {
                                self.smoke_chartshow = true;
                            }
                        })

                        queryChartData();

                        self.showNotSelectError = false;
                        self.showExcel = true;
                    })
                } // showDevDetail

                /*根据用户选择显示和获取历史曲线*/
                self.selectSensor = function (selectSensorData) {
                    self.curSensorId = selectSensorData.sn
                    self.curType = selectSensorData.dev_type

                    if (selectSensorData.dev_type === "humidity-temperature") {
                        self.humidity_temperature_chartshow = true;
                        self.illumination_chartshow = false;
                        self.soilth_chartshow = false;
                        self.smoke_chartshow = false;
                    } else if (selectSensorData.dev_type === "illumination") {
                        self.humidity_temperature_chartshow = false;
                        self.illumination_chartshow = true;
                        self.soilth_chartshow = false;
                        self.smoke_chartshow = false;
                    } else if (selectSensorData.dev_type === "soil-th") {
                        self.humidity_temperature_chartshow = false;
                        self.illumination_chartshow = false;
                        self.soilth_chartshow = true;
                        self.smoke_chartshow = false;
                    } else if (selectSensorData.dev_type === "smoke") {
                        self.humidity_temperature_chartshow = false;
                        self.illumination_chartshow = false;
                        self.soilth_chartshow = false;
                        self.smoke_chartshow = true;
                    }
                    self.showNotSelectError = false
                    queryChartData()
                }

                //更新查询时间范围(月/日/天)
                self.selectDateRange = function (range) {
                    self.range = range;
                    if (range == 'today') {
                        self.startDate = UtilService.today()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.todaytitle()

                    } else if (range == 'week') {
                        self.chartSize = "scope2"
                        self.startDate = UtilService.weekAgo()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.weektitle()

                    } else if (range == 'month') {
                        self.chartSize = "scope2"
                        self.startDate = UtilService.monthAgo()
                        self.endDate = UtilService.tomorrow()
                        self.dateTimeTitle = UtilService.monthtitle()
                    }

                    if (_.isNull(self.curSensors)) {
                        self.showNotSelectError = true
                    } else {
                        self.showNotSelectError = false
                        HighchartService.setStartDateTime(self.queryChartReq.startDate)
                        queryChartData();
                    }
                }

                //更新查询时间范围(小时/20分/5分)
                self.updateChartSize = function (size) {

                    self.chartSize = size;
                    //检查设备是否为空
                    if (_.isNull(self.curSensors)) {
                        self.showNotSelectError = true

                    } else {
                        self.showNotSelectError = false
                        queryChartData()
                    }
                }

                //自定义查询初始时间
                self.anStartDateModel = UtilService.today();
                self.anEndDateModel = UtilService.tomorrow();

                //自定义查询范围
                self.dateRangeConfirm = function () {
                    self.startDateTime = jQuery("#anStartDateModel").val() // bad
                    self.endDateTime = jQuery("#anEndDateModel").val() // bad

                    if (_.isEmpty(self.startDateTime) || _.isEmpty(self.endDateTime)) {
                        alert("请选择日期")
                        return false
                    }
                    self.startDate = self.startDateTime
                    self.endDate = self.endDateTime

                    var tmpStart = moment(self.startDateTime.split(" ")[0]).format('MMMDo') + self.startDateTime.split(" ")[1]
                    var tmpEnd = moment(self.endDateTime.split(" ")[0]).format('MMMDo') + self.endDateTime.split(" ")[1]

                    self.dateTimeTitle = tmpStart + " -- " + tmpEnd

                    if (_.isNull(self.curSensors)) {
                        self.showNotSelectError = true

                    } else {
                        self.showNotSelectError = false
                        queryChartData()
                    }
                }

                //更新图表类型
                self.updateChartType = function (ctype) {
                    HighchartService.updateChartType(ctype)
                }

                //self.dateModel = 'today'

                self.queryChartReq.startDate = new Date(self.startDate) //for chart
                HighchartService.setStartDateTime(self.queryChartReq.startDate)

                self.dateTimeTitle = moment(new Date()).format('MMMDo')

                //页面调取chart配置
                self.temperature_chartOptionForTemp = HighchartService.getChartOption("temperature")
                self.humidity_chartOptionForTemp = HighchartService.getChartOption("humidity")
                self.lux_chartOptionForTemp = HighchartService.getChartOption("lux")
                self.soil_temperature_chartOptionForTemp = HighchartService.getChartOption("soiltemperature")
                self.soil_humidity_chartOptionForTemp = HighchartService.getChartOption("soilhumidity")
                self.smoke_chartOptionForTemp = HighchartService.getChartOption("smoke")

                //调节时间
                var updateTime = function(time){
                    var Time = moment(new Date(time)).format('LLL');
                    return Time
                }

                //多选设备
               /* var dev_components = []  //多选源数据

                var multipleSelect = function(com){
                    var count = 0;
                    _.forEach(com, function(data){
                        dev_components.push({id: count, text: data.dev_name})
                        count ++;
                    })

                    $(".js-example-basic-multiple").select2({
                        data: dev_components,
                        placeholder: "请选择设备"
                    });
                    dev_components = []
                }
                self.multipleSelected = $(".js-example-basic-multiple").select2("data")*/

                //导出excel事件
                self.exportExcel = function () {

                    DevService.excelexport(self.queryChartReq).then(function(data){

                        var query = self.queryChartReq;
                        var url = "api/analyses/histories/excelexport?" + "date=" + query.date + "&scope=" + query.scope + "&sn=" + query.sn + "&device_type=" + query.device_type
                        if(data.result === "Failed" && data.msg ==="this time no data"){
                            alert("无历史数据!")
                        }else{
                            window.location = url;
                        }
                    })

                }

                self.$on('leftbarCollapsed', function (ev, data) {
                    //self.temperature_chartOptionForTemp.options.chart.reflow();
                    self.temperature_chartOptionForTemp = HighchartService.getChartOption("temperature")
                    self.humidity_chartOptionForTemp = HighchartService.getChartOption("humidity")
                    self.lux_chartOptionForTemp = HighchartService.getChartOption("lux")
                    self.soil_temperature_chartOptionForTemp = HighchartService.getChartOption("soiltemperature")
                    self.soil_humidity_chartOptionForTemp = HighchartService.getChartOption("soilhumidity")
                    self.smoke_chartOptionForTemp = HighchartService.getChartOption("smoke")
                })

            }])


})();






