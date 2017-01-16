"use strict";

angular.module("risevision.common.components.presentation-selector.services", [
  "risevision.common.gapi",
  "risevision.core.util"
]);

angular.module("risevision.common.components.presentation-selector", [
  "risevision.common.components.presentation-selector.services",
  "risevision.common.components.scrolling-list",
  "risevision.common.loading",
  "ui.bootstrap"
]);

"use strict";

angular.module("risevision.common.components.presentation-selector.services")
  .factory("presentationFactory", ["$q", "presentation",
    function ($q, presentation) {
      var factory = {};

      var _presentations = [];
      factory.loadingPresentation = false;
      factory.apiError = "";

      factory.getPresentationCached = function (presentationId) {
        var presentation = _.find(_presentations, {
          id: presentationId
        });

        if (!presentation) {
          presentation = {
            id: presentationId
          };

          _presentations.push(presentation);

          factory.getPresentation(presentationId);
        }

        return presentation;
      };

      var _updatePresentationCache = function (presentation) {
        var cachedPresentation = factory.getPresentationCached(
          presentation.id);

        cachedPresentation.name = presentation.name;
        cachedPresentation.revisionStatus = presentation.revisionStatus;
      };

      factory.getPresentation = function (presentationId) {
        var deferred = $q.defer();

        //show loading spinner
        factory.loadingPresentation = true;

        presentation.get(presentationId)
          .then(function (result) {
            _updatePresentationCache(result.item);

            deferred.resolve(result.item);
          })
          .then(null, function (e) {
            factory.apiError = e.message ? e.message : e.toString();

            deferred.reject();
          })
          .finally(function () {
            factory.loadingPresentation = false;
          });

        return deferred.promise;
      };

      return factory;
    }
  ]);

"use strict";

/*jshint camelcase: false */

angular.module("risevision.common.components.presentation-selector.services")
  .constant("PRESENTAION_WRITABLE_FIELDS", [
    "name", "layout", "distribution", "isTemplate", "embeddedIds"
  ])
  .constant("PRESENTAION_SEARCH_FIELDS", [
    "name", "id", "revisionStatusName"
  ])
  .service("presentation", ["$q", "$log", "coreAPILoader", "userState",
    "pick", "PRESENTAION_WRITABLE_FIELDS", "PRESENTAION_SEARCH_FIELDS",
    function ($q, $log, coreAPILoader, userState, pick,
      PRESENTAION_WRITABLE_FIELDS, PRESENTAION_SEARCH_FIELDS) {

      var createSearchQuery = function (fields, search) {
        var query = "";

        for (var i in fields) {
          query += "OR " + fields[i] + ":~\"" + search + "\" ";
        }

        query = query.substring(3);

        return query.trim();
      };

      var service = {
        list: function (search, cursor) {
          var deferred = $q.defer();

          var query = search.query ?
            createSearchQuery(PRESENTAION_SEARCH_FIELDS, search.query) :
            "";

          var obj = {
            "companyId": userState.getSelectedCompanyId(),
            "search": query,
            "cursor": cursor,
            "count": search.count,
            "sort": search.sortBy + (search.reverse ? " desc" : " asc")
          };
          $log.debug("list presentations called with", obj);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.list(obj);
          })
            .then(function (resp) {
              $log.debug("list presentations resp", resp);

              deferred.resolve(resp.result);
            })
            .then(null, function (e) {
              $log.error("Failed to get list of presentations.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        },
        get: function (presentationId) {
          var deferred = $q.defer();

          var obj = {
            "id": presentationId,
            "companyId": userState.getSelectedCompanyId()
          };

          $log.debug("get presentation called with", presentationId);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.get(obj);
          })
            .then(function (resp) {
              $log.debug("get presentation resp", resp);
              deferred.resolve(resp.result);
            })
            .then(null, function (e) {
              $log.error("Failed to get presentation.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        },
        add: function (presentation) {
          var deferred = $q.defer();

          var fields = pick.apply(this, [presentation].concat(
            PRESENTAION_WRITABLE_FIELDS));
          if (userState.isRiseAdmin()) {
            fields.isStoreProduct = presentation.isTemplate && presentation
              .isStoreProduct;
          }
          var obj = {
            "companyId": userState.getSelectedCompanyId(),
            "data": fields
          };
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.add(obj);
          })
            .then(function (resp) {
              $log.debug("added presentation", resp);
              deferred.resolve(resp.result);
            })
            .then(null, function (e) {
              $log.error("Failed to add presentation.", e);
              deferred.reject(e);
            });
          return deferred.promise;
        },
        update: function (presentationId, presentation) {
          var deferred = $q.defer();

          var fields = pick.apply(this, [presentation].concat(
            PRESENTAION_WRITABLE_FIELDS));
          if (userState.isRiseAdmin()) {
            fields.isStoreProduct = presentation.isTemplate && presentation
              .isStoreProduct;
          }
          var obj = {
            "id": presentationId,
            "data": fields
          };

          $log.debug("update presentation called with", presentationId);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.patch(obj);
          })
            .then(function (resp) {
              $log.debug("update presentation resp", resp);
              deferred.resolve(resp.result);
            })
            .then(null, function (e) {
              $log.error("Failed to update presentation.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        },
        delete: function (presentationId) {
          var deferred = $q.defer();

          var obj = {
            "id": presentationId
          };

          $log.debug("delete presentation called with", presentationId);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.delete(obj);
          })
            .then(function (resp) {
              $log.debug("delete presentation resp", resp);
              deferred.resolve(resp);
            })
            .then(null, function (e) {
              $log.error("Failed to delete presentation.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        },
        publish: function (presentationId) {
          var deferred = $q.defer();

          var obj = {
            "id": presentationId
          };

          $log.debug("publish presentation called with", presentationId);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.publish(obj);
          })
            .then(function (resp) {
              $log.debug("publish presentation resp", resp);
              deferred.resolve(resp);
            })
            .then(null, function (e) {
              $log.error("Failed to publish presentation.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        },
        restore: function (presentationId) {
          var deferred = $q.defer();

          var obj = {
            "id": presentationId
          };

          $log.debug("restore presentation called with", presentationId);
          coreAPILoader().then(function (coreApi) {
            return coreApi.presentation.restore(obj);
          })
            .then(function (resp) {
              $log.debug("restore presentation resp", resp);
              deferred.resolve(resp.result);
            })
            .then(null, function (e) {
              $log.error("Failed to restore presentation.", e);
              deferred.reject(e);
            });

          return deferred.promise;
        }
      };

      return service;
    }
  ]);

"use strict";

angular.module("risevision.common.components.presentation-selector")
  .directive("presentationName", ["presentationFactory",
    function (presentationFactory) {
      return {
        restrict: "A",
        scope: {
          id: "=presentationName"
        },
        link: function ($scope, element) {
          $scope.$watch("id", function (id) {
            if (id) {
              $scope.presentation = presentationFactory.getPresentationCached(
                $scope.id);
            }
          });

          $scope.$watch("presentation.name", function (name) {
            if (name) {
              element.html(name);
            }
          });
        } //link()
      };
    }
  ]);

"use strict";
angular.module("risevision.common.components.presentation-selector")
  .controller("PresentationListModalController", ["$scope", "$rootScope",
    "presentation", "$loading", "BaseList", "$filter",
    function ($scope, $rootScope, presentation, $loading, BaseList, $filter) {
      var DB_MAX_COUNT = 40; //number of records to load at a time

      $scope.presentations = new BaseList(DB_MAX_COUNT);

      $scope.search = {
        sortBy: "name",
        count: DB_MAX_COUNT,
        reverse: false
      };

      $scope.filterConfig = {
        placeholder: $filter("translate")(
          "schedules-app.presentation-modal.search.placeholder"),
        id: "presentationSearchInput"
      };

      $scope.$watch("loadingPresentations", function (loading) {
        if (loading) {
          $loading.start("presentation-list-loader");
        } else {
          $loading.stop("presentation-list-loader");
        }
      });

      $scope.load = function () {
        if (!$scope.presentations.list.length || !$scope.presentations.endOfList &&
          $scope.presentations.cursor) {
          $scope.loadingPresentations = true;

          presentation.list($scope.search, $scope.presentations.cursor)
            .then(function (result) {
              $scope.presentations.add(result.items ? result.items : [],
                result.cursor);
            })
            .then(null, function (e) {
              $scope.error =
                "Failed to load presentations. Please try again later.";
            })
            .finally(function () {
              $scope.loadingPresentations = false;
            });
        }
      };

      $scope.load();

      $scope.sortBy = function (cat) {
        $scope.presentations.clear();

        if (cat !== $scope.search.sortBy) {
          $scope.search.sortBy = cat;
        } else {
          $scope.search.reverse = !$scope.search.reverse;
        }

        $scope.load();
      };

      $scope.doSearch = function () {
        $scope.presentations.clear();

        $scope.load();
      };

      $scope.select = function (presentationId, presentationName) {
        $rootScope.$broadcast(
          "risevision.common.components.presentation-selector.presentation-selected",
          presentationId, presentationName);
      };
    }
  ]);

"use strict";

angular.module("risevision.common.components.presentation-selector")
  .controller("selectPresentationModal", ["$scope", "$modalInstance",
    function ($scope, $modalInstance) {
      $scope.$on(
        "risevision.common.components.presentation-selector.presentation-selected",
        function (event, presentationId, presentationName) {
          $modalInstance.close([presentationId, presentationName]);
        }
      );

      $scope.dismiss = function () {
        $modalInstance.dismiss();
      };
    }
  ]);

"use strict";

// Revision Status Filter
angular.module("risevision.common.components.presentation-selector")
  .filter("presentationStatus", ["translateFilter",
    function (translateFilter) {
      return function (revisionStatusName) {
        if (revisionStatusName === "Published") {
          return translateFilter(
            "schedules-app.presentation-modal.presentation-list.status.published"
          );
        } else if (revisionStatusName === "Revised") {
          return translateFilter(
            "schedules-app.presentation-modal.presentation-list.status.revised"
          );
        } else {
          return "N/A";
        }
      };
    }
  ]);

(function(module) {
try {
  module = angular.module('risevision.common.components.presentation-selector');
} catch (e) {
  module = angular.module('risevision.common.components.presentation-selector', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('presentation-selector/presentation-list-modal.html',
    '<div ng-controller="PresentationListModalController"><search-filter filter-config="filterConfig" search="search" do-search="doSearch"></search-filter><div class="panel half-top"><div class="scrollable-list" scrolling-list="load()" rv-spinner="" rv-spinner-key="presentation-list-loader" rv-spinner-start-active="1"><table id="presentationListTable" class="table table--hover"><thead class="table-header"><tr class="table-header__row"><th id="tableHeaderName" ng-click="sortBy(\'name\')" class="table-header__cell clickable">{{\'schedules-app.presentation-modal.presentation-list.heading.name\' | translate}}<i ng-if="search.sortBy == \'name\'" class="fa" ng-class="{false: \'fa-long-arrow-up\', true: \'fa-long-arrow-down\'}[search.reverse]"></i></th><th id="tableHeaderStatus" class="table-header__cell text-right">{{\'schedules-app.presentation-modal.presentation-list.heading.status\' | translate}}</th></tr></thead><tbody class="table-body"><tr class="table-body__row clickable" data-ng-click="toggleObject.item = $index; select(presentation.id, presentation.name);" data-ng-class="{\'active\' : toggleObject.item == $index}" ng-repeat="presentation in presentations.list"><td id="presentationName" class="table-body__cell">{{presentation.name}}</td><td class="table-body__cell text-right"><span ng-class="{\'text-danger\': presentation.revisionStatus==1}">{{presentation.revisionStatusName | presentationStatus}}</span></td></tr></tbody></table></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('risevision.common.components.presentation-selector');
} catch (e) {
  module = angular.module('risevision.common.components.presentation-selector', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('presentation-selector/presentation-modal.html',
    '<div id="addPresentationModal"><div class="modal-header"><button type="button" class="close" ng-click="dismiss()" aria-hidden="true"><i class="fa fa-times"></i></button><h3 class="modal-title" translate="">schedules-app.presentation-modal.title</h3></div><div class="modal-body" stop-event="touchend" ng-include="" src="\'presentation-selector/presentation-list-modal.html\'"></div></div>');
}]);
})();
