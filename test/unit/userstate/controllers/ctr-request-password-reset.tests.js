"use strict";
describe("controller: Request Password Reset", function() {
  beforeEach(module("risevision.common.components.userstate"));
  beforeEach(module(function ($provide) {
    $provide.service("userauth", function() {
      return {
        requestPasswordReset: function() {}
      };
    });
    $provide.service("$loading",function() {
      return {
        startGlobal: sandbox.spy(),
        stopGlobal: sandbox.spy()
      };
    });
    $provide.service("$log",function() {
      return {
        log: sandbox.spy(),
        error: sandbox.spy()
      };
    });
  }));

  var $scope, $loading, $log, userauth, sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();

    inject(function($injector, $rootScope, $controller) {
      $scope = $rootScope.$new();

      $loading = $injector.get("$loading");
      $log = $injector.get("$log");
      userauth = $injector.get("userauth");

      $controller("RequestPasswordResetCtrl", {
        $scope: $scope,
        $log: $log,
        userauth: userauth
      });

      $scope.credentials.username = "username";
      $scope.$digest();
    });
  });

  afterEach(function () {
    sandbox.restore();
  });
    
  it("should exist", function() {
    expect($scope).to.be.ok;
  });

  describe("customLogin: ", function() {
    it("should redirect to login on success", function(done) {
      sandbox.stub(userauth, "requestPasswordReset").returns(Q.resolve());
      $scope.requestPasswordReset();

      setTimeout(function() {
        expect(userauth.requestPasswordReset).to.have.been.calledWith("username");
        expect($scope.emailSent).to.be.true;
        expect($loading.startGlobal).to.have.been.called;
        expect($loading.stopGlobal).to.have.been.called;
        expect($log.log).to.have.been.called;
        expect($log.error).to.not.have.been.called;
        done();
      }, 0);
    });

    it("should redirect to login on error", function(done) {
      sandbox.stub(userauth, "requestPasswordReset").returns(Q.reject());
      $scope.requestPasswordReset();

      setTimeout(function() {
        expect(userauth.requestPasswordReset).to.have.been.calledWith("username");
        expect($scope.emailSent).to.be.true;
        expect($loading.startGlobal).to.have.been.called;
        expect($loading.stopGlobal).to.have.been.called;
        expect($log.log).to.not.have.been.called;
        expect($log.error).to.have.been.called;
        done();
      }, 0);
    });
  });
});
