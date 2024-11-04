let x, y, mobile;
let room = "abc123";
let pause = false, playersKey = [];

function Detect() {
    let rotation = Math.abs(window.orientation) === 90;
    let fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
    if (!rotation && false) {

        /*if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        }*/

        document.getElementById('rotation_msg').style.display = "flex";
        document.getElementById('game').style.display = "none";
        document.getElementById('fullscreen').style.display = "none";
    } else {
        document.getElementById('rotation_msg').style.display = "none";

        if (!fullscreenElement && false) {
            document.getElementById('fullscreen').style.display = "flex";
            document.getElementById('game').style.display = "none";
        } else {
            document.getElementById('fullscreen').style.display = "none";
            document.getElementById('game').style.display = "block";
        }
    }
}

function launchFullscreen(element) {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function logKey(e) {
    if (e.keyCode === 88) {
        mobileControl = !mobileControl;
        console.log("switch");
    }
}


if (detectmob()) {
    if (Math.abs(window.orientation) === 90) {
        x = window.screen.availWidth;
        y = window.screen.availHeight;
    } else {
        y = window.screen.availWidth;
        x = window.screen.availHeight;
    }
    mobile = true;
    setInterval(Detect, 1);
} else {
    x = Math.ceil(window.innerWidth);
    y = Math.ceil(window.innerHeight);
    mobile = false;
    document.addEventListener('keydown', logKey);
}

console.log("x : " + x + ", y : " + y);

let config = {
    type: Phaser.AUTO,
    width: x,
    height: y,
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade: {debug: false}
    }
};

let game = new Phaser.Game(config);

if (mobile) {
    game.scene.add('Game', Mobile, true);
    Client.socket.emit('device', 'mobile');
} else {
    game.scene.add('Over', Over);
    game.scene.add('Game', Pc);
    game.scene.add('Menu', Menu, true);
    Client.socket.emit('device', 'pc or tablet');
}

/*Client.socket.on('connect', function () {
    Client.socket.emit('room', room);
});*/
Client.socket.on('pcList', function (data) {
    pcIds = data.host;
    game.scene.getScene('Game').loadJson(data.host, data.socketId);
    //Client.socket.json.emit('testJson', JSON.stringify(pcIds));
});

Client.socket.on('newPlayer', function (data) {
    game.scene.getScene('Menu').addPlayer(data);
});

Client.socket.on('idPlayer', function (data) {
    idPlayer = data;
});

Client.socket.on('changingPlayer', function (data) {
    game.scene.getScene('Menu').changePlayer(data.name, data.idPlayer);
});

Client.socket.on('pad', function (data) {
    game.scene.getScene('Game').movePlayer(data.idPlayer, data.x, data.y);
    coeffX = data.x;
    coeffY = data.y;
});

Client.socket.on('acceleration', function (data) {
    moving[data] = true;
    console.log("Moving " + data);
});

Client.socket.on('missile', function (data) {
    game.scene.getScene('Game').missilePlayer(data);
    //missile[data] = true;
    //smart = true;
    console.log("Missile " + data);
});
