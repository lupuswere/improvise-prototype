//Basic settings
var express = require("express");
var path = require("path");
var app = express();
var mongoose = require('mongoose');
var server = require("http").createServer(app);
var io = require("socket.io").listen(server);
var methodOverride = require("method-override");
var Schema = mongoose.Schema;
var morgan = require("morgan");
var jwt = require('jwt-simple');
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var cookieParser = require('cookie-parser');
var secr = "molly";
var secr2 = "menglin";
var secrForPassword = "trailside";
app.use(cookieParser("secret"));
mongoose.connect('mongodb://user:password@ds059651.mongolab.com:59651/improvise');
//MongoDB
var Users = new Schema({
    username: String,
    password: String
});
mongoose.model("Users", Users);
var Invitations = new Schema({
    sender: String,
    content: String,
    receiver: String
});
mongoose.model("Invitations", Invitations);
var Profiles = new Schema({
    username: String,
    gender: String,
    address: String,
    city: String,
    province: String,
    country: String,
    zipCode: String,
    hobby: Array
});
mongoose.model("Profiles", Profiles);
var User = mongoose.model("Users");
var Invitation = mongoose.model("Invitations");
var Profile = mongoose.model("Profiles");
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
            //Return the welcome message
            socket.emit("system", obj);
            //Broadcast the new user
            socket.broadcast.emit("system", obj);
        } else {
            obj["text"] = msg;
            obj["author"] = client.name;
            obj["type"] = "message";
            var acpt = obj["text"].split(/\s+/).map(String);
            if (acpt[0] === "ACCEPTED!") {
                obj["msgType"] = "acceptance";
                obj["invitationSender"] = acpt[1];
            } else {
                obj["msgType"] = "invitation";
                obj["status"] = true;
            }
            socket.emit("message", obj);
            //Broadcast to other users
            socket.broadcast.emit("message", obj);
        }
    });

    socket.on("disconnect", function () {
        var obj = {
            time: getTime(),
            color: client.color,
            author: "System",
            text: client.name,
            type: "disconnect"
        };

        //Broadcast about the disconnection
        socket.broadcast.emit("system", obj);
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

app.get("/", function (req, res) {
    res.sendfile("views/index.html");
});

app.get("/landing", function (req, res) {
    res.sendfile("views/landing.html");
});

app.get("/invited", function (req, res) {
    res.sendfile("views/invited.html");
});

app.get("/accepted", function (req, res) {
    res.sendfile("views/accepted.html");
});

app.get("/profile", function (req, res) {
    res.sendfile("views/profile.html");
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

// REST APIs that operates on database
app.get("/acceptedInvitations/:username", function (req, res) {
    Invitation.find({"receiver": req.params.username}, "sender content receiver", function (err, invitation) {
        if (err) {
            console.log("Error: " + err);
        }
        res.json(invitation);
    });
});

app.get("/invitedInvitations/:username", function (req, res) {
    Invitation.find({"sender": req.params.username}, "sender content receiver", function (err, invitation) {
        if (err) {
            console.log("Error: " + err);
        }
        res.json(invitation);
    });
});

app.post("/invitations", function (req, res) {
    Invitation.create({
        sender: req.body.sender,
        content: req.body.content,
        receiver: req.body.receiver,
        done: false
    }, function (err, json) {
        if (err) {
            res.send(err);
        }
        res.json(json);
    });
});

app.delete("/acceptedInvitations/:username", function (req, res) {
    Invitation.find({ "receiver" : req.params.username }).remove(function (err){
        if(err) {
            res.json({res: false});
        } else {
            res.json({ res: true });
        }
    });
});

app.delete("/invitedInvitations/:username", function (req, res) {
    Invitation.find({ "sender" : req.params.username }).remove(function (err){
        if(err) {
            res.json({res: false});
        } else {
            res.json({ res: true });
        }
    });
});

app.get("/profile/:username", function (req, res) {
    Profile.find({
        "username": req.params.username
    }, "username gender address city province country zipCode hobby", function (err, profile) {
        if (err) {
            console.log("Error: " + err);
        }
        res.json(profile);
    });
});

app.post("/profile/:username", function (req, res) {
    Profile.create({
        "username": req.params.username,
        "gender": req.body.gender,
        "address": req.body.address,
        "city": req.body.city,
        "province": req.body.province,
        "country": req.body.country,
        "zipCode": req.body.zipCode,
        "hobby": req.body.hobby,
        done: false
    }, function (err, profile) {
        if(err) {
            console.log("Error: " + err);
            res.json({res: false});
        } else {
            res.json({res: true});
        }
    });
});

//TODO
app.put("/profile/:username", function (req, res) {

});

// APIs of user log in and sign up
app.post('/signup', function (req, res) {
    var encodedPassword = jwt.encode(req.body.password, secrForPassword);
    User.create({
        username: req.body.username,
        password: encodedPassword,
        done: false
    }, function (err, user) {
        if (err) {
            res.send(err);
        }
        var secretUserInfo = jwt.encode(user, secr);
        res.cookie('improvise', secretUserInfo, {maxAge: 1000 * 60 * 30});
        res.json(user);
    });

});

app.post("/tmpsave", function (req, res) {
    var tmp = jwt.encode(req.body.msgList, secr2);
    res.cookie("tmpImprovise", tmp, {maxAge: 1000 * 60 * 30});
    res.json(tmp);
});

app.get("/tmpsave", function (req, res) {
    var tmp = jwt.decode(req.cookies.tmpImprovise, secr2);
    res.cookie("tmpImprovise", "no", {maxAge: 1});
    res.json(tmp);
});

app.get("/checkuser/:username", function (req, res) {
    User.findOne({"username": req.params.username}, "username", function (err, user) {
        if (err) {
            console.log("Error: " + err);
        }
        res.json(user);
    });
});

app.get("/login/:username", function (req, res) {
    User.findOne({"username": req.params.username}, "username password", function (err, user) {
        if (err) {
            console.log("Error: " + err);
        }
        if (user) {
            var secretUserInfo = jwt.encode(user, secr);
            res.cookie("improvise", secretUserInfo, {maxAge: 1000 * 60 * 30});
            user.password = jwt.decode(user.password, secrForPassword);
            res.json(user);
        } else {
            user = {
                username: req.params.username
            };
            res.json(user);
        }

    });
});

/**
 * New API for log in
 */

app.post("/api/login", function (req, res) {
    var decodedPassword = jwt.encode(req.body.password, secrForPassword);
    User.findOne({"username": req.body.username}, "username password", function (err, user) {
        if(err) {
            console.log("Error: " + err);
            res.json({ res: false });
        }
        if(user) {
            if(decodedPassword === user.password) {
                var secretUserInfo = jwt.encode(user, secr);
                res.cookie("improvise", secretUserInfo, {maxAge: 1000 * 60 * 30});
                res.json({ res: true });
            } else {
                res.json({ res: false });
            }
        } else {
            res.json({ res: false });
        }
    });
});

app.get("/checklogin", function (req, res) {
    var userInfo = jwt.decode(req.cookies.improvise, secr);
    res.json(userInfo);
});

app.get("/logout", function (req, res) {
    res.cookie("improvise", "no", {maxAge: 1});
    res.redirect("/");
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