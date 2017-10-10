"use strict";

angular.module("risevision.common.components.userstate")
  .factory("canAccessApps", ["$q", "$state", "$location",
    "userState", "userAuthFactory",
    function ($q, $state, $location, userState, userAuthFactory) {
      return function () {
        return userAuthFactory.authenticate(false)
          .catch(function (err) {
            $state.go("common.auth.unauthorized", null, {
              reload: true
            });

            $location.replace();
            return $q.reject();
          });
      };
    }
  ]);
