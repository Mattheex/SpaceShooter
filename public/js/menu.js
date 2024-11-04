let mobileIds = {};

class Menu extends Phaser.Scene {
    constructor() {
        super({key: 'Menu'});
    }

    preload() {
        this.load.image('blue', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_blue.png');
        this.load.image('green', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_green.png');
        this.load.image('orange', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_orange.png');
        this.load.image('red', 'assets/spaceshooter/PNG/Player/Ship1/playerShip1_red.png');
    }

    create() {
        this.cameras.main.backgroundColor.setTo(0, 0, 0, 128);

        this.nbPlayer = 0;
        this.all = false;
        let msg = "Space in Fires";
        let color = "#FFFFFF";
        this.text = this.add.text(0, 0, msg, {fontSize: 80, color: color});
        Phaser.Display.Align.In.Center(this.text, this.add.zone(x / 2, y / 4, x, y));

        this.line = new Phaser.Geom.Line(x / 2 - 50, y / 2 + y / 4, x, y / 2 + y / 4);

        this.player = this.add.group();
        this.statue = this.add.group();
        //this.key = [];

        this.keys = this.input.keyboard.addKeys('P');

        //this.addPlayer();
        //this.removePlayer(0);
    }

    update() {
        if (this.keys.P.isDown || checkMoving()) {
            let statue = this.statue.getChildren();
            this.all = true;
            for (let i = 0; i < statue.length; i++) {
                if (statue[i].text !== "Prêt !") {
                    this.all = false;
                    break;
                }
            }
            if (this.all) {
                for (let i = 0; i < this.player.getChildren().length; i++) playersKey.push(this.player.getChildren()[i].texture.key);
                this.keys.P.isDown = false;
                this.scene.bringToTop('Game');
                this.scene.run('Game');
                this.scene.stop();
            } else {
                console.log("Not ready !");
            }
        }
    }

    addPlayer(mobileId) {
        console.log('add Player');
        mobileIds[this.nbPlayer] = mobileId;
        this.player.add(this.add.image(x, y, 'blue').setScale(0.5));
        moving.push(false);
        this.statue.add(this.add.text(0, 0, 'sélection', {fontSize: 20, color: "#FFFFFF"}));
        this.playerLine();
        Client.socket.emit('idPlayer', {id: mobileIds[this.nbPlayer], idPlayer: this.nbPlayer});
        this.nbPlayer++;
        console.log(this.player);
    }

    changePlayer(name, idPlayer) {
        if (name === 'finish') {
            this.statue.getChildren()[idPlayer].text = "Prêt !";
            this.statue.getChildren()[idPlayer].color = "#B71C1C";
        } else {
            this.player.getChildren()[idPlayer].setTexture(name);
            this.playerLine();
        }
    }

    removePlayer(idPlayer) {
        this.player.getChildren()[idPlayer].destroy();
        this.nbPlayer--;
    }

    playerLine() {
        this.line.x1 = x / 2 - 99 * 0.4 * (this.nbPlayer) * 2.5;
        this.line.x2 = x / 2 + 99 * 0.4 * (this.nbPlayer) * 2.5;
        Phaser.Actions.PlaceOnLine(this.player.getChildren(), this.line);
        Phaser.Actions.PlaceOnLine(this.statue.getChildren(), this.line);
    }
}