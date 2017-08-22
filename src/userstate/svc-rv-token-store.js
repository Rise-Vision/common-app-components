(function (angular) {
  "use strict";

  angular.module("risevision.common.components.rvtokenstore")
    .service("rvTokenStore", ["$log", "$location", "cookieStore",
      "getBaseDomain",
      function ($log, $location, cookieStore, getBaseDomain) {
        var _readRvToken = function () {
          var token = cookieStore.get("rv-token");

          try {
            return JSON.parse(token);
          } catch (e) {
            return token;
          }
        };

        var _writeRvToken = function (value) {
          var baseDomain = getBaseDomain();
          if (baseDomain === "localhost") {
            cookieStore.put("rv-token", JSON.stringify(value), {
              path: "/"
            });
          } else {
            cookieStore.put("rv-token", JSON.stringify(value), {
              domain: baseDomain,
              path: "/"
            });
          }
        };

        var _clearRvToken = function () {
          var baseDomain = getBaseDomain();
          if (baseDomain === "localhost") {
            cookieStore.remove("rv-token", {
              path: "/"
            });
          } else {
            cookieStore.remove("rv-token", {
              domain: baseDomain,
              path: "/"
            });
          }
        };

        var rvToken = {
          read: _readRvToken,
          write: _writeRvToken,
          clear: _clearRvToken
        };

        return rvToken;
      }
    ]);

})(angular);
