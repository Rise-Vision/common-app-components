"use strict";

angular.module("risevision.common.components.userstate")
  .controller("UrlStateCtrl", ["$state", "urlStateService",
    function ($state, urlStateService) {
      if ($state.current.name.indexOf(".final") === -1) {
        var stateString = urlStateService.get();
        var newState = $state.current.name + ".final";

        $state.go(newState, {
          state: stateString
        });
      }
    }
  ]);
