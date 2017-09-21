(function (angular) {
  "use strict";

  angular.module("risevision.common.components.userstate")
    .factory("urlStateService", ["$window", "$location", "userState",
      function ($window, $location, userState) {

        var urlStateService = {};

        urlStateService.get = function () {
          // var loc;
          var path, search, state;

          // Redirect to the URL root and append pathname back to the URL
          // on Authentication success
          // This prevents Domain authentication errors for sub-folders
          // Warning: Root folder must have CH available for this to work,
          // otherwise no redirect is performed!
          // loc = $window.location.origin + "/";
          // Remove first character (/) from path since we're adding it to loc
          path = $window.location.pathname ? $window.location
            .pathname
            .substring(1) : "";
          search = $window.location.search;

          state = encodeURIComponent(JSON.stringify({
            p: path,
            u: $window.location.hash,
            s: search
          }));

          return state;
        };

        urlStateService.redirectToState = function (stateString) {
          var state = JSON.parse(decodeURIComponent(stateString));
          if (state.p || state.s) {
            userState._persistState();

            $window.location.replace(state.p +
              state.s +
              state.u
            );
          } else if ($location.$$html5) { // HTML5 mode, clear path
            $location.path("");
          } else { // non HTML5 mode, set hash
            $window.location.hash = state.u;
          }
        };

        return urlStateService;
      }
    ]);

})(angular);
