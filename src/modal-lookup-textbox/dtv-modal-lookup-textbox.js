(function () {
  "use strict";
  angular.module("risevision.app.common.components.modal-lookup-textbox")
    .directive("tagTextbox", ["$modal", "$templateCache", "$q",
      function ($modal, $templateCache, $q) {
        return {
          restrict: "E",
          $scope: {
            tags: "=?",
            tagDefs: "=",
            statusCode: "@"
          },
          template: $templateCache.get("modal-lookup-textbox/tag-textbox.html"),
          link: function ($scope) {
            $scope.openModal = function () {
              var modalInstance = $modal.open({
                template: $templateCache.get("modal-lookup-textbox/tag-lookup-modal.html"),
                controller: "tagLookup",
                resolve: {
                  tags: function () {
                    return angular.copy($scope.tags);
                  },
                  tag: function(){
                    var svc = {};
                    svc.list = function(){
                      var deferred = $q.defer();
                      if($scope.statusCode === 200){
                        var resp = {};
                        resp.items = $scope.tagDefs;
                        deferred.resolve(resp);
                      } else {
                        deferred.reject("Rejection Status Code: " + $scope.statusCode)
                      }
                      return deferred.promise;
                    };

                    return svc;
                  }
                }
              });

              modalInstance.result.then(function (tags) {
                //do what you need if user presses ok
                $scope.tags = tags;
              }, function () {
                // do what you need to do if user cancels
              });
            };

          } //link()
        };
      }
    ]);
}());
