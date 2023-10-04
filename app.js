import level01Platforms from './level-01.js';
let gameOver = false;

const context = document.querySelector('canvas');
const c = context.getContext("2d");
context.width = innerWidth;
context.height = innerHeight;

let levelWidth = 10000;
let playerLives = 3;

// const platformAmount = 100 


// Physics Variables
let friction = 0;
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
    drawLabel() {
        c.fillStyle = 'black';
        c.font = '12px Arial';
        c.fillText(`X: ${this.position.x} ${this.inLevelXPosition.x}`, this.position.x, this.position.y - 5);
    }
    update() {
        this.create()
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

// keyboard inputs
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

const loop = function() {
    c.clearRect(0, 0, context.width, context.height);
    player.update();    
    player.drawLabel()
    console.log(player.inLevelXPosition.x-player.position.x)
    platforms.forEach(platform => {
        platform.update()
        platform.drawLabel()
        if (
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {
            player.jumping = false;
            player.position.y = platform.position.y - player.height;
            player.velocity.y = 0
        }
    });
    if  ((player.position.x < innerWidth/2) && (player.position.x > playerStartingXPosition) &&
        (player.inLevelXPosition.x <innerWidth/2) && (player.inLevelXPosition.x > innerWidth/4)) {
            player.position.x = player.inLevelXPosition.x
        }
console.log('context',context.height)
console.log('player bottom',player.position.y + player.height)
    if (player.position.y +player.height >= context.height) {
        if (playerLives > 0) {
            // Player loses a life
            playerLives--;
            // Reset player position
            player.position.x = playerStartingXPosition;
            player.position.y = innerHeight/6;
            player.velocity.y = 0;
            player.velocity.x = 0;
            player.inLevelXPosition.x = playerStartingXPosition;
            platforms = generateInitialPlatforms();

        } else if (!gameOver) {
            // Player has no lives left, trigger game over
            alert('You lose!');
            gameOver = true
            // Reset the game when the alert is dismissed
            resetGame();
        }
    }

    // player lives markers
    for (let i = 0; i < playerLives; i++) {
        const x = 20 + i * 40;
        const y = 20;
        c.fillStyle = 'firebrick';
        c.fillRect(x, y, 32, 32);
    }
    

    // keyboard movement actions
    if (keys.left.pressed) {
        player.velocity.x = -5
    } else if (keys.right.pressed) {
        player.velocity.x = 5    
    } else {
        player.velocity.x = player.velocity.x * friction
    }

    //  moves the player an appropriate amount
    player.position.x += player.velocity.x;

    // keeps player on the map
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

    // makes double jumping not work
    if (player.position.y >= context.height - player.height) {
        player.jumping = false;
        player.position.y = context.height - player.height;
        player.velocity.y = 0;
        player.inLevelXPosition.x = playerStartingXPosition;
    }
    
    // looper
    window.requestAnimationFrame(loop); 
}

function resetGame() {
    // Reload the page to fully reset the game
    window.location.reload();
}

function generateInitialPlatforms() {
    let initialPlatformData = level01Platforms.map((platformData) => {
        let platform = new Platform();
        platform.position.x = platformData.x;
        platform.position.y = platformData.y;
        platform.width = platformData.width;
        return platform;
    });
    return initialPlatformData;
}

let platforms = generateInitialPlatforms();

// for (i=0;i<platformAmount;i++){
//     let newPlatform = new Platform
//     platforms.push(newPlatform)
// }




const player = new Player
let playerStartingXPosition = player.position.x
console.log('player started at:', playerStartingXPosition)
player.create()
window.requestAnimationFrame(loop)