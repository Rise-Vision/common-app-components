"use strict";

angular.module("risevision.common.components.userstate")
  .factory("canAccessApps", ["$q", "userState", "userAuthFactory", "$state",
    function ($q, userState, userAuthFactory, $state) {
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
              $state.go("common.auth.unregistered");
            } else {
              $state.go("common.auth.unauthorized");
            }
            deferred.reject();
          });
        return deferred.promise;
      };
    }
  ]);
