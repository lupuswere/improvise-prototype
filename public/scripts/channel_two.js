var app = angular.module("channelTwo", ["luegg.directives"]);
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
    $http.get("/tmpsave")
        .success(function (data) {
            if(data && data.length !== 0) {
                $scope.messages = data;
            }
        })
        .error(function (data) {
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
        if (json.msgType === "acceptance") {
            var tmpSend = json.text.split(/\s+/).map(String);
            var role = "you";
            if (tmpSend[1] !== $scope.user.username) {
                role = tmpSend[1];
            }
            json.text = "accepted the invitation from " + role + ".";
        }
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

    $scope.invited = function () {
        $window.location.href = "/invited";
    };

    $scope.accepted = function () {
        $window.location.href = "/accepted";
    };

    $scope.profile = function () {
        $window.location.href = "/profile";
    };

    $scope.logout = function () {
        $window.location.href = "/logout";
    };
    $scope.accept = function (message) {
        var msg = "ACCEPTED! " + message.author;
        message.status = false;
        var invPack = {
            sender: message.author,
            content: message.text,
            receiver: $scope.user.username
        };
        $http.post("/invitations", invPack)
            .success(function (data) {
                //TODO
            })
            .error(function (data) {
                if (data) {
                    console.log("Error: " + data);
                }
            });
        socket.send(msg);
        $scope.$apply();
    };

});