class Fish { //Deals with the spawning and movement of the fish, but not the collision
    constructor() {
    }

    spawnFish() {
        let rand = Math.floor((Math.random() * 7)); //A random number is used to pick the texture for each sprite
        let fish = new Sprite(fishTex[rand]);
        fish.position.y = Math.floor(Math.random() * ((HEIGHT - 50) - 50 + 1) + 50);
        let scale = Math.random() * (0.5 - 0.1) + 0.1;
        fish.vx = Math.random() * (3 - 1.5) + 1.5; //sets random speed to swim across the screen
        fish.vy = 0;
        fish._hooked = false;

        if (Math.random() <= 0.5) { //Random number to decide which side they spawn on
            fish.position.x = -20; //Sets it to far left side of screen
            fish.scale.set(-scale, scale);
            fish._dir = 0; //Used to determine which way they need to swim 
        } else {
            fish.position.x = WIDTH + fish.scale.x;
            fish.scale.set(scale);
            fish._dir = 1;
        }

        fish._weight = scale * Math.random() * (10 - 4) + 4; //A weight is added to the fish as a way 
            //to prevent catching too many fish

        if (rand > 0) {
            fish._score = fish._weight * rand; //Score is based on weight * texture index
        } else {
            fish._score = fish._weight;
        }

        fishObjects.push(fish);
        app.stage.addChild(fish);
    }

    checkFish() {
        for (let i = 0; i < fishObjects.length; i++) {
            if (fishObjects[i]._dir == 0) { //Determines which code to use based on thier spawn direction
                fishObjects[i].x += fishObjects[i].vx;
                fishObjects[i].y += fishObjects[i].vy;

                if (fishObjects[i].position.x > WIDTH + fishObjects[i].width) { //If they go off screen they get removed
                    let tempObj = fishObjects[i]; //From the array and deleted from the stage
                    fishObjects.splice(i, 1);
                    app.stage.removeChild(tempObj);
                    break;
                }
            } else if (fishObjects[i]._dir == 1) {
                fishObjects[i].x -= fishObjects[i].vx;
                fishObjects[i].y += fishObjects[i].vy;

                if (fishObjects[i].position.x < -fishObjects[i].width) {
                    let tempObj = fishObjects[i];
                    fishObjects.splice(i, 1);
                    app.stage.removeChild(tempObj);
                    break;
                }
            }

            if (fishObjects[i].position.y < -5) { //This section determines if the fish have been reeled in and what score they provide
                pointsNum += Math.round(fishObjects[i]._score);

                if (Math.round(fishObjects[i]._score) > biggestCatchNum) {
                    biggestCatchNum = Math.round(fishObjects[i]._score);

                    //A highscore is implemented using the localStorage system
                    if (biggestCatchNum > localStorage.getItem("highScore")) {
                        localStorage.setItem("highScore", biggestCatchNum);
                    }
                }

                //The fish's weight is reduced from the hook then the fish is removed
                currentWeight -= fishObjects[i]._weight;
                let tempObj = fishObjects[i];
                fishObjects.splice(i, 1);
                app.stage.removeChild(tempObj);
                break;
            }
        }
    }
}