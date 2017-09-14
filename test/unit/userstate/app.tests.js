"use strict";

describe("app:", function() {
  beforeEach(function () {
    module("risevision.common.components.userstate");

    inject(function ($injector) {
      $state = $injector.get("$state");
      $rootScope = $injector.get("$rootScope");
    });
  });

  var $state, $rootScope, $templateCache;

  describe("states: ", function() {

    it("apps.launcher.unauthorized", function() {
      var state = $state.get("apps.launcher.unauthorized");
      expect(state).to.be.ok;
      expect(state.url).to.not.be.ok;
      expect(state.controller).to.be.ok;
    });
    
    it("apps.launcher.unregistered", function() {
      var state = $state.get("apps.launcher.unregistered");
      expect(state).to.be.ok;
      expect(state.url).to.not.be.ok;
      expect(state.controller).to.be.ok;
    });

    it("apps.launcher.signin", function() {
      var state = $state.get("apps.launcher.signin");
      expect(state).to.be.ok;
      expect(state.url).to.equal("/signin");
      expect(state.controller).to.be.ok;
    });

  });

  describe("listeners: ", function() {
    it("should register", function() {
      expect($rootScope.$$listeners["risevision.user.signedOut"]).to.be.ok;
      expect($rootScope.$$listeners["$stateChangeStart"]).to.be.ok;
      expect($rootScope.$$listeners["risevision.user.authorized"]).to.be.ok;
    });

    it("should forward user to signout page", function() {
      $state.go("apps.launcher.signin");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("apps.launcher.signin");
      expect($state.current.url).to.equal("/signin");
      
      $rootScope.$broadcast("risevision.user.signedOut");
      
      $rootScope.$digest();

      expect($state.current.name).to.equal("apps.launcher.unauthorized");
    });

    it("should restore previous state after authentication", function() {
      $state.go("apps.launcher.signin");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("apps.launcher.signin");
      expect($state.current.url).to.equal("/signin");
      
      $state.go("apps.launcher.unauthorized");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("apps.launcher.unauthorized");

      $rootScope.$broadcast("risevision.user.authorized");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("apps.launcher.signin");
      expect($state.current.url).to.equal("/signin");
    });
  });
    
  
});
