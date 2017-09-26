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

  // Set up our mappings between URLs, templates, and controllers
  .config(["$urlRouterProvider", "$stateProvider", "$locationProvider",
    function storeRouteConfig($urlRouterProvider, $stateProvider,
      $locationProvider) {

      $locationProvider.html5Mode(true);

      $urlRouterProvider.otherwise("/");

      // Use $stateProvider to configure states.
      $stateProvider.state("common", {
        template: "<div ui-view></div>"
      })

      .state("common.googleresult", {
        url: "/state=:state&access_token=:access_token&token_type=:token_type&expires_in=:expires_in",
        controller: "GoogleResultCtrl"
      })

      .state("common.auth", {
        abstract: true,
        template: "<div class=\"app-launcher\" ui-view></div>"
      })

      .state("common.auth.unauthorized", {
        controller: "UrlStateCtrl",
        template: "<div ui-view></div>"
      })

      .state("common.auth.unauthorized.final", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get("userstate/login.html");
          }
        ],
        url: "/unauthorized/:state",
        controller: "LoginCtrl"
      })

      .state("common.auth.createaccount", {
        controller: "UrlStateCtrl",
        template: "<div ui-view></div>"
      })

      .state("common.auth.createaccount.final", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get("userstate/create-account.html");
          }
        ],
        url: "/createaccount/:state",
        controller: "LoginCtrl"
      })

      .state("common.auth.confirmaccount", {
        controller: "ConfirmAccountCtrl",
        template: "<div ui-view></div>",
        url: "/confirmaccount/:user/:token"
      })

      .state("common.auth.requestpasswordreset", {
        controller: "UrlStateCtrl",
        template: "<div ui-view></div>"
      })

      .state("common.auth.requestpasswordreset.final", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get(
              "userstate/request-password-reset.html");
          }
        ],
        url: "/requestpasswordreset/:state",
        controller: "RequestPasswordResetCtrl"
      })

      .state("common.auth.resetpassword", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get(
              "userstate/reset-password-confirm.html");
          }
        ],
        url: "/resetpassword/:user/:token",
        controller: "ResetPasswordConfirmCtrl"
      })

      .state("common.auth.unregistered", {
        controller: "UrlStateCtrl",
        template: "<div ui-view></div>"
      })

      .state("common.auth.unregistered.final", {
        templateProvider: ["$templateCache",
          function ($templateCache) {
            return $templateCache.get("userstate/signup.html");
          }
        ],
        url: "/unregistered/:state",
        controller: "SignUpCtrl"
      });

    }
  ])

  .run(["$rootScope", "$state", "$stateParams", "urlStateService",
    function ($rootScope, $state, $stateParams, urlStateService) {

      $rootScope.$on("risevision.user.signedOut", function () {
        $state.go("common.auth.unauthorized");
      });

      $rootScope.$on("risevision.user.authorized", function () {
        if ($stateParams.state &&
          $state.current.name.indexOf("common.auth") !== -1) {
          urlStateService.redirectToState($stateParams.state);
        }
      });
    }
  ])

  .value("CLIENT_ID", "614513768474.apps.googleusercontent.com");

})(angular);
