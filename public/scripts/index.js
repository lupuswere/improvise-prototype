var app = angular.module("index", []);
app.controller("mainCtrl", function mainCtrl ($scope, $http) {
    $scope.wrongInfo = false;
    $scope.input = {};
    $scope.alreadyInfo = false;
    $scope.login = function (input) {
        $scope.wrongInfo = false;
        $scope.alreadyInfo = false;
        $http.get("/login/" + input.username)
            .success(function (data) {
                if (data && data.username) {
                    if(data.password === input.password) {
                        //TODO: Lead to landing page and save cookies
                        console.log("success!");
                    } else {
                        $scope.wrongInfo = true;
                    }
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
                            //TODO: Lead to landing page and save cookies
                            console.log("success!");
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