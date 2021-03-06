/**
 * Created by xieyiming on 15-1-22.
 */

(function(){
  'use strict';

  angular.module('page.manager', [])
    .controller('ManagerController', ['$scope', '$rootScope', 'DevService', 'UtilService', 'BaiduMapService', '$global', 'DashboardMapService',
      function($scope, $rootScope, DevService, UtilService, BaiduMapService, $global, DashboardMapService) {

        var self = $scope;
        $rootScope.curPage = "manager";
        $global.set('rightbarCollapsed', false);
        $rootScope.curPage = "analysis";

        self.$on('$destroy', function() {
          $global.set('rightbarCollapsed', true);
          console.error("关闭 sidebar manlu");
        });


        self.center = DashboardMapService.getCenter();
        self.markers = DashboardMapService.getMarkers();
        self.layers = DashboardMapService.getLayers();

        console.info(">>>>>>>>>>>>> get self.layer: ", self.layers);
        self.events = DashboardMapService.getEvents();

        $scope.newTaskTitle = '';
        $scope.newTaskLabelText = '';
        $scope.showTasksTab = true;
        $scope.showCompletedTab = false;

        self.devList = [];
        self.devAlreadyGrouped = [];

        var flattenCommonData = function(data, isgrouped) {
          var temp = {};
          temp["dev_uuid"] = data.dev_uuid;
          if (isgrouped) {
            temp["groups"] = data.common.groups;
            temp["rawgroups"] = _.pluck(data.common.groups, "name");
          } else {
            temp["groups"] = [];
          }

          temp["alarm_list"] = data.common.alarm_list;
          temp["online"] = data.common.online;
          temp["location"] = data.common.location;
          temp["dev_alias"] = data.dev_alias;

          return temp;
        };

        var getUngroupDev = function() {
          console.error("getGroupDev");
          self.devList = [];
          DevService.getDevList({
            common: "online,devname,location",
            components: "null",
            isgrouped: false
          }).then(function(data) {
            _.forEach(data, function(el) {
              self.devList.push(flattenCommonData(el, false));
            });
            DevService.curUnregistDevList = self.devList;
          });
        };

        var getGroupDev = function() {
          console.error("getUngroupDev");
          self.devAlreadyGrouped = [];
          DevService.getDevList({
            common: "online,devname,location",
            components: "null",
            isgrouped: true
          }).then(function(data) {
            _.forEach(data, function(el) {
              self.devAlreadyGrouped.push(flattenCommonData(el, true));
            });
            console.log("after: ", self.devAlreadyGrouped);
          });
        };

        self.$on("data:updateDevInfo:change", function() {
          getGroupDev();
          getUngroupDev();
        });

        self.clickOnTab = function(tab) {
          if ('unregisted' == tab) {
            self.curTab = 'unregisted';
            getUngroupDev();
            console.log("### --> ### unregisterTab ");
          }

          if ('registed' == tab) {
            self.curTab = 'registed';
            console.log("### --> ### registerTab ");
            getGroupDev();
          }
        }; // clickOnTab

        getGroupDev(); // init the regist tab

        self.showByGroup = function(group_name) {
          console.log("## showByGroup: ", group_name);
          if ('all' == group_name) {
            getGroupDev();
          } else {
            DevService.getDevListByGroup(group_name).then(function(data) {
              console.log("getDevListByGroup: ", data);
              self.devAlreadyGrouped = [];
              _.forEach(data, function(el) {
                self.devAlreadyGrouped.push(flattenCommonData(el, true));
              });
            });
          } // else
        };

        self.openSettingCtrlSideBar = function(dev_uuid) {
          console.log("openSettingCtrlSideBar!");
          jQuery("#rightbar-settings").css("right", '0px'); // bad code

          self.curUUID = dev_uuid;
          $rootScope.$broadcast("ui:settingSideBar:open", {
            dev_uuid: dev_uuid
          });
        };

        self.hideSettingsSideBar = function() {
          jQuery("#rightbar-settings").css("right", '-500px');
        };

        self.updateCtrlData = function(title, key, val) {

          var targetIndex = _.findIndex(self.ctrlPanelData, function(el) {
            return el.title == title;
          });
          self.ctrlPanelData[targetIndex].content[key] = val;
          //      self.ctrlPanelData[0].content.ip = val;
          return "updateCtrlData"; // if returned , will be used as a error hint
        };

        self.colorPool = {
          color1: "rgb(255, 118, 118)",
          color2: "rgb(89, 184, 104)",
          color3: "rgb(89, 123, 184)",
          color4: "rgb(156, 184, 89)",
          color5: "rgb(55, 194, 188)",
          color6: "rgb(226, 198, 56)",
          color7: "rgb(56, 136, 226)",
          color8: "rgb(184, 89, 165)"
        };

        self.curDevInfo = {
          ip: '192.168.24.22',
          gateway: "192.168.25.254",
          mask: "255.255.255.0",
          dns1: "192.168.25.254",
          dns2: "18.168.25.254"
        };

        DevService.getDevGroupList().then(function(data) {
          console.info("-----> getDevGroupList group data: ", data);
          self.groups = data;
        });

        self.$on("update:groupCntChange", function() {
          console.info("update:groupCntChange arrived !");

          DevService.getDevGroupList().then(function(data) {
            console.info("update:groupCntChange: getDevGroupList group", data);
            self.groups = data;
          });
        });

        self.$on("update:groupCntChange", function() {
          console.info("update:groupCntChange arrived !");
          self.devAlreadyGrouped = [];
          DevService.getDevList({
            common: "online,devname",
            components: "null",
            isgrouped: true
          }).then(function(data) {
            _.forEach(data, function(el) {
              var temp = {};
              temp["dev_uuid"] = el.dev_uuid;
              temp["groups"] = el.common.groups;
              temp["alarm_list"] = el.common.alarm_list;
              temp["online"] = el.common.online;
              self.devAlreadyGrouped.push(temp);
            });
            console.log("after: ", self.devAlreadyGrouped);
          });
        });

        self.tasksComplete = [];
        self.devAlreadyGrouped = [];
        self.selectedItem = {};
        self.options = {};
        self.selectDevPool = {}; // just for display use
        self.devListSelectedGroup = [];
        self.devListSelected = [];

        self.addGroupSelected = function(name, color) {
          console.log("addGroupSelected: ", name);
          self.devListSelectedGroup.push({
            name: name,
            color: color
          });
        };

        self.removeSelectedGroup = function(name) {
          console.log("removeSelectedGroup: ", name);
          _.remove(self.devListSelectedGroup, function(el) {
            return el.name == name;
          });
        };

        self.addMultiSelectGroupConfirmed = function() {
          console.log("devListSelectedGroup: ", self.devListSelectedGroup);
          console.log("devListSelected: ", self.devListSelected);

          // todo: remove devList and push to devAlreadyGrouped
          // todo: warn when add group is empty

          if (self.devListSelectedGroup.length == 0) {
            alert("请选择分组");
            return false;
          }

          _.forEach(self.devListSelected, function(el) {
            el.groups = self.devListSelectedGroup;
            self.devAlreadyGrouped.push(el);

            _.remove(self.devList, function(subel) {
              return subel.dev_uuid == el.dev_uuid;
            });
          });

          DevService.addDevToGroup(_.pluck(self.devListSelected, "dev_uuid"), self.devListSelectedGroup)
            .then(function() {
              console.log("DevService.addDevToGroup multi done");
            });

          // cleanup
          self.devListSelectedGroup = [];
          self.devListSelected = [];
          self.multiSelect = !self.multiSelect;
          return false;
        };

        self.addMultiSelectGroupCancel = function() {
          self.multiSelect = !self.multiSelect;
        };

        self.toggleMultiSelect = function() {
          self.multiSelect = !self.multiSelect;

          if (self.multiSelect) {
            self.devListSelected = _.clone(self.devList);

            _.forEach(_.pluck(self.devList, 'dev_uuid'), function(el) {
              self.selectDevPool[el] = true;
            });

            console.log("toggleMultiSelect: devListSelected: ", self.devListSelected);
          }
        };

        self.toggleDevSelect = function(dev_uuid) {
          var targetIndex = -1;

          targetIndex = _.findIndex(self.devListSelected, function(el) {
            return el.dev_uuid == dev_uuid;
          });

          if (targetIndex >= 0) {
            _.remove(self.devListSelected, function(el) {
              return el.dev_uuid == dev_uuid;
            });
            self.selectDevPool[dev_uuid] = false;

          } else {
            self.devListSelected.push({
              dev_uuid: dev_uuid
            });
            self.selectDevPool[dev_uuid] = true;
          }
          //      console.log("self.selectDevPool: ", self.selectDevPool)
          console.log("devListSelected: ", self.devListSelected);
        };

        self.inDevSelected = function(uuid) {
          console.log("inDevSelected");
          return true;
        };

        self.toggleDevDetail = function() {
          self.devDetailCollapse = !self.devDetailCollapse;
        };

        self.complete = function(dev) {
          console.log("completeed: ", dev);
          self.devAlreadyGrouped.push(dev);

          if (_.isEmpty(dev.groups) || _.isUndefined(dev.groups)) {
            alert("请选择一个分组");
            return false;
          }

          DevService.addDevToGroup(dev.dev_uuid, _.pluck(dev.groups, "name")).then(function() {
            console.log("update:addDevToGroup");

            $rootScope.$broadcast("update:addDevToGroup", true);
            console.info("addDevToGroup ok!");
          });

          //      self.tasksComplete.push(item);
          _.remove(self.devList, function(el) {
            return el.dev_uuid == dev.dev_uuid;
          });
          return false;
        };

        self.incomplete = function(item, index) {
          self.tasks.push(item);
          self.tasksComplete.splice(index, 1);
        };

        self.removeDevGroupItem = function(uuid, group) {
          var targetIndex = _.findIndex(self.devAlreadyGrouped, function(el) {
            return el.dev_uuid == uuid;
          });
          console.log("removeDevGroupItem devAlreadyGrouped: ", self.devAlreadyGrouped);
          _.remove(self.devAlreadyGrouped[targetIndex].groups, function(el) {
            return el == group;
          });

          if (self.devAlreadyGrouped[targetIndex].groups.length == 0) {

            self.devList.push(_.find(self.devAlreadyGrouped, function(el) {
              return el.dev_uuid == uuid;
            }));

            _.remove(self.devAlreadyGrouped, function(el) {
              return el.dev_uuid == uuid;
            });
          }

          DevService.rmDevFromGroup(uuid, group.name).then(function() {
            console.info("DevService.rmDevFromGroup done");
            $rootScope.$broadcast("update:removeDevToGroup", true);

          });
          //todo: sync to DB
        };

        self.getGroupColor = function(name) {
          console.log("getGroupColor: ", name);
          var ret = _.find(self.groups, function(el) {
            return el.name == name;
          });
          return ret.color;
        };

        self.addGroupPreview = function(dev_uuid, groupName, color) {

          console.log("self addGroupPreview dev_uuid: ", dev_uuid);
          console.log("self addGroupPreview groupName: ", groupName);

          var targetIndex = _.findIndex(self.devList, function(el) {
            return el.dev_uuid == dev_uuid;
          });

          if (_.indexOf(self.devList[targetIndex].groups, groupName) >= 0) {
            alert("不能重复添加");
            return false;
          }
          //todo: check duplicate

          if (_.isUndefined(self.devList[targetIndex].groups)) {
            self.devList[targetIndex].groups = [];
          }

          //      _.remove(self.devList[targetIndex].groups, function(el){
          //        return el.name == "未注册"
          //      })

          self.devList[targetIndex].groups.push({
            name: groupName,
            color: color
          });
          return false;
        };

        self.addGroup = function(name) {
          //todo: check valid uniq etc ...
          if (_.isUndefined(name)) {
            alert("todo: check valid");
            return false;
          }

          self.addGroupArea = false;
          self.groups.push({
            name: name,
            color: self.selectGroupItemColor
          });

          //      DevService.addGroup({name:name, color: self.selectGroupItemColor}).then(function(){
          DevService.addGroup(name, self.selectGroupItemColor).then(function() {
            console.info("addGroup ok!");
          });

          console.log("add Group done: ", name);
        };

        self.deleteGroup = function(groupName) {
          console.info("self.deleteGroup in manager");

          DevService.deleteGroup(groupName).then(function() {

            console.log("deleteGroup: ", groupName + " done");
          });

        };

        self.selectGroupItemColor = self.colorPool["color1"]; //default

        self.addGroupTag = function(colorName, rgb) {
          self.selectGroupItemColor = rgb;
          console.log("addGroupItem: ", colorName);
          console.log("addGroupItem: ", rgb);
        };

        self.openGroupArea = function() {
          self.addGroupArea = true;
        };

        self.hideGroupArea = function() {
          self.addGroupArea = false;
        };

      }
    ])

  .controller("RemoteCtrlTabController", ['$scope', "$rootScope", "DevService", "UtilService",
    function($scope, $rootScope, DevService, UtilService) {
      var self = $scope;

      self.$on("ui:settingSideBar:open", function(ev, data) {
        self.curDevUuid = data.dev_uuid;
        DevService.getCmdList(data.dev_uuid).then(function(data) {
          console.log("openDetailSideBar get cmdlist: ", data);
          self.cmdList = data;
          self.cmdListOpt = {};

          _.forEach(self.cmdList, function(el) {
            self.cmdListOpt[el] = {
              show: false,
              data: {}
            };
          });
        });
      });

      var doVerifyData = function(data) {

        console.log("================== do verifyData =================");

        _.forEach(data.showcase, function(val, key) {
          //        console.log("::::::: about to verify val: ", val, " key: ", key)
          if (_.has(val, "verify")) {
            var verify_key = val.verify;
            var verify_pool = data.verify_keys;
            var alias_pool = data.translate_alias;

            if (_.has(verify_pool[verify_key], "translate_alias")) {
              val.val = alias_pool[val.val];
            }

            if (verify_pool[verify_key].data_type == "int") {
              val.val = parseInt(val.val);
            }
            //todo do verify
          }

        }); // end forEach
        data.showcase = UtilService.makePure(data.showcase);
        //      console.debug("after verify: ", data)
        return data;
      };

      self.verifyData = function(item, key, val) {
        //      var val = parseInt(val)

        console.log("self.changeShowcase4: ", item + " " + key + " " + val);

        if (key != 'component_id') {
          var query = {};

          var verifyed = doVerifyData(_.cloneDeep(self.cmdListOpt[item].data));

          if (_.isObject(verifyed)) {
            query['dev_uuid'] = verifyed.dev_uuid;
            query['ccp_token'] = verifyed.ccp_token;
            query['params'] = verifyed.showcase;
            query['params'].cmd = verifyed.cmd;
          } else {

            alert("verify error: ", verifyed);
          }

          console.log(":::::::: query: ", query);
          DevService.sendCmd(query).then(function(data) {});

        } else {

          console.log("before find: ", self.cmdListOpt[item].data.params);
          var targetIndex = _.findIndex(self.cmdListOpt[item].data.params, function(el) {
            return el.component_id.val == parseInt(val);
          });

          console.log("before deepCopy this: ", self.cmdListOpt[item].data.params[targetIndex]);
          self.cmdListOpt[item].data.showcase = _.cloneDeep(self.cmdListOpt[item].data.params[targetIndex]);
          console.log("before find(showcase): ", self.cmdListOpt[item].data.showcase);

        }
      };

      self.loadOption = function(item, key, show_key) {
        console.info("self.loadOption key: ", key);
        console.info("self.loadOption show_key: ", show_key);

        if (_.isObject(show_key)) {
          var show_key_bind = key + "_" + self.cmdListOpt[item].data.showcase[show_key.bind].val;
          console.log("show_key_bind: ", show_key_bind);
          self.curOption = self.cmdListOpt[item].data.show_keys[show_key_bind];
        } else {
          self.curOption = self.cmdListOpt[item].data.show_keys[show_key];
        }
        console.debug("self.curOption: ", self.curOption);
      };

      self.ctrlPanelToggle = function(item) {
        // todo: check self.cmdListOpt[item] and deside weather to post to db
        console.log("ctrlPanelToggle assign: ", self.cmdListOpt[item].show);

        if (!self.cmdListOpt[item].show) {
          console.log("load data ctrlPanel data");

          DevService.loadCtrlItem(self.curDevUuid, item).then(function(data) {
            console.info("loadCtrlItem: ", data);

            self.cmdListOpt[item].data = data;
            self.cmdListOpt[item].data.showcase = _.cloneDeep(self.cmdListOpt[item].data.params[0]);
            //          self.cmdListOpt[item].show = !self.cmdListOpt[item].show

          });
        }
        self.cmdListOpt[item].show = !self.cmdListOpt[item].show;
      };

    }
  ])

  .controller("SettingTabController", ['$scope', "$rootScope", "MapService", "BaiduMapService", "leafletEvents", "DevService",
    function($scope, $rootScope, MapService, BaiduMapService, leafletEvents, DevService) {
      var self = $scope;

      self.layers = {
        baselayers: {
          cloudmade: {
            name: '监测地图',
            type: 'xyz',
            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          }
        },
        overlays: {}
      };

      self.center = {
        lat: 26.82407078047018,
        lng: 114.345703125,
        zoom: 5 // more big more details
      };

      self.markers = {
        mainMarker: {
          lat: 38.6799428,
          lng: 154.0679234,
          focus: true,
          message: "正在获取定位信息 ...",
          draggable: true
        }
      };

      self.curEdit = {};

      self.updateDevInfo = function() {
        self.curEdit.groups = self.multipleSelect.groups;

        if (_.isEmpty(self.curEdit.groups)) {
          alert("请选择设备编组");
          return false;
        }

        console.info("####@####  updateDevInfo(before): ", self.curEdit);

        DevService.updateDevInfo(self.curEdit).then(function(data) {
          console.info("########  updateDevInfo(after): ", data);
          $rootScope.$broadcast("data:updateDevInfo:change", true);
          alert("保存完毕 !");
        });
        return false;
      };

      self.$on("ui:settingSideBar:open", function(ev, data) {
        self.locateState = "正在获取定位信息 ...";

        console.info(">>> ui:settingSideBar:open: ", data.dev_uuid);
        console.info(">>> ui:settingSideBar: self.devlist ", DevService.curUnregistDevList);

        var targetDevList = [];
        var targetDevIndex = -1;

        if ('unregisted' == self.curTab) {
          targetDevIndex = _.findIndex(DevService.curUnregistDevList, function(el) {
            return el.dev_uuid == data.dev_uuid;
          });
          targetDevList = DevService.curUnregistDevList;
        } else {
          targetDevIndex = _.findIndex(self.devAlreadyGrouped, function(el) {
            return el.dev_uuid == data.dev_uuid;
          });
          console.error("inside targetDevIndex: ", targetDevIndex);
          targetDevList = self.devAlreadyGrouped;
        }

        //        console.log("ui:settingSideBar: targetDevIndex: ", targetDevIndex)

        self.locateState = "可手动拖拽纠正坐标位置";
        //        console.log("### found targetDevList: ", targetDevList)
        //        console.log("### found location: ", targetDevList[targetDevIndex])
        var curDev = targetDevList[targetDevIndex];
        var curLocation = curDev.location;
        console.log("##-@@-## DevService.curUnregistDevList: ", targetDevList[targetDevIndex]);
        //        self.curDev = curDev
        self.markers.mainMarker.lat = curLocation.lat;
        self.markers.mainMarker.lng = curLocation.lng;
        self.markers.mainMarker.message = curLocation.address;
        self.markers.mainMarker.focus = true;

        //        console.error("******* fuck you: ", self.curEdit)
        if (_.has(curDev, "dev_alias") && !_.isUndefined(curDev["dev_alias"])) {
          self.curEdit.dev_alias = curDev.dev_alias;
        } else {
          self.curEdit.dev_alias = curDev.dev_uuid;
        }

        self.curEdit.dev_uuid = curDev.dev_uuid;
        self.curEdit.lat = curLocation.lat;
        self.curEdit.lng = curLocation.lng;

        console.log("fuck self.curEdit: ", self.curEdit);

        self.center.lat = curLocation.lat;
        self.center.lng = curLocation.lng;

        self.center.zoom = 7;

        DevService.getDevGroupList().then(function(data) {
          console.log("## getDevGroupList: ", data);
          self.availableGroups = _.pluck(data, "name");
        });

        if ('unregisted' == self.curTab) {
          self.multipleSelect.groups = curDev.groups;
        } else {
          self.multipleSelect.groups = curDev.rawgroups;
        }

      });

      var markerEvents = leafletEvents.getAvailableMarkerEvents();
      //handle dragend event
      for (var k in markerEvents) {
        var eventName = 'leafletDirectiveMarker.' + markerEvents[k];
        self.$on(eventName, function(event, args) {
          if ("leafletDirectiveMarker.dragstart" == event.name) {
            self.locateState = "正在获取定位信息 ...";
          }
          if ("leafletDirectiveMarker.dragend" == event.name) {
            BaiduMapService.getAddressByCoor(self.markers.mainMarker.lat, self.markers.mainMarker.lng)
              .then(function(data) {
                console.log("BaiduMapService.getAddressByCoor: ", data.data);

                if (_.isEmpty(data.data.result.formatted_address)) {
                  self.curAddr = "参考位置仅支持中国大陆地区";
                } else {
                  self.curAddr = data.data.result.formatted_address;
                  self.locateState = "可手动拖拽纠正坐标位置";
                }
                self.markers.mainMarker.message = self.curAddr;
                self.markers.mainMarker.focus = true;
                self.curEdit.lat = data.data.result.location.lat;
                self.curEdit.lng = data.data.result.location.lng;
              });
          }

        });
      }

      console.log("self.curDev.groups: ", self.curDev);

      self.multipleSelect = {
        groups: []
      };

    }
  ]);

})();


