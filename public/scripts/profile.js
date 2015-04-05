var app = angular.module("profilePage", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    $scope.user = {};
    $http.get("/checklogin")
        .success(function (data) {
            if (data) {
                $scope.user = data;
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
    $scope.invited = function () {
        $window.location.href = "/invited";
    };
    $scope.accepted = function () {
        $window.location.href = "/accepted";
    };
    $scope.landing = function () {
        $window.location.href = "/landing";
    };
});