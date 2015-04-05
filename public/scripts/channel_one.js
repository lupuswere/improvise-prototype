var app = angular.module("channelOne", ["luegg.directives"]);
app.controller("mainCtrl", function mainCtrl($scope, $http, $window) {
    $scope.status = "";
    $scope.messages = [];
    $scope.myName = false;
    $scope.preMessage = {};
    $scope.user = {};
    $http.get("/checklogin")
        .success(function (data) {
            if (data) {
                $scope.user = data;
                $scope.preMessage.text = $scope.user.username;
                $scope.sendMessage();
            } else {
                $window.location.href = "/";
            }
        })
        .error(function (data) {
            $window.location.href = "/";
            console.log("Error: " + data);
        });
    //Build Web Socket connection
    socket = io.connect("http://localhost"); //Local Development
    //socket = io.connect("http://improvise.jit.su");
    //Confirm connection
    socket.on("open", function () {
        $scope.status = "Name:";
        $scope.$apply();
    });
    //Listen to system
    socket.on("system", function (json) {
        if (json.type === "welcome") {
            var newMsg = {};
            if ($scope.myName === json.text) {
                $scope.status = $scope.myName + ": ";
                newMsg["author"] = json.text;
                newMsg["text"] = "joined channel Sports.";
                $scope.messages.push(newMsg);
            } else if (json.type === "disconnect") {
                newMsg["author"] = json.text;
                newMsg["text"] = "left channel Sports.";
                $scope.messages.push(newMsg);
            }
            $scope.$apply();
        }
    });

    //Listen to message event
    socket.on("message", function (json) {
        //$scope.messages.push(json.author + ": " + json.text);
        $scope.messages.push(json);
        //console.log(json);
        $scope.$apply();
    });

    //Submit message via send button
    $scope.sendMessage = function () {
        var msg = $scope.preMessage.text;
        if (msg) {
            socket.send(msg);
            $scope.preMessage = {};
            if ($scope.myName === false) {
                $scope.myName = msg;
            }
        }
        $scope.glued = true;
        $scope.$apply();
    };

    //Submit message via enter
    $scope.sendMessageByEnter = function (keyEvent) {
        if (keyEvent.which === 13) {
            $scope.sendMessage();
            $scope.apply();
        }
    };

    $scope.back = function () {
        $window.location.href = "/landing";
    };

    $scope.invitations = function () {
        $window.location.href = "/invitations";
    };

    $scope.profile = function () {
        $window.location.href = "/profile";
    };

    $scope.accept = function (message) {
        var msg = "ACCEPTED!";
        message.status = false;
        socket.send(msg);
        $scope.$apply();
    };

});