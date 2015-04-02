var app = angular.module("landingPage", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http) {
    $scope.channels = ["sports", "dinner", "movie"];
});