"use strict";

describe("app:", function() {
  beforeEach(function () {
    module("risevision.common.components.userstate");

    inject(function ($injector) {
      $state = $injector.get("$state");
      $rootScope = $injector.get("$rootScope");
      urlStateService = $injector.get("urlStateService");
      
      sinon.stub(urlStateService, "redirectToState");
    });
  });

  var $state, $rootScope, $templateCache, urlStateService;

  describe("states: ", function() {

    it("common.googleresult", function() {
      var state = $state.get("common.googleresult");
      expect(state).to.be.ok;
      expect(state.url).to.equal("/state=:state&access_token=:access_token&token_type=:token_type&expires_in=:expires_in");
      expect(state.controller).to.equal("GoogleResultCtrl");
    });
    
    it("auth states should be proxied", function() {
      ["common.auth.unauthorized", "common.auth.createaccount",
        "common.auth.unregistered"].forEach(function(stateName) {
        var state = $state.get("common.auth.unauthorized");
        expect(state).to.be.ok;
        expect(state.url).to.not.be.ok;
        expect(state.controller).to.equal("UrlStateCtrl");
        expect(state.template).to.be.ok;
      });
    });

    it("common.auth.unauthorized.final", function() {
      var state = $state.get("common.auth.unauthorized.final");
      expect(state).to.be.ok;
      expect(state.url).to.equal("/unauthorized/:state");
      expect(state.controller).to.equal("LoginCtrl");
    });
    
    it("common.auth.createaccount.final", function() {
      var state = $state.get("common.auth.createaccount.final");
      expect(state).to.be.ok;
      expect(state.url).to.equal("/createaccount/:state");
      expect(state.controller).to.equal("LoginCtrl");
    });
  });

  describe("listeners: ", function() {
    it("should register", function() {
      expect($rootScope.$$listeners["risevision.user.signedOut"]).to.be.ok;
      expect($rootScope.$$listeners["risevision.user.authorized"]).to.be.ok;
    });

    it("should forward user to signout page", function() {
      $state.go("common.googleresult");
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.googleresult");
      
      $rootScope.$broadcast("risevision.user.signedOut");
      
      $rootScope.$digest();

      expect($state.current.name).to.equal("common.auth.unauthorized");
    });

    it("should restore previous state after authentication", function() {
      $state.go("common.auth.unauthorized.final", {
        state: "stateString"
      });
      
      $rootScope.$digest();
      
      expect($state.current.name).to.equal("common.auth.unauthorized.final");

      $rootScope.$broadcast("risevision.user.authorized");
      
      $rootScope.$digest();
      
      urlStateService.redirectToState.should.have.been.calledWith("stateString");
    });
  });
    
  
});
