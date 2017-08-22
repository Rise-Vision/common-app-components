"use strict";

angular.module("risevision.common.components.userstate")
  .controller("LoginCtrl", ["$scope", "$loading", "userAuthFactory",
    "uiFlowManager",
    function ($scope, $loading, userAuthFactory, uiFlowManager) {
      $scope.credentials = {};

      // Login Modal
      $scope.googleLogin = function (endStatus) {
        $loading.startGlobal("auth-buttons-login");
        userAuthFactory.authenticate(true)
          .finally(function () {
            $loading.stopGlobal("auth-buttons-login");
            uiFlowManager.invalidateStatus(endStatus);
          });
      };

      $scope.customLogin = function (endStatus) {
        $loading.startGlobal("auth-buttons-login");
        userAuthFactory.authenticate(true, $scope.credentials)
          .then(function () {
            $scope.loginError = false;
          })
          .then(null, function () {
            $scope.loginError = true;
          })
          .finally(function () {
            $loading.stopGlobal("auth-buttons-login");
            uiFlowManager.invalidateStatus(endStatus);
          });
      };
    }
  ]);
