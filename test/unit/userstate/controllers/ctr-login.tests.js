"use strict";
describe("controller: Log In", function() {
  beforeEach(module("risevision.common.components.userstate"));
  beforeEach(module(function ($provide) {
    $provide.service("userAuthFactory", function() {
      return {
        authenticate: function(forceAuth, credentials) {
          var deferred = Q.defer();

          expect(forceAuth).to.be.true;

          if (credentials) {
            expect(credentials).to.equal("credentials");
          }
          
          if (loginSuccess) {
            deferred.resolve();
          } else {
            deferred.reject();
          }

          return deferred.promise;
        }
      };
    });
    $provide.service("uiFlowManager",function(){
      return {
        invalidateStatus : sinon.spy()
      };
    });
    $provide.service("$loading",function(){
      return {
        startGlobal : sinon.spy(),
        stopGlobal : sinon.spy()
      };
    });
    
  }));
  var $scope, $loading, loginSuccess, uiFlowManager;
  beforeEach(function () {
    loginSuccess = false;
    
    inject(function($injector,$rootScope, $controller){
      $scope = $rootScope.$new();
      
      $loading = $injector.get("$loading");
      uiFlowManager = $injector.get("uiFlowManager");

      $controller("LoginCtrl", {
        $scope: $scope,
        $state: $injector.get("$state"),
        $loading: $loading,
        uiFlowManager: uiFlowManager
      });
      $scope.$digest();
      
      $scope.credentials = "credentials";
    });
  });

  it("should exist", function() {
    expect($scope).to.be.ok;
    expect($scope.googleLogin).to.be.a("function");
    expect($scope.customLogin).to.be.a("function");
  });

  describe("googleLogin: ", function() {
    it("should handle successful login", function(done) {
      loginSuccess = true;

      $scope.googleLogin("endStatus");
      
      $loading.startGlobal.should.have.been.calledWith("auth-buttons-login");

      setTimeout(function(){
        $loading.stopGlobal.should.have.been.calledWith("auth-buttons-login");
        uiFlowManager.invalidateStatus.should.have.been.calledWith("endStatus");

        done();
      },10);
    });
    
    it("should handle login failure", function(done) {
      $scope.googleLogin("endStatus");
      
      $loading.startGlobal.should.have.been.calledWith("auth-buttons-login");

      setTimeout(function(){
        $loading.stopGlobal.should.have.been.calledWith("auth-buttons-login");
        uiFlowManager.invalidateStatus.should.have.been.calledWith("endStatus");

        expect($scope.loginError).to.not.be.ok;

        done();
      },10);
    });
  });
  
  describe("customLogin: ", function() {
    it("should handle successful login", function(done) {
      loginSuccess = true;

      $scope.customLogin("endStatus");
      
      $loading.startGlobal.should.have.been.calledWith("auth-buttons-login");

      setTimeout(function(){
        $loading.stopGlobal.should.have.been.calledWith("auth-buttons-login");
        uiFlowManager.invalidateStatus.should.have.been.calledWith("endStatus");

        expect($scope.loginError).to.be.false;

        done();
      },10);
    });
    
    it("should handle login failure", function(done) {
      $scope.customLogin("endStatus");
      
      $loading.startGlobal.should.have.been.calledWith("auth-buttons-login");

      setTimeout(function(){
        $loading.stopGlobal.should.have.been.calledWith("auth-buttons-login");
        uiFlowManager.invalidateStatus.should.have.been.calledWith("endStatus");

        expect($scope.loginError).to.be.true;

        done();
      },10);
    });
  });

});
