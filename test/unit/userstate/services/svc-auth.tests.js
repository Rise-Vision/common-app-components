"use strict";
describe("service: auth:", function() {
  beforeEach(module("risevision.common.components.userstate"));
  beforeEach(module(function ($provide) {
    $provide.service("$q", function() {return Q;});

    $provide.service("coreAPILoader",function () {
      return function(){
        var deferred = Q.defer();

        deferred.resolve({
          userauth: {
            add: function(obj) {
              expect(obj).to.be.ok;
              expect(obj.username).to.be.ok;
              expect(obj.password).to.be.ok;

              if (returnResult) {
                return Q.resolve({
                  result: obj.username
                });
              } else {
                return Q.reject("API Failed");
              }
            },
            update: function(obj) {
              expect(obj).to.be.ok;
              expect(obj.username).to.be.ok;
              expect(obj.password).to.be.ok;

              if (returnResult) {
                return Q.resolve({
                  result: obj.username
                });
              } else {
                return Q.reject("API Failed");
              }
            }, 
            login: function(obj) {
              expect(obj).to.be.ok;
              expect(obj.username).to.be.ok;
              expect(obj.password).to.be.ok;

              if (returnResult) {
                return Q.resolve("token");
              } else {
                return Q.reject("API Failed");
              }
            },
            refreshToken: function(obj) {
              expect(obj).to.be.ok;
              expect(obj.username).to.be.ok;
              expect(obj.token).to.be.ok;

              if (returnResult) {
                return Q.resolve("refreshedToken");
              } else {
                return Q.reject("API Failed");
              }
            },        
          }
        });
        return deferred.promise;
      };
    });

  }));
  var userauth, returnResult;
  beforeEach(function(){
    returnResult = true;

    inject(function($injector){
      userauth = $injector.get("userauth");
    });
  });

  it("should exist",function(){
    expect(userauth).to.be.ok;
    expect(userauth.add).to.be.a("function");
    expect(userauth.update).to.be.a("function");
    expect(userauth.login).to.be.a("function");
    expect(userauth.refreshToken).to.be.a("function");
  });

  describe("add:",function(){
    it("should add user auth",function(done){
      userauth.add("username", "newpass")
        .then(function(resp){
          expect(resp).to.be.ok;
          expect(resp).to.equal("username");

          done();
        })
        .then(null,done);
    });

    it("should handle failure to add user auth",function(done){
      returnResult = false;
      userauth.add("username", "newpass")
        .then(function(resp) {
          done(resp);
        })
        .then(null, function(error) {
          expect(error).to.deep.equal("API Failed");
          done();
        })
        .then(null,done);
    });
  });  

  describe("update:",function(){
    it("should update user auth",function(done){
      userauth.update("username", "newpass")
        .then(function(resp){
          expect(resp).to.be.ok;
          expect(resp).to.equal("username");

          done();
        })
        .then(null,done);
    });

    it("should handle failure to update user auth",function(done){
      returnResult = false;
      userauth.update("username", "newpass")
        .then(function(resp) {
          done(resp);
        })
        .then(null, function(error) {
          expect(error).to.deep.equal("API Failed");
          done();
        })
        .then(null,done);
    });
  });
  
  describe("login:",function(){
    it("should login user",function(done){
      userauth.login("username", "pass")
        .then(function(resp){
          expect(resp).to.be.ok;
          expect(resp).to.equal("token");

          done();
        })
        .then(null,done);
    });

    it("should handle failure to login user",function(done){
      returnResult = false;
      userauth.login("username", "pass")
        .then(function(resp) {
          done(resp);
        })
        .then(null, function(error) {
          expect(error).to.deep.equal("API Failed");
          done();
        })
        .then(null,done);
    });
  });
  
  describe("refreshToken:",function(){
    it("should login user",function(done){
      userauth.refreshToken("username", "newToken")
        .then(function(resp){
          expect(resp).to.be.ok;
          expect(resp).to.equal("refreshedToken");

          done();
        })
        .then(null,done);
    });

    it("should handle failure to login user",function(done){
      returnResult = false;
      userauth.refreshToken("username", "newToken")
        .then(function(resp) {
          done(resp);
        })
        .then(null, function(error) {
          expect(error).to.deep.equal("API Failed");
          done();
        })
        .then(null,done);
    });
  });

});
