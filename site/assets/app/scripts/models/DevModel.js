/**
 * Created by xieyiming on 15-1-9.
 */



angular.module('models.dev', [])

    .service("DevModel", ["$q", "$http", function ($q, $http) {
        var self = this;

        self.getDevList = function (query) {
            var query_str = query.url + "?" + query.params

            console.log("DevModel query: ", query_str)

            if (query.method == "GET") {
                return $http.get(query_str)
            }
        }

        self.getDevGroupList = function () {
            return $http.get("/api/devgroup")
        }

        self.addGroup = function (query) {
            return $http.post("/api/devgroup", query)
        }

        self.deleteGroup = function (query) {
            console.log("self.deleteGroup ====>> ", query)
            return $http.put("/api/devgroup", query)
//      return $http.post("/api/devgroup", query)
        }

        self.addDevToGroup = function (query) {
            console.log("addDevToGroup: ", query)
            return $http.post("/api/devgroup/add_device_list", query)
        }

        self.rmDevFromGroup = function (query) {
            console.log("rmDevFromGroup: ", query)
            return $http.post("/api/devgroup/rm_device", query)
        }

        self.getDevGroup = function () {
            var deferred = $q.defer();
            //todo: extra = online
            setTimeout(function () {
                var data = [
                    {
                        name: "成都市区",
                        dev_uuid: 'fake dev uuid',
                        online: true,
                        visiable: true,
                        lat: 32.4532,
                        lon: 10.4567,
                        warning_list: [],
                        components: [
                            {
                                component_id: 0,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            },
                            {
                                component_id: 1,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            },
                            {
                                component_id: 2,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            },
                            {
                                component_id: 3,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            },
                            {
                                component_id: 4,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            }
                        ]
                    },

                    {
                        name: "北京市区",
                        dev_uuid: 'fake dev uuid',
                        online: true,
                        visiable: true,
                        lat: 32.4532,
                        lon: 10.4567,
                        warning_list: [],
                        components: [
                            {
                                component_id: 0,
                                name: "freq alas",
                                freq: 102.6,
                                mode: 'fm'
                            },
                            {
                                component_id: 1,
                                name: "freq alas",
                                freq: 88.0,
                                mode: 'fm'
                            },
                            {
                                component_id: 2,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'am'
                            },
                            {
                                component_id: 3,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            },
                            {
                                component_id: 4,
                                name: "freq alas",
                                freq: 95.5,
                                mode: 'fm'
                            }
                        ]


                    }
                ]
//        return deferred.reject();
                return deferred.resolve(data);
            })
            return deferred.promise;
        }

        self.getCmdList = function (query) {
            var query_str = query.url + "?" + query.params

            if (query.method == "GET") {
                return $http.get(query_str)
            }
        }

        self.loadCtrlItem = function (query) {
            var query_str = query.url + "?" + query.params
            console.debug("loadCtrlItem: ", query_str)

            if (query.method == "GET") {
                return $http.get(query_str)
            }
        }

        self.sendCmd = function (query) {
            var query_str = query.url

            console.log("self.sendCmd: ", query)

            return $http.post("api/remote/do_cmd", query)
        }

        self.getProvinceList = function (query) {
            var query_str = query.url

            return $http.get(query_str)
        }

        var getQuery = function (query) {
            var query_str = query.url + "?" + query.params

            return $http.get(query_str)
        }

        self.getCityList = function (query) {
            return getQuery(query)
        }

        self.getDistrictList = function (query) {
            return getQuery(query)
        }

        self.getSmartGateByDistrict = function (query) {
            return getQuery(query)
        }

        self.updateDevInfo = function (query) {
            return $http.post(query.url, query.params)
        }

        //获取历史数据
        self.queryAnalysissData = function (query) {
            var query_str = query.url + "?" + query.params
            console.log("url", query_str);

            return $http.get(query_str)
        }

        //获取导出excel数据
        self.excelexport = function (query) {
            var query_str = query.url + "?" + query.params
            return $http.get(query_str)
        }

        self.getUserDev = function (query) {
            var query_str = query.url
            return $http.get(query_str)
        }

        //update password
        self.update_pwd = function (query) {
            return $http.put(query.url, query.parameter);
        }


        /*--------------alarm model------------------*/

        //get报警未读信息
        self.getAlarmUnreadEvents = function (query) {
            var query_str = query.url + "?" + query.parameter
            return $http.get(query_str)
        }

        //get报警已读信息
        self.getAlarmOnreadEvents = function (query) {
            var query_str = query.url + "?" + query.parameter
            return $http.get(query_str)
        }

        //未读信息设置为已读
        self.updateOnread = function (query) {
            return $http.put(query.url, query.parameter);
        }

        var getAlarmData = function (query) {
            var query_str = query
            return $http.get(query_str)
        }

        //获取大棚报警默认预案策略
        self.getstrategy_default = function (query) {
            return getAlarmData(query)
        }

        //获取自定义大棚报警预案策略
        self.getCustom = function (query) {
            return getAlarmData(query)
        }

        //添加自定义大棚报警预案策略
        self.addCustom = function (query) {
            return $http.post('api/users/custom_alarmstrategies', angular.fromJson(query))
        }

        //更新自定义大棚报警预案策略
        self.updateCustom = function (query, id) {
            return $http.put('/api/users/custom_alarmstrategies/' + id, query)
        }

        //删除自定义大棚报警预案策略
        self.deleteCustom = function (query) {
            return $http.delete(query)
        }

        self.getTemp = function (query) {
            return getAlarmData(query)
        }

        self.getsns = function () {
            return getAlarmData('/api/users/smartgates/sns')
        }

        //获取指定大棚报警策略信息
        self.getShed = function (shed_id) {
            return getAlarmData('/api/users/smartgates/' + shed_id + '/alarmstrategy_settings')
        }

        //添加大棚报警策略
        self.addShed = function (shed_id, strategy_type) {
            console.log('--------------------------', shed_id);
            return $http.post('/api/users/smartgates/' + shed_id + '/alarmstrategy_settings', strategy_type);
        }

        //删除大棚报警策略
        self.deleteShed = function (query) {
            return $http.delete(query)
        }

        //设备控制
        self.remotesActions = function(list, token){
            return $http.post('/api/remotes/erelays/actions', list);
        }

    }])

