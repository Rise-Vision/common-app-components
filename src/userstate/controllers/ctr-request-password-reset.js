"use strict";

angular.module("risevision.common.components.userstate")
  .controller("RequestPasswordResetCtrl", ["$scope", "$loading", "$log", "userauth",
    function ($scope, $loading, $log, userauth) {
      $scope.forms = {};
      $scope.credentials = {};
      $scope.errors = {};
      $scope.emailSent = false;

      $scope.requestPasswordReset = function () {
        $scope.emailSent = false;
        $loading.startGlobal("auth-request-password-reset");

        userauth.requestPasswordReset($scope.credentials.username)
          .then(function () {
            $log.log("Reset password request sent");
          })
          .catch(function (err) {
            $log.error(err);
          })
          .finally(function () {
            $loading.stopGlobal("auth-request-password-reset");
            $scope.emailSent = true;
          });
      };
    }
  ]);
