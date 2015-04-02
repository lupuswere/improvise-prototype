//Basic settings
var express = require("express");
var path = require("path");
var app = express();
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var methodOverride = require("method-override");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");

//Set up log level
io.set("log level", 1);

//Listen to Web Socket Connection
io.on("connection", function (socket) {
    socket.emit("open"); //Broadcast to the client about the success of connection
    var client = {
        socket: socket,
        name: false,
        color: getColor()
    }; //Client object
    //Listen to the message
    socket.on("message", function (msg) {
        var obj = {
            time: getTime(),
            color: client.color
        };

        //Whether this is the first connection?
        if (!client.name) {
            client.name = msg;
            obj["text"] = client.name;
            obj["author"] = "System";
            obj["type"] = "welcome";
            //console.log(client.name + " login");

            //Return the welcome message
            socket.emit("system", obj);
            //Broadcast the new user
            socket.broadcast.emit("system", obj);
        } else {
            obj["text"] = msg;
            obj["author"] = client.name;
            obj["type"] = "message";
            //console.log(client.name + " say: " + msg);
            socket.emit("message", obj);
            //Broadcast to other users
            socket.broadcast.emit("message", obj);
        }
    });

    socket.on("disconnect1", function () {
        var obj = {
            time: getTime(),
            color: client.color,
            author: "System",
            text: client.name,
            type: "disconnect"
        };

        //Broadcast about the disconnection
        socket.broadcast.emit("system", obj);
        //console.log(client.name + "Disconnect");
    });
});

app.set("port", process.env.PORT || 80);
app.set("views", __dirname + "/views");
app.use(morgan("dev"));
app.use(bodyParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, "public")));

var env = process.env.NODE_ENV || "development";
if ("development" === app.get("env")) {
    app.use(errorHandler());
}

//The html file of Web Socket
app.get("/", function (req, res) {
    res.sendfile("views/landing.html");
});

app.get("/channel/sports", function (req, res) {
    res.sendfile("views/channels/channel_one.html");
});

app.get("/channel/dinner", function (req, res) {
    res.sendfile("views/channels/channel_two.html");
});

app.get("/channel/movie", function (req, res) {
    res.sendfile("views/channels/channel_three.html");
});

server.listen(app.get("port"), function () {
    console.log("Listening on port " + app.get("port"));
});

var getTime = function () {
    var now = new Date();
    return now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
};

var getColor = function () {
    var colors = ['AliceBlue', 'AntiqueWhite', 'Aqua', 'Aquamarine', 'Azure', 'Beige', 'Bisque', 'Black', 'BlanchedAlmond', 'Blue', 'BlueViolet', 'Brown', 'BurlyWood', 'CadetBlue', 'Chartreuse', 'Chocolate', 'Coral', 'CornflowerBlue', 'Cornsilk', 'Crimson', 'Cyan', 'DarkBlue', 'DarkCyan', 'DarkGoldenRod', 'DarkGray', 'DarkGreen', 'DarkKhaki', 'DarkMagenta', 'DarkOliveGreen', 'DarkOrange', 'DarkOrchid', 'DarkRed', 'DarkSalmon', 'DarkSeaGreen', 'DarkSlateBlue', 'DarkSlateGray', 'DarkTurquoise', 'DarkViolet', 'DeepPink', 'DeepSkyBlue', 'DimGray', 'DodgerBlue', 'FireBrick', 'FloralWhite', 'ForestGreen', 'Fuchsia', 'Gainsboro', 'GhostWhite', 'Gold', 'GoldenRod', 'Gray', 'Green', 'GreenYellow', 'HoneyDew', 'HotPink', 'IndianRed ', 'Indigo  ', 'Ivory', 'Khaki', 'Lavender', 'LavenderBlush', 'LawnGreen', 'LemonChiffon', 'LightBlue', 'LightCoral', 'LightCyan', 'LightGoldenRodYellow', 'LightGray', 'LightGreen', 'LightPink', 'LightSalmon', 'LightSeaGreen', 'LightSkyBlue', 'LightSlateGray', 'LightSteelBlue', 'LightYellow', 'Lime', 'LimeGreen', 'Linen', 'Magenta', 'Maroon', 'MediumAquaMarine', 'MediumBlue', 'MediumOrchid', 'MediumPurple', 'MediumSeaGreen', 'MediumSlateBlue', 'MediumSpringGreen', 'MediumTurquoise', 'MediumVioletRed', 'MidnightBlue', 'MintCream', 'MistyRose', 'Moccasin', 'NavajoWhite', 'Navy', 'OldLace', 'Olive', 'OliveDrab', 'Orange', 'OrangeRed', 'Orchid', 'PaleGoldenRod', 'PaleGreen', 'PaleTurquoise', 'PaleVioletRed', 'PapayaWhip', 'PeachPuff', 'Peru', 'Pink', 'Plum', 'PowderBlue', 'Purple', 'RebeccaPurple', 'Red', 'RosyBrown', 'RoyalBlue', 'SaddleBrown', 'Salmon', 'SandyBrown', 'SeaGreen', 'SeaShell', 'Sienna', 'Silver', 'SkyBlue', 'SlateBlue', 'SlateGray', 'Snow', 'SpringGreen', 'SteelBlue', 'Tan', 'Teal', 'Thistle', 'Tomato', 'Turquoise', 'Violet', 'Wheat', 'White', 'WhiteSmoke', 'Yellow', 'YellowGreen'];
    return colors[Math.round(Math.random() * 10000 % colors.length)];
};