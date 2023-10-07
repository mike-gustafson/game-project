import level01Platforms from './level-01.js';


let trianglesCurrentPosition = 0;
let triangles = [];
let trianglePeakMaxHeight = innerHeight/2;
let trianglePeakMinHeight = innerHeight/1.5;

let clouds = [];
let cloudX = 0;
let cloudY = 200;

    
const scoredPlatforms = new Set();
const canvas = document.querySelector('canvas');
const context = canvas.getContext("2d");
const startMenu = document.getElementById('start-menu');
const startButton = document.getElementById('start-button');
startButton.addEventListener('click', startGame);
canvas.width = innerWidth;
canvas.height = innerHeight;
let isMenuDisplayed = true
let PlayerStartingLives = 3
let playerLives = PlayerStartingLives;
const scorePositionX = canvas.width / 2;
const scorePositionY = 50;
let scoreTotal = 0;
let scoreThisLife = 0;
let levelWidth = 10000;
let playerLanded = false;
let playerStartingXPosition;
let platforms;
let player;
// Sounds
const soundPlayerLanding = new Audio('sounds/332661__reitanna__big-thud.wav');
const soundPlayerJumping = new Audio('sounds/399095__plasterbrain__8bit-jump.wav');
const soundGameOver = new Audio('sounds/362204__taranp__horn_fail_wahwah_3.wav')
const backgroundMusic = new Audio('sounds/Kirill_Kharchenko_-_Background_Hip-Hop_Funk.mp3')

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
            x: 180,
            y: 20
        }
        this.inLevelXPosition = {
            x: 180
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
        context.fillStyle = 'firebrick'
        context.fillRect(this.position.x, this.position.y, this.width, this.height);
        context.strokeStyle = '#666666';
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
        this.width = random(100,500)
        this.position = {
            x: Math.floor(Math.random() * levelWidth-this.width),
            y: Math.floor((Math.random() * (innerHeight*.75)+(innerHeight/4)-30)),
        }
    }
    create() {
        context.fillStyle = 'white'
        context.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.create()
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
                    if (isPlayerOnAPlatform()) {
                        player.velocity.y = -20;
                        player.jumping = true
                        playerLanded = false
                        soundPlayerJumping.play();
                    }
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
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawClouds()
    drawTriangles();
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
    if (isMenuDisplayed) {
        return;
    }
    requestAnimationFrame(loop); 
}

// FUNCTIONS --------------------------------------------------------------------------
function random(min,max){
    return Math.floor(Math.random() * (max-min + 1) + min)
}
function generatePlatforms() {
    let initialPlatformData = level01Platforms.map((platformData) => {
        let platform = new Platform();
        platform.position.x = platformData.x;
        platform.position.y = innerHeight/2 + platformData.y;
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
    startMenu.style.display = 'flex';
    isMenuDisplayed = true
}
function hideMenu() {
    startMenu.style.display = 'none';
    isMenuDisplayed = false
}
function gameOver() {
    backgroundMusic.pause()
    soundGameOver.play()
    showMenu();
}
function resetScores() {
    scoreThisLife = 0
    scoreTotal = 0
}
function startGame() {
    createGameAssets()
    hideMenu()
    resetScores()
    playerLives = PlayerStartingLives
    backgroundMusic.play()
    window.requestAnimationFrame(loop)
}
function drawScore() {
    context.fillStyle = 'black';
    context.font = '32px Arial';
    context.textAlign = 'center';
    context.fillText(`Total Score:  ${scoreTotal}`, scorePositionX, scorePositionY);
    context.fillText(`This Life:  ${scoreThisLife}`, scorePositionX, scorePositionY+32);
}
function drawPlayerLives() {
    for (let i = 0; i < playerLives; i++) {
        let x = 180 - (i * 40);
        let y = 20;
        context.fillStyle = 'firebrick';
        context.fillRect(x, y, 32, 32);
    }
}
function isPlayerOnAPlatform() {
    for (let platform of platforms) {
        if (
            player.position.y >= platform.position.y - player.height &&
            player.position.y <= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {
            player.jumping = false;
            if (!playerLanded) {
                soundPlayerLanding.play()
                playerLanded = true;
            }
            player.position.y = platform.position.y - player.height;
            player.velocity.y = 0
            addPoints(platform)
            return true;
        }
    }
    return false;
}
function isPlayerOnTheGround() {
    if (player.position.y +player.height >= canvas.height) {
        if (playerLives > 0) {
            playerLives--;
            player.position.x = playerStartingXPosition;
            player.position.y = 20;
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
    player.position.x += player.velocity.x;
}
function createGameAssets() {
    player = new Player
    playerStartingXPosition = player.position.x
    platforms = generatePlatforms();
    createTriangles();
    clouds = []
    createClouds()
    player.create()
}
function createTriangles(){
    let lastPosition;
    let a;
    let b;
    let c;
    let cXOffset;
    while (trianglesCurrentPosition < levelWidth) {
        a = trianglesCurrentPosition;
        lastPosition = trianglesCurrentPosition;
        c = random(trianglePeakMinHeight, trianglePeakMaxHeight)
        b = c/2 + trianglesCurrentPosition;
        cXOffset = lastPosition+(b-a)/2
        triangles.push({a, b, c, cXOffset})
        console.log(triangles)
        trianglesCurrentPosition = b
    }
}
function drawTriangles() {
    for (let i = 0; i < triangles.length; i++) {
        context.beginPath();
        context.moveTo(triangles[i].a, innerHeight);
        context.lineTo(triangles[i].b, innerHeight);
        context.lineTo(triangles[i].cXOffset, innerHeight - triangles[i].c);
        context.closePath();
        context.lineWidth = 5;
        context.strokeStyle = '#666666';
        context.stroke();
        context.fillStyle = "#b1a849";
        context.fill();
    }
} 

function createClouds() {
    let cloudX = 0
    while (cloudX < levelWidth) {
        clouds.push({x: random(100,500)+cloudX,y: random(200, 400)})
        cloudX = cloudX + random(100,500)
    }
}
function drawClouds() {
    for (let i = 0; i < clouds.length; i++){
        context.beginPath();
        context.arc(clouds[i].x, clouds[i].y, 60, Math.PI * 0.5, Math.PI * 1.5);
        context.arc(clouds[i].x + 70, clouds[i].y - 60, 70, Math.PI * 1, Math.PI * 1.85);
        context.arc(clouds[i].x + 152, clouds[i].y - 45, 50, Math.PI * 1.37, Math.PI * 1.91);
        context.arc(clouds[i].x + 200, clouds[i].y, 60, Math.PI * 1.5, Math.PI * 0.5);
        context.moveTo(clouds[i].x + 200, clouds[i].y + 60);
        context.lineTo(clouds[i].x, clouds[i].y + 60);
        context.strokeStyle = '#797874';
        context.stroke();
        context.fillStyle = '#ffffff';
        context.fill()
    }
}
