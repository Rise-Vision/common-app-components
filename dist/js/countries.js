(function () {
  "use strict";

  angular.module("risevision.common.components.countries", [
    "risevision.core.countries"
  ])
    .directive("countryDropdown", ["$templateCache", "COUNTRIES",
      function ($templateCache, COUNTRIES) {
        return {
          restrict: "E",
          scope: {
            country: "="
          },
          template: $templateCache.get("countries/country-dropdown.html"),
          link: function ($scope) {
            $scope.countries = COUNTRIES;
          } //link()
        };
      }
    ]);
}());

(function(module) {
try { app = angular.module("risevision.common.components.countries"); }
catch(err) { app = angular.module("risevision.common.components.countries", []); }
app.run(["$templateCache", function($templateCache) {
  "use strict";
  $templateCache.put("countries/country-dropdown.html",
    "<select id=\"country-dropdown\" class=\"form-control selectpicker\"\n" +
    "  ng-model=\"country\" ng-options=\"c.code as c.name for c in countries | orderBy: 'name'\">\n" +
    "  <option value=\"\">&lt; Select Country &gt;</option>\n" +
    "</select>\n" +
    "");
}]);
})();
