(function () {
  "use strict";
  angular.module("risevision.app.common.components.modal-lookup-textbox",
    ["risevision.common.loading",
      "ui.bootstrap"
    ]);
}());
(function () {
"use strict";

angular.module("risevision.app.common.components.modal-lookup-textbox")
//updated url parameters to selected display status from status filter
    .controller("tagLookup", ["$scope", "tag", "$modalInstance", "$loading",
      "$log", "tags",
      function ($scope, tag, $modalInstance, $loading, $log, tags) {
        var _type = "LOOKUP";
        $scope.loadingTags = false;
        $scope.selectedTags = tags ? tags : [];

        $scope.$watch("loadingTags", function (loading) {
          if (loading) {
            $loading.start("tag-loader");
          } else {
            $loading.stop("tag-loader");
          }
        });

        var _flattenTagList = function(tags) {
          var res = [];
          for (var i = 0; i < tags.length; i++) {
            var tag = tags[i];

            if (tag.type === _type) {
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

        var _init = function () {
          $scope.loadingTags = true;

          tag.list()
            .then(function (tagList) {
              return tagList.items;
            })
            .then(function (items) {
              $scope.availableTags = _flattenTagList(items);
            })
            .then(null, function(e) {
              $log.error("Could not load tags: ", e);
            }).finally(function() {
              $scope.loadingTags = false;
            });
        };

        _init();

        $scope.selectTag = function(tag) {
          $scope.selectedTags.push(tag);
        };

        $scope.removeTag = function(index) {
          //remove from array
          if (index > -1) {
            $scope.selectedTags.splice(index, 1);
          }
        };

        $scope.cancel = function() {
          $modalInstance.dismiss();
        };

        $scope.apply = function () {
          $modalInstance.close($scope.selectedTags);
        };

      }
    ]);
}());
(function () {

  "use strict";

/* Filters */
// Tag Search Filter
angular.module("risevision.app.common.components.modal-lookup-textbox")
    .filter("tagSelection", [function($filter) {
      return function(tags, selectedTags) {
        if (!tags) {
          return [];
        }
        var res = [];
        for (var i = 0; i < tags.length; i++) {
          var found = false;
          for (var j = 0; j < selectedTags.length; j++) {
            if(tags[i].name === selectedTags[j].name &&
              tags[i].value === selectedTags[j].value){
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
}());

(function () {
  "use strict";
  angular.module("risevision.app.common.components.modal-lookup-textbox")
    .directive("tagTextbox", ["$modal", "$templateCache", "$q",
      function ($modal, $templateCache, $q) {
        return {
          restrict: "E",
          $scope: {
            tags: "=?",
            tagDefs: "=",
            statusCode: "@"
          },
          template: $templateCache.get("modal-lookup-textbox/tag-textbox.html"),
          link: function ($scope) {
            $scope.openModal = function () {
              var modalInstance = $modal.open({
                template: $templateCache.get("modal-lookup-textbox/tag-lookup-modal.html"),
                controller: "tagLookup",
                resolve: {
                  tags: function () {
                    return angular.copy($scope.tags);
                  },
                  tag: function(){
                    var svc = {};
                    svc.list = function(){
                      var deferred = $q.defer();
                      if($scope.statusCode === 200){
                        var resp = {};
                        resp.items = $scope.tagDefs;
                        deferred.resolve(resp);
                      } else {
                        deferred.reject("Rejection Status Code: " + $scope.statusCode)
                      }
                      return deferred.promise;
                    };

                    return svc;
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
}());

(function(module) {
try { app = angular.module("risevision.app.common.components.modal-lookup-textbox"); }
catch(err) { app = angular.module("risevision.app.common.components.modal-lookup-textbox", []); }
app.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("modal-lookup-textbox/tag-lookup-modal.html",
    "<div>\n" +
    "\n" +
    "    <div class=\"modal-body\">\n" +
    "        <div rv-spinner rv-spinner-key=\"tag-loader\" rv-spinner-start-active=\"0\"></div>\n" +
    "        <div class=\"content-box content-box-editable\">\n" +
    "            <div class=\"label label-tag\" ng-repeat=\"tag in selectedTags\" ng-click=\"removeTag($index)\">\n" +
    "                {{tag.name}}: <span class=\"tag-value\">{{tag.value}}</span>\n" +
    "                <span><i class=\"fa fa-minus-circle\"></i></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "        <div class=\"content-box select-tags half-top\">\n" +
    "            <div class=\"input-group\">\n" +
    "                <span class=\"input-group-addon\"><i class=\"fa fa-search\"></i></span>\n" +
    "                <input type=\"text\" class=\"form-control\" placeholder=\"Search Lookup Tags\" ng-model=\"query\">\n" +
    "            </div>\n" +
    "\n" +
    "            <div class=\"label label-tag\" ng-repeat=\"tag in availableTags | tagSelection:selectedTags | filter:query\" ng-click=\"selectTag(tag)\">\n" +
    "                {{tag.name}}: <span class=\"tag-value\">{{tag.value}}</span>\n" +
    "                <span><i class=\"fa fa-plus-circle\"></i></span>\n" +
    "            </div>\n" +
    "        </div>\n" +
    "\n" +
    "    </div><!-- modal-body -->\n" +
    "\n" +
    "    <div class=\"modal-footer\">\n" +
    "        <button type=\"button\" class=\"btn btn-primary btn-fixed-width\"  ng-click=\"apply()\">Apply <i class=\"fa fa-white fa-check icon-right\"></i></button>\n" +
    "        <button type=\"button\" class=\"btn btn-default btn-fixed-width\" ng-click=\"cancel()\">Cancel <i class=\"fa fa-times icon-right\"></i></button>\n" +
    "    </div>\n" +
    "\n" +
    "\n" +
    "</div><!-- end: controller --> ");
}]);
})();

(function(module) {
try { app = angular.module("risevision.app.common.components.modal-lookup-textbox"); }
catch(err) { app = angular.module("risevision.app.common.components.modal-lookup-textbox", []); }
app.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("modal-lookup-textbox/tag-textbox.html",
    "<div class=\"content-box content-box-editable clickable add-bottom\" ng-click=\"openModal()\">\n" +
    "    <span class=\"edit-icon\"><i class=\"fa fa-lg fa-pencil\"></i></span>\n" +
    "    <div class=\"label label-tag\" ng-repeat=\"tag in tags\">\n" +
    "        <span class=\"tag-name\">{{tag.name}}</span> <span class=\"tag-value\">{{tag.value}}</span>\n" +
    "    </div>\n" +
    "</div>");
}]);
})();
