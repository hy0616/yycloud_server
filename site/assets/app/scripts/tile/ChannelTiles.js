/**
 * Created by xieyiming on 15-1-8.
 */


(function(){
  'use strict';

  angular.module('theme.channelTile', [

  ])

    .controller('TileController', ['$scope', 'DevService', function ($scope, DevService) {
      var self = $scope;

      DevService.getDevInfoForTile().then(function (data) {
        self.devInfos = data;
      })

    }])

    .controller('DevTableController', ['$scope', 'DevService',"$rootScope",
      function ($scope, DevService, $rootScope) {
        var self = $scope;

        self.selectProvince = function (name) {
          self.curProvince = name

          DevService.getCityList({province: name}).then(function (data) {
            self.city_list = data
              self.district_list = "";
              self.dev_list = "";
          })
        }

        self.selectCity = function (city) {
          self.curCity = city

          DevService.getDistrictList({province: self.curProvince, city: city}).then(function (data) {
            self.district_list = data
            self.dev_list = "";
          })

        }

          self.selectDistricts = function (district) {
              self.curDistrict = district

              DevService.getSmartGateByDistrict({province:self.curProvince, city:self.curCity, district: district}).then(function (data) {
                  console.log("getDevList: ", data)
                  self.devInfos = data
                  self.dev_list = data
              })
          }

        self.selectDev = function (sn) {
          console.log("selectDev: ", sn)

          DevService.getDevInfoByUid(sn).then(function (data) {
            DevService.curGreenHouseForList = data

            $rootScope.$broadcast("ui:update:curDevForList", true)
  //        self.curDevInfo = data
          })
        }

        DevService.getProvinceList().then(function (data) {
          self.province_list = data
        })

        self.multipleSelect = {
          groups: []
        }

        DevService.getDevGroupList().then(function (data) {
          console.log(">>->> getDevGroupList: ", data)

          self.availableGroups = _.pluck(data, "name")
          self.multipleSelect.groups[0] = self.availableGroups[0]

          self.devInfos = []

          self.curGroup = self.multipleSelect.groups[0]

          return DevService.getDevListByGroup(self.multipleSelect.groups[0])
        }).then(function (data) {
          _.forEach(data, function (el) {
            self.devInfos.push(el);
          })
        })

        self.groupsSubmit = function (groups) {
          console.log("groupsSubmit groups: ", groups)
          self.curGroup = groups

          self.devInfos = []
          _.forEach(groups, function (groupname) {
            DevService.getDevListByGroup(groupname).then(function (data) {
              console.log("get:   ", data)

              _.forEach(data, function (el) {
                self.devInfos.push(el);
              })

            })
          })

        } // groupsSubmit


      }])

  
})();






