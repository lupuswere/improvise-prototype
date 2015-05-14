var app = angular.module("landingPage", []);
app.controller("mainCtrl", function mainCtrl($scope, $http, $window) {
    $scope.channels = ["sports", "dinner", "movie"];
    //$scope.channels = ["sports"];
    $scope.user = {};
    $scope.msg = {
        msgList: []
    };
    $scope.msgCount = 0;
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
    //Build Web Socket connection
    //socket = io.connect("http://localhost"); //Local Development
    //socket = io.connect("http://improvise.jit.su"); //original host
    socket = io.connect("http://improvise-lupuswere.rhcloud.com");
    socket.on("message", function (json) {
        $scope.msgCount++;
        if (json.msgType === "acceptance") {
            var tmpSend = json.text.split(/\s+/).map(String);
            var role = "you";
            if (tmpSend[1] !== $scope.user.username) {
                role = tmpSend[1];
            }
            json.text = "accepted the invitation from " + role + ".";
        }
        $scope.msg.msgList.push(json);
        $scope.$apply();
    });
    //Has bugs
    $scope.toChannel = function (channel) {
        $scope.tmpSave();
        $window.location.href = "/channel/" + channel;
    };
    $scope.invited = function () {
        $scope.tmpSave();
        $window.location.href = "/invited";
    };
    $scope.accepted = function () {
        $scope.tmpSave();
        $window.location.href = "/accepted";
    };
    $scope.profile = function () {
        $scope.tmpSave();
        $window.location.href = "/profile";
    };
    $scope.logout = function () {
        $window.location.href = "/logout";
    };
    $scope.tmpSave = function () {
        $http.post("/tmpsave", $scope.msg)
            .success(function (data) {
                //TODO
                console.log(data);
            })
            .error(function (data) {
                console.log("Error: " + data);
            });
    };
});