"use strict";

angular.module("risevision.common.components.userstate")
  .controller("SignUpCtrl", ["$scope", "userAuthFactory", "uiFlowManager",
    "$loading",
    function ($scope, userAuthFactory, uiFlowManager, $loading) {

      // Login Modal
      $scope.login = function (endStatus) {
        $loading.startGlobal("auth-buttons-login");
        userAuthFactory.authenticate(true).then().finally(function () {
          $loading.stopGlobal("auth-buttons-login");
          uiFlowManager.invalidateStatus(endStatus);
        });
      };
    }
  ]);
