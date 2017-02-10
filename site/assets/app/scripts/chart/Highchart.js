/**
 * Created by xieyiming on 15-1-11.
 */



'use strict'

angular
  .module('', [])
  // todo: rename the module or controller
  .controller('AnalysisController', ['$scope','HighchartService','UtilService','DevService',
    function ($scope,HighchartService, UtilService,DevService) {

      if (typeof String.prototype.startsWith != 'function') {
        // see below for better implementation!
        String.prototype.startsWith = function (str){
          return this.indexOf(str) == 0
        }
      }

      var self = $scope

      self.dayModel = 'today'
      self.sigModel = 'snr'

      self.startDate = ''
      self.endDate = ''

      self.dateTimeTitle = moment(new Date()).format('MMMDo')
      self.chartOption = HighchartService.getChartOption()

      self.dateRangeConfirm = function(){
        self.startDateTime = jQuery("#anStartDateModel").val()
        self.endDateTime = jQuery("#anEndDateModel").val()

        if(_.isEmpty(self.startDateTime) || _.isEmpty(self.endDateTime)){
          alert("请选择日期")
          return false
        }

        self.startDate = UtilService.parseDateTime(self.startDateTime)
        self.endDate = UtilService.parseDateTime(self.endDateTime)

        var tmpStart = moment(self.startDateTime.split(" ")[0]).format('MMMDo') + self.startDateTime.split(" ")[1]
        var tmpEnd   = moment(self.endDateTime.split(" ")[0]).format('MMMDo') + self.endDateTime.split(" ")[1]

        self.dateTimeTitle = tmpStart + " -- " + tmpEnd

        self.isDateStaffCollapsed = false

        //todo: update chartData
        var fakedata = []
        _.times(20, function(){
          fakedata.push(_.random(0,30))
        })

        //todo: got data
        HighchartService.updateData(fakedata)
      }

      self.updateChartData = function(date_type){

        if(date_type == 'today'){
          self.startDate = UtilService.today()
          self.endDate = UtilService.today()
          self.dateTimeTitle = UtilService.todaytitle()

        } else if(date_type == 'week') {
          self.startDate = UtilService.weekAgo()
          self.endDate = UtilService.today()
          self.dateTimeTitle = UtilService.weektitle()

        } else if(date_type == 'month') {
          self.startDate = UtilService.monthAgo()
          self.endDate = UtilService.today()
          self.dateTimeTitle = UtilService.monthtitle()
        }

        console.info("====> startDate: ", self.startDate)
        console.info("====> endDate: ", self.endDate)

//        self.chartConfig.series[0].data = []
        var fakedata = []
        _.times(20, function(){
          fakedata.push(_.random(0,30))
        })

        //todo: got data
        HighchartService.updateData(fakedata)
      }

      DevService.getDevGroupList().then(function(data){
        console.debug("self.groups: ", self.groups)
        self.groups = data
      })

      self.curGroup = "选择分组"

      self.selectDev = function(uuid){
        console.debug("selectDev: ", uuid)

        self.curDev = uuid; //todo: dev uuid
//        DevService.getFreqNameByDev(devName).then(function(data){
//          self.channels = data
//        })

        var targetIndex = _.findIndex(self.devs,function(el){
          return el.dev_uuid == uuid
        })

        self.channels = self.devs[targetIndex].components
      }

      self.selectGroup = function(groupName){
        console.log("select-group: ", groupName)
        self.curGroup = groupName
//        DevService.getDevNameByGroup(groupName).then(function(data){
//          self.devs = data
//        })
        DevService.getDevListByGroup(groupName).then(function(data){
          console.log("getDevListByGroup devs: ", data)
          self.devs = []
          _.forEach(data, function(el){
            var temp = {}
            temp["dev_uuid"] = el.dev_uuid
            temp["dev_name"] = el.common.dev_name
            temp["online"] = el.common.online
            temp["components"] = el.components

            self.devs.push(temp)
          })
//          self.devs = data
        })

      }

//      self.selectFreqPool = [];
      self.selectFreqPool = {}
      self.selectAllHelper = {}
      var curSelectCntHelper = {}

      self.selectAllFreq = function(dev_uuid, component_id){
//        console.log("selectAllFreq: ", dev_uuid);
//        console.log("selectAllFreq: ", component_id);
        var avalidComponent = _.find(self.channels.data, function(item){
          return item.component_id == component_id
        })

        console.log("debug: self.selectAllHelper[dev_uuid+component_id]: " ,self.selectAllHelper[dev_uuid+component_id]);
        if(_.isUndefined(self.selectAllHelper[dev_uuid+component_id])){
          self.selectAllHelper[dev_uuid+component_id] = true;
          _.each(avalidComponent.freqs, function(freq){
            self.selectFreqPool[(dev_uuid+'__'+component_id+'__'+freq)] = true;
          })
        }
        else if (self.selectAllHelper[dev_uuid+component_id]) {
          //unselect
          self.selectAllHelper[dev_uuid+component_id] = false;
//          console.log("avalidComponent: ", avalidComponent);
          curSelectCntHelper[dev_uuid+component_id] = 0;
          _.each(avalidComponent.freqs, function(freq){
            self.selectFreqPool[(dev_uuid+'__'+component_id+'__'+freq)] = false;
          })
        } else {
          self.selectAllHelper[dev_uuid+component_id] = true;
          _.each(avalidComponent.freqs, function(freq){
            self.selectFreqPool[(dev_uuid+'__'+component_id+'__'+freq)] = true;
          })
        }
      }

      self.toggleMultiSelect = function(dev_uuid, component_id, freq){
        var selectLabel = String(dev_uuid)+ '__' + String(component_id)+ '__' + String(freq);


        if( self.selectFreqPool[selectLabel] ){
          self.selectFreqPool[selectLabel] = false;
          self.selectAllHelper[dev_uuid+component_id] = false;
        } else {
          self.selectFreqPool[selectLabel] = true;
//          var allSelectLabel = _.keys(self.selectFreqPool);
          var allSelectLabel =
            _.keys(_.pick(self.selectFreqPool, function(val, key){
              return val == true;
            }));

          console.log("clear curSelectCntHelper: ", dev_uuid+component_id);
          console.log("about clear self.curSelectCntHelper: ", curSelectCntHelper);
          console.log("about clear: ", curSelectCntHelper[dev_uuid+component_id]);

          curSelectCntHelper[dev_uuid+component_id] = 0;
//          delete curSelectCntHelper[dev_uuid+component_id];
          console.log("allSelectFreqs: ", allSelectLabel);
          _.each(allSelectLabel, function(label){
            if(label.startsWith(dev_uuid+'__'+component_id)){
              curSelectCntHelper[dev_uuid+component_id] += 1;
            }

          })

          var avalidComponent = _.find(self.channels.data, function(item){
            return item.component_id == component_id;
          });

          console.log("curSelectCntHelper: ", curSelectCntHelper);
          console.log("selectComponent.freqs.length: ", avalidComponent.freqs.length);

          if(curSelectCntHelper[dev_uuid+component_id] == avalidComponent.freqs.length){
            self.selectAllHelper[dev_uuid+component_id] = true;
          }
        }

        console.log("toggleMultiSelect after: ", self.selectFreqPool);
      }

    }])



