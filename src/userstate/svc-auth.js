(function () {
  "use strict";

  angular.module("risevision.common.components.userstate")
    .constant("USER_AUTH_WRITABLE_FIELDS", [
      "username", "password"
    ])
    .constant("TOKEN_WRITABLE_FIELDS", [
      "username", "token"
    ])
    .service("auth", ["$q", "$log", "coreAPILoader", "pick",
      "USER_AUTH_WRITABLE_FIELDS", "TOKEN_WRITABLE_FIELDS",
      function ($q, $log, coreAPILoader, pick,
        USER_AUTH_WRITABLE_FIELDS, TOKEN_WRITABLE_FIELDS) {

        var service = {
          add: function (username, password) {
            var deferred = $q.defer();

            var obj = {
              "username": username,
              "password": password
            };
            coreAPILoader().then(function (coreApi) {
              return coreApi.userauth.save(obj);
            })
              .then(function (resp) {
                $log.debug("added user credentials", resp);
                deferred.resolve(resp.result);
              })
              .then(null, function (e) {
                console.error("Failed to add credentials.", e);
                deferred.reject(e);
              });
            return deferred.promise;
          },
          update: function (username, password) {
            var deferred = $q.defer();

            var obj = {
              "username": username,
              "password": password
            };
            coreAPILoader().then(function (coreApi) {
              return coreApi.userauth.update(obj);
            })
              .then(function (resp) {
                $log.debug("update user credentials resp", resp);
                deferred.resolve(resp.result);
              })
              .then(null, function (e) {
                console.error("Failed to update credentials.", e);
                deferred.reject(e);
              });

            return deferred.promise;
          },
          login: function (username, password) {
            var deferred = $q.defer();

            var obj = {
              "username": username,
              "password": password
            };
            coreAPILoader().then(function (coreApi) {
              return coreApi.userauth.login(obj);
            })
              .then(function (resp) {
                $log.debug("login successful", resp);
                deferred.resolve(resp);
              })
              .then(null, function (e) {
                console.error("Failed to login user.", e);
                deferred.reject(e);
              });

            return deferred.promise;
          },
          refreshToken: function (username, token) {
            var deferred = $q.defer();

            var obj = {
              "username": username,
              "token": token
            };
            coreAPILoader().then(function (coreApi) {
              return coreApi.userauth.refreshToken(obj);
            })
              .then(function (resp) {
                $log.debug("token refresh successful", resp);
                deferred.resolve(resp);
              })
              .then(null, function (e) {
                console.error("Failed to refresh token.", e);
                deferred.reject(e);
              });

            return deferred.promise;
          }
        };

        return service;
      }
    ]);
})();
