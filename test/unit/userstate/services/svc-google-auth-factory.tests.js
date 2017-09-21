/*jshint expr:true */
/*global gapi*/
"use strict";

describe("Services: googleAuthFactory", function() {
  var path = "";

  beforeEach(module("risevision.common.components.userstate"));

  beforeEach(module(function ($provide) {
    //stub services
    $provide.service("$q", function() {return Q;});
    $provide.value("$location", {
      search: function () {
        return {};
      },
      path: sinon.spy(function () {
        return path;
      }),
      protocol: function () {
        return "protocol";
      },
      url: function() {
        return "";
      },
      $$html5: true
    });
    $provide.service("getBaseDomain", function() {
      return function() {
        return "domain";
      };
    });
    $provide.factory("$http", function () {
      return $http = {
        get: sinon.spy(function(url) {
          return Q.resolve({data:{email:'a@b.ca'}});
        })
      };
    });
    $provide.service("userState", function() {
      return userState = {
        _state: {
          inRVAFrame: inRVAFrame,
          userToken: {
            email: "username@test.com"
          },
          params: {
            access_token: "testToken"
          }
        },
        refreshProfile: sinon.spy(function() { return Q.resolve(); }),
        _setUserToken: sinon.spy(),
        _persistState: sinon.spy(),
        _restoreState: sinon.spy()
      };
    });
    $provide.service("gapiLoader", function () {
      return gapiLoader = sinon.spy(function() {
        return Q.resolve({
          auth: gapiAuth = {
            authorize: sinon.spy(function(opts) {
              if (authorizeResponse) {
                return Q.resolve(authorizeResponse);
              } else {
                return Q.reject();
              }
            }),
            setToken: sinon.spy()
          }
        });
      });
    });
    $provide.service("getOAuthUserInfo", function() {
      return function() {
        var deferred = Q.defer();
        if (failOAuthUser) {
          deferred.reject("oauth failure");
        } else {
          deferred.resolve({
            email: "someuser@awesome.io"
          });
        }
        
        return deferred.promise;
      };
    });
  }));
  
  var googleAuthFactory, userState, $http, $window, inRVAFrame,
    authorizeResponse, gapiLoader, gapiAuth, failOAuthUser;
  
  describe("authenticate: ", function() {
    beforeEach(function() {
      authorizeResponse = true;
      failOAuthUser = false;
      inRVAFrame = true;

      inject(function($injector){
        googleAuthFactory = $injector.get("googleAuthFactory");
      });
    });

    it("should exist, return a promise", function() {
      expect(googleAuthFactory.authenticate).to.be.ok;
      expect(googleAuthFactory.authenticate).to.be.a("function");

      expect(googleAuthFactory.authenticate().then).to.be.a("function");
    });

    it("should load gapi and attempt to authorize user", function(done) {
      googleAuthFactory.authenticate();
      
      setTimeout(function() {
        gapiLoader.should.have.been.called;
        gapiAuth.authorize.should.have.been.called;

        done();
      }, 10);
    });
    
    it("should authorize with the default options", function(done) {
      googleAuthFactory.authenticate();
      
      setTimeout(function() {
        gapiAuth.authorize.should.have.been.calledWith({
          "client_id":"614513768474.apps.googleusercontent.com",
          "scope":"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          "cookie_policy":"protocol://domain",
          "authuser":"username@test.com",
          "immediate":true
        });

        done();
      }, 10);
    });
    
    it("should authorize with redirect via select_account", function(done) {
      googleAuthFactory.authenticate(true);
      
      setTimeout(function() {
        gapiAuth.authorize.should.have.been.calledWith({
          "client_id":"614513768474.apps.googleusercontent.com",
          "scope":"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          "cookie_policy":"protocol://domain",
          "authuser":"username@test.com",
          "prompt":"select_account"
        });

        done();
      }, 10);
    });

    it("should load selected account via $http request", function(done) {
      userState._state.userToken = "dummy";
      googleAuthFactory.authenticate();
      
      setTimeout(function() {
        $http.get.should.have.been.calledWith("https://www.googleapis.com/oauth2/v1/userinfo?access_token=testToken");

        gapiAuth.authorize.should.have.been.calledWith({
          "client_id":"614513768474.apps.googleusercontent.com",
          "scope":"https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
          "cookie_policy":"protocol://domain",
          "authuser":"a@b.ca",
          "immediate":true
        });

        done();
      }, 10);
    });

    it("should handle failure to retrieve oauthUserInfo", function(done) {
      failOAuthUser = true;

      googleAuthFactory.authenticate().then(function(resp) {
        done(resp);
      })
      .then(null, function(error) {
        expect(error).to.equal("oauth failure");
        done();
      })
      .then(null,done);
    });

    it("should retrieve oauthUserInfo correctly", function(done) {
      googleAuthFactory.authenticate().then(function(resp) {
        expect(resp).to.deep.equal({ email: "someuser@awesome.io" });

        done();
      })
      .then(null,done);
    });
  });
  
  describe("authenticateRedirect: ", function() {
    beforeEach(module(function ($provide) {
      $provide.value("$window", {
        location: {
          href: "http://localhost:8000/editor/list?cid=companyId",
          origin: "http://localhost:8000",
          pathname: "/editor/list",
          search: "?cid=companyId",
          hash: ""
        }
      });
    }));
    beforeEach(function() {
      inRVAFrame = false;

      inject(function($injector){
        $window = $injector.get("$window");
        googleAuthFactory = $injector.get("googleAuthFactory");
      });
    });

    it("should not redirect if forceAuth is false", function(done) {
      googleAuthFactory.authenticate().then(function(resp) {
        expect($window.location.href).to.equal("http://localhost:8000/editor/list?cid=companyId");
        expect(resp).to.deep.equal({ email: "someuser@awesome.io" });

        done();
      })
      .then(null,done);
    });

    it("should redirect to the google auth page", function(done) {
      googleAuthFactory.authenticate(true);
      
      setTimeout(function() {
        expect($window.location.href).to.equal("https://accounts.google.com/o/oauth2/auth" +
          "?response_type=token" +
          "&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile" +
          "&client_id=614513768474.apps.googleusercontent.com" +
          "&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2F" + 
          "&prompt=select_account" +
          "&state=%257B%2522p%2522%253A%2522editor%252Flist%2522%252C%2522u%2522%253A%2522%2522%252C%2522s%2522%253A%2522%253Fcid%253DcompanyId%2522%257D"
        );

        done();
      }, 10);
    });

  });

  describe("interpret auth result: ", function() {
    var $location;

    beforeEach(function() {
      path = "/state=%7B%22p%22%3A%22%22%2C%22u%22%3A%22%23%2F%22%2C%22s%22%3A%22%22%7D&access_token=ya29&token_type=Bearer&expires_in=3600";
      inRVAFrame = false;

      inject(function($injector){
        $location = $injector.get("$location");
        googleAuthFactory = $injector.get("googleAuthFactory");
      });
    });
    
    it("should parse params from url", function() {
      userState._restoreState.should.have.been.called;
      userState._setUserToken.should.have.been.calledWith({"state":"%7B%22p%22%3A%22%22%2C%22u%22%3A%22%23%2F%22%2C%22s%22%3A%22%22%7D","access_token":"ya29","token_type":"Bearer","expires_in":"3600"});
      
      $location.path.should.have.been.calledWith("");
    })
  });

});
