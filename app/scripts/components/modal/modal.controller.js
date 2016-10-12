app.controller('modalCtrl', function($scope, $timeout, $interval, $http, $uibModalInstance, user) {
$scope.user = user;
$scope.seconds = 10;

$interval(function () {
  $scope.seconds = $scope.seconds - 1;
  if($scope.seconds === 0){
    $uibModalInstance.close();
  }
}, 1000, 10);

console.log($scope.user);
});
