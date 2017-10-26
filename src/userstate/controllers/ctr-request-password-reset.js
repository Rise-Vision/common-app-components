"use strict";

angular.module("risevision.common.components.userstate")
  .controller("RequestPasswordResetCtrl", ["$scope", "$loading", "$log",
    "userauth",
    function ($scope, $loading, $log, userauth) {
      $scope.forms = {};
      $scope.credentials = {};
      $scope.errors = {};
      $scope.emailSent = false;
      $scope.isGoogleAccount = false;

      $scope.requestPasswordReset = function () {
        $scope.emailSent = false;
        $scope.isGoogleAccount = false;
        $loading.startGlobal("auth-request-password-reset");

        userauth.requestPasswordReset($scope.credentials.username)
          .then(function () {
            $log.log("Reset password request sent");
            $scope.emailSent = true;
          })
          .catch(function (err) {
            var error = err && err.result && err.result.error && err.result
              .error.message;

            if (error === "Google account") {
              $log.log("Requested password reset for Google account");
              $scope.isGoogleAccount = true;
            } else {
              $log.error(err);
              $scope.emailSent = true;
            }
          })
          .finally(function () {
            $loading.stopGlobal("auth-request-password-reset");
          });
      };
    }
  ]);
