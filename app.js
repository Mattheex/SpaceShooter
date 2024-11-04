var express = require('express');
var fs = require("fs");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
let host = {};
let freeId = 0;

app.use('/css', express.static(__dirname + '/public/css'));
app.use('/js', express.static(__dirname + '/public/js'));
app.use('/assets', express.static(__dirname + '/public/assets'));

/*let obj = {};
let i = 0;
fs.readdirSync(__dirname + '/public/assets/spaceshooter/PNG/Enemies/').forEach(function (file) {
    obj['enemy' + i] = file;
    i++;
});

json = JSON.stringify(obj);
fs.writeFileSync(__dirname + '/public/js/enemies.json', json);
console.log("Json wrote");*/

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 8081, function () {
    console.log('Listening on ' + server.address().port);
});


io.on('connection', function (socket) {

    console.log("NewConnection");

    //socket.join('some room');

    /*socket.on('room', function (room) {
        //socket.join(room);
    });*/

    socket.on('newConnection', function (data) {
        socket.to(data.id).emit('newPlayer', data.socketId);
    });

    socket.on('idPlayer', function (data) {
        socket.to(data.id).emit('idPlayer', data.idPlayer);
        console.log(data.idPlayer);
    });

    socket.on('pad', function (data) {
        socket.to(data.id).emit('pad', {x: data.x, y: data.y});
    });

    socket.on('acceleration', function (data) {
        if (data.z > 6) {
            socket.to(data.id).emit('acceleration', 0);
        }
    });

    socket.on('missile', function (data) {
        socket.to(data.id).emit('missile', 0);
    });


    socket.on('test', function (data) {
        console.log("Device Motion : " + data);
    });

    socket.on('testJson', function (data) {
        data = JSON.parse(data);
        console.log("JSON : " + data['123']);
    });

    socket.on('changingPlayer', function (data) {
        socket.to(data.id).emit('changingPlayer', {name: data.name, idPlayer: data.idPlayer});
        console.log("Changing Player : " + data.idPlayer);
    });

    socket.on('device', function (data) {
        if (data === "pc or tablet") {
            host[freeId] = socket.id;
            freeId++;
            console.log("New host :" + JSON.stringify(host));
        } else {
            socket.emit("pcList", {host: host, socketId: socket.id});
            console.log("Emit host list : " + JSON.stringify(host));
        }
        console.log(data);
    });

    socket.on('disconnecting', () => {
        for (let key in host) {
            if (host[key] === socket.id) {
                delete host[key];
                console.log("disconnected : " + JSON.stringify(host));
                break;
            }
        }

        for (let key in host){

        }
    });
});



