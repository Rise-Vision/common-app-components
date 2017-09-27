"use strict";

/*jshint camelcase: false */

angular.module("risevision.common.components.userstate")
  .controller("GoogleResultCtrl", ["$log", "$stateParams", "userState",
    "urlStateService",
    function ($log, $stateParams, userState, urlStateService) {
      $log.debug("URL params", $stateParams);

      userState._restoreState();
      if ($stateParams.access_token) {
        userState._setUserToken($stateParams);
      }

      if ($stateParams.state) {
        urlStateService.redirectToState($stateParams.state);
      }
    }
  ]);