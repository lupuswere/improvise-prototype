# Improvite - Prototype

_This is the repository for the server side and web client side of Improvise._

* Team members: Lifei Li, Menglin (Molly) He, Haoyu Liu and Weining Gu.
* Server: Node.js and Express 4.
* Database: MongoDB.
* Front end: AngularJS.
* The server is now hosted on [Nodejitsu](https://webops.nodejitsu.com).
* The database is on [Mongolab](https://mongolab.com/).
* Our mobile side is [here](https://github.com/lupuswere/improvise).
* Website link: http://improvise.jit.su

## Server side

* All server code is in server.js.

### Log in

* Package used: jwt-simple
* User info is encrypted and stored in browser cookie.

```javascript
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
```

* And everytime user visits a new page, we should check the cookie:

```javascript
app.get("/checklogin", function (req, res) {
    var userInfo = jwt.decode(req.cookies.improvise, secr);
    res.json(userInfo);
});
```

* When log out, set a short time cookie:
```javascript
app.get("/logout", function (req, res) {
    res.cookie("improvise", "no", {maxAge: 1});
    res.redirect("/");
});
```


### REST APIs

* A typical API that gets data from Mongo is like this:

```javascript
app.get("/acceptedInvitations/:username", function (req, res) {
    Invitation.find({"receiver": req.params.username}, "sender content receiver", function (err, invitation) {
        if (err) {
            console.log("Error: " + err);
        }
        res.json(invitation);
    });
});
```

### Socket Connection

* Package used: Socket.io

```javascript
var io = require("socket.io").listen(server);
io.on("connection", function (socket) {
    socket.emit("open"); //Broadcast to the client about the success of connection
    var client = {
        socket: socket,
        name: false,
        color: getColor()
    };
    socket.on("message", function (msg) {
        var obj = {
            time: getTime(),
            color: client.color
        };
        if (!client.name) {
            client.name = msg;
            obj["text"] = client.name;
            obj["author"] = "System";
            obj["type"] = "welcome";
            socket.emit("system", obj);
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
            apnConnection.pushNotification(note, myDevice);//Test
            socket.emit("message", obj);
            //Broadcast to other users
            socket.broadcast.emit("message", obj);
        }
    });
});
```

### Apple Push Notifications

* Package used: apn

* First of all, follow the instruction on this [tutorial](http://www.raywenderlich.com/32960/apple-push-notification-services-in-ios-6-tutorial-part-1) to get necessary files.

* Then turn them (pfx files) into pem files.

```shell
openssl pkcs12 -in [filename] -out [filename] -nodes
```

For more info you could check out this [page](https://www.sslshopper.com/ssl-converter.html).

* Then get the token of the development device.

```objective-c
- (void)application:(UIApplication *)app didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken { 
    NSString *str = [NSString stringWithFormat:@"Device Token=%@",deviceToken];
    NSLog(@"This is device token%@", deviceToken);
}

- (void)application:(UIApplication *)app didFailToRegisterForRemoteNotificationsWithError:(NSError *)err { 
    NSString *str = [NSString stringWithFormat: @"Error: %@", err];
    NSLog(@"Error %@",err);    
}
```

* Server side code : a typical server notification

```javascript
var token = "devicetoken";
var myDevice = new apn.Device(token);
var note = new apn.Notification();
var options = {
    "cert": __dirname + "/cert/cert.pem",
    "key": __dirname + "/cert/key.pem",
    "passphrase": "improvise"
};

var apnConnection = new apn.Connection(options);
note.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
note.badge = 1;
note.sound = "ping.aiff";
note.alert = "\u2709 You have a new invitation!";
note.payload = {'messageFrom': 'Improvise'};

apnConnection.pushNotification(note, myDevice);
```

## Client side

* Client side code is in public/scripts.

* A typical call to REST API:

```javascript
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
```

* A typical connection from Socket.io (client) to Socket.io (server):

```javascript
//Build Web Socket connection
socket = io.connect("http://localhost"); //Local Development
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
```