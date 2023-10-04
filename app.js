const context = document.querySelector('canvas');
const c = context.getContext("2d");
context.width = innerWidth;
context.height = innerHeight;

let levelWidth = 10000;

const platformAmount = 100 
let platforms = [];

// Physics Variables
let friction = 0.8;
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
        this.create()
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
            y: Math.floor((Math.random() * innerHeight)),
        }
    }
    create() {
        c.fillStyle = 'white'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    update() {
        this.create()
        if (
            (player.position.x <= 100 && player.inLevelXPosition.x >= 100) ||
            (player.inLevelXPosition.x < levelWidth && player.position.x >= innerWidth / 2)
        ) {
            this.position.x -= player.velocity.x;
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
                player.velocity.y = -25;
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
    console.log(player.inLevelXPosition.x)
    platforms.forEach(platform => {
        platform.update()
        if (
            player.position.y + player.height >= platform.position.y &&
            player.position.y <= platform.position.y + platform.height &&
            player.inLevelXPosition.x + player.width >= platform.position.x &&
            player.inLevelXPosition.x <= platform.position.x + platform.width
        ) {
            player.jumping = false;
            player.position.y = platform.position.y - player.height;
            player.velocity.y = 0;
        }
    });

    // syncs both position values at an appropriate time, usefull for running back and forth in a level
    if  ((player.position.x < innerWidth/2) && (player.position.x > innerWidth/4) &&
        (player.inLevelXPosition.x <innerWidth/2) && (player.inLevelXPosition.x > innerWidth/4)) {
            player.position.x = player.inLevelXPosition.x
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
    }
    
    // looper
    window.requestAnimationFrame(loop); 
}

for (i=0;i<platformAmount;i++){
    let newPlatform = new Platform
    platforms.push(newPlatform)
}
const player = new Player
let playerStartingXPosition = player.position.x
console.log('player started at:', playerStartingXPosition)
player.create()
window.requestAnimationFrame(loop)