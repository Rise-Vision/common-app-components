(function (angular) {
  "use strict";

  /*jshint camelcase: false */

  angular.module("risevision.common.components.userstate")
    .factory("customAuthFactory", ["$q", "$log", "gapiLoader",
      "userauth", "userState",
      function ($q, $log, gapiLoader, userauth, userState) {
        var factory = {};

        factory.authenticate = function (credentials) {
          var deferred = $q.defer();
          var _state = userState._state;

          if (credentials && credentials.username && credentials.password) {
            var addPromise = $q.resolve();
            if (credentials.newUser) {
              addPromise = userauth.add(credentials.username, credentials.password);
            }

            addPromise
              .then(function () {
                return $q.all([userauth.login(credentials.username,
                  credentials.password), gapiLoader()]);
              })
              .then(function (result) {
                var loginInfo = result[0] && result[0].result;
                var gApi = result[1];

                if (loginInfo && loginInfo.item) {
                  var token = {
                    access_token: loginInfo.item,
                    expires_in: "3600",
                    token_type: "Bearer"
                  };
                  gApi.auth.setToken(token);

                  deferred.resolve({
                    email: credentials.username,
                    token: token
                  });
                } else {
                  deferred.reject();
                }
              })
              .then(null, function () {
                deferred.reject();
              });
          } else if (_state.userToken && _state.userToken.token) {
            gapiLoader().then(function (gApi) {
              gApi.auth.setToken(_state.userToken.token);

              // TODO: Validate token?

              deferred.resolve(_state.userToken);
            });
          } else {
            deferred.reject();
          }

          return deferred.promise;
        };

        return factory;
      }
    ]);

})(angular);
