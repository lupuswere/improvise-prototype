var app = angular.module("invitedPage", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    $scope.user = {};
    $scope.invitedInvitations = [];
    $http.get("/checklogin")
        .success(function (data) {
            if (data) {
                $scope.user = data;
                $http.get("/invitedInvitations/" + $scope.user.username)
                    .success(function (data) {
                        if (data) {
                            var tmpInvitedInvitations = [];

                            $scope.invitedInvitations = tmpInvitedInvitations;
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
    $scope.accepted = function () {
        $window.location.href = "/accepted";
    };
    $scope.profile = function () {
        $window.location.href = "/profile";
    };
});