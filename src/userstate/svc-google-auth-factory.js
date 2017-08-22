(function (angular) {
  "use strict";

  /*jshint camelcase: false */

  angular.module("risevision.common.components.userstate")
  // constants (you can override them in your app as needed)
  .value("OAUTH2_SCOPES",
    "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
  )
    .value("GOOGLE_OAUTH2_URL", "https://accounts.google.com/o/oauth2/auth")
    .run(["$location", "$window", "userState", "$log",
      function ($location, $window, userState, $log) {
        var stripLeadingSlash = function (str) {
          if (str[0] === "/") {
            str = str.slice(1);
          }
          return str;
        };

        var parseParams = function (str) {
          var params = {};
          str.split("&").forEach(function (fragment) {
            var fragmentArray = fragment.split("=");
            params[fragmentArray[0]] = fragmentArray[1];
          });
          return params;
        };

        var path = $location.path();
        var params = parseParams(stripLeadingSlash(path));
        $log.debug("URL params", params);
        userState._restoreState();
        if (params.access_token) {
          userState._setUserToken(params);
        }
        if (params.state) {
          var state = JSON.parse(decodeURIComponent(params.state));
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
        }

      }
    ])
    .factory("googleAuthFactory", [
      "$q", "$log", "$location", "CLIENT_ID", "gapiLoader", "OAUTH2_SCOPES",
      "getOAuthUserInfo", "objectHelper",
      "$rootScope", "$interval", "$window", "GOOGLE_OAUTH2_URL",
      "localStorageService", "$document", "uiFlowManager", "getBaseDomain",
      "rvTokenStore", "$http", "userState",
      function ($q, $log, $location, CLIENT_ID,
        gapiLoader, OAUTH2_SCOPES, getOAuthUserInfo, objectHelper,
        $rootScope, $interval, $window, GOOGLE_OAUTH2_URL,
        localStorageService, $document, uiFlowManager, getBaseDomain,
        rvTokenStore, $http, userState) {

        var _accessTokenRefreshHandler = null;

        var _authorizeDeferred;

        var _scheduleAccessTokenAutoRefresh = function () {
          //cancel any existing $interval(s)
          $interval.cancel(_accessTokenRefreshHandler);
          _accessTokenRefreshHandler = $interval(function () {
            //cancel current $interval. It will be re-sheduled if authentication succeeds
            $interval.cancel(_accessTokenRefreshHandler);
            //refresh Access Token
            authenticate();
          }, 55 * 60 * 1000); //refresh every 55 minutes
        };

        var _cancelAccessTokenAutoRefresh = function () {
          $interval.cancel(_accessTokenRefreshHandler);
          _accessTokenRefreshHandler = null;
        };

        var _gapiAuthorize = function (attemptImmediate) {
          var deferred = $q.defer();

          var _state = userState._state;
          var opts = {
            client_id: CLIENT_ID,
            scope: OAUTH2_SCOPES,
            cookie_policy: $location.protocol() + "://" +
              getBaseDomain()
          };

          if (_state.userToken !== "dummy") {
            opts.authuser = _state.userToken.email;
          } else {
            opts.authuser = $http.get(
              "https://www.googleapis.com/oauth2/v1/userinfo?access_token=" +
              _state.params.access_token)
              .then(function (resp) {
                return resp.data.email;
              }, function (err) {
                $log.debug("Error retrieving userinfo");
                return opts.authuser;
              });
          }

          if (attemptImmediate) {
            opts.immediate = true;
          } else {
            opts.prompt = "select_account";
          }

          $q.all([gapiLoader(), opts.authuser])
            .then(function (qAll) {
              var gApi = qAll[0];
              opts.authuser = qAll[1];
              // Setting the gapi token with the chosen user token. This is a fix for the multiple account issue.
              gApi.auth.setToken(_state.params);

              gApi.auth.authorize(opts, function (authResult) {
                $log.debug("authResult");
                if (authResult && !authResult.error) {
                  if (_state.params) {
                    // clear token so we don't deal with expiry
                    delete _state.params;
                  }

                  _scheduleAccessTokenAutoRefresh();

                  deferred.resolve(authResult);
                } else {
                  deferred.reject(authResult.error ||
                    "failed to authorize user");
                }
              });
            }).then(null, deferred.reject); //gapiLoader

          return deferred.promise;
        };

        /*
         * Responsible for triggering the Google OAuth process.
         *
         */
        var authenticate = function (forceAuth) {
          var deferred = $q.defer();

          var authResult;

          _gapiAuthorize(!forceAuth)
            .then(function (res) {
              authResult = res;

              return getOAuthUserInfo();
            })
            .then(function (oauthUserInfo) {
              deferred.resolve(oauthUserInfo);
            })
            .then(null, function (err) {
              deferred.reject(err);
            });

          return deferred.promise;
        };

        var authenticateRedirect = function (forceAuth) {

          if (!forceAuth) {
            return authenticate(forceAuth);
          } else {
            var loc, path, search, state;

            // Redirect to full URL path
            if ($rootScope.redirectToRoot === false) {
              loc = $window.location.href.substr(0, $window.location.href
                .indexOf(
                  "#")) || $window.location.href;
            }
            // Redirect to the URL root and append pathname back to the URL
            // on Authentication success
            // This prevents Domain authentication errors for sub-folders
            // Warning: Root folder must have CH available for this to work,
            // otherwise no redirect is performed!
            else {
              loc = $window.location.origin + "/";
              // Remove first character (/) from path since we're adding it to loc
              path = $window.location.pathname ? $window.location.pathname
                .substring(
                  1) : "";
              search = $window.location.search;
            }

            // double encode since response gets decoded once!
            state = encodeURIComponent(encodeURIComponent(JSON.stringify({
              p: path,
              u: $window.location.hash,
              s: search
            })));

            userState._persistState();
            uiFlowManager.persist();

            $window.location.href = GOOGLE_OAUTH2_URL +
              "?response_type=token" +
              "&scope=" + encodeURIComponent(OAUTH2_SCOPES) +
              "&client_id=" + CLIENT_ID +
              "&redirect_uri=" + encodeURIComponent(loc) +
            //http://stackoverflow.com/a/14393492
            "&prompt=select_account" +
              "&state=" + state;

            var deferred = $q.defer();
            // returns a promise that never get fulfilled since we are redirecting
            // to that google oauth2 page
            return deferred.promise;
          }
        };

        var googleAuthFactory = {
          authenticate: userState._state.inRVAFrame ?
            authenticate : authenticateRedirect
        };

        return googleAuthFactory;
      }
    ]);

})(angular);
