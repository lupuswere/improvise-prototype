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
    $scope.invitations = function () {
        $window.location.href = "/invitations";
    };
    $scope.landing = function () {
        $window.location.href = "/landing";
    };
});