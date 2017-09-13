/*jshint expr:true */
/*global gapi*/
"use strict";

describe("Services: auth & user state", function() {
  var path = "";

  beforeEach(module("risevision.common.components.userstate"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("$location", {
      search: function () {
        return {};
      },
      path: function () {
        return path;
      },
      protocol: function () {
        return "protocol";
      },
      url: function() {
        return "";
      }
    });
    $provide.service("getBaseDomain", [function() {
      return function() {
        return "domain";
      };
    }]);

    $provide.factory("rvTokenStore", [function () {
      var token;
      return {
        read: function() {
          return token;
        },
        write: function(newToken) {
          token = newToken;
        },
        clear: function() {
          token = undefined;
        }
      };
    }]);
    $provide.factory("externalLogging", [function () {
      return {
        logEvent: function(){
        }
      };
    }]);
    $provide.value("$loading", {
      startGlobal: function(){},
      stopGlobal: function(){}
    });
    $provide.factory("$http", [function () {
      return {
        get: function(url,data, config) {
          return Q.resolve({data:{email:'a@b.ca'}});
        }
      };
    }]);
  }));
  
  it("should exist, also methods", function(done) {
    inject(function(userState) {
      expect(userState.authenticate).to.be.ok;
      expect(userState.signOut).to.be.ok;
      expect(userState.getUserCompanyId).to.be.ok;
      ["getUserCompanyId", "getSelectedCompanyId", "getSelectedCompanyName",
      "updateCompanySettings", "getSelectedCompanyCountry", "getUsername",
      "getUserEmail", "getCopyOfProfile", "resetCompany",
      "getCopyOfUserCompany", "getCopyOfSelectedCompany", "switchCompany",
      "isSubcompanySelected", "getUserPicture", "inRVAFrame",
      "isRiseAdmin", "isRiseStoreAdmin", "isUserAdmin", "isPurchaser",
      "isSeller", "isRiseVisionUser", "isLoggedIn", "authenticate",
      "authenticatePopup",
      "signOut", "checkUsername", "updateUserProfile", "refreshProfile", 
      "getAccessToken"].forEach(
      function (method) {
        expect(userState).to.have.property(method);
        expect(userState[method]).to.be.a("function");
      });
      done();
    });
  });
  
  describe("user not logged in: ",function(){
    var userState, rootScope, broadcastSpy,externalLoggingSpy, gapiLoaderCalled;

    beforeEach(module(function ($provide) {
      gapiLoaderCalled = 0;
      $provide.service("gapiLoader", function () {
        return function() {
          gapiLoaderCalled++;
          var deferred = Q.defer();
          
          deferred.resolve({
            auth: {
              authorize: function(opts, callback) {
                callback({});
              },
              setToken: function() {}
            }
          });
          
          return deferred.promise;
        };
      });
    }));

    beforeEach(function() {      
      inject(function($injector){
        rootScope = $injector.get("$rootScope");
        var $window = $injector.get("$window");
        userState = $injector.get("userState");

        $window.performance = {timing: {navigationStart:0}};
        var externalLogging = $injector.get("externalLogging");
        externalLoggingSpy = sinon.spy(externalLogging, "logEvent");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
      });
    });
    
    it("should not be authenticated", function(done) {
      userState.authenticate().then(done, function(msg) {
        expect(userState.isLoggedIn()).to.be.false;
        expect(msg).to.equal("user is not authenticated");
        broadcastSpy.should.not.have.been.calledWith("risevision.user.authorized");
        done();
      })
      .then(null,done);
    });

    it("should log page speed for unauthenticated user", function(done) {
      userState.authenticate().then(done, function() {
        externalLoggingSpy.should.have.been.calledWith("page load time","unauthenticated user");
        done();    
      })
      .then(null,done);
    });
    
    
    it("should pre-initialize gapiLoader", function(done) {
      userState.authenticate().then(done, function() {
        expect(gapiLoaderCalled).to.be.equal(1);
        
        done();
      })
      .then(null,done);
    });
  });
  
  describe("should remember user: ", function(){
    var userState, rootScope, broadcastSpy, externalLoggingSpy;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        rootScope = $injector.get("$rootScope");
        var $window = $injector.get("$window");
        $window.performance = {timing: {navigationStart:0}};
        var externalLogging = $injector.get("externalLogging");
        externalLoggingSpy = sinon.spy(externalLogging, "logEvent");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
        // Fake user token being stored locally
        userState._setUserToken({access_token:'token'});
      });
    });
    
    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.true;
        broadcastSpy.should.have.been.calledWith("risevision.user.authorized");
        expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });


    it("should log page speed for authenticated user", function(done) {
      userState.authenticate().then(done, function() {
        externalLoggingSpy.should.have.been.calledWith("page load time","authenticated user");
        done();    
      })
      .then(null,done);
    });
        
    it("should obtain user & company info", function(done) {
      userState.authenticate().then(function() {
        expect(userState.getUserEmail()).to.equal("michael.sanchez@awesome.io");
        expect(userState.isRiseAdmin()).to.be.false;
        expect(userState.isUserAdmin()).to.be.true;
        expect(userState.getCopyOfProfile().firstName).to.equal("Michael");
        
        expect(userState.getUserCompanyName()).to.equal("Rise Vision Test Co.");
        expect(userState.getSelectedCompanyCountry()).to.equal("CA");
        
        done();
      })
      .then(null,done);
      
    });

    it("should sign out", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        broadcastSpy.should.have.been.calledWith("risevision.user.authorized");

        userState.signOut().then(function() {
          expect(userState.isLoggedIn()).to.be.false;
          expect(userState.isRiseVisionUser()).to.be.false;
          broadcastSpy.should.have.been.calledWith("risevision.user.signedOut");
          expect(userState.getUsername()).to.not.be.truely;

          done();
        }, function(err) {
          done(err || "error");
        })
        .then(null,done);
      })
      .then(null,done);

    });
    
    it("set url path for next tests", function() {
      path = "/state=%7B%22p%22%3A%22%22%2C%22u%22%3A%22%23%2F%22%2C%22s%22%3A%22%22%7D&access_token=ya29&token_type=Bearer&expires_in=3600";
    });

  });
  
  describe("interpret auth result, new user: ", function(){
    var userState, rootScope, broadcastSpy;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("john.doe@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        rootScope = $injector.get("$rootScope");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
      });
    });
    
    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.false;
        broadcastSpy.should.have.been.calledWith("risevision.user.authorized");
        expect(userState.getUsername()).to.equal("john.doe@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });
  });
  
  describe("interpret auth result, existing user: ", function(){
    var userState, rootScope, broadcastSpy;
    
    beforeEach(function() {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        rootScope = $injector.get("$rootScope");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
      });
    });

    it("should be authenticated", function(done) {
      userState.authenticate().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.true;
        broadcastSpy.should.have.been.calledWith("risevision.user.authorized");
        expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

        done();
      }, function(err) {
        done(err || "error");
      })
      .then(null,done);
    });

  });
  
  describe("handle api failures: ", function() {
    beforeEach(module(function ($provide) {
      $provide.service("gapiLoader", function () {
        return function() {
          var deferred = Q.defer();
          
          if (failGapiLoader) {
            deferred.reject("gapi loader failed");
          }
          else {
            deferred.resolve({
              auth: {
                authorize: function(opts, callback) {
                  if (failAuthorize) {
                    callback({
                      error: "authorize failure"
                    });
                  }
                  callback({});
                },
                setToken: function() {}
              }
            });
          }
          
          return deferred.promise;
        };
      });
      $provide.service("getOAuthUserInfo", function() {
        return function() {
          var deferred = Q.defer();
      
          if (failOAuthUser) {
            deferred.reject("oauth failure");
          }
          else {
            deferred.resolve({
              id: 1234,
              email: "someuser@awesome.io",
              picture: "photo.jpg"
            });
          }
          
          return deferred.promise;
        };
      });
    }));
    
    var failGapiLoader, failAuthorize, failOAuthUser;
    
    it("should throw error if gapi loader fails", function(done) {
      failGapiLoader = true;

      inject(function(userState,$rootScope){
        var broadcastSpy = sinon.spy($rootScope, "$broadcast");
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          broadcastSpy.should.not.have.been.calledWith("risevision.user.authorized");
          expect(err).to.equal("gapi loader failed");
          
          done();
        })
        .then(null,done);
      });
    });
    
    it("should throw error if gapi.auth.authorize fails", function(done) {
      failGapiLoader = false;
      failAuthorize = true;
    
      inject(function(userState,$rootScope){
        var broadcastSpy = sinon.spy($rootScope, "$broadcast");
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          broadcastSpy.should.not.have.been.calledWith("risevision.user.authorized");
          expect(err).to.equal("authorize failure");
          
          done();
        })
        .then(null,done);
      });
    });
      
    it("should throw error on oauth failure", function(done) {
      failGapiLoader = false;
      failAuthorize = false;
      failOAuthUser = true;
    
      inject(function(userState,$rootScope){
        var broadcastSpy = sinon.spy($rootScope, "$broadcast");
        userState.authenticate().then(done, function(err) {
          expect(userState.isLoggedIn()).to.be.false;
          broadcastSpy.should.not.have.been.calledWith("risevision.user.authorized");
          expect(err).to.equal("oauth failure");
                    
          done();
        })
        .then(null,done);
      });
    });
  });
  
  describe("force authentication: ", function() {

    beforeEach( module( function($provide) {
      $provide.service("$q", function() {return Q;});
      $provide.value("$location", {
        search: function () {
          return {inRVA : ""};
        },
        path: function () {
          return "";
        },
        protocol: function () {
          return "protocol";
        },
        url: function() {}
      });
    }));
    

    it("should be authenticated with force", function(done) {
      inject(function(userState,$rootScope){
        gapi.setPendingSignInUser("michael.sanchez@awesome.io");
        gapi.auth.authorize({immediate: true}, function() {});
        var broadcastSpy = sinon.spy($rootScope, "$broadcast");
        userState.authenticate(true).then(function() {
          expect(userState.isLoggedIn()).to.be.true;
          expect(userState.isRiseVisionUser()).to.be.true;
          broadcastSpy.should.have.been.calledWith("risevision.user.authorized");
          broadcastSpy.should.have.been.calledWith("risevision.user.userSignedIn");
          expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

          done();
        })
          .then(null,done);
      });
    });
  });
  
  it("authenticatePopup: should force authentication", function(done) {
    inject(function(userState,$rootScope){
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");

      var broadcastSpy = sinon.spy($rootScope, "$broadcast");
      userState.authenticatePopup().then(function() {
        expect(userState.isLoggedIn()).to.be.true;
        expect(userState.isRiseVisionUser()).to.be.true;
        broadcastSpy.should.have.been.calledWith("risevision.user.authorized");
        broadcastSpy.should.have.been.calledWith("risevision.user.userSignedIn");
        expect(userState.getUsername()).to.equal("michael.sanchez@awesome.io");

        done();
      })
        .then(null,done);
    });
  });
  
  describe("checkUsername: ", function() {
    var userState;
    
    beforeEach(function(done) {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        
        done();
      });
    });
    
    beforeEach(function(done) {
      expect(userState.checkUsername("michael.sanchez@awesome.io")).to.be.false;

      userState.authenticate().then(function() {
        done();
      });
    });
    
    it("should ignore case", function() {
      expect(userState.checkUsername("michael.sanchez@awesome.io")).to.be.true;
      expect(userState.checkUsername("Michael.Sanchez@awesome.io")).to.be.true;
    });
    
    it("should fail gracefully", function() {
      expect(userState.checkUsername("someone@awesome.io")).to.be.false;
      expect(userState.checkUsername()).to.be.false;
    });
  });
  
  describe("updateUserProfile: ", function(){
    var userState, rootScope, broadcastSpy;
    
    beforeEach(function(done) {
      gapi.setPendingSignInUser("michael.sanchez@awesome.io");
      gapi.auth.authorize({immediate: false}, function() {});

      inject(function($injector){
        userState = $injector.get("userState");
        rootScope = $injector.get("$rootScope");
        broadcastSpy = sinon.spy(rootScope, "$broadcast");
        
        done();
      });
    });
    
    beforeEach(function(done) {
      userState.authenticate().then(function() {
        done();
      });
    });
    
    it("should get copyOfProfile", function() {
      var profile = userState.getCopyOfProfile(true);

      expect(profile).to.be.ok;
      expect(profile.firstName).to.equal("Michael");
      expect(userState.isPurchaser()).to.be.true;
    });

    it("should update profile", function() {
      var profile = userState.getCopyOfProfile(true);

      profile.lastName = "S.";
      profile.roles.pop();
      
      userState.updateUserProfile(profile);
      
      var copyOfProfile = userState.getCopyOfProfile();
      
      expect(copyOfProfile.lastName).to.equal("S.");
      expect(userState.isPurchaser()).to.be.false;
      
      setTimeout(function() {
        broadcastSpy.should.have.been.calledWithExactly("risevision.user.updated");
        broadcastSpy.should.have.been.once;
      }, 10);
    });
    
    it("should not update other user's profile", function() {
      var profile = {
        username: "someone@awesome.io",
        firstName: "Someone",
        lastName: "Else"
      };

      userState.updateUserProfile(profile);
      
      var copyOfProfile = userState.getCopyOfProfile();
      
      expect(copyOfProfile.lastName).to.equal("Sanchez");
      
      setTimeout(function() {
        broadcastSpy.should.not.have.been.once;
      }, 10);
    });

  });
});
