'use strict'

angular
  .module('theme.charts-flot', [])
  .controller('FlotChartsController', ['$scope', '$timeout','$interval', 'ChartModel',
    function ($scope, $timeout, $interval ,ChartModel) {

      var self = $scope;

      var dxta = [];
      var totalPoints = 24;
      var updateInterval = 200;
      var prevData = 0;

      //todo: use a limit to limit to 1 time per second
      function realtimeData() {
        if (dxta.length > 0)
          dxta = dxta.slice(1);

        var realData = ChartModel.realtimeData();

        prevData = realData

//        console.log("realData: ", realData);
        while (dxta.length < totalPoints) {
          var prev = dxta.length > 0 ? dxta[dxta.length - 1] : 10,
            y = prev + Math.random() * 10 - 5;
//            y = realData;

          if (y < 0) {
            y = 0;
          } else if (y > 40) {
            y = 40;
          }

          dxta.push(y);
        }

        var res = [];
        for (var i = 0; i < dxta.length; ++i) {
          res.push([i, dxta[i]])
        }
        return res;
      }

      $scope.realtimeData = [realtimeData()];
//      $scope.realtimeData2 = [realtimeData()];

      $scope.realtimeOptions = {
        series: {
          shadowSize: 0,
          lines: {
            fill: 0.1,
            show: true,
            lineWidth: 1.5
          }
        },
        grid: {
          borderWidth: 1,
          backgroundColor: "transparent",
          tickColor: "red"
//          backgroundColor: "#fff",
//          tickColor: "#008040"
        },
        yaxis: {
//          tickColor: "rgba(0,0,0,0.04)",
          tickColor: "rgba(255,255,255,0.04)",
          ticks: 2,
          min: 0,
          max: 40,
          font: {
//            color: 'rgba(0,0,0,0.4)',
            color: 'rgba(255,255,255,0.4)',
            size: 8
          }
        },
        xaxis: {
          tickColor: "transparent",
          show: false
        },
//        colors: ['#7dcc93']
        colors: ['#EE5C42']
      };

      $scope.realtimeOptions2 = {
        series: {
          shadowSize: 0,
          lines: {
            fill: 0.1,
            show: true,
            lineWidth: 1.5
          }
        },
        grid: {
          borderWidth: 1,
          backgroundColor: "transparent",
//          tickColor: "red"
//          backgroundColor: "#fff",
//          tickColor: "#008040"
        },
        yaxis: {
//          tickColor: "rgba(0,0,0,0.04)",
          tickColor: "rgba(255,255,255,0.04)",
          ticks: 4,
          min: 0,
          max: 40,
          font: {
//            color: 'rgba(0,0,0,0.4)',
            color: 'rgba(255,255,255,0.4)',
            size: 4
          }
        },
        xaxis: {
          tickColor: "transparent",
          show: false
        },
//        colors: ['#7dcc93']
        colors: ['#F4A460']
      };


      var promise;
      // only this way can do it, $interval can't not, reason unkown
      var throttledrealtimeData = _.throttle(realtimeData, 200000);

      var updateRealtimeData = function () {

        $scope.realtimeData = [throttledrealtimeData()];

        $timeout.cancel(promise);
        promise = $timeout(updateRealtimeData, updateInterval);
      };

      updateRealtimeData();

  }])

  .service("ChartModel", function () {
    var self = this;

    var fetchData = function() {

      return Math.random() * 30;
    };

    self.title = function () {
      return "Chart title";
    };

    self.realtimeData = function () {
//      var theData = 20;
//
//      var fetchData =  _.throttle(function(){
////      var fetchData =  _.debounce(function(){
//        console.log("fetchData ... ");
//        theData = Math.random() * 30;
//        return theData;
//      }, 3000);
//
//      fetchData()
////      console.log("fake data");

      return Math.random() * 30;
    };

  })


  .directive('flotChart', function () {
    return {
      restrict: 'AE',
      scope: {
        data: '=flotData',
        options: '=flotOptions',
        plothover: '&plotHover',
        plotclick: '&plotClick'
      },
      link: function (scope, element, attr) {
        var plot = $.plot($(element), scope.data, scope.options);

        $(element).bind('plothover', function (event, position, item) {
          scope.plothover({
            event: event,
            position: position,
            item: item
          });
        });

        $(element).bind('plotclick', function (event, position, item) {
          scope.plotclick({
            event: event,
            position: position,
            item: item
          });
        });

        scope.$watch('data', function (newVal, oldVal) {
          plot.setData(newVal);
          plot.draw();
        });

        scope.$watch('options', function (newVal, oldVal) {
          plot = $.plot($(element), scope.data, newVal);
        }, true);
      }
    }
  })
