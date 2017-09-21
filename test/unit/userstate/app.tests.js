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

    it("common.auth.unauthorized", function() {
      var state = $state.get("common.auth.unauthorized");
      expect(state).to.be.ok;
      expect(state.url).to.not.be.ok;
      expect(state.controller).to.equal("LoginCtrl");
    });
    
    it("common.auth.createaccount", function() {
      var state = $state.get("common.auth.createaccount");
      expect(state).to.be.ok;
      expect(state.url).to.not.be.ok;
      expect(state.controller).to.equal("LoginCtrl");
    });
    
    it("common.auth.unregistered", function() {
      var state = $state.get("common.auth.unregistered");
      expect(state).to.be.ok;
      expect(state.url).to.not.be.ok;
      expect(state.controller).to.equal("SignUpCtrl");
    });

  });

  xdescribe("listeners: ", function() {
    it("should register", function() {
      expect($rootScope.$$listeners["risevision.user.signedOut"]).to.be.ok;
      expect($rootScope.$$listeners["$stateChangeStart"]).to.be.ok;
      expect($rootScope.$$listeners["risevision.user.authorized"]).to.be.ok;
    });

    it("should forward user to signout page", function() {
      $state.go("common.auth.signin");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.auth.signin");
      expect($state.current.url).to.equal("/signin");
      
      $rootScope.$broadcast("risevision.user.signedOut");
      
      $rootScope.$digest();

      expect($state.current.name).to.equal("common.auth.unauthorized");
    });

    it("should restore previous state after authentication", function() {
      $state.go("common.auth.signin");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.auth.signin");
      expect($state.current.url).to.equal("/signin");
      
      $state.go("common.auth.unauthorized");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.auth.unauthorized");

      $rootScope.$broadcast("risevision.user.authorized");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.auth.signin");
      expect($state.current.url).to.equal("/signin");
    });
  });
    
  
});
