"use strict";

angular.module("risevision.common.components.userstate")
  .controller("ConfirmAccountCtrl", ["$scope", "$loading", "$state",
    "$stateParams",
    "userauth", "urlStateService",
    function ($scope, $loading, $state, $stateParams, userauth,
      urlStateService) {
      $loading.startGlobal("auth-confirm-account");

      userauth.confirmUserCreation($stateParams.user, $stateParams.token)
        .then(function () {
          console.log("User confirmed");
        })
        .catch(function (err) {
          console.log(err);
        })
        .finally(function () {
          $loading.stopGlobal("auth-confirm-account");
          $state.go("common.auth.unauthorized");
        });
    }
  ]);
