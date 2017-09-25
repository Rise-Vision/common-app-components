"use strict";
describe("controller: Url State", function() {
  beforeEach(module("risevision.common.components.userstate"));
  beforeEach(module(function ($provide) {
    $provide.service("urlStateService", function() {
      return {
        get: function() {
          return "stateString";
        }
      };
    });
    $provide.service("$state", function() {
      return $state = {
        current: {
          name: "currentState"
        },
        go: sinon.spy()
      };
    });

  }));
  var $state;

  beforeEach(function () {
    inject(function($injector, $rootScope, $controller){
      $controller("UrlStateCtrl");
      
      $rootScope.$digest();
    });
  });

  it("should redirect to final state", function() {
    $state.go.should.have.been.called;
    $state.go.should.have.been.calledWith("currentState.final", {state: "stateString"});
  });
});
