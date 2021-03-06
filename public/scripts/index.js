var app = angular.module("index", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http, $window) {
    $scope.wrongInfo = false;
    $scope.input = {};
    $scope.alreadyInfo = false;
    $scope.wrongLoginInfo = false;
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
        $http.post("/api/login/", input)
            .success(function (data) {
                if (data) {
                    if(data.res) {
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
                $scope.wrongInfo = true;
            });
    };

    $scope.signup = function (input) {
        $scope.wrongInfo = false;
        $scope.alreadyInfo = false;
        $scope.wrongLoginInfo = false;
        $http.get("/checkuser/" + input.username)
            .success(function (data) {
                if (!(data && data.username)) {
                    $http.post("/signup", $scope.input)
                        .success(function (data) {
                            $window.location.href = '/landing';
                        })
                        .error(function (data) {
                            $scope.wrongLoginInfo = true;
                            console.log("Error: " + data);
                        });
                } else {
                    $scope.alreadyInfo = true;
                }
            })
            .error(function (data) {
                $scope.wrongLoginInfo = true;
                console.log("Error: " + data);
            });
    };
});