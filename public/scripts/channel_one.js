var app = angular.module("channelOne", ["luegg.directives"]);
app.controller("mainCtrl", function mainCtrl ($scope, $http) {
    $scope.status = "";
    $scope.messages = [];
    $scope.myName = false;
    $scope.preMessage = {};
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
            if ($scope.myName === json.text) {
                $scope.status = $scope.myName + ": ";
                $scope.messages.push(json.text + " joined chat.");
            } else if (json.type === "disconnect") {
                $scope.messages.push(json.text + " left chat.");
            }
            $scope.$apply();
        }
    });

    //Listen to message event
    socket.on("message", function (json) {
        $scope.messages.push(json.author + ": " + json.text);
        $scope.$apply();
    });

    //Submit message via send button
    $scope.sendMessage = function () {
        var msg = $scope.preMessage.text;
        if(msg) {
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
});