"use strict";

angular.module("risevision.common.components.userstate")
  .controller("ResetPasswordConfirmCtrl", ["$scope", "$loading", "$state",
    "$stateParams", "userauth",
    function ($scope, $loading, $state, $stateParams, userauth) {
      $scope.forms = {};
      $scope.credentials = {};
      $scope.errors = {};

      $scope.resetPassword = function () {
        $scope.invalidToken = false;
        $scope.emailNotConfirmed = false;
        $scope.notMatchingPassword = false;

        if ($scope.credentials.newPassword !== $scope.credentials.confirmPassword) {
          $scope.notMatchingPassword = true;
          return;
        }

        $loading.startGlobal("auth-reset-password");
        userauth.resetPassword($stateParams.user, $stateParams.token, $scope.credentials
          .newPassword)
          .then(function () {
            console.log("Password updated");
            $state.go("common.auth.unauthorized");
          })
          .catch(function (err) {
            console.log(err);
            $scope.invalidToken = true;
          })
          .finally(function () {
            $loading.stopGlobal("auth-reset-password");
          });
      };

      $scope.requestConfirmationEmail = function () {
        $scope.emailSent = false;
        $loading.startGlobal("auth-request-confirmation-email");
        userauth.resetPassword($stateParams.user, $stateParams.token, $scope.credentials
          .newPassword)
          .then(function () {
            $scope.emailSent = true;
          })
          .catch(function (err) {
            console.log(err);
          })
          .finally(function () {
            $loading.stopGlobal("auth-request-confirmation-email");
          });
      };
    }
  ]);
