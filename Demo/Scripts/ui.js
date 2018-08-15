class UI {
    constructor() {

    }

    createUI() {
        biggestPoints.position.set(20, 60);

        points = new Text("Points: ", style);
        points.position.set(20, 20);
        gameItems.push(points);
        app.stage.addChild(points);

        timerText = new Text(60, style);
        timerText.position.set(WIDTH / 2, HEIGHT - 50);
        timerText.anchor.set(0.5, 0.5);
        gameItems.push(timerText);
        app.stage.addChild(timerText);

        let pausedTex = TextureCache["Paused.png"];
        pauseButton = new Sprite(pausedTex);
        pauseButton.anchor.set(0.5, 0.5);
        pauseButton.position.set(WIDTH / 2, HEIGHT / 4.5);
        pauseButton.visible = false;

        gameItems.push(pauseButton);
        app.stage.addChild(pauseButton);

        let restartTex = TextureCache["Restart.png"];
        restartButton = new Sprite(restartTex);
        restartButton.anchor.set(0.5, 0.5);
        restartButton.position.set(WIDTH / 2, HEIGHT / 3);
        restartButton.visible = false;

        restartButton.interactive = true;
        restartButton.buttonMode = true;

        restartButton.on('pointerdown', this.onButtonDown)
            .on('pointerup', this.onButtonUp)
            .on('pointerupoutside', this.onButtonUp)
            .on('pointerover', this.onButtonOver)
            .on('pointerout', this.onButtonOut);

        gameItems.push(restartButton);
        app.stage.addChild(restartButton);
    }

    onButtonDown() {
        this.isDown = true;
        this.alpha = 0.5;
    }

    onButtonUp() {
        this.isDown = false;

        if (this.isOver) { //Does not trigger unless mouse is unpressed above the button
            if (this == startButton) {
                for (let i = 0; i < menuItems.length; i++) {
                    menuItems[i].visible = false;
                }
                isLoading = true; //A boolean to check if the second background needs to be raised
                mouseTemp = mousePos; //Without this, the mouse is always check as moving
            } else if (this == restartButton) {
                location.reload();
            }
        } else {
            this.alpha = 1;
        }
    }

    onButtonOver() {
        this.isOver = true;
        rotateAnim = true;
    }

    onButtonOut() {
        this.isOver = false;
        rotateAnim = false;
    }
}