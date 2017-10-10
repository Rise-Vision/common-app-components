"use strict";

angular.module("risevision.common.components.userstate")
  .controller("LoginCtrl", ["$scope", "$loading", "$stateParams",
    "$state", "userAuthFactory", "customAuthFactory", "uiFlowManager",
    "urlStateService", "isSignUp",
    function ($scope, $loading, $stateParams, $state, userAuthFactory,
      customAuthFactory, uiFlowManager, urlStateService, isSignUp) {
      $scope.forms = {};
      $scope.credentials = {};
      $scope.errors = {};
      $scope.isSignUp = isSignUp;

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
              if ($stateParams.state) {
                urlStateService.redirectToState($stateParams.state);
              }
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

      $scope.isPasswordValid = function () {
        return userAuthFactory.isPasswordValid($scope.credentials.password);
      };

      $scope.showSignUp = function () {
        var stateString = urlStateService.get();

        $state.go("common.auth.createaccount.final", {
          state: $stateParams.state
        });
      };

      $scope.showSignIn = function () {
        var stateString = urlStateService.get();

        $state.go("common.auth.unauthorized.final", {
          state: $stateParams.state
        });
      };

      $scope.createAccount = function (endStatus) {
        $scope.errors = {};

        if ($scope.forms.loginForm.$valid && $scope.isPasswordValid()) {
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
