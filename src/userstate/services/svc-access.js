"use strict";

angular.module("risevision.common.components.userstate")
  .factory("canAccessApps", ["$q", "$state", "$location",
    "userState", "userAuthFactory", "urlStateService",
    function ($q, $state, $location, userState, userAuthFactory,
      urlStateService) {
      return function () {
        var deferred = $q.defer();
        userAuthFactory.authenticate(false)
          .then(function () {
            if (userState.isRiseVisionUser()) {
              deferred.resolve();
            } else {
              return $q.reject();
            }
          })
          .then(null, function () {
            var newState;

            if (!userState.isLoggedIn()) {
              newState = "common.auth.createaccount";
            } else if ($state.get("common.auth.unregistered")) {
              newState = "common.auth.unregistered";
            }

            if (newState) {
              $state.go(newState, {
                state: urlStateService.get()
              }, {
                reload: true
              });

              $location.replace();
            }

            deferred.reject();
          });
        return deferred.promise;
      };
    }
  ]);
