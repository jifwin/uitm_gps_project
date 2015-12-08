angular.module('mapApp', [])
.config(function ($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
})
.controller('friendsTableCtrl', function ($scope) {
  $scope.friends = [];
  $scope.removeFriends = function (){
    $scope.friends = [];
    $scope.$apply();
  };
  $scope.addFriend = function(username) {
    $scope.friends.push(username);
    $scope.$apply();
  }
});