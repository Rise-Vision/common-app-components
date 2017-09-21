"use strict";

angular.module("risevision.common.components.userstate")
  .controller("LoginCtrl", ["$scope", "$loading", "userAuthFactory",
    "customAuthFactory", "uiFlowManager",
    function ($scope, $loading, userAuthFactory, customAuthFactory,
      uiFlowManager) {
      $scope.forms = {};
      $scope.credentials = {};
      $scope.errors = {};

      $scope.googleLogin = function (endStatus) {
        $loading.startGlobal("auth-buttons-login");
        userAuthFactory.authenticate(true)
          .finally(function () {
            $loading.stopGlobal("auth-buttons-login");
            uiFlowManager.invalidateStatus(endStatus);
          });
      };

      $scope.customLogin = function (endStatus) {
        $scope.errors = {};

        if ($scope.forms.loginForm.$valid) {
          $loading.startGlobal("auth-buttons-login");

          userAuthFactory.authenticate(true, $scope.credentials)
            .then(function () {
              //
            })
            .then(null, function () {
              $scope.errors.loginError = true;
            })
            .finally(function () {
              $loading.stopGlobal("auth-buttons-login");
              uiFlowManager.invalidateStatus(endStatus);
            });
        }
      };

      $scope.createAccount = function (endStatus) {
        $scope.errors = {};

        if ($scope.forms.loginForm.$valid) {
          $loading.startGlobal("auth-buttons-login");

          customAuthFactory.addUser($scope.credentials)
            .then(function () {
              $scope.errors.confirmationRequired = true;
            })
            .then(null, function () {
              $scope.errors.duplicateError = true;
            })
            .finally(function () {
              $loading.stopGlobal("auth-buttons-login");
              uiFlowManager.invalidateStatus(endStatus);
            });
        }
      };

    }
  ]);
