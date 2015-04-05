var app = angular.module("acceptedPage", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    $scope.user = {};
    $scope.acceptedInvitations = [];
    $http.get("/checklogin")
        .success(function (data) {
            if (data) {
                $scope.user = data;
                $http.get("/acceptedInvitations/" + $scope.user.username)
                    .success(function (data) {
                        if (data) {
                            $scope.acceptedInvitations = data;
                        }
                    })
                    .error(function (data) {
                        console.log("Error: " + data);
                    });
            } else {
                $window.location.href = "/";
            }
        })
        .error(function (data) {
            $window.location.href = "/";
            console.log("Error: " + data);
        });

    $scope.toChannel = function (channel) {
        $window.location.href = "/channel/" + channel;
    };
    $scope.landing = function () {
        $window.location.href = "/landing";
    };
    $scope.invited = function () {
        $window.location.href = "/invited";
    };
    $scope.profile = function () {
        $window.location.href = "/profile";
    };
});