let Client = {};
Client.socket = io();
let moving = [];
let coeffX = 0, coeffY = 0, highScore = 0, speed_world = 10;
let smart = false, bombe = false, mobileControl = false, zoe = false;

class Pc extends Phaser.Scene {

    constructor() {
        super({key: 'Game'});
    }

    preload() {
        this.loading = this.add.text(x / 2, y - 100, "Loading...", {fontSize: 30, color: '#1B5E20'});
        this.couloir = [];

        for (let i = 0; i < 11; i++) {
            this.couloir.push(i * x / 10)
        }

        for (let i = 0; i < 10; i++) {
            let n = ((this.couloir[i] + this.couloir[i + 1]) / 2);
            this.couloir.push(n);
        }

        this.couloir.splice(0, 11);
        this.maxMeteor = -1;
        this.maxEnemy = -1;

        console.log(this.couloir);

        if (zoe) {
            this.load.image('background', 'assets/spaceshooter/Backgrounds/black.png');
            this.load.image('player', 'assets/scaled_zoe/biscuit.png');
            this.load.image('player_life', 'assets/scaled_zoe/biscuit_life.png');
            this.load.image('lazerPlayer', 'assets/scaled_zoe/chocolat.png');
            this.load.image('lazerEnemy', 'assets/scaled_zoe/curly.png');
            this.load.image('powerup', 'assets/scaled_zoe/diamant.png');

            for (let key in jsonMeteorZoe) {
                this.load.image(key, 'assets/scaled_zoe/' + jsonMeteorZoe[key]);
                this.maxMeteor++;
            }

            for (let key in jsonEnemyZoe) {
                this.load.image(key, 'assets/scaled_zoe/' + jsonEnemyZoe[key]);
                this.maxEnemy++;
            }

            for (let key in jsonPowerZoe) {
                this.load.image(key, 'assets/scaled_zoe/' + jsonPowerZoe[key]);
            }
        } else {
            this.load.image('background', 'assets/spaceshooter/Backgrounds/black.png');
            this.load.image('lazerPlayer', 'assets/spaceshooter/PNG/Lasers/laserBlue01.png');
            this.load.image('lazerEnemy', 'assets/spaceshooter/PNG/Lasers/laserRed01.png');
            this.load.image('powerup', 'assets/spaceshooter/PNG/Power-ups/powerupBlue_bolt.png');

            let color = ['blue', 'green', 'orange', 'red'];

            for (let i = 0; i < color.length; i++) {
                this.load.image(color[i], 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_' + color[i] + '.png');
                this.load.image(color[i] + 'Life', 'assets/spaceshooter/PNG/UI/playerLife1_' + color[i] + '.png');
                this.load.image(color[i] + 'power0', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_' + color[i] + '_power0.png');
            }

            for (let key in jsonMeteor) {
                this.load.image(key, 'assets/spaceshooter/PNG/Meteors/' + jsonMeteor[key]);
                this.maxMeteor++;
            }

            for (let key in jsonEnemy) {
                this.load.image(key, 'assets/spaceshooter/PNG/Enemies/' + jsonEnemy[key]);
                this.maxEnemy++;
            }

            for (let key in jsonPower) {
                this.load.image(key, 'assets/spaceshooter/PNG/Lasers/' + jsonPower[key]);
            }
        }

        this.load.image('fire', 'assets/spaceshooter/fire.png');


        this.load.audio('airWolf2', 'assets/audio/Hold.mp3');
        //this.load.audio('explosion_meteor', 'assets/audio/ex_meteor.mp3');

        console.log('finish preload');
    }

    create() {
        this.back = this.add.tileSprite(x / 2, y / 2, x, y, 'background');
        this.circlesX = [x / 2, x - 250, 250];
        this.distance = 200;
        this.circle = new Phaser.Geom.Circle(0, 0, 0);

        this.players = this.physics.add.group({
            immovable: true
        });

        this.meteors = this.physics.add.group({
            velocityY: 500,
            immovable: true
        });
        for (let i = 0; i < 3; i++) {
            let meteor = this.meteors.create(this.couloir[entierAleatoire(0, 9)], -500 * i, 'meteor' + entierAleatoire(0, this.maxMeteor));
            meteor.setData({'type': 'meteor'});
        }

        this.powers = this.physics.add.group({
            velocityY: 250,
            immovable: true
        });

        this.lazersP = this.physics.add.group({
            velocityY: -1000,
            immovable: true
        });

        this.lazersE = this.physics.add.group({
            velocityY: 1000,
            immovable: true
        });
        for (let i = 0; i < 5; i++) {
            let laser = this.lazersE.create(0, 0, 'lazerEnemy');
            laser.setData({'type': 'laser'});
            this.lazersE.killAndHide(laser);
        }

        this.bombes = this.physics.add.group({
            velocityY: -600,
            immovable: true
        });

        this.enemies = this.physics.add.group({
            immovable: true
        });
        this.createEnemy = true;

        let j = 0;
        for (let i = 0; i < 3; i++) {
            for (let k = 0; k < 10; k++) {
                let enemy = this.enemies.create(0, 0, 'enemy' + entierAleatoire(0, this.maxEnemy)).setData('type', 'enemyCircle');
                enemy.setScale(0.5, 0.5);
                enemy.setData({'type': 'enemyCircle', 'id': i});
                enemy.setVisible(false);
                enemy.rotation = (Math.PI * k) / 5 - Math.PI / 2;
                let laser = this.lazersE.create(0, 0, 'lazerEnemy').setData('type', 'laser');
                laser.visible = false;
                laser.angle = enemy.angle + 180;
                let angle = enemy.rotation + Math.PI / 2;
                this.time.addEvent({
                    delay: 2000,
                    callback: this.fireEnemies,
                    args: [enemy, laser, angle],
                    callbackScope: this,
                    loop: true,
                    startAt: 2000 - j
                });
                j += 100;
            }

        }
        this.enemiesCircleChild = this.enemies.getChildren();
        this.enemiesCircleSlice = [];
        for (let i = 0; i < 3; i++) {
            this.enemiesCircleSlice.push(this.enemiesCircleChild.slice(i * 10, (i + 1) * 10));
        }

        for (let i = 0; i < 3; i++) {
            let enemy = this.enemies.create(entierAleatoire(0, x), -i * 20, 'enemy' + entierAleatoire(0, this.maxEnemy));
            enemy.setScale(0.5, 0.5);
            enemy.setVelocity(entierAleatoire(-300, 300), entierAleatoire(50, 300));
            enemy.setData({'type': 'enemy', 'id': i});
            let laser = this.lazersE.create(0, 0, 'lazerEnemy').setData('type', 'laser');
            laser.visible = false;
            this.time.addEvent({
                delay: 1500,
                callback: this.fireEnemies,
                args: [enemy, laser, Math.PI / 2],
                callbackScope: this,
                loop: true,
                startAt: i * 300
            });
        }
        this.enemiesChild = this.enemies.getChildren().slice(this.enemies.getLength() - 3, this.enemies.getLength());

        this.defense = this.physics.add.image(0, 0, 'power0');
        this.defense.setVisible(false);

        let nbr = playersKey.length;
        let lineLength = nbr * 99 * 0.5 * +(nbr - 1) * 100;
        let begin = (x - lineLength) / 2;
        this.lifes = [];
        this.powerDispo = [];

        for (let i = 0; i < nbr; i++) {
            let key = playersKey[i];
            let player = this.players.create(begin + lineLength * i / nbr, y - 100, key);
            player.setScale(0.5, 0.5);
            player.setCollideWorldBounds(true);
            player.setImmovable(true);
            player.isAlive = true;
            player.setData({
                "id": i,
                "key": key,
                "life": 3,
                "power": -1,
                "power0": false,
                "guns": 0
            });

            let line = new Phaser.Geom.Line(50, 35, 50 + 3 * 99 * 0.8, 35 + 20 * i * 99);
            let lifeSprite = this.add.group({key: key + "Life", frameQuantity: 3, setScale: {x: 0.6, y: 0.6}});
            Phaser.Actions.PlaceOnLine(lifeSprite.getChildren(), line);
            this.lifes.push(lifeSprite);

            this.powerDispo.push(this.add.image(40, y - 35))
        }

        this.playersChildren = this.players.getChildren();

        this.fonction = [this.createPower0.bind(this), this.createPower1.bind(this),
            this.createPower2.bind(this), this.createPower3.bind(this)];

        this.keys = this.input.keyboard.addKeys('Z,Q,S,D,M,L,P');

        let zoneB = this.add.zone(x / 2 - 50, y + 50).setSize(x + 100, 1);
        let zoneT = this.add.zone(x / 2 - 50, -200).setSize(x + 100, 1);
        let zoneT2 = this.add.zone(x / 2 - 50, -30).setSize(x + 100, 1);
        let zoneL = this.add.zone(-50, y / 2).setSize(1, y);
        let zoneR = this.add.zone(x + 50, y / 2).setSize(1, y);
        this.physics.world.enable([zoneB, zoneT, zoneL, zoneR, zoneT2]);

        this.physics.add.overlap([zoneB, zoneL, zoneR], this.enemies, (zone, object) => {
            this.resetEnemy(object);
        }, null, this);

        this.physics.add.overlap(zoneB, [this.meteors, this.powers], (zone, object) => {
            object.visible = true;
            object.x = this.couloir[entierAleatoire(0, 9)];
            object.y = entierAleatoire(-100, -20);
        }, null, this);

        this.physics.add.overlap([zoneT2, zoneB, zoneL, zoneR], this.lazersE, (zone, object) => {
            object.visible = false;
            object.setVelocity(0);
        }, null, this);

        this.physics.add.overlap([zoneT, zoneL, zoneR], [this.lazersP, this.bombes], (zone, object) => {
            object.destroy();
        }, null, this);

        this.physics.add.collider(this.players, [this.meteors, this.lazersE, this.enemies], this.killPlayer.bind(this), null, this);

        this.physics.add.collider(this.players, [this.powers], (player, bonus) => {
            if (bonus.visible) {
                let bombeID = entierAleatoire(0, 3);
                console.log(player.getData("key") + 'power0');
                this.powerDispo[player.getData("id")].setTexture('power' + bombeID);
                player.setData("power", bombeID);
                bonus.x = this.couloir[entierAleatoire(0, 9)];
                bonus.y = entierAleatoire(-100, -20);
                console.log("Ger PowerUp " + bombeID);
            }
        }, null, this);

        this.physics.add.collider(this.lazersP, [this.meteors, this.enemies], (lazer, enemies) => {
            if (enemies.visible) {
                lazer.destroy();
                enemies.visible = false;
                this.dropPower(enemies.x, enemies.y);
            }
        }, null, this);
        this.physics.add.collider(this.bombes, [this.meteors, this.enemies], this.killEnemies2.bind(this), null, this);
        this.events.on('resume', () => {
            this.musicBack.resume();
        });

        this.time.addEvent({
            delay: 40000,
            callback: this.circleEvent,
            callbackScope: this,
            loop: true,
            startAt: 40000
        });

        //this.musicBack = this.sound.add('airWolf2');
        //this.musicBack.play();
        /*this.musicMeteor = this.sound.add('explosion_meteor');
        this.musicMeteor.volume = 1.7;*/

        this.score = 0;
        this.scoreDisplay = this.add.text(40, 20, this.score, {
            fontSize: 18,
            color: '#FFFFFF'
        });
        this.fireScore = this.add.image(20, 22, 'fire');
        this.fireScore.setVisible(false);


        this.loading.visible = false;
        //this.rect = this.add.rectangle(0, 0, 100, 100, 0xFFFFFF);
    }

    update() {
        this.back.tilePositionY += speed_world;
        this.scoreDisplay.setText(this.score);
        if (this.score > highScore && highScore !== 0) {
            this.scoreDisplay.setColor("#D50000");
            this.fireScore.visible = true;
        }
        this.score += 10;

        if (this.keys.P.isDown) {
            this.keys.P.isDown = false;
            this.sceneManager(0, null);
        }

        for (let i = 0; i < moving.length; i++) {
            if (moving[i]) {
                console.log(this.playersChildren[i].getData("power"));
                if (this.playersChildren[i].getData("power") !== -1) {
                    this.fonction[this.playersChildren[i].getData("power")](this.playersChildren[i]);
                    this.powerDispo[this.playersChildren[i].getData("id")].setTexture();
                    this.playersChildren[i].setData("power", -1);
                }
                moving[i] = false;
            }
        }

        if (this.enemiesCircleSlice[0][7].y > y && !this.createEnemy) { //10-7
            this.createEnemy = true;
            Phaser.Actions.Call(this.enemiesChild, (enemy) => {
                this.resetEnemy(enemy);
            });
        }
    }

    circleEvent() {
        let j;
        console.log('Circle Event');
        for (let i = this.circlesX.length - 1; i > 0; i--) {
            j = Math.floor(Math.random() * (i + 1));
            [this.circlesX[i], this.circlesX[j]] = [this.circlesX[j], this.circlesX[i]];
        }
        this.createEnemy = false;
        this.timerCircle = this.time.addEvent({
            delay: 4000,
            callback: this.createCircle,
            callbackScope: this,
            repeat: 2,
            startAt: 3000
        });
    }

    createCircle() {
        let repeat = this.timerCircle.getRepeatCount();
        let items = this.enemiesCircleSlice[repeat];
        let angle = 0;
        let angleStep = 6.28 / items.length;

        for (let i = 0; i < items.length; i++) {
            items[i].x = this.circlesX[repeat] + (this.distance * Math.cos(angle));
            items[i].y = -200 + (this.distance * Math.sin(angle));
            items[i].setVelocityY(200);
            items[i].visible = true;
            angle += angleStep;
        }
    }

    movePlayer(idPlayer, coeffX, coeffY) {
        this.playersChildren[idPlayer].setVelocity(400 * coeffX, 400 * coeffY);
    }

    missilePlayer(idPlayer) {
        if (this.playersChildren[idPlayer].isAlive) {
            this.createFiresPlayer(this.playersChildren[idPlayer]);
        }
    }

    killPlayer(p, object) {
        if (object.visible && p.isAlive) {
            if (!p.getData("power0")) {
                console.log("Player kill");
                if (p.getData("life") === 0) {
                    this.sceneManager(1, this.score);
                } else {
                    p.setData("life", p.getData("life") - 1);
                    this.lifes[p.getData('id')].getChildren()[p.getData("life")].destroy();
                    p.isAlive = false;
                    p.setVisible(false);
                    this.timerDeath = this.time.addEvent({
                        delay: 200,
                        args: [p],
                        callback: this.playerBlind,
                        callbackScope: this,
                        repeat: 4,
                    });
                    object.visible = false;
                    this.dropPower(object.x, object.y);
                }
            } else {
                console.log("defense");
                p.setData("power0", false);
                p.setTexture(p.getData("key"));
            }
        }
    }

    playerBlind(p) {
        p.setVisible(!p.visible);
        if (this.timerDeath.repeatCount === 0) {
            p.isAlive = true;
        }
    }

    killEnemies2(bombe, enemies) {
        if (enemies.visible) {
            enemies.visible = false;
            this.dropPower(enemies.x, enemies.y);
            if (bombe.getData('id') === 2) {
                bombe.setVelocity(0);
                this.tweens.add({
                    targets: bombe,
                    scaleX: 8,
                    scaleY: 8,
                    ease: 'Sine.easeInOut',
                    duration: 600,
                    onComplete: (tween, targets) => {
                        targets[0].destroy();
                    }
                });
            }
        }
    }

    dropPower(x, y) {
        if (entierAleatoire(0, 9) < 7) {
            let power = this.powers.create(x, y, 'powerup');
        }
    }

    createPower0(player) {
        console.log("Power 0 player " + player.getData("id"));
        console.log(player.getData("key") + 'power0');
        if (zoe) {
            //this.defense.setScale(2.5);
        } else {
            player.setTexture(player.getData("key") + 'power0');
            player.setData("power0", true);
        }
    }

    createPower1(player) {
        console.log("Power 1 player " + player.getData("id"));
        let bombe = this.bombes.create(player.x, player.y - 50, 'power1').setData({'type': 'laser', 'id': 1});
        this.tweens.add({
            targets: bombe,
            scaleX: 6,
            scaleY: 6,
            ease: 'Sine.easeInOut',
            duration: 800
        });
    }

    createPower2(player) {
        console.log("Power 2 player " + player.getData("id"));
        this.bombes.create(player.x, player.y - 50, 'power2').setData({'type': 'laser', 'id': 2});
    }

    createPower3(player) {
        console.log("Power 3 player " + player.getData("id"));
        player.setData("guns", 1);
        this.time.delayedCall(5000, () => {
            player.setData("guns", 0);
        }, [], this);
    }

    createFiresPlayer(p) {
        //console.log("Fire player");
        let x = p.x;
        let y = p.y - 50;
        if (p.getData("guns") === 0) {
            this.lazersP.create(x, y, 'lazerPlayer').setData({'type': 'laserP'});
        } else {
            let vDirection = 800 * Math.cos(Math.PI / 4);
            let velocity = [[0, -700], [vDirection, -vDirection], [-vDirection, -vDirection]];
            let name = (zoe) ? ['power3', 'power31', 'power32'] : ['power3', 'power3', 'power3'];
            for (let i = 0; i < 3; i++) {
                this.lazersP.create(x, y, name[i]).setVelocity(velocity[i][0], velocity[i][1]).setData({'type': 'laserP'});
            }
        }
    }

    resetEnemy(enemy) {
        if (enemy.getData('type') === "enemy" && this.createEnemy) {
            enemy.setVisible(true);
            enemy.setVelocity(entierAleatoire(-300, 300), entierAleatoire(200, 300));
            enemy.x = entierAleatoire(0, x);
            enemy.y = -200 * Math.random();
        } else {
            enemy.setVisible(false);
            enemy.setVelocity(0);
            enemy.x = -100;
            enemy.y = -100;
        }
    }

    fireEnemies(enemy, laser, angle) {
        if (enemy.y > 0 && enemy.y < y && enemy.visible) {
            laser.x = enemy.x;
            laser.y = enemy.y;
            laser.setVelocity(1000 * Math.cos(angle), 1000 * Math.sin(angle));
            laser.visible = true;

        }
    }

    sceneManager(state, score) {
        console.log(state);
        /*do {
            this.musicBack.pause();
        } while (this.musicBack.isPlaying);*/
        this.scene.bringToTop('Over');
        this.scene.run('Over', {state: state, score: score});
        this.scene.pause();
    }
}