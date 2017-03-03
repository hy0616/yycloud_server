/**
 * Created by xieyiming on 15-1-12.
 */



angular.module('service.dev', [])

  .service("DevService", ["$q", 'DevModel', '$rootScope', '$interval', '$http',
    function ($q, DevModel, $rootScope, $interval, $http) {
      var self = this

//    return deferred.reject();

      var parseQuery = function (query) {
        var query_parsed = "common=" + query.common + "&components=" + query.components
        if (_.has(query, "isgrouped")) {
          query_parsed = query_parsed + "&isgrouped=" + query["isgrouped"]
        }

        return query_parsed
      }
      self.curChn = null

      var parseCurChn = function (data) {
        if (data.device_type == "humidity") {
          data.val = data.humidity + "#"
        } else if (data.device_type == "temperature") {
          data.val = data.temperature + "C"
        } else {
          data.val = "_"
        }

        self.curChn = data
        $rootScope.curChn = data
      }

        //获取搜有大棚及设备信息策略
        self.getAllSmartgates = function(){
            var deferred = $q.defer();

            $http.get("/api/webusers/smartgates").then(function(data){
                return deferred.resolve(data);
            })
            return deferred.promise;
        }

        //获取大棚总数量
      self.getTotalInfo = function () {
        var deferred = $q.defer()

        $http.get("api/smartgates/count").then(function (data) {
          return deferred.resolve(data.data)
        })
        return deferred.promise
      }

        self.getPersonalInfo = function () {
            var deferred = $q.defer()

            $http.get("api/users/smartgates/count").then(function (data) {
                return deferred.resolve(data.data)
            })
            return deferred.promise
        }

        //通过大棚sn获取指定大棚及设备信息
      self.getDevInfoByUid = function (sn) {
        var deferred = $q.defer();

        var query = "api/smartgates/" + sn + "/infos";

        $http.get(query).success(function (data) {
          return deferred.resolve(data)
        })

        return deferred.promise
      }

      self.getDevInfo = function (dev_uuid, component_id) {
        var deferred = $q.defer()
//      http://localhost:1337/api/device/info?dev_uuid=yydev1-66c13393-6b5f-49ed-8850-5b77e879264e
        //todo:
        var args_parsed = "dev_uuid=" + dev_uuid + "&components=[" + component_id + "],[all]"

        var query = {
          url: "/api/device/info",
          params: args_parsed,
          method: "GET"
        }

        DevModel.getDevList(query).then(function (data) {

          parseCurChn(data.data.components[0])

          $rootScope.$broadcast("update:curChn")
          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.getDevList = function (args) {
        var deferred = $q.defer()
        var args_parsed = parseQuery(args)

        var query = {
          url: "/api/smartgates",
          params: args_parsed,
          method: "GET"
        }

        /**
         * get the current user's smartgates.
         * need to
         * @type {{url: string, params, method: string}}
         */
        /*var query = {
          url: "/api/users/smartgates",
          params: args_parsed,
          method: "GET"
        }*/


        console.log("DevService url: ", query.url)
        DevModel.getDevList(query).then(function (data) {
          console.log("DevService getDevList: ", data.data)
          return deferred.resolve(data.data)
        })
        return deferred.promise
      }

      self.getDevListByGroup = function (groupName) {
        var deferred = $q.defer()
        var args_parsed = "group_name=" + groupName

        var query = {
          url: "/api/devgroup/device_list",
          params: args_parsed,
          method: "GET"
        }
        DevModel.getDevList(query).then(function (data) {
          return deferred.resolve(data.data);
        })

        return deferred.promise

      }

      self.getDevGroupList = function () {
        var deferred = $q.defer();

        DevModel.getDevGroupList().then(function (data) {
          return deferred.resolve(data.data);
        }).catch(function (err) {
          return deferred.reject(err)
        })

        return deferred.promise;
      }

      self.deleteGroup = function (name) {
        var deferred = $q.defer()
        var query = {
          name: name
        }
        DevModel.deleteGroup(query).then(function () {
          $rootScope.$broadcast("update:groupCntChange")
          return deferred.resolve()
        }).catch(function (err) {
          return deferred.reject(err)
        })

        return deferred.promise
      }

      self.addGroup = function (name, color) {
        var deferred = $q.defer()

        var query = {
          name: name,
          color: color
        }
        console.log("addGroup query: ", query)

        DevModel.addGroup(query).then(function () {
          $rootScope.$broadcast("update:groupCntChange")
          return deferred.resolve()
        }).catch(function (err) {
          return deferred.reject(err)
        })

        return deferred.promise
      }

      self.rmDevFromGroup = function (uuid, groupName) {
        var deferred = $q.defer()

        var query = {
          dev_uuid: uuid,
          group_name: groupName
        }

        DevModel.rmDevFromGroup(query).then(function () {
          return deferred.resolve()
        })

        return deferred.promise
      }

      self.addDevToGroup = function (uuids, groupNames) {
        var deferred = $q.defer()
        var uuid_parsed = null

        if (_.isString(uuids)) {
          uuid_parsed = uuids
        }

        if (_.isArray(uuids)) {
          uuid_parsed = uuids.join(",")
        }

        var query = {
          dev_uuid: uuid_parsed,
          group_name: groupNames.join(",")
        }
        console.log("addDevToGroup: query: ", query)

        DevModel.addDevToGroup(query).then(function () {
          $rootScope.$broadcast("update:addGroup")
          return deferred.resolve()
        })
        return deferred.promise
      }

      self.getDevInfoForTile = function () {
        var deferred = $q.defer();

        DevModel.getDevInfoForTile().then(function (data) {
          return deferred.resolve(data);
        }).catch(function (err) {
          return deferred.reject(err);
        })
        return deferred.promise;
      }

      self.getGroupName = function () {
        var deferred = $q.defer();

        DevModel.getGrounInfo().then(function (data) {

          return deferred.resolve(_.pluck(data, 'dev_group'))
        }).catch(function (err) {
          return deferred.reject(err);
        })


        return deferred.promise;
      }

      self.getDevNameByGroup = function (name) {
        var deferred = $q.defer();

        DevModel.getDevNameByGroup(name).then(function (data) {
          return deferred.resolve(data)
        }).catch(function (err) {
          return deferred.reject(err);
        })

        return deferred.promise;
      }

      self.getFreqNameByDev = function (name) {
        var deferred = $q.defer();

        DevModel.getFreqNameByDev(name).then(function (data) {
          return deferred.resolve(data)
        }).catch(function (err) {
          return deferred.reject(err);
        })

        return deferred.promise;
      }

        //获取历史数据
      self.queryAnalysissData = function (_query) {
        var deferred = $q.defer()
        var query = {
          url: "/api/analyses/histories",
          params: "&date=" + _query.date + "&scope=" + _query.scope + "&sn=" + _query.sn + "&device_type=" + _query.device_type
        }
        DevModel.queryAnalysissData(query).then(function (data) {
          return deferred.resolve(data.data)
        }).catch(function (err) {
          console.log("err: ", err)
        })
        return deferred.promise
      }

        //获取导出excel数据
        self.excelexport = function(_query){
            var deferred = $q.defer()
            var query = {
                url: "/api/analyses/histories/excelexport",
                params: "date=" + _query.date + "&scope=" + _query.scope + "&sn=" + _query.sn + "&device_type=" + _query.device_type
            }
            DevModel.excelexport(query).then(function (data) {
                return deferred.resolve(data.data)
            }).catch(function (err) {
                console.log("err: ", err)
            })
            return deferred.promise
        }

      self.getGrounInfo = function () {
        var deferred = $q.defer()

        DevModel.getGrounInfo().then(function (data) {
          return deferred.resolve(data)
        }).catch(function (err) {
          return deferred.reject(err)
        })
        return deferred.promise
      }

      self.getCmdList = function (dev_uuid) {
        var deferred = $q.defer()

        var query = {
          url: 'api/remote/get_cmd_list',
          method: 'GET',
          params: 'dev_uuid=' + dev_uuid
        }

        DevModel.getCmdList(query).then(function (data) {
          return deferred.resolve(data.data)
        })
        return deferred.promise
      }

      self.loadCtrlItem = function (dev_uuid, cmd_name) {
        var deferred = $q.defer()

        var query = {
          url: 'api/remote/get_cmd',
          method: 'GET',
          params: 'dev_uuid=' + dev_uuid + "&cmd_name=" + cmd_name
        }

        DevModel.loadCtrlItem(query).then(function (data) {
          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.sendCmd = function (query) {
        var deferred = $q.defer()

        console.log("in service sendCmd: ", query)

        DevModel.sendCmd(query).then(function (data) {
          return deferred.resolve(data.data);
        })

        return deferred.promise;
      }

      self.getProvinceList = function () {
        var deferred = $q.defer();

        var query = {
          url: "api/geogroups/provinces",
          method: "GET",
          params: ""
        }

        DevModel.getProvinceList(query).then(function (data) {

          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.getCityList = function (_query) {
        var deferred = $q.defer();
        //api/devgeogroup/province_city_list?name=四川省

        var query = {
          url: "api/geogroups/provinces/cities",
          method: "GET",
          params: "province=" + _query.province
        }

        DevModel.getCityList(query).then(function (data) {

          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.getDistrictList = function (_query) {
        var deferred = $q.defer();
        //api/devgeogroup/province_city_list?name=四川省

        var query = {
          url: "api/geogroups/provinces/cities/districts",
          method: "GET",
          params: "province=" + _query.province + "&city=" + _query.city
        }

        DevModel.getDistrictList(query).then(function (data) {

          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.getPlantList = function () {
        var deferred = $q.defer();

        var query = {
          url: "api/plunt_list",
          method: "GET"
        }

        $http.get(query.url).success(function (data) {
          console.log("getPlantList:", data)
          return deferred.resolve(data)
        })

        return deferred.promise
      }


      self.getSmartGateByDistrict = function (_query) {
        // api/devgeogroup/city_list?name=成都市
        var deferred = $q.defer();

        var query = {
          url: "api/geogroups/provinces/cities/districts/smartgates",
          method: "GET",
          params: "province=" + _query.province + "&city=" + _query.city + "&district=" + _query.district
        }

        DevModel.getSmartGateByDistrict(query).then(function (data) {
          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.updateDevInfo = function (_query) {
        var deferred = $q.defer();

        var query = {
          url: "api/device/update_location",
          method: "POST",
          params: _query
        }

        DevModel.updateDevInfo(query).then(function (data) {
          return deferred.resolve(data.data)
        })

        return deferred.promise
      }

      self.getUserDev = function () {
        var deferred = $q.defer()

        var query = {
          url: "api/users/infos",
          method: "GET"
        }

        DevModel.getUserDev(query).then(function (data) {
          return deferred.resolve(data.data)
        })

        return deferred.promise

      }

       /*-----------alarm service-------*/

        //get报警未读信息
        self.getAlarmUnreadEvents = function(){
            var deferred = $q.defer();
            var query = {
                url: "api/users/alarmevents",
                parameter: 'read_state=unread'
            }
            DevModel.getAlarmUnreadEvents(query).then(function(data){
                return deferred.resolve(data);
            })
            return deferred.promise;
        }

        //get报警已读信息
        self.getAlarmOnreadEvents = function(){
            var deferred = $q.defer();
            var query = {
                url: "api/users/alarmevents",
                parameter: 'read_state=read&begin_date=&end_date='
            }
            DevModel.getAlarmOnreadEvents(query).then(function(data){
                return deferred.resolve(data);
            })
            return deferred.promise;
        }

        //未读信息设置为已读
        self.updateOnread = function(_query){
            var deferred = $q.defer();
            var query = {
                url:"api/users/alarmevents",
                parameter:_query
            }
            DevModel.updateOnread(query).then(function(data){
                return deferred.resolve(data);
            })
            return deferred.promise;
        }

        //获取大棚报警默认策略
      self.getstrategy_default = function () {
        var deferred = $q.defer();

        var query = "/api/default_alarmstrategies"

        DevModel.getstrategy_default(query).then(function (data) {
          return deferred.resolve(data)
        })

        return deferred.promise
      }

        //获取用户自定义报警策略
      self.getCustom = function () {
        var deferred = $q.defer()

        var query = "/api/users/custom_alarmstrategies"

        DevModel.getCustom(query).then(function (data) {
          return deferred.resolve(data)
        })

        return deferred.promise
      }

        //添加自定义报警策略
      self.addCustom = function (query) {
        var deferred = $q.defer()

                DevModel.addCustom(query).then(function () {
                    $rootScope.$broadcast("update:CustomChange")
                    return deferred.resolve()
                }).catch(function (err) {
                    return deferred.reject(err)
                })

        return deferred.promise
      }

          //更新自定义大棚报警策略
      self.updateCustom = function (query, id) {
        var deferred = $q.defer()

                DevModel.updateCustom(query, id).then(function () {
                    $rootScope.$broadcast("update:CustomChange")
                    return deferred.resolve()
                }).catch(function (err) {
                    return deferred.reject(err)
                })

        return deferred.promise
      }

        //删除自定义报警策略
      self.deleteCustom = function (id) {
        var deferred = $q.defer()

        var query = '/api/users/custom_alarmstrategies/' + id

                DevModel.deleteCustom(query).then(function () {
                    $rootScope.$broadcast("update:CustomChange")
                    return deferred.resolve()
                }).catch(function (err) {
                    return deferred.reject(err)
                })

        return deferred.promise
      }

      self.getTemp = function () {
        var deferred = $q.defer()

        var query = '/api/users/temp_alarmstrategies'

        DevModel.getTemp(query).then(function (data) {
          return deferred.resolve(data)
        })

        return deferred.promise
      }

        self.getsns = function () {
            var deferred = $q.defer()

            DevModel.getsns().then(function (data) {
                return deferred.resolve(data)
            })

            return deferred.promise
        }

        //获取报警指定大棚报警信息
      self.getShed = function (shedId) {
        var deferred = $q.defer()

        DevModel.getShed(shedId).then(function (data) {
          return deferred.resolve(data)
        })

        return deferred.promise
      }
        //添加大棚报警策略
      self.addShed = function (shed_id, strategy_type) {
        var deferred = $q.defer()

        DevModel.addShed(shed_id, strategy_type).then(function () {
        $rootScope.$broadcast('updata:shed',shed_id);
          return deferred.resolve()
        }).catch(function (err) {
          return deferred.reject(err)
        })

        return deferred.promise
      }
        //删除大棚报警策略
      self.deleteShed = function (shedId, alarmstrategy_settings) {
        var deferred = $q.defer()

        var query = '/api/users/shed/' + shedId + '/alarmstrategy_settings'

        DevModel.deleteShed(query).then(function () {
          return deferred.resolve()
        }).catch(function (err) {
          return deferred.reject(err)
        })

        return deferred.promise
      }

        //update password
        self.update_pwd = function(info){
            var deferred = $q.defer()
            var query = {
                url:'/api/users/passwords',
                parameter:info
            }
            DevModel.update_pwd(query).then(function(){
                return deferred.resolve()
            }).catch(function(err){
                alert("原密码不正确!");
                return deferred.reject(err);
            })
            return deferred.promise
        }

        //设备远程控制
        self.remotesActions = function(list, token){
            var deferred = $q.defer();

            DevModel.remotesActions(list, token).then(function(data){
                return deferred.resolve(data);
            }).catch(function(err){
                return deferred.reject(err);
            })
            return deferred.promise;
        }

    }])
