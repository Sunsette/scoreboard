var app = angular.module('scoreboard', ['ui.bootstrap']);
app.controller('myCtrl', function($scope, $timeout, $http, $uibModal) {

    var websocketPort = "10.129.8.158";

    $scope.gameName = "The Grand Movie Music Quiz";

    $scope.game = {
        name: "The Grand Movie Music Quiz",
        edit: false
    };

    $scope.guessing = false;

    $scope.user = {
        name: "Enter Name"
    };

    $scope.teams = [{
        name: 'Team Null Pointer Exception'
    }, {
        name: "Team 404"
    }];

    if (typeof(Storage) !== "undefined") {
        // Code for window.localStorage/sessionStorage.
    } else {
        // Sorry! No Web Storage support..
    }

    // if (window.localStorage.getItem("teamOneScore") === undefined || isNaN(window.localStorage.getItem("teamOneScore")) || window.localStorage.getItem("teamTwoScore") === null) {
    //     window.localStorage.teamOneScore = 0;
    //     $scope.teamOne = {
    //         score: 0
    //     };
    //
    //     $scope.teamTwo = {
    //         score: 0
    //     };
    // } else {
    //     $scope.teamOne = {
    //         score: parseInt(window.localStorage.getItem("teamOneScore"))
    //     };
    //     console.log($scope.teamOne);
    // }
    //
    // if (window.localStorage.getItem("teamTwoScore") === undefined || isNaN(window.localStorage.getItem("teamTwoScore")) || window.localStorage.getItem("teamTwoScore") === null) {
    //     window.localStorage.teamTwoScore = 0;
    // } else {
    //     $scope.teamTwo = {
    //         score: parseInt(window.localStorage.getItem("teamTwoScore"))
    //     };
    //     //console.log(window.localStorage.getItem("teamTwoScore"));
    //     //console.log(isNaN(window.localStorage.getItem("teamTwoScore")));
    // }

    $scope.teamOne = {

    };

    $scope.teamTwo = {

    };

    $http({
        method: 'GET',
        url: '/context'
    }).then(function successCallback(response) {
        console.log(response.data[0]);
        var teams = response.data[0];
        $scope.teamOne = {
          name:  teams[0].name,
          score:  teams[0].score
        };
        $scope.teamTwo = {
          name: teams[1].name,
          score: teams[1].score
        };
    }, function errorCallback(response) {
        // called asynchronously if an error occurs
        // or server returns response with an error status.
    });

    var ws = new WebSocket("ws://" + websocketPort + ":3030", "echo-protocol");

    ws.onopen = function() {
        console.log("Socket has been opened!");
    };

    ws.onmessage = function(message) {
        console.log(JSON.parse(message.data));
        if (message.data.team !== undefined) {

            if (!$scope.guessing) {
                $scope.guessing = true;
                var modalInstance = $uibModal.open({
                    animation: true,
                    ariaLabelledBy: 'modal-title',
                    ariaDescribedBy: 'modal-body',
                    templateUrl: 'scripts/components/modal/modal.template.html',
                    controller: 'modalCtrl',
                    //  controllerAs: '$ctrl',
                    size: 'lg',
                    resolve: {
                        user: function() {
                            return JSON.parse(message.data);
                        }
                    }
                });

                modalInstance.result.then(function(selectedItem) {
                    console.log("In heeree!");
                    $scope.guessing = false;
                }, function() {
                    //  $scope.guessing = false;
                    $timeout(function() {
                        $scope.guessing = false;
                        console.log("Guessing is now allowed");
                    }, 10000);
                    console.log("Over here");
                });
            }
        } else {
            console.log(message.data);
            var data = JSON.parse(message.data);
            $scope.teamOne = data.teamOne;
            $scope.teamTwo = data.teamTwo;
            console.log($scope.teamOne);
            $scope.$apply();
        }
    };

    ws.onclose = function(event) {
        console.log("Connection closed by server");
        console.log(event);
    };

    $scope.bing = function() {
        console.log($scope.user);
        ws.send(JSON.stringify($scope.user));

    };

    $scope.addPoint = function(team, position) {
        // console.log($(".score-points "));
        // console.log($(".score-points ")[0]);
        // console.log(position)
        // $(".score-points")[0].addClass('magictime puffIn');
        // $timeout(function() {
        //     $(".score-points ").removeClass('magictime puffIn');
        // }, 2000);
        // if (localStorage[team] == undefined) {
        //     window.localStorage[team] = {
        //         score: 0
        //     };
        // }
      //  console.log(team);
      //  console.log(window.localStorage);
      //  var storageVar = team + "Score";
      //  window.localStorage[storageVar] = parseInt(window.localStorage.getItem(storageVar)) + 1;
        ws.send(JSON.stringify({
            teamOne: $scope.teamOne,
            teamTwo: $scope.teamTwo
        }));
    };

    $scope.reducePoint = function(team) {
      //  window.localStorage[team + "Score"] = parseInt(window.localStorage.getItem(team + "Score")) - 1;
        ws.send(JSON.stringify({
            teamOne: $scope.teamOne,
            teamTwo: $scope.teamTwo
        }));
    }

    $scope.$watch('teamOne.name', function(newName, oldName){
      if(newName && oldName){
        console.log(newName);
        console.log(oldName);
        $http({
            method: 'PUT',
            url: '/team/name?oldName='+oldName+'&newName='+newName
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {
            console.error(response);
        });
      }
    });

    $scope.$watch('teamTwo.name', function(newName, oldName){
      if(newName && oldName){
        $http({
            method: 'PUT',
            url: '/team/name?oldName='+oldName+'&newName='+newName
        }).then(function successCallback(response) {
            console.log(response);
        }, function errorCallback(response) {
            console.error(response);
        });
      }
    });

});
