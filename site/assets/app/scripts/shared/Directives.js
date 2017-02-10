
(function(){
  'use strict'

  angular
    .module('theme.directives', [])
    .directive('disableAnimation', ['$animate', function($animate){
      return {
          restrict: 'A',
          link: function($scope, $element, $attrs){
              $attrs.$observe('disableAnimation', function(value){
                  $animate.enabled(!value, $element);
              });
          }
      }
    }])
    .directive('slideOut', function() {
      return {
        restrict: 'A',
        scope: {
          show: '=slideOut'
        },
        link: function (scope, element, attr) {
          element.hide();
          scope.$watch('show', function (newVal, oldVal) {
            if (newVal !== oldVal) {
              element.slideToggle({
                complete: function () { scope.$apply(); }
              });
            }
          });
        }
      }
    })
    .directive('slideOutNav', ['$timeout', function($t) {
      return {
        restrict: 'A',
        scope: {
          show: '=slideOutNav'
        },
        link: function (scope, element, attr) {
          scope.$watch('show', function (newVal, oldVal) {
            if ($('body').hasClass('collapse-leftbar')) {
              if (newVal == true)
                element.css('display', 'block');
              else
                element.css('display', 'none');
              return;
            }
            if (newVal == true) {
              element.slideDown({
                complete: function () {
                  $t(function () { scope.$apply() })
                }
              });
            } else if (newVal == false) {
              element.slideUp({
                complete: function () {
                  $t(function () { scope.$apply() })
                }
              });
            }
          });
        }
      }
    }])
    .directive('panel', function(){
      return {
        restrict: 'E',
        transclude: true,
        scope: {
          panelClass: '@',
          heading: '@',
          panelIcon: '@'
        },
        templateUrl: 'templates/panel.html'
      }
    })
    .directive('pulsate', function () {
      return {
        scope: {
          pulsate: '='
        },
        link: function (scope, element, attr) {
          $(element).pulsate(scope.pulsate);
        }
      }
    })
    .directive('prettyprint', function() {
      return {
      restrict: 'C',
          link: function postLink(scope, element, attrs) {
              element.html(prettyPrintOne(element.html(),'',true));
          }
      };
    })

    .directive("passwordVerify", function() {
      return {
        require: "ngModel",
        scope: {
          passwordVerify: '='
        },
        link: function(scope, element, attrs, ctrl) {
          scope.$watch(function() {
              var combined;

              if (scope.passwordVerify || ctrl.$viewValue) {
                 combined = scope.passwordVerify + '_' + ctrl.$viewValue;
              }
              return combined;
          }, function(value) {
              if (value) {
                  ctrl.$parsers.unshift(function(viewValue) {
                      var origin = scope.passwordVerify;
                      if (origin !== viewValue) {
                          ctrl.$setValidity("passwordVerify", false);
                          return undefined;
                      } else {
                          ctrl.$setValidity("passwordVerify", true);
                          return viewValue;
                      }
                  });
              }
          });
       }
      };
    })
    .directive('backgroundSwitcher', function () {
      return {
        restrict: 'EA',
        link: function (scope, element, attr) {
          $(element).click( function () {
            $('body').css('background', $(element).css('background'));
          });
        }
      };
    })
    .directive('panelControls', [function() {
      return {
        restrict: 'E',
        require: '?^tabset',
        link: function(scope, element, attrs, tabsetCtrl) {
          var panel = $(element).closest('.panel');
          if (panel.hasClass('.ng-isolate-scope') == false) {
            $(element).appendTo(panel.find('.options'));
          }
        }
      };
    }])
    .directive('panelControlCollapse', function () {
      return {
        restrict: 'EAC',
        link: function (scope, element, attr) {
          element.bind('click', function () {
            $(element).toggleClass("fa-chevron-down fa-chevron-up");
            $(element).closest(".panel").find('.panel-body').slideToggle({duration: 200});
            $(element).closest(".panel-heading").toggleClass('rounded-bottom');
          })
          return false;
        }
      };
    })
    .directive('icheck', function($timeout, $parse) {
        return {
            require: '?ngModel',
            link: function($scope, element, $attrs, ngModel) {
                return $timeout(function() {
                    var parentLabel = element.parent('label');
                    if (parentLabel.length)
                      parentLabel.addClass('icheck-label');
                    var value;
                    value = $attrs['value'];

                    $scope.$watch($attrs['ngModel'], function(newValue){
                        $(element).iCheck('update');
                    })

                    return $(element).iCheck({
                        checkboxClass: 'icheckbox_minimal-blue',
                        radioClass: 'iradio_minimal-blue'

                    }).on('ifChanged', function(event) {
                        if ($(element).attr('type') === 'checkbox' && $attrs['ngModel']) {
                            $scope.$apply(function() {
                                return ngModel.$setViewValue(event.target.checked);
                            });
                        }
                        if ($(element).attr('type') === 'radio' && $attrs['ngModel']) {
                            return $scope.$apply(function() {
                                return ngModel.$setViewValue(value);
                            });
                        }
                    });
                });
            }
        };
    })
    .directive('knob', function () {
      return {
        restrict: 'EA',
        template: '<input class="dial" type="text"/>',
        scope: {
          options: '='
        },
        replace: true,
        link: function (scope, element, attr) {
          $(element).knob(scope.options);
        }
      }
    })
    .directive('uiBsSlider', ['$timeout', function ($timeout) {
      return {
        link: function (scope, element, attr) {
          // $timeout is needed because certain wrapper directives don't
          // allow for a correct calculaiton of width
          $timeout(function () {
            element.slider();
          });
        }
      };
    }])
    .directive('tileLarge', function() {
      return {
        restrict: 'E',
        scope: {
          item: '=data'
        },
        templateUrl: 'templates/tile-large.html',
        transclude: true
      }
    })
    .directive('tileMini', function() {
      return {
        restrict: 'E',
        scope: {
          item: '=data'
        },
        templateUrl: 'templates/tile-mini.html'
      }
    })



    .directive('tileChannel', function() {
      return {
        restrict: 'E',
        scope: {
          devinfo: '=data'
  //        select: "&"
        },

        controller: function($scope, $rootScope) {
          var self = $scope;
          // 这里又广播给自己是因为如果从一个 tile 点击到另一个tile , scope 变了 curselect 依赖
          // 的 scope 也变了，上一个 tile 的 hightlight 来不及取消掉
          self.curselect = 10000;
          self.select = function (dev_id, component_id) {
            self.curselect = (dev_id + component_id)
            $rootScope.$broadcast('update:tile:curselect', {dev_id:dev_id,component_id:component_id})
            console.info("curselect: ", self.curselect);
          }
          self.$on('update:tile:curselect', function(e, d){
            self.curselect = (d.dev_id + d.component_id);
          })

        },
        templateUrl: 'templates/tile-channel.html'
      }
    })

    .directive('tileHeaderbar', function(){
      return {
        restrict: "E",
        scope: {
          data:"="
        },

        templateUrl: "templates/tile-headerbar.html"
      }
    })


    .directive('tile', function() {
      return {
        restrict: 'E',
        scope: {
          heading: '@',
          type: '@'
        },
        transclude: true,
        templateUrl: 'templates/tile-generic.html',
        link: function (scope, element, attr) {
          var heading = element.find('tile-heading');
          if (heading.length) {
            heading.appendTo(element.find('.tiles-heading'));
          }
        },
        replace: true
      }
    })


    .directive('jscrollpane', ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        scope: {
          options: '=jscrollpane'
        },
        link: function (scope, element, attr) {
          $timeout( function () {
            if (navigator.appVersion.indexOf("Win")!=-1)
              element.jScrollPane($.extend({mouseWheelSpeed: 20},scope.options))
            else
              element.jScrollPane(scope.options);
            element.on('click', '.jspVerticalBar', function(event) { event.preventDefault(); event.stopPropagation(); });
            element.bind('mousewheel', function(e) {
              e.preventDefault();
            });
          });
        }
      };
    }])
    // specific to app
    .directive('stickyScroll', function () {
      return {
        restrict: 'A',
        link: function (scope, element, attr) {
          function stickyTop() {
              var topMax = parseInt(attr.stickyScroll);
              var headerHeight = $('header').height();
              if (headerHeight>topMax) topMax = headerHeight;
              if ($('body').hasClass('static-header') == false)
                return element.css('top', topMax+'px');
              var window_top = $(window).scrollTop();
              var div_top = element.offset().top;
              if (window_top < topMax) {
                  element.css('top', (topMax-window_top)+'px');
              } else {
                  element.css('top', 0+'px');
              }
          }

          $(function () {
              $(window).scroll(stickyTop);
              stickyTop();
          });
        }
      }
    })
    .directive('rightbarRightPosition', function () {
      return {
        restrict: 'A',
        scope: {
          isFixedLayout: '=rightbarRightPosition'
        },
        link: function (scope, element, attr) {
          scope.$watch('isFixedLayout', function (newVal, oldVal) {
            if (newVal!=oldVal) {
              setTimeout( function () {
                var $pc = $('#page-content');
                var ending_right = ($(window).width() - ($pc.offset().left + $pc.outerWidth()));
                if (ending_right<0) ending_right=0;
                $('#page-rightbar').css('right',ending_right);
              }, 100);
            }
          });
        }
      };
    })
    .directive('fitHeight', ['$window', '$timeout', '$location', function ($window, $timeout, $location) {
      return {
        restrict: 'A',
        scope: true,
        link: function (scope, element, attr) {
          scope.docHeight = $(document).height();
          var setHeight = function (newVal) {
            var diff = $('header').height();
            if ($('body').hasClass('layout-horizontal')) diff += 112;
            if ((newVal-diff)>element.outerHeight()) {
              element.css('min-height', (newVal-diff)+'px');
            } else {
              element.css('min-height', $(window).height()-diff);
            }
          };
          scope.$watch('docHeight', function (newVal, oldVal) {
            setHeight(newVal);
          });
          $(window).on('resize', function () {
            setHeight($(document).height());
          });
          var resetHeight = function () {
              scope.docHeight = $(document).height();
  //            $timeout(resetHeight, 1000);
            }
  //        $timeout(resetHeight , 1000);
        }
      };
    }])
    .directive('jscrollpaneOn', ['$timeout', function ($timeout) {
      return {
        restrict: 'A',
        scope: {
          applyon: '=jscrollpaneOn'
        },
        link: function (scope, element, attr) {
          scope.$watch('applyon', function (newVal) {
            if (newVal == false) {
              var api = element.data('jsp');
              if (api) api.destroy();
              return;
            }
            $timeout( function () {
              element.jScrollPane({autoReinitialise:true});
            });
          });
        }
      };
    }])
    .directive('backToTop', function () {2
      return {
        restrict: 'AE',
        link: function (scope, element, attr) {
          element.click( function (e) {
            $('body').scrollTop(0);
          });
        }
      }
    })

      .directive('updatePwd', function(){
          return {
              restrict: 'A',
              scope: true,
              link: function(scope, elem, attr){
                  $(elem).click(function(){
                      $('#up_pwd').fadeIn(100, function(){

                      })
                  })

                  $('#shut').click(function () {
                      $('#up_pwd').fadeOut(100);
                  });

              }
          }
      })

    .factory('exportExcel',function($window){
        var uri='data:application/vnd.ms-excel;base64,',
            template='<html' +
                ' xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"' +
                ' xmlns="http://www.w3.org/TR/REC-html40">' +
                '<head>' +
                '<!--[if gte mso 9]>' +
                '<xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/>' +
                '</x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml>' +
                '<![endif]-->' +
                '</head><body><table>{table}</table></body></html>',
            base64=function(s){return $window.btoa(unescape(encodeURIComponent(s)));},
            format=function(s,c){return s.replace(/{(\w+)}/g,function(m,p){return c[p];})};
        return {
            tableToExcel:function(tableId,worksheetName){
                var table=$(tableId),
                    ctx={worksheet:worksheetName,table:table.html()},
                    href=uri+base64(format(template,ctx));
                return href;
            }
        };
    })


})();



