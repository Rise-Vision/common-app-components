"use strict";
describe("controller: Google Result", function() {
  beforeEach(module("risevision.common.components.userstate"));
  beforeEach(module(function ($provide) {
    $provide.service("urlStateService", function() {
      return urlStateService = {
        redirectToState: sinon.spy()
      };
    });
    $provide.value("$stateParams", {
      state: "currentState",
      access_token: "token"
    });
    $provide.service("userState", function() {
      return userState = {
        _restoreState: function() {},
        _setUserToken: sinon.spy()
      };
    });

  }));
  var userState, urlStateService;

  beforeEach(function () {
    inject(function($injector, $rootScope, $controller){
      $controller("GoogleResultCtrl");
      
      $rootScope.$digest();
    });
  });

  it("should restore state and redirect", function() {
    userState._setUserToken.should.have.been.calledWith({
      state: "currentState",
      access_token: "token"
    });

    urlStateService.redirectToState.should.have.been.calledWith("currentState");
  });
});
