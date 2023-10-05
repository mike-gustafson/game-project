import level01Platforms from './level-01.js';

const scoredPlatforms = new Set();
const context = document.querySelector('canvas');
const c = context.getContext("2d");
const menu = document.getElementById('menu');
const startButton = document.getElementById('startButton');
startButton.addEventListener('click', startGame);
context.width = innerWidth;
context.height = innerHeight;

let playerLives = 3;
const scorePositionX = context.width / 2;
const scorePositionY = 50;
let scoreTotal = 0;
let scoreThisLife = 0;
let levelWidth = 10000;

let playerStartingXPosition;
let platforms;
let player;
// Sounds
const soundPlayerLanding = new Audio('/sounds/332661__reitanna__big-thud.wav');



// Physics Variables
let friction = .7;
let gravity = 1.3;
let keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}

// player constructor
class Player {
    constructor() {
        this.position = {
            x: 100,
            y: 300
        }
        this.inLevelXPosition = {
            x: 100
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        this.width = 32
        this.height = 32
        this.jumping = false;
    }
    create() {
        c.fillStyle = 'firebrick'
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
    update() {
        this.create();
        this.position.x = Math.round(this.position.x);
        this.position.y += this.velocity.y;
        this.velocity.y += gravity;
    }
}

// platform constructor
class Platform {
    constructor() {
        this.height = 15
        this.width = Math.floor(Math.random() * (500 - 100) + 100)
        this.position = {
            x: Math.floor(Math.random() * levelWidth-this.width),
            y: Math.floor((Math.random() * (innerHeight*.75)+(innerHeight/4)-30)),
        }
    }
    create() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    drawLabel() {
        c.fillStyle = 'black';
        c.font = '12px Arial';
        c.fillText(`X: ${this.position.x}`, this.position.x, this.position.y - 5);
    }
    update() {
        this.create()
        this.drawLabel()
        this.position.x = Math.round(this.position.x);

        if (
            (player.position.x <= 100 && player.inLevelXPosition.x >= 100) ||
            (player.inLevelXPosition.x < levelWidth && player.position.x >= innerWidth / 2)
        ) {
            if (player.velocity.x !== 0){
                this.position.x -= player.velocity.x;
            }
        }
    }
}   
// INPUT EVENT LISTENERS--------------------------------------------------------------

addEventListener('keydown', ({ keyCode }) => {
        switch (keyCode) {
            case 65:
                keys.left.pressed = true
                break;
            case 68:
                keys.right.pressed = true    
                    break;
            case 32:
                if (!player.jumping) {
                    player.velocity.y = -20;
                    player.jumping = true
                }
                break;
        }
    });
addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65:
            keys.left.pressed = false
            break;
        case 32:
            if (!player.jumping) {
            }
            break;
        case 68:
            keys.right.pressed = false            
            break;
    }
});

// GAME LOOP -------------------------------------------------------------------------

const loop = function() {
    c.clearRect(0, 0, context.width, context.height);
    player.update();
    drawScore()
    platforms.forEach(platform => {
        platform.update()
    })
    drawPlayerLives();
    isPlayerOnAPlatform();
    isPlayerOnTheGround();
    movePlayer();
    keepPlayerOnTheScreen();
    requestAnimationFrame(loop); 
}

// FUNCTIONS --------------------------------------------------------------------------

function generatePlatforms() {
    let initialPlatformData = level01Platforms.map((platformData) => {
        let platform = new Platform();
        platform.position.x = platformData.x;
        platform.position.y = platformData.y;
        platform.width = platformData.width;
        return platform;
    });
    return initialPlatformData;
}
function addPoints(platform) {
    if (!scoredPlatforms.has(platform)){
        scoreTotal +=  10;
        scoreThisLife += 10;
        scoredPlatforms.add(platform);
    }
}
function showMenu() {
    menu.style.display = 'flex';
}
function hideMenu() {
    menu.style.display = 'none';
}
function gameOver() {
    showMenu();
    resetGame()
}
function resetGame() {
    window.location.reload()
}
function startGame() {
    createGameAssets()
    hideMenu()
    window.requestAnimationFrame(loop)
}
function drawScore() {
    c.fillStyle = 'black';
    c.font = '32px Arial';
    c.textAlign = 'center';
    c.fillText(`Total Score:  ${scoreTotal}`, scorePositionX, scorePositionY);
    c.fillText(`This Life:  ${scoreThisLife}`, scorePositionX, scorePositionY+32);
}
function drawPlayerLives() {
    for (let i = 0; i < playerLives; i++) {
        const x = 10 + i * 40;
        const y = 20;
        c.fillStyle = 'firebrick';
        c.fillRect(x, y, 32, 32);
    }
}
function isPlayerOnAPlatform() {
    platforms.forEach(platform => {
        if (
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {if (
            !soundPlayerLanding.paused) {
            soundPlayerLanding.currentTime = 0; // Reset the sound to the beginning
        }
            soundPlayerLanding.play();
            player.jumping = false;
            player.position.y = platform.position.y - player.height;
            player.velocity.y = 0
            addPoints
        (platform);
        }
    });
}
function isPlayerOnTheGround() {
    if (player.position.y +player.height >= context.height) {
        if (playerLives > 0) {
            playerLives--;
            player.position.x = playerStartingXPosition;
            player.position.y = innerHeight/6;
            player.velocity.y = 0;
            player.velocity.x = 0;
            player.jumping = false;
            player.inLevelXPosition.x = playerStartingXPosition;
            scoreThisLife=0
            platforms = generatePlatforms();
        } else if (playerLives===0){
            gameOver()
        }
    }
}
function keepPlayerOnTheScreen() {
    if (player.inLevelXPosition.x > levelWidth) {
        player.inLevelXPosition.x = levelWidth
    }
    if (player.inLevelXPosition.x < 0) {
        player.inLevelXPosition.x = playerStartingXPosition;
    }
    if (player.inLevelXPosition.x < levelWidth) {
        player.inLevelXPosition.x += player.velocity.x;
    }
    if (player.position.x < 100) {
        player.position.x = 100
    } else if (player.position.x > innerWidth/2) {
        player.position.x = innerWidth/2 
    }
}
function movePlayer () {
    if (keys.left.pressed) {
        player.velocity.x = -5
    } else if (keys.right.pressed) {
        player.velocity.x = 5    
    } else {
        player.velocity.x = player.velocity.x * friction
    }
    //  moves the player an appropriate amount
    player.position.x += player.velocity.x;
}
function createGameAssets() {
    player = new Player
    playerStartingXPosition = player.position.x
    platforms = generatePlatforms();
    player.create()
}