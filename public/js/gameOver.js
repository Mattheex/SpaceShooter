class Over extends Phaser.Scene {

    constructor() {
        super({key: 'Over'});
    }

    create(data) { //0:pause , 1:over
        this.state = data.state;
        this.cameras.main.backgroundColor.setTo(0, 0, 0, 128);
        let msg = (this.state === 0) ? "Pause" : "Game Over";
        let color = (this.state === 0) ? "#FFFFFF" : '#B71C1C';
        this.text = this.add.text(0, 0, msg, {fontSize: 80, color: color});
        Phaser.Display.Align.In.Center(this.text, this.add.zone(x / 2, y / 2, x, y));

        if (data.score !== null) {
            this.textS = this.add.text(0, 0, "Score : " + data.score, {fontSize: 20, color: "#F44336"});
            Phaser.Display.Align.In.Center(this.textS, this.add.zone(x / 2, y / 2 + 80, x, y));
            highScore = data.score;
        }

        this.keys = this.input.keyboard.addKeys('P');
    }

    update() {
        if (this.keys.P.isDown || checkMoving()) {
            this.keys.P.isDown = false;
            this.scene.bringToTop('Game');
            if (this.state === 0) {
                this.scene.resume('Game');
            } else {
                this.scene.run('Game');
            }
            this.scene.stop();
        }
    }
}