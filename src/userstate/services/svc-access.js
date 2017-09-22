"use strict";

angular.module("risevision.common.components.userstate")
  .factory("canAccessApps", ["$q", "$state", "$location",
    "userState", "userAuthFactory",
    function ($q, $state, $location, userState, userAuthFactory) {
      return function () {
        var deferred = $q.defer();
        userAuthFactory.authenticate(false).then(function () {
          if (userState.isRiseVisionUser()) {
            deferred.resolve();
          } else {
            return $q.reject();
          }
        })
          .then(null, function () {
            if (userState.isLoggedIn()) {
              $state.go("common.auth.unregistered", null, {
                reload: true
              });
            } else {
              $state.go("common.auth.unauthorized", null, {
                reload: true
              });
            }

            $location.replace();

            deferred.reject();
          });
        return deferred.promise;
      };
    }
  ]);
