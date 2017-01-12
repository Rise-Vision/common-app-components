"use strict";

angular.module("risevision.common.components.tag-selector.services", [
  "risevision.common.gapi"
]);

angular.module("risevision.common.components.tag-selector", [
  "risevision.common.components.tag-selector.services",
  "risevision.common.loading",
  "ui.bootstrap"
])
  .value("companyId", "")
  .value("STORAGE_API_ROOT",
    "https://storage-dot-rvaserver2.appspot.com/_ah/api");

"use strict";

//load the google api client lib for the storage api
angular.module("risevision.common.components.tag-selector.services")
  .factory("storageApiLoader", ["STORAGE_API_ROOT", "gapiClientLoaderGenerator",
    function (STORAGE_API_ROOT, gapiClientLoaderGenerator) {
      return gapiClientLoaderGenerator("storage", "v0.01", STORAGE_API_ROOT);
    }
  ])
  .value("STORAGE_API_ROOT",
    "https://storage-dot-rvaserver2.appspot.com/_ah/api");

"use strict";

angular.module("risevision.common.components.tag-selector.services")
  .service("tag", ["$q", "userState", "storageApiLoader", "$log",
    function ($q, userState, storageApiLoader, $log) {
      var LOOKUP_TYPE = "LOOKUP";
      var service = {};

      var _flattenTagList = function (tags) {
        var res = [];
        for (var i = 0; i < tags.length; i++) {
          var tag = tags[i];

          if (tag.type === LOOKUP_TYPE) {
            for (var j = 0; j < tag.values.length; j++) {
              res.push({
                name: tag.name,
                value: tag.values[j]
              });
            }
          }
        }
        return res;
      };

      service.flatList = function () {
        var deferred = $q.defer();

        service.list()
          .then(function (resp) {
            return _flattenTagList(resp.items);
          })
          .then(function (result) {
            deferred.resolve(result);
          })
          .then(null, function (e) {
            deferred.reject(e);
          });

        return deferred.promise;
      };

      service.list = function () {
        var deferred = $q.defer();
        var obj = {
          companyId: userState.getSelectedCompanyId()
        };

        storageApiLoader().then(function (storageApi) {
          return storageApi.tagdef.list(obj);
        })
          .then(function (resp) {
            $log.debug("get tag list resp", resp);
            deferred.resolve(resp.result);
          })
          .then(null, function (e) {
            $log.error("Failed to get tags list.", e);
            deferred.reject(e);
          });

        return deferred.promise;
      };

      return service;
    }
  ]);

"use strict";

angular.module("risevision.common.components.tag-selector")
  .directive("tagTextbox", ["$modal",
    function ($modal) {
      return {
        restrict: "E",
        scope: {
          tags: "="
        },
        templateUrl: "tag-selector/tag-textbox.html",
        link: function ($scope) {
          $scope.openModal = function () {
            var modalInstance = $modal.open({
              templateUrl: "tag-selector/tag-lookup-modal.html",
              controller: "tagLookup",
              resolve: {
                tags: function () {
                  return angular.copy($scope.tags);
                }
              }
            });

            modalInstance.result.then(function (tags) {
              //do what you need if user presses ok
              $scope.tags = tags;
            }, function () {
              // do what you need to do if user cancels
            });
          };

        } //link()
      };
    }
  ]);

"use strict";

//updated url parameters to selected display status from status filter
angular.module("risevision.common.components.tag-selector")
  .controller("tagLookup", ["$scope", "tag", "$modalInstance", "$loading",
    "$log", "tags",
    function ($scope, tag, $modalInstance, $loading, $log, tags) {
      $scope.loadingTags = false;
      $scope.selectedTags = tags ? tags : [];

      $scope.$watch("loadingTags", function (loading) {
        if (loading) {
          $loading.start("tag-loader");
        } else {
          $loading.stop("tag-loader");
        }
      });

      var _init = function () {
        $scope.loadingTags = true;

        tag.flatList()
          .then(function (tagList) {
            $scope.availableTags = tagList;
          })
          .then(null, function (e) {
            $log.error("Could not load tags: ", e);
          }).finally(function () {
            $scope.loadingTags = false;
          });
      };

      _init();

      $scope.selectTag = function (tag) {
        $scope.selectedTags.push(tag);
      };

      $scope.removeTag = function (index) {
        //remove from array
        if (index > -1) {
          $scope.selectedTags.splice(index, 1);
        }
      };

      $scope.cancel = function () {
        $modalInstance.dismiss();
      };

      $scope.apply = function () {
        $modalInstance.close($scope.selectedTags);
      };

    }
  ]);

"use strict";

// Tag Search Filter
angular.module("risevision.common.components.tag-selector")
  .filter("tagSelection", [

    function ($filter) {
      return function (tags, selectedTags) {
        if (!tags) {
          return [];
        }
        var res = [];
        for (var i = 0; i < tags.length; i++) {
          var found = false;
          for (var j = 0; j < selectedTags.length; j++) {
            if (tags[i].name === selectedTags[j].name &&
              tags[i].value === selectedTags[j].value) {
              found = true;
              break;
            }
          }

          if (!found) {
            res.push(tags[i]);
          }
        }
        return res;
      };
    }
  ]);

(function(module) {
try {
  module = angular.module('risevision.common.components.tag-selector');
} catch (e) {
  module = angular.module('risevision.common.components.tag-selector', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('tag-selector/tag-lookup-modal.html',
    '<div><div class="modal-body" stop-event="touchend"><div rv-spinner="" rv-spinner-key="tag-loader" rv-spinner-start-active="0"></div><div class="panel selected-tags panel-editable"><div class="label label-tag" ng-repeat="tag in selectedTags" ng-click="removeTag($index)">{{tag.name}}: <span class="tag-value">{{tag.value}}</span> <span><i class="fa fa-minus-circle"></i></span></div></div><div class="panel select-tags half-top"><div class="input-group"><span class="input-group-addon"><i class="fa fa-search"></i></span> <input type="text" class="form-control" placeholder="Search Lookup Tags" ng-model="query"></div><div class="label label-tag" ng-repeat="tag in availableTags | tagSelection:selectedTags | filter:query" ng-click="selectTag(tag)">{{tag.name}}: <span class="tag-value">{{tag.value}}</span> <span><i class="fa fa-plus-circle"></i></span></div></div></div><div class="modal-footer"><button type="button" class="btn btn-primary btn-fixed-width" ng-click="apply()">Apply <i class="fa fa-white fa-check icon-right"></i></button> <button type="button" class="btn btn-default btn-fixed-width" ng-click="cancel()">Cancel <i class="fa fa-times icon-right"></i></button></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('risevision.common.components.tag-selector');
} catch (e) {
  module = angular.module('risevision.common.components.tag-selector', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('tag-selector/tag-textbox.html',
    '<div class="panel panel-editable clickable add-bottom" ng-click="openModal()"><span class="edit-icon"><i class="fa fa-lg fa-pencil"></i></span><div class="label label-tag" ng-repeat="tag in tags"><span class="tag-name">{{tag.name}}</span> <span class="tag-value">{{tag.value}}</span></div></div>');
}]);
})();
