(function (angular) {
  "use strict";

  try {
    angular.module("risevision.common.config");
  } catch (err) {
    angular.module("risevision.common.config", []);
  }

  angular.module("risevision.common.config")
    .value("ENABLE_EXTERNAL_LOGGING", true)
    .value("CORE_URL", "https://rvaserver2.appspot.com/_ah/api");

  angular.module("risevision.common.components.util", []);
  angular.module("risevision.common.components.logging", []);

  angular.module("risevision.common.components.rvtokenstore", [
    "risevision.common.components.util", "LocalStorageModule",
    "ngBiscuit"
  ]);

  angular.module("risevision.common.components.userstate", [
    "ui.router",
    "risevision.common.components.util",
    "risevision.common.components.rvtokenstore",
    "risevision.common.components.logging",
    "risevision.common.config",
    "risevision.common.gapi", "LocalStorageModule",
    "risevision.core.cache",
    "risevision.core.oauth2", "risevision.core.company",
    "risevision.core.util", "risevision.core.userprofile",
    "risevision.common.loading", "risevision.ui-flow"
  ])

  .value("CLIENT_ID", "614513768474.apps.googleusercontent.com");

})(angular);

"use strict";

angular.module("risevision.common.components.logging")
  .factory("bigQueryLogging", ["externalLogging", "userState",
    function (externalLogging, userState) {
      var factory = {};

      factory.logEvent = function (eventName, eventDetails, eventValue,
        username, companyId) {
        return externalLogging.logEvent(eventName, eventDetails, eventValue,
          username || userState.getUsername(), companyId || userState.getSelectedCompanyId()
        );
      };

      return factory;
    }
  ]);

(function (angular) {

  "use strict";

  angular.module("risevision.common.components.userstate")
    .factory("companyState", ["$location", "getCompany", "objectHelper",
      "$rootScope", "$log", "$q",
      function ($location, getCompany, objectHelper, $rootScope, $log, $q) {
        var pendingSelectedCompany;

        var _state = {
          userCompany: {},
          selectedCompany: {}
        };

        var _resetCompanyState = function () {
          objectHelper.clearObj(_state.selectedCompany);
          objectHelper.clearObj(_state.userCompany);
          $log.debug("Company state has been reset.");
        };

        if ($location.search().cid) {
          $log.debug("cid", $location.search().cid,
            "saved for later processing.");
          pendingSelectedCompany = $location.search().cid;
        }

        var _init = function () {
          var deferred = $q.defer();

          //populate userCompany
          getCompany().then(function (company) {
            var selectedCompanyId = _companyState.getSelectedCompanyId() ?
              _companyState.getSelectedCompanyId() :
              pendingSelectedCompany;

            objectHelper.clearAndCopy(company, _state.userCompany);

            return _switchCompany(selectedCompanyId);
          })
            .then(null, function () {
              _companyState.resetCompany();
            })
            .finally(function () {
              pendingSelectedCompany = null;

              deferred.resolve(null);
            });

          return deferred.promise;
        };

        var _switchCompany = function (companyId) {
          var deferred = $q.defer();

          if (companyId && companyId !== _state.userCompany.id) {
            getCompany(companyId)
              .then(function (company) {
                objectHelper.clearAndCopy(company, _state.selectedCompany);

                deferred.resolve();
                $rootScope.$broadcast(
                  "risevision.company.selectedCompanyChanged");
              })
              .then(null, function (resp) {
                $log.error("Failed to load selected company.", resp);

                deferred.reject(resp);
              });
          } else {
            _companyState.resetCompany();

            deferred.resolve();
          }

          return deferred.promise;
        };

        var _companyState = {
          init: _init,
          switchCompany: _switchCompany,
          updateCompanySettings: function (company) {
            if (company && company.id === _companyState.getSelectedCompanyId()) {
              objectHelper.clearAndCopy(company, _state.selectedCompany);
            }
            if (company && company.id === _companyState.getUserCompanyId()) {
              objectHelper.clearAndCopy(company, _state.userCompany);
            }

            $rootScope.$broadcast("risevision.company.updated", {
              "companyId": company.id
            });
          },
          resetCompany: function () {
            objectHelper.clearAndCopy(_state.userCompany, _state.selectedCompany);

            $rootScope.$broadcast(
              "risevision.company.selectedCompanyChanged");
          },
          resetCompanyState: _resetCompanyState,
          getUserCompanyId: function () {
            return (_state.userCompany && _state.userCompany.id) || null;
          },
          getUserCompanyName: function () {
            return (_state.userCompany && _state.userCompany.name) ||
              null;
          },
          getSelectedCompanyId: function () {
            return (_state.selectedCompany && _state.selectedCompany.id) ||
              null;
          },
          getSelectedCompanyName: function () {
            return (_state.selectedCompany && _state.selectedCompany.name) ||
              null;
          },
          getSelectedCompanyCountry: function () {
            return (_state.selectedCompany && _state.selectedCompany.country) ||
              null;
          },
          getCopyOfUserCompany: function (noFollow) {
            if (noFollow) {
              return angular.extend({}, _state.userCompany);
            } else {
              return objectHelper.follow(_state.userCompany);
            }
          },
          getCopyOfSelectedCompany: function (noFollow) {
            if (noFollow) {
              return angular.extend({}, _state.selectedCompany);
            } else {
              return objectHelper.follow(_state.selectedCompany);
            }
          },
          isSubcompanySelected: function () {
            return _state.selectedCompany && _state.selectedCompany.id !==
              (_state.userCompany && _state.userCompany.id);
          },
          isTestCompanySelected: function () {
            return _state.selectedCompany && _state.selectedCompany.isTest ===
              true;
          },
          isSeller: function () {
            return (_state.selectedCompany && _state.selectedCompany.sellerId) ?
              true : false;
          },
          isRootCompany: function () {
            return _state.userCompany && !_state.userCompany.parentId;
          }
        };

        return _companyState;
      }
    ]);

})(angular);

"use strict";

angular.module("risevision.common.components.logging")
  .constant("EXTERNAL_LOGGER_SERVICE_URL",
    "https://www.googleapis.com/bigquery/v2/projects/client-side-events/datasets/Apps_Events/tables/TABLE_ID/insertAll"
)
  .constant("EXTERNAL_LOGGER_REFRESH_URL",
    "https://www.googleapis.com/oauth2/v3/token?" +
    "client_id=1088527147109-6q1o2vtihn34292pjt4ckhmhck0rk0o7.apps.googleusercontent.com&" +
    "client_secret=nlZyrcPLg6oEwO9f9Wfn29Wh&refresh_token=1/xzt4kwzE1H7W9VnKB8cAaCx6zb4Es4nKEoqaYHdTD15IgOrJDtdun6zK6XiATCKT&" +
    "grant_type=refresh_token"
)
  .factory("externalLogging", ["$http", "$window", "$q", "$log",
    "EXTERNAL_LOGGER_REFRESH_URL", "EXTERNAL_LOGGER_SERVICE_URL",
    "ENABLE_EXTERNAL_LOGGING",
    function ($http, $window, $q, $log, EXTERNAL_LOGGER_REFRESH_URL,
      EXTERNAL_LOGGER_SERVICE_URL, ENABLE_EXTERNAL_LOGGING) {
      var factory = {};

      var _getSuffix = function () {
        var date = new Date();
        var year = date.getUTCFullYear();
        var month = date.getUTCMonth() + 1;
        var day = date.getUTCDate();
        if (month < 10) {
          month = "0" + month;
        }
        if (day < 10) {
          day = "0" + day;
        }
        return year.toString() + month.toString() + day.toString();
      };

      var EXTERNAL_LOGGER_INSERT_SCHEMA = {
        "kind": "bigquery#tableDataInsertAllRequest",
        "skipInvalidRows": false,
        "ignoreUnknownValues": false,
        "templateSuffix": _getSuffix(),
        "rows": [{
          "insertId": "",
          "json": {
            "event": "",
            "event_details": "",
            "event_value": 0,
            "host": "",
            "ts": 0,
            "user_id": "",
            "company_id": ""
          }
        }]
      };

      var _token, _tokenRefreshedAt;

      factory.logEvent = function (eventName, eventDetails, eventValue,
        userId, companyId) {
        $log.debug("BQ log", eventName, eventDetails, eventValue, userId,
          companyId);

        if (ENABLE_EXTERNAL_LOGGING === false) {
          $log.debug("External Logging DISABLED");
          return;
        }

        var deferred = $q.defer();

        factory.getToken().then(function (token) {
          var insertData = JSON.parse(JSON.stringify(
            EXTERNAL_LOGGER_INSERT_SCHEMA));
          var serviceUrl = EXTERNAL_LOGGER_SERVICE_URL.replace("TABLE_ID",
            "apps_events");

          insertData.rows[0].insertId = Math.random().toString(36).substr(2)
            .toUpperCase();
          insertData.rows[0].json.event = eventName;
          if (eventDetails) {
            insertData.rows[0].json.event_details = eventDetails;
          }
          if (eventValue) {
            insertData.rows[0].json.event_value = eventValue;
          }
          insertData.rows[0].json.user_id = userId || "";
          insertData.rows[0].json.company_id = companyId || "";
          insertData.rows[0].json.host = $window.location.hostname;
          insertData.rows[0].json.ts = new Date().toISOString();

          $http.post(serviceUrl, insertData, {
            headers: {
              "Content-Type": "application/json",
              "Authorization": "Bearer " + token
            }
          }).then(function (result) {
            deferred.resolve(result);
          }, function (error) {
            $log.debug("error posting to BQ", error);
            deferred.reject(error);
          });
        }, function (error) {
          $log.debug("BQ token ERROR", error);
          deferred.reject(error);
        });

        return deferred.promise;
      };

      factory.getToken = function () {
        var deferred = $q.defer();
        if (_token && new Date().getTime() - _tokenRefreshedAt < 3580000) {
          deferred.resolve(_token);
        } else {
          $http.post(EXTERNAL_LOGGER_REFRESH_URL).then(function (resp) {
            _token = resp.data.access_token;
            _tokenRefreshedAt = new Date().getTime();
            deferred.resolve(resp.data.access_token);
          }, function () {
            deferred.reject();
          });
        }
        return deferred.promise;
      };

      return factory;
    }
  ]);

(function (angular) {
  "use strict";

  angular.module("risevision.common.components.rvtokenstore")
    .service("rvTokenStore", ["$log", "$location", "cookieStore",
      "getBaseDomain",
      function ($log, $location, cookieStore, getBaseDomain) {
        var _readRvToken = function () {
          return cookieStore.get("rv-token");
        };

        var _writeRvToken = function (value) {
          var baseDomain = getBaseDomain();
          if (baseDomain === "localhost") {
            cookieStore.put("rv-token", value, {
              path: "/"
            });
          } else {
            cookieStore.put("rv-token", value, {
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

(function (angular) {

  "use strict";

  angular.module("risevision.common.components.userstate")

  .run(["$rootScope", "userState", "selectedCompanyUrlHandler",
    function ($rootScope, userState, selectedCompanyUrlHandler) {
      $rootScope.$on("risevision.company.selectedCompanyChanged",
        function (newCompanyId) {
          if (newCompanyId) {
            selectedCompanyUrlHandler.updateUrl();
          }
        });

      //detect selectCompany changes on route UI
      $rootScope.$on("$stateChangeSuccess", selectedCompanyUrlHandler.updateSelectedCompanyFromUrl);
      $rootScope.$on("$routeChangeSuccess", selectedCompanyUrlHandler.updateSelectedCompanyFromUrl);
      $rootScope.$on("$locationChangeSuccess", selectedCompanyUrlHandler.locationChangeSuccess);
    }
  ])

  .service("selectedCompanyUrlHandler", ["$state", "$stateParams",
    "$location", "userState",
    function ($state, $stateParams, $location, userState) {
      // Called when the selectedCompanyId is changed
      this.updateUrl = function () {
        var selectedCompanyId = userState.getSelectedCompanyId();
        // This parameter is only appended to the url if the user is logged in
        // Do not apply during $state.trasition (handler will)
        if (selectedCompanyId && $location.search().cid !==
          selectedCompanyId && !$state.transition) {
          $stateParams.cid = selectedCompanyId;
          $state.params.cid = selectedCompanyId;

          $location.search("cid", selectedCompanyId);
        }
      };

      this.updateSelectedCompanyFromUrl = function () {
        var newCompanyId = $location.search().cid;

        if (newCompanyId && userState.getUserCompanyId() &&
          newCompanyId !== userState.getSelectedCompanyId()) {
          // The CID is changed in the URL; switch company
          userState.switchCompany(newCompanyId);
        } else if (!newCompanyId && userState.getSelectedCompanyId()) {
          // The CID is missing in the URL; add it
          var currentURL = $location.absUrl();

          $stateParams.cid = userState.getSelectedCompanyId();
          $state.params.cid = userState.getSelectedCompanyId();

          $location.search("cid", userState.getSelectedCompanyId());
          if (currentURL === $location.destUrl) {
            // see explanation below
            $location.replace();
          }
        }
      };

      this.locationChangeSuccess = function (event, newUrl) {
        $location.destUrl = newUrl;
      };

      /*

      Explanation for the usage of the $location.replace() above
      ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

      Scenario 1: When application is using "ng-href" directive, then application goes through the following cycle

        $locationChangeSuccess -> $stateChangeSuccess -> $locationChangeSuccess

      Scenario 2: When application is using "ui-sref" directive or "$state.go" funtion, then application goes through the following cycle

        $stateChangeSuccess -> $locationChangeSuccess

      Here is the dilemma:
      - without $location.replace(), scenarion #2 works as expected creating single entries in the browser navigation history, 
      however scenario #1 creates duplicate entries - one URL without "cid" parameter and with "cid".
      - with $location.replace(), scenarion #2 does not add any entries to the browser navigation history, 
      however scenario #1 works as expected.
      
      The solution is to monitor $locationChangeSuccess events and record "newUrl" parameter, then use it in $stateChangeSuccess event
      in order to detect if pattern falls under scenario 1 or 2 then call $location.replace() based on that condition.

      */

    }
  ]);
})(angular);

(function (angular) {
  "use strict";

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

  angular.module("risevision.common.components.userstate")
  // constants (you can override them in your app as needed)
  .value("DEFAULT_PROFILE_PICTURE",
    "http://api.randomuser.me/portraits/med/men/33.jpg")
    .value("OAUTH2_SCOPES",
      "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile"
  )
    .value("GOOGLE_OAUTH2_URL", "https://accounts.google.com/o/oauth2/auth")
    .run(["$location", "$window", "userState", "$log",
      function ($location, $window, userState, $log) {
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
    .factory("userState", [
      "$q", "$log", "$location", "CLIENT_ID",
      "gapiLoader", "OAUTH2_SCOPES", "userInfoCache",
      "getOAuthUserInfo", "getUserProfile", "companyState", "objectHelper",
      "$rootScope", "$interval", "$loading", "$window", "GOOGLE_OAUTH2_URL",
      "localStorageService", "$document", "uiFlowManager", "getBaseDomain",
      "rvTokenStore", "externalLogging", "$http",
      function ($q, $log, $location, CLIENT_ID,
        gapiLoader, OAUTH2_SCOPES, userInfoCache,
        getOAuthUserInfo, getUserProfile, companyState, objectHelper,
        $rootScope, $interval, $loading, $window, GOOGLE_OAUTH2_URL,
        localStorageService, $document, uiFlowManager, getBaseDomain,
        rvTokenStore, externalLogging, $http) {
        //singleton factory that represents userState throughout application

        var _state = {
          profile: {}, //Rise vision profile
          user: {}, //Google user
          roleMap: {},
          userToken: rvTokenStore.read(),
          inRVAFrame: angular.isDefined($location.search().inRVA)
        };

        var _accessTokenRefreshHandler = null;

        var _authorizeDeferred, _authenticateDeferred;

        var _shouldLogPageLoad = true;

        var _logPageLoad = function (details) {
          if (_shouldLogPageLoad) {
            _shouldLogPageLoad = false;
            try {
              var duration = new Date().getTime() - $window.performance.timing
                .navigationStart;
              externalLogging.logEvent("page load time", details,
                duration,
                userState.getUsername(), userState.getSelectedCompanyId()
              );
            } catch (e) {
              $log.debug("Error logging load time");
            }
          }
        };

        var _detectUserOrAuthChange = function () {
          var token = rvTokenStore.read();
          if (token !== _state.userToken) {
            //token change indicates that user either signed in, or signed out, or changed account in other app
            $window.location.reload();
          } else if (_state.userToken) {
            //make sure user is not signed out of Google account outside of the CH enabled apps
            _authorize(true).finally(function () {
              if (!_state.userToken) {
                $log.debug("Authentication failed. Reloading...");
                $window.location.reload();
              }
            });
          }
        };

        var _visibilityListener = function () {
          var visibilityState;
          var document = $document[0];
          if (typeof document.hidden !== "undefined") {
            visibilityState = "visibilityState";
          } else if (typeof document.mozHidden !== "undefined") {
            visibilityState = "mozVisibilityState";
          } else if (typeof document.msHidden !== "undefined") {
            visibilityState = "msVisibilityState";
          } else if (typeof document.webkitHidden !== "undefined") {
            visibilityState = "webkitVisibilityState";
          }
          $log.debug("visibility: " + document[visibilityState]);
          if ("visible" === document[visibilityState]) {
            _detectUserOrAuthChange();
          }
        };

        var _getVisibilityChangeName = function () {
          var visibilityChange;
          var document = $document[0];
          if (typeof document.hidden !== "undefined") {
            visibilityChange = "visibilitychange";
          } else if (typeof document.mozHidden !== "undefined") {
            visibilityChange = "mozvisibilitychange";
          } else if (typeof document.msHidden !== "undefined") {
            visibilityChange = "msvisibilitychange";
          } else if (typeof document.webkitHidden !== "undefined") {
            visibilityChange = "webkitvisibilitychange";
          }
          return visibilityChange;
        };

        var _addEventListenerVisibilityAPI = function () {
          document.addEventListener(_getVisibilityChangeName(),
            _visibilityListener);
        };

        var _removeEventListenerVisibilityAPI = function () {
          document.removeEventListener(_getVisibilityChangeName(),
            _visibilityListener);
        };

        _addEventListenerVisibilityAPI();

        var _setUserToken = function () {
          _state.userToken = userState.getUsername();
          rvTokenStore.write(_state.userToken);
        };

        var _clearUserToken = function () {
          $log.debug("Clearing user token...");
          _cancelAccessTokenAutoRefresh();
          _state.userToken = null;
          rvTokenStore.clear();
        };

        var _scheduleAccessTokenAutoRefresh = function () {
          //cancel any existing $interval(s)
          $interval.cancel(_accessTokenRefreshHandler);
          _accessTokenRefreshHandler = $interval(function () {
            //cancel current $interval. It will be re-sheduled if authentication succeeds
            $interval.cancel(_accessTokenRefreshHandler);
            //refresh Access Token
            _authorize(true);
          }, 55 * 60 * 1000); //refresh every 55 minutes
        };

        var _cancelAccessTokenAutoRefresh = function () {
          $interval.cancel(_accessTokenRefreshHandler);
          _accessTokenRefreshHandler = null;
        };

        var _resetUserState = function () {
          _authenticateDeferred = null;
          objectHelper.clearObj(_state.user);
          objectHelper.clearObj(_state.profile);
          _state.roleMap = {};

          companyState.resetCompanyState();
          $log.debug("User state has been reset.");
        };

        var refreshProfile = function () {
          var deferred = $q.defer();
          //populate profile if the current user is a rise vision user
          getUserProfile(_state.user.username, true).then(
            function (profile) {
              userState.updateUserProfile(profile);

              //populate company info
              return companyState.init();
            }).then(function () {
            deferred.resolve();
          }, deferred.reject);
          return deferred.promise;
        };

        var _gapiAuthorize = function (attemptImmediate) {
          var deferred = $q.defer();

          var opts = {
            client_id: CLIENT_ID,
            scope: OAUTH2_SCOPES,
            cookie_policy: $location.protocol() + "://" +
              getBaseDomain()
          };

          if (_state.userToken !== "dummy") {
            opts.authuser = _state.userToken;
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
                  _clearUserToken();

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
        var _authorize = function (attemptImmediate) {
          if (_authorizeDeferred) {
            return _authorizeDeferred.promise;
          }

          _authorizeDeferred = $q.defer();

          var authResult;

          _gapiAuthorize(attemptImmediate)
            .then(function (res) {
              authResult = res;

              return getOAuthUserInfo();
            })
            .then(function (oauthUserInfo) {
              if (!_state.user.username || !_state.profile.username ||
                _state.user.username !== oauthUserInfo.email) {

                //populate user
                objectHelper.clearAndCopy({
                  userId: oauthUserInfo.id, //TODO: ideally we should not use real user ID or email, but use hash value instead
                  username: oauthUserInfo.email,
                  picture: oauthUserInfo.picture
                }, _state.user);

                _setUserToken();

                refreshProfile()
                  .finally(function () {
                    _authorizeDeferred.resolve(authResult);
                    $rootScope.$broadcast(
                      "risevision.user.authorized");
                    if (!attemptImmediate) {
                      $rootScope.$broadcast(
                        "risevision.user.userSignedIn");
                    }

                    _authorizeDeferred = undefined;
                  });
              } else {
                _authorizeDeferred.resolve(authResult);

                _authorizeDeferred = undefined;
              }
            })
            .then(null, function (err) {
              objectHelper.clearObj(_state.user);
              _authorizeDeferred.reject(err);

              _authorizeDeferred = undefined;
            });

          return _authorizeDeferred.promise;
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

            localStorageService.set("risevision.common.userState", _state);
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

        var authenticate = function (forceAuth) {
          var authenticateDeferred;

          // Clear User state
          if (forceAuth) {
            _resetUserState();
            userInfoCache.removeAll();
          }

          // Return cached promise
          if (_authenticateDeferred) {
            return _authenticateDeferred.promise;
          } else {
            _authenticateDeferred = $q.defer();
          }

          // Always resolve local copy of promise
          // in case cached version is cleared
          authenticateDeferred = _authenticateDeferred;
          $log.debug("authentication called");

          var _proceed = function () {
            // This flag indicates a potentially authenticated user.
            var userAuthed = (angular.isDefined(_state.userToken) &&
              _state.userToken !== null);
            $log.debug("userAuthed", userAuthed);

            if (forceAuth || userAuthed === true) {
              _authorize(!forceAuth)
                .then(function (authResult) {
                  if (authResult && !authResult.error) {
                    authenticateDeferred.resolve();
                  } else {
                    _clearUserToken();
                    $log.debug("Authentication Error: " +
                      authResult.error);
                    authenticateDeferred.reject(
                      "Authentication Error: " + authResult.error);
                  }
                })
                .then(null, function (err) {
                  _clearUserToken();
                  authenticateDeferred.reject(err);
                })
                .finally(function () {
                  $loading.stopGlobal(
                    "risevision.user.authenticate");
                  _logPageLoad("authenticated user");
                });
            } else {
              var msg = "user is not authenticated";
              $log.debug(msg);
              //  _clearUserToken();
              authenticateDeferred.reject(msg);
              objectHelper.clearObj(_state.user);
              $loading.stopGlobal("risevision.user.authenticate");
              _logPageLoad("unauthenticated user");
            }
          };
          // pre-load gapi to prevent popup blocker issues
          gapiLoader().finally(_proceed);

          if (forceAuth) {
            $loading.startGlobal("risevision.user.authenticate");
          }

          return authenticateDeferred.promise;
        };

        var signOut = function (signOutGoogle) {
          var deferred = $q.defer();
          userInfoCache.removeAll();
          gapiLoader().then(function (gApi) {
            if (signOutGoogle) {
              $window.logoutFrame.location =
                "https://accounts.google.com/Logout";
            }
            gApi.auth.signOut();
            // The flag the indicates a user is potentially
            // authenticated already, must be destroyed.
            _clearUserToken();
            //clear auth token
            // The majority of state is in here
            _resetUserState();
            objectHelper.clearObj(_state.user);
            //call google api to sign out
            $rootScope.$broadcast("risevision.user.signedOut");
            $log.debug("User is signed out.");
            deferred.resolve();
          }, function () {
            deferred.reject();
          });
          return deferred.promise;
        };

        var isLoggedIn = function () {
          if (!_state.user.username) {
            return false;
          } else {
            return true;
          }
        };

        var isRiseVisionUser = function () {
          return _state.profile.username !== null &&
            _state.profile.username !== undefined;
        };

        var hasRole = function (role) {
          return angular.isDefined(_state.roleMap[role]);
        };

        var getAccessToken = function () {
          return $window.gapi ? $window.gapi.auth.getToken() : null;
        };

        var _restoreState = function () {
          var sFromStorage = localStorageService.get(
            "risevision.common.userState");
          if (sFromStorage) {
            angular.extend(_state, sFromStorage);
            localStorageService.remove("risevision.common.userState"); //clear
            $log.debug("userState restored with", sFromStorage);
          }
        };

        var userState = {
          // user getters
          getUsername: function () {
            return (_state.user && _state.user.username) || null;
          },
          getUserEmail: function () {
            return _state.profile.email;
          },
          getCopyOfProfile: function (noFollow) {
            if (noFollow) {
              return angular.extend({}, _state.profile);
            } else {
              return objectHelper.follow(_state.profile);
            }
          },
          getUserPicture: function () {
            return _state.user.picture;
          },
          hasRole: hasRole,
          inRVAFrame: function () {
            return _state.inRVAFrame;
          },
          isRiseAdmin: function () {
            return hasRole("sa") && companyState.isRootCompany();
          },
          isRiseStoreAdmin: function () {
            return hasRole("ba") && companyState.isRootCompany();
          },
          isUserAdmin: function () {
            return hasRole("ua");
          },
          isPurchaser: function () {
            return hasRole("pu");
          },
          isSeller: companyState.isSeller,
          isRiseVisionUser: isRiseVisionUser,
          isLoggedIn: isLoggedIn,
          getAccessToken: getAccessToken,
          // user functions
          checkUsername: function (username) {
            return (username || false) && (userState.getUsername() ||
                false) &&
              username.toUpperCase() === userState.getUsername().toUpperCase();
          },
          updateUserProfile: function (user) {
            if (userState.checkUsername(user.username)) {
              objectHelper.clearAndCopy(angular.extend({
                username: _state.user.username
              }, user), _state.profile);

              //set role map
              _state.roleMap = {};
              if (_state.profile.roles) {
                _state.profile.roles.forEach(function (val) {
                  _state.roleMap[val] = true;
                });
              }

              $rootScope.$broadcast("risevision.user.updated");
            }
          },
          authenticate: _state.inRVAFrame ? authenticate : authenticateRedirect,
          authenticatePopup: function () {
            return authenticate(true);
          },
          signOut: signOut,
          refreshProfile: refreshProfile,
          addEventListenerVisibilityAPI: _addEventListenerVisibilityAPI,
          removeEventListenerVisibilityAPI: _removeEventListenerVisibilityAPI,
          // company getters
          getUserCompanyId: companyState.getUserCompanyId,
          getUserCompanyName: companyState.getUserCompanyName,
          getSelectedCompanyId: companyState.getSelectedCompanyId,
          getSelectedCompanyName: companyState.getSelectedCompanyName,
          getSelectedCompanyCountry: companyState.getSelectedCompanyCountry,
          getCopyOfUserCompany: companyState.getCopyOfUserCompany,
          getCopyOfSelectedCompany: companyState.getCopyOfSelectedCompany,
          isSubcompanySelected: companyState.isSubcompanySelected,
          isTestCompanySelected: companyState.isTestCompanySelected,
          isRootCompany: companyState.isRootCompany,
          // company functions
          updateCompanySettings: companyState.updateCompanySettings,
          updateUserCompanySettings: companyState.updateUserCompanySettings,
          resetCompany: companyState.resetCompany,
          switchCompany: companyState.switchCompany,
          // private
          _restoreState: _restoreState,
          _setUserToken: function (params) {
            // save params in state in case of redirect
            _state.params = params;

            // set fake user token to idicate user is logged in
            _state.userToken = "dummy";
          },
          _persistState: function () {
            // persist user state
            localStorageService.set("risevision.common.userState", _state);
          }
        };

        return userState;
      }
    ]);

})(angular);

(function (angular) {
  "use strict";
  angular.module("risevision.common.components.util")

  .value("humanReadableError", function (resp) {
    var message;
    if (resp.message) {
      message = resp.message;
    } else if (resp.error) {
      if (resp.error.message) {
        message = resp.error.message;
      } else {
        message = resp.error;
      }
    } else {
      message = resp;
    }
    return JSON.stringify(message);
  })

  .factory("dateIsInRange", [

    function () {
      /**
       * check if date is in range
       * @param {Date} date
       * @param {String} strStartDate
       * @param {String} strEndDate
       */
      return function (date, strStartDate, strEndDate) {
        // strStartDate, strEndDate can either be empty string or date in ISO 8601 format "2014-05-14T00:00:00.000Z"
        // empty means no there is no specific start or/and end date is set

        // When parsing time, we don't want to convert Universal time to the current TimeZone
        // example new Date(Date.parse("2014-05-14T00:00:00.000")); returns "Tue May 13 2014 20:00:00 GMT-0400 (EDT)"
        // what we want is to pretend that date already comes adjusted to the current TimeZone
        // example "2014-05-14T00:00:00.000" show be converted to "Tue May 14 2014 00:00:00 GMT-0400 (EDT)"

        var res = true;
        var re, dt;

        try {
          if (strStartDate) {
            re = strStartDate.match(/(\d{4})\-(\d{2})\-(\d{2})/);
            dt = new Date(re[1], parseInt(re[2]) - 1, re[3], 0, 0, 0, 0);
            res = (date >= dt);
          }

          if (res && strEndDate) {
            re = strEndDate.match(/(\d{4})\-(\d{2})\-(\d{2})/);
            dt = new Date(re[1], parseInt(re[2]) - 1, re[3], 0, 0, 0, 0);
            res = (date <= dt);
          }

        } catch (e) {
          res = false;
        }

        return res;

      };

    }
  ])

  .factory("objectHelper", [

    function () {
      var factory = {};

      factory.follow = function (source) {
        var Follower = function () {};
        Follower.prototype = source;
        return new Follower();
      };

      factory.clearObj = function (obj) {
        for (var member in obj) {
          delete obj[member];
        }
      };

      factory.clearAndCopy = function (src, dest) {
        factory.clearObj(dest);
        angular.extend(dest, src);
      };

      return factory;
    }
  ])

  .factory("getBaseDomain", ["$log", "$location",
    function ($log, $location) {
      var _looksLikeIp = function (addr) {
        if (/^([0-9])+\.([0-9])+\.([0-9])+\.([0-9])+$/.test(addr)) {
          return (true);
        }
        return (false);
      };

      return function () {
        var result;
        if (!result) {
          var hostname = $location.host();

          if (_looksLikeIp(hostname)) {
            result = hostname;
          } else {
            var parts = hostname.split(".");
            if (parts.length > 1) {
              // Somehow, cookies don't persist if we set the domain to appspot.com. 
              // It requires a sub-domain to be set, ie. rva-test.appspot.com.
              if (parts[parts.length - 2] === "appspot") {
                result = parts.slice(parts.length - 3).join(".");
              } else {
                result = parts.slice(parts.length - 2).join(".");
              }
            } else {
              //localhost
              result = hostname;
            }
          }

          $log.debug("baseDomain", result);
        }
        return result;
      };

    }
  ]);
})(angular);
