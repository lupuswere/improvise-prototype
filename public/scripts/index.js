var app = angular.module("index", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    $scope.wrongInfo = false;
    $scope.input = {};
    $scope.alreadyInfo = false;

    $http.get("/checklogin")
        .success(function (data) {
            if(data) {
                $window.location.href = "/landing";
            }
        })
        .error(function (data) {
            console.log("Error: " + data);
        });

    $scope.login = function (input) {
        $scope.wrongInfo = false;
        $scope.alreadyInfo = false;
        $http.get("/login/" + input.username)
            .success(function (data) {
                if (data && data.username && data.password) {
                    if(data.password === input.password) {
                        console.log("success!");
                        $window.location.href = '/landing';
                    } else {
                        $scope.wrongInfo = true;
                    }
                } else {
                    $scope.wrongInfo = true;
                }
            })
            .error(function (data) {
                console.log("Error: " + data);
            });
    };

    $scope.signup = function (input) {
        $scope.wrongInfo = false;
        $scope.alreadyInfo = false;
        $http.get("/checkuser/" + input.username)
            .success(function (data) {
                if (!(data && data.username)) {
                    $http.post("/signup", $scope.input)
                        .success(function (data) {
                            $window.location.href = '/landing';
                        })
                        .error(function (data) {
                            console.log("Error: " + data);
                        });
                } else {
                    $scope.alreadyInfo = true;
                }
            })
            .error(function (data) {
                console.log("Error: " + data);
            });
    };
});