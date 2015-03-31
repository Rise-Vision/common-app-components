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
