"use strict";
describe("controller: app", function() {
  beforeEach(module("risevision.app.common.components.modal-lookup-textbox"));
  var $scope;
  var tag = {};
  var tags = [];
  var modalInstance = {};
  beforeEach(function(){
    inject(function($injector,$rootScope, $controller, _$loading_, _$log_, $q){
      $scope = $rootScope.$new();
      tag.list = function(){
        var deferred = $q.defer();
        deferred.resolve({items: []});
        return deferred.promise;
      };

      $controller("tagLookup", {
        $scope: $scope,
        tag: tag,
        $modalInstance: modalInstance,
        $loading: _$loading_,
        $log: _$log_,
        tags: tags
      });
      $scope.$digest();
    });
  });
  it("should exist",function(){
    expect($scope).to.be.truely;
  });
});
