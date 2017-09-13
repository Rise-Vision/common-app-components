(function (angular) {
  "use strict";

  try {
    angular.module("risevision.common.config");
  } catch (err) {
    angular.module("risevision.common.config", []);
  }

  angular.module("risevision.common.config")
    .value("ENABLE_EXTERNAL_LOGGING", true)
    .value("CORE_URL", "https://rvaserver2.appspot.com/_ah/api")
    .value("LOGIN_TEMPLATE_URL", "userstate/login.html");

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

  // Set up our mappings between URLs, templates, and controllers
  .config(["$urlRouterProvider", "$stateProvider", "$locationProvider",
    function storeRouteConfig($urlRouterProvider, $stateProvider,
      $locationProvider) {

      $locationProvider.html5Mode(true);

      $urlRouterProvider.otherwise("/");

      // Use $stateProvider to configure states.
      $stateProvider.state("apps", {
        template: "<div ui-view></div>"
      })

      .state("apps.launcher", {
        abstract: true,
        template: "<div class=\"app-launcher\" ui-view></div>"
      })

      .state("apps.launcher.unauthorized", {
        templateProvider: ["$templateCache", "LOGIN_TEMPLATE_URL",
          function ($templateCache, LOGIN_TEMPLATE_URL) {
            return $templateCache.get(LOGIN_TEMPLATE_URL);
          }
        ],
        controller: "LoginCtrl"
      })

      .state("apps.launcher.unregistered", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get("userstate/signup.html");
          }
        ],
        controller: "SignUpCtrl"
      })

      .state("apps.launcher.signin", {
        url: "/signin",
        controller: "SignInCtrl"
      });

    }
  ])

  .run(["$rootScope", "$state",
    function ($rootScope, $state) {

      $rootScope.$on("risevision.user.signedOut", function () {
        $state.go("apps.launcher.unauthorized");
      });

      var returnState;
      $rootScope.$on("$stateChangeStart", function (event, next, current) {
        if (next && next.name.indexOf("apps.launcher.un") === -1) {
          returnState = next;
        }
      });

      $rootScope.$on("risevision.user.authorized", function () {
        if (returnState && $state.current.name.indexOf("apps.launcher.un") !==
          -1) {
          $state.go(returnState);
        }
      });
    }
  ])

  .value("CLIENT_ID", "614513768474.apps.googleusercontent.com");

})(angular);
