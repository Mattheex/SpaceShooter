let pcIds = {}, pcId, idPlayer;

class Mobile extends Phaser.Scene {
    constructor() {
        super({key: 'Game'});
    }

    preload() {
        this.load.image('background', 'assets/spaceshooter/Backgrounds/black.png');
        this.load.image('lazer', 'assets/spaceshooter/PNG/Lasers/laserBlue01.png');
        this.load.image('powerUpBlue', 'assets/spaceshooter/PNG/Power-ups/powerupBlue_bolt.png');
        this.load.image('direction', 'assets/spaceshooter/direction.png');
        this.load.image('left', 'assets/spaceshooter/leftArrow.png');
        this.load.image('right', 'assets/spaceshooter/rightArrow.png');
        this.load.image('blue', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_blue.png');
        this.load.image('green', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_green.png');
        this.load.image('orange', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_orange.png');
        this.load.image('red', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_red.png');
    }

    create() {
        this.cameras.main.backgroundColor.setTo("#30373e");
        this.input.addPointer(1);

        this.dispoShip = ['blue', 'green', 'orange', 'red'];
        this.id = 0;
        this.over = false;
        this.nbPlayer = 0;
    }

    update() {
        if (this.over) {
            this.controller();
        }
    }

    controller() {
        let p = this.input.activePointer;
        if (p.id === this.id) {
            let xD = p.worldX - this.direction.x;
            let yD = p.worldY - this.direction.y;
            let norme = Math.sqrt(xD * xD + yD * yD);

            xD /= norme;
            yD /= norme;

            Client.socket.emit('pad', {id: pcId, idPlayer: idPlayer, x: xD, y: yD});
        }
    }

    loadJson(host, socketId) {
        this.login = this.add.text(0, 0, '', {font: '45px Courier', fill: '#ffff00'}).setInteractive();
        Phaser.Display.Align.In.Center(this.login, this.add.zone(x / 2, y / 2, x, y));

        for (let key in host) {
            this.login.text = key;
        }

        this.login.on('pointerdown', () => {
            pcId = pcIds[this.login.text];
            Client.socket.emit('newConnection', {id: pcId, socketId: socketId});
            //Client.socket.emit("test", JSON.stringify(pcIds));
            this.login.visible = false;
            if (window.DeviceMotionEvent) {
                Client.socket.emit("test", true);
            } else {
                Client.socket.emit("test", false);
            }
            window.addEventListener("devicemotion", handleMotionEvent, false);
            this.loadPlayer();
        });
    }

    loadPlayer() {
        this.left = this.add.sprite(x / 4, y / 2, 'left').setInteractive();
        this.left.input.hitArea.setTo(-50, -50, this.left.width + 50 * 2, this.left.height + 50 * 2);

        this.center = this.add.sprite(x / 2, y / 2, 'blue').setInteractive();
        this.center.input.hitArea.setTo(-50, -50, this.center.width + 50 * 2, this.center.height + 50 * 2);

        this.right = this.add.sprite(3 * x / 4, y / 2, 'right').setInteractive();
        this.right.input.hitArea.setTo(-50, -50, this.right.width + 50 * 2, this.right.height + 50 * 2);

        this.left.on('pointerdown', () => {
            if (this.nbPlayer - 1 < 0) {
                this.nbPlayer = 3
            } else {
                this.nbPlayer--;
            }
            Client.socket.emit('changingPlayer', {id: pcId, name: this.dispoShip[this.nbPlayer], idPlayer: idPlayer})
        });

        this.center.on('pointerdown', () => {
            Client.socket.emit('changingPlayer', {id: pcId, name: 'finish', idPlayer: idPlayer});
            this.left.destroy();
            this.right.destroy();
            this.center.destroy();
            this.loadInput();
        });

        this.right.on('pointerdown', () => {
            if (this.nbPlayer + 1 > 3) {
                this.nbPlayer = 0
            } else {
                this.nbPlayer++;
            }
            Client.socket.emit('changingPlayer', {id: pcId, name: this.dispoShip[this.nbPlayer], idPlayer: idPlayer})
        });
    }

    loadInput() {
        this.lazer = this.add.sprite(x - 100, y / 2, 'lazer').setInteractive();
        this.lazer.input.hitArea.setTo(-50, -50, this.lazer.width + 50 * 2, this.lazer.height + 50 * 2);

        this.direction = this.add.sprite(100, y - 200, 'direction').setInteractive();
        this.direction.setScale(2);

        this.direction.on('pointerdown', (pointer) => {
            this.over = true;
            this.id = pointer.id;
            console.log(this.id);
        });

        this.lazer.on('pointerdown', () => {
            Client.socket.emit('missile', {id: pcId, idPlayer: idPlayer});
            console.log("Missile");
        });

        this.input.on('pointerup', (pointer) => {
            if (pointer.id === this.id) {
                console.log("over false");
                this.over = false;
                this.id = 0;
                Client.socket.emit('pad', {id: pcId, idPlayer: idPlayer, x: 0, y: 0});
            }
        });
    }
}