'use strict';

class Input {
    constructor() {

    }

    input() {
        let key_p = this.keyboard(80);

        app.stage.on('pointermove', function (eventData) {
            mousePos = eventData.data.global; //Sets variable to mouse pos to allow the hook to lerp to the position
            isMouseMove = true;
            if (timer) {
                clearTimeout(timer);
            }

            timer = setTimeout(checkMove, 20);
        });

        app.stage.on('pointerdown', function (eventData) {
            if (canFish && state != pause) {
                isPulling = true;
            }
        });

        key_p.press = () => { //Used to show and hide the pause menu
            if (state == play) {
                state = pause;
                clearInterval(inter); //stops fish from spawning
                pauseButton.visible = true;
                restartButton.visible = true;
            } else if (state == pause) {
                state = play;
                pauseButton.visible = false;
                restartButton.visible = false;
                inter = setInterval(fishObj.spawnFish, 2000); //restarts fish spawning
            }
        }
    }

    //Key handler from https://github.com/kittykatattack/learningPixi#introduction
    //Mouse handler is not from the link shown above
    keyboard(keyCode) {
        let key = {};
        key.code = keyCode;
        key.isDown = false;
        key.isUp = true;
        key.press = undefined;
        key.release = undefined;
        //The `downHandler`
        key.downHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isUp && key.press) key.press();
                key.isDown = true;
                key.isUp = false;
            }
            event.preventDefault();
        };

        //The `upHandler`
        key.upHandler = event => {
            if (event.keyCode === key.code) {
                if (key.isDown && key.release) key.release();
                key.isDown = false;
                key.isUp = true;
            }
            event.preventDefault();
        };

        //Attach event listeners
        window.addEventListener(
            "keydown", key.downHandler.bind(key), false
        );
        window.addEventListener(
            "keyup", key.upHandler.bind(key), false
        );
        return key;
    }
}