var app = angular.module('scoreboard', ['ui.bootstrap']);
app.controller('myCtrl', function($scope, $timeout, $http, $uibModal) {

    if (typeof(Storage) !== "undefined") {
        // Code for window.localStorage/sessionStorage.
    } else {
        // Sorry! No Web Storage support..
    }

    $scope.user = {
      name: "Your Name"
    };

    if (window.localStorage.getItem("teamOneScore") === undefined || isNaN(window.localStorage.getItem("teamOneScore")) || window.localStorage.getItem("teamTwoScore") === null) {
        window.localStorage.teamOneScore = 0;
        $scope.teamOne = {
            score: 0
        };

        $scope.teamTwo = {
            score: 0
        };
    } else {
        $scope.teamOne = {
            score: parseInt(window.localStorage.getItem("teamOneScore"))
        };
        console.log($scope.teamOne);
    }

    if (window.localStorage.getItem("teamTwoScore") === undefined || isNaN(window.localStorage.getItem("teamTwoScore")) || window.localStorage.getItem("teamTwoScore") === null) {
        window.localStorage.teamTwoScore = 0;
    } else {
        $scope.teamTwo = {
            score: parseInt(window.localStorage.getItem("teamTwoScore"))
        };
        //console.log(window.localStorage.getItem("teamTwoScore"));
        //console.log(isNaN(window.localStorage.getItem("teamTwoScore")));
    }

    $scope.firstName = "John";
    $scope.lastName = "Doe";


    $scope.teams = [{name: 'Team Null Pointer Exception'}, {name:"Team 404" }];

    $scope.teamOne.name = "Team Null Pointer Exception";
    $scope.teamTwo.name = "Team 404";

    var ws = new WebSocket("ws://localhost:3030", "echo-protocol");

   ws.onopen = function(){
       console.log("Socket has been opened!");
   };

   ws.onmessage = function(message) {
      console.log(JSON.parse(message.data));
      var modalInstance = $uibModal.open({
      animation: true,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: 'scripts/components/modal/modal.template.html',
      controller: 'modalCtrl',
    //  controllerAs: '$ctrl',
      size: 'lg',
      resolve: {
        user: function () {
          return JSON.parse(message.data);
        }
      }
    });
   };

   $scope.bing = function(){
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
        if (localStorage[team] == undefined) {
            window.localStorage[team] = {
                score: 0
            };
        }
        console.log(team);
        console.log(window.localStorage);
        var storageVar = team + "Score";
        window.localStorage[storageVar] = parseInt(window.localStorage.getItem(storageVar)) + 1;
    };

    $scope.reducePoint = function(team) {
        window.localStorage[team + "Score"] = parseInt(window.localStorage.getItem(team + "Score")) - 1;
    }

    $scope.scoreSound = function() {

    };
});
