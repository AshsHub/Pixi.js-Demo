"use strict";

let rotateAnim = false;

let type = "WebGL";

var WIDTH = 600;
var HEIGHT = 600;

let Application = PIXI.Application, //Created aliases to make lines of code shorter and easier to remember
    Container = PIXI.Container,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    TextureCache = PIXI.utils.TextureCache,
    Sprite = PIXI.Sprite,
    Rectangle = PIXI.Rectangle,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics;

if (!PIXI.utils.isWebGLSupported()) {
    type = "canvas";
}

PIXI.utils.sayHello(type);

var app = new PIXI.Application(WIDTH, HEIGHT, {
    backgroundColor: 0xff0000,
    antialias: true
});

//Add canvas that Pixi created to the HTML document
document.getElementById('Canvas').appendChild(app.view);

let startButton, quitButton, pauseButton, restartButton, state, message, help, backgroundGameImage, isLoading, hook, isMouseMove, timer, inter,
    biggestPoints, timerText, biggestCatch, points, pointsNum = 0,
    gameTimer = 60,
    biggestCatchNum = 0,
    isPulling = false,
    canFish = false,
    currentWeight = 0,
    rotateLeft = false,
    len = 50,
    lerpSpeed = 0.15,
    menuItems = [],
    gameItems = [],
    fishObjects = [],
    fishTex = [];

const fishObj = new Fish();
const uiRef = new UI();
const inputRef = new Input();

let mousePos = {
    x: 0,
    y: 0
};

let mouseTemp = {
    x: 0,
    y: 0
};

let style = new TextStyle({ //Used to create the style of font shown in the game
    fontFamily: "Impact",
    fontSize: 30,
    fill: "white",
    stroke: '#0000FF',
    strokeThickness: 3,
    dropShadow: true,
    dropShadowColor: "#000000",
    dropShadowBlur: 4,
    dropShadowAngle: Math.PI / 3,
    dropShadowDistance: 3,
});

loader //Loads all the needed images from the image folder
    .add("Images/Sprites.json")
    .add("backgroundMenuImage", "Images/Background.jpg")
    .add("backgroundGameImage", "Images/UnderwaterBG.png")
    .on("progress", loadProgressHandler) //Gives loading progress
    .load(setup);

/**
 * Initial setup for the game. Creates background and sets up input
 */
function setup() {
    app.stage.interactive = true;

    let background = new Sprite(resources.backgroundMenuImage.texture);
    background.width = WIDTH;
    background.height = HEIGHT;
    background.pivot.set(0.5, 0.5);
    app.stage.addChild(background);

    backgroundGameImage = new Sprite(resources.backgroundGameImage.texture);
    backgroundGameImage.height = HEIGHT * 1.5;
    backgroundGameImage.width = WIDTH * 1.5;
    backgroundGameImage.pivot.set(0.5, 0.5);
    backgroundGameImage.position.y = HEIGHT;
    app.stage.addChild(backgroundGameImage);

    state = menu;
    menuInit();

    inputRef.input();
    app.ticker.add(delta => gameLoop(delta));
}

/**
 * Create menu and loads highscore
 */
function menuInit() {
    message = new Text("Pixi.js Demo - Ashley Cook", style);
    message.position.set(WIDTH / 2, 60);
    message.anchor.set(0.5, 0.5);
    menuItems.push(message);
    app.stage.addChild(message);

    help = new Text("The hook will follow your mouse \n (Left click to reel in) \n hook as many fish as you can within a minute \n the fish have weight so too many fish at once \n will break the line!", style);
    help.position.set(5, HEIGHT / 1.5);
    menuItems.push(help);
    app.stage.addChild(help);

    if (localStorage.getItem("highScore") > 0) {
        biggestPoints = new Text("Biggest Ever Catch: " + localStorage.getItem("highScore"), style);
    } else {
        biggestPoints = new Text("You currently don't have a highscore", style);
    }

    biggestPoints.position.set(5, HEIGHT / 1.7);
    app.stage.addChild(biggestPoints);


    let startTex = TextureCache["Start.png"];
    startButton = new Sprite(startTex);
    startButton.anchor.set(0.5, 0.5);
    startButton.position.set(WIDTH / 2, HEIGHT / 4.5);

    startButton.interactive = true;
    startButton.buttonMode = true;

    startButton.on('pointerdown', uiRef.onButtonDown)
        .on('pointerup', uiRef.onButtonUp)
        .on('pointerupoutside', uiRef.onButtonUp)
        .on('pointerover', uiRef.onButtonOver)
        .on('pointerout', uiRef.onButtonOut);

    menuItems.push(startButton);
    app.stage.addChild(startButton);
}

/**
 * Creates hook and preloads fish
 */
function gameInit() {

    let hookTex = TextureCache["Hook.png"]
    hook = new Sprite(hookTex);
    hook.anchor.set(0.5, 1);
    hook.scale.set(0.5, 0.5);
    hook.position.set(300, 300);
    hook._weightMax = 10;
    gameItems.push(hook);
    app.stage.addChild(hook);

    uiRef.createUI();
    gameOverInit();

    for (let i = 0; i < 7; i++) {
        fishTex[i] = TextureCache["Fish" + i + ".png"];
    }

    setTimeout(function () { //Prevents the player from reeling in thier rod right after the game starts
        canFish = true;
    }, 3000);

    setInterval(fishObj.spawnFish, 1000);
}

/**
 * Displays end game message and clears redundent UI
 */
function gameOverInit() {
    let gameOverTimer = setInterval(function () {
        if (state == play) {
            timerText.text = gameTimer--;

            if (gameTimer <= 0) {
                clearInterval(gameOverTimer);

                for (let i = 0; i < gameItems.length; i++) {
                    gameItems[i].visible = false;
                }

                let endMessage = new Text("", style);
                endMessage.position.set(WIDTH / 2, 20);
                endMessage.anchor.set(0.5, 0.5);
                app.stage.addChild(endMessage);

                if (biggestCatchNum > localStorage.getItem("highScore")) {
                    endMessage.text = "CONGRATS! You beat your previous highscore with " + biggestCatchNum;
                } else {
                    endMessage.text = "You didn't beat your highest score, try again!"
                }

                restartButton.visible = true;
            }
        }
    }, 1000);
}


function gameLoop(delta) {
    state(delta);
}

/**
 * Play state
 */
function play() {
    //background parallax 
    backgroundGameImage.position.set(-mousePos.x / 10 - 100, -mousePos.y / 10 - 10);

    points.text = "Points: " + pointsNum;
    biggestPoints.text = "Biggest Catch: " + biggestCatchNum;

    fishObj.checkFish();

    //If the player reels in the hook, the hook will rise and take any fish it collides with
    if (isPulling) {
        if (hook.position.y >= 0) {
            for (let i = 0; i < fishObjects.length; i++) {
                if (collisionDetection(hook, fishObjects[i])) {
                    fishObjects[i].vx = 0;
                    fishObjects[i].vy = -10;

                    if (!fishObjects[i]._hooked) {
                        currentWeight += fishObjects[i]._weight;
                        fishObjects[i]._hooked = true;
                    }

                    if (currentWeight > hook._weightMax) {
                        for (let i = 0; i < fishObjects.length; i++) {
                            console.log("Too heavy");
                            currentWeight = 0;
                            fishObjects[i].vy = 0;

                            if (pointsNum >= 20) pointsNum -= 20;
             
                            fishObjects[i].vx = 6;

                            isPulling = false;
                        }
                    }
                }
            }
            hook.position.y -= 10;

        } else {
            isPulling = false;
        }
    } else {
        //if the hook is not being reeled in, lerp towards the mouse position
        hook.position.x = lerp(hook.position.x, mousePos.x, lerpSpeed);
        hook.position.y = lerp(hook.position.y, mousePos.y, lerpSpeed);
    }
}

function pause() {

}

/**
 * Menu State
 */
function menu() {
    //Moves the secondary background if the player has chosen to press play
    if (isLoading) {
        backgroundGameImage.position.y -= 10;

        if (backgroundGameImage.position.y < 0) {
            backgroundGameImage.position.y = 0;
            gameInit();
            state = play;
        }
    }

    let rotationAmount = 0.01;
    let maxRotation = 0.2;

    //Creates simple back and forth rotation animation when button is start hovered over
    if (rotateAnim) {
        if (!rotateLeft) {
            message.rotation += rotationAmount;
            rotateLeft = (message.rotation >= maxRotation) ? true : false;
        } else {
            message.rotation -= rotationAmount;
            rotateLeft = (message.rotation <= -maxRotation) ? false : true;
        }
    } else {
        message.rotation = 0;
    }
}

function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end
}

function checkMove() {
    isMouseMove = false;
}

/**
 * aabb collision check
 * @param {PIXI.Sprite} rect1 
 * @param {PIXI.Sprite} rect2 
 */
function collisionDetection(rect1, rect2) {
    let rect1Bounds = rect1.getBounds();
    let rect2Bounds = rect2.getBounds();

    if (rect1 == hook) {
        rect1Bounds.y = (rect1Bounds.y + (rect1Bounds.height - 5));

        return rect1Bounds.x + rect1Bounds.width > rect2Bounds.x && rect1Bounds.x < rect2Bounds.x + rect2Bounds.width &&
            rect1Bounds.y > rect2Bounds.y && rect1Bounds.y < rect2Bounds.y + rect2Bounds.height;
    } else {
        return rect1Bounds.x + rect1Bounds.width > rect2Bounds.x && rect1Bounds.x < rect2Bounds.x + rect2Bounds.width &&
            rect1Bounds.y + rect1Bounds.height > rect2Bounds.y && rect1Bounds.y < rect2Bounds.y + rect2Bounds.height;
    }
}

function loadProgressHandler(loader, resource) {
    resource ? console.log("progress of " + resource.name + ": " + loader.progress + "%") : console.log("progress of " + resource.url + ": " + loader.progress + "%");
}