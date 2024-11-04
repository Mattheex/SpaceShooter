function detectmob() {
    return !!(navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i));
}

function entierAleatoire(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function handleMotionEvent(event) {
    console.log(event.acceleration.x);
    Client.socket.emit('acceleration', {
        id: pcId,
        idPlayer: idPlayer,
        x: Math.abs(event.acceleration.x),
        y: Math.abs(event.acceleration.y),
        z: Math.abs(event.acceleration.z)
    });
}

function checkMoving() {
    for (let i = 0; i < moving.length; i++) {
        if (moving[i]) {
            moving[i] = false;
            return true
        }
    }
    return false
}

const jsonMeteor = {
    "meteor0": "meteorBrown_big1.png",
    "meteor1": "meteorBrown_big2.png",
    "meteor2": "meteorBrown_big3.png",
    "meteor3": "meteorBrown_big4.png",
    "meteor4": "meteorBrown_med1.png",
    "meteor5": "meteorBrown_med3.png",
    "meteor6": "meteorBrown_small1.png",
    "meteor7": "meteorBrown_small2.png",
    "meteor8": "meteorBrown_tiny1.png",
    "meteor9": "meteorBrown_tiny2.png"
};

const jsonEnemy = {
    "enemy0": "enemyBlack1.png",
    "enemy1": "enemyBlack2.png",
    "enemy2": "enemyBlack3.png",
    "enemy3": "enemyBlack4.png",
    "enemy4": "enemyBlack5.png",
    "enemy5": "enemyBlue1.png",
    "enemy6": "enemyBlue2.png",
    "enemy7": "enemyBlue3.png",
    "enemy8": "enemyBlue4.png",
    "enemy9": "enemyBlue5.png",
    "enemy10": "enemyGreen1.png",
    "enemy11": "enemyGreen2.png",
    "enemy12": "enemyGreen3.png",
    "enemy13": "enemyGreen4.png",
    "enemy14": "enemyGreen5.png",
    "enemy15": "enemyRed1.png",
    "enemy16": "enemyRed2.png",
    "enemy17": "enemyRed3.png",
    "enemy18": "enemyRed4.png",
    "enemy19": "enemyRed5.png"
};

const jsonPower = {
    "power0": "laserBlue08.png",
    "power1": "laserBlue09.png",
    "power2": "laserBlue10.png",
    "power3": "laserBlue11.png",
};

const jsonMeteorZoe = {
    "meteor0": "meteor1.png",
    "meteor1": "meteor2.png",
    "meteor2": "meteor3.png"
};

const jsonEnemyZoe = {
    "enemy0": "curlyPocket.png"
};

const jsonPowerZoe = {
    "power0": "lemon_circle.png",
    "power1": "hinata.png",
    "power2": "tnt.png",
    "power3": "naruto.png",
    "power31": "sasuke.png",
    "power32": "sakura.png"
};