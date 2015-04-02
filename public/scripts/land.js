var app = angular.module("landingPage", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    //$scope.channels = ["sports", "dinner", "movie"];
    $scope.channels = ["sports"];
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
});