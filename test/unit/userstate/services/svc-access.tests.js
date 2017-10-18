"use strict";
describe("service: access:", function() {
  beforeEach(module("risevision.common.components.userstate"));

  beforeEach(module(function ($provide) {
    $provide.service("$q", function() {return Q;});
    $provide.service("userAuthFactory", function() {
      return {
        authenticate : function(){
          var deferred = Q.defer();
                  
          if (authenticate) {
            deferred.resolve("auth");
          }
          else {
            deferred.reject("not auth");
          }
          
          return deferred.promise
        }        
      };
    });
    $provide.service("userState",function(){
      return {
        isRiseVisionUser : function(){
          return isRiseVisionUser;
        },
        isLoggedIn: function() {
          return isLoggedIn;
        },
        _restoreState: function(){},
        _state: {}
      }
    });
    $provide.service("$state", function() {
      return $state = {
        go: sinon.spy(),
        get: sinon.spy(function() {
          return true;
        })
      };
    });
    $provide.service("$location", function() {
      return $location = {
        replace: sinon.spy()
      };
    });
  }));
  
  var canAccessApps, $location, $state, authenticate, isRiseVisionUser, isLoggedIn;
  beforeEach(function(){
    isRiseVisionUser = true;
    authenticate = true;
    isLoggedIn = true;

    inject(function($injector){
      canAccessApps = $injector.get("canAccessApps");
    });
  });

  it("should exist",function(){
    expect(canAccessApps).to.be.truely;
    expect(canAccessApps).to.be.a("function");
  });

  it("should resolve if authenticated",function(done){
    canAccessApps()
    .then(function(){
      done();
    })
    .then(null, function() {
      done("error");
    });
  });
  
  it("should reject if user is not Rise Vision User",function(done){
    isRiseVisionUser = false;
    authenticate = true;
    isLoggedIn = true;

    canAccessApps()
    .then(function() {
      done("authenticated");
    })
    .then(null, function() {
      $state.go.should.have.been.calledWith("common.auth.unregistered", null, {
        reload: true
      });

      $location.replace.should.have.been.called;

      done();
    });  
  });
  
  it("should reject if user is not Rise Vision User",function(done){
    isRiseVisionUser = false;
    authenticate = true;
    isLoggedIn = false;

    canAccessApps()
    .then(function() {
      done("authenticated");
    })
    .then(null, function() {
      $state.go.should.have.been.calledWith("common.auth.createaccount", null, {
        reload: true
      });

      $location.replace.should.have.been.called;

      done();
    });
  });
  
  it("should reject if user is not authenticated",function(done){
    isRiseVisionUser = true;
    authenticate = false;
    isLoggedIn = false;

    canAccessApps()
    .then(function() {
      done("authenticated");
    })
    .then(null, function() {
      $state.go.should.have.been.calledWith("common.auth.createaccount", null, {
        reload: true
      });

      $location.replace.should.have.been.called;

      done();
    });  
  });

});
