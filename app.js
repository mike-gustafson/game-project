let context
let rectangle
let loop;
context = document.querySelector("canvas").getContext("2d");
let   movementDirections = {
  up: false,
  left: false,
  right: false,
};
context.canvas.height = 400;
context.canvas.width = 800;

const platform = {
  x: 60,          // X position of the platform
  y: context.canvas.height / 1.5,  // Y position (halfway up the canvas)
  width: 100,      // Width of the platform
  height: 10,      // Height of the platform
};

rectangle = {
  height:32,
  jumping:true,
  width:32,
  x:10,
  x_velocity:0,
  y:0,
  y_velocity:0
};

window.addEventListener('keydown', e => {
  let key_state = (e.type == "keydown");
  
  switch(e.key) {
    case 'ArrowLeft':
      movementDirections.left = key_state;
      break;
    case 'ArrowUp':
      if (key_state && !rectangle.jumping) {
        rectangle.y_velocity = -50;
        rectangle.jumping = true;
      }
      break;
    case 'ArrowRight':
      movementDirections.right = key_state;
      break;
  }
  
});

window.addEventListener('keyup', e => {
  movementDirections = {
    up: false,
    left: false,
    right: false,
  };
})


loop = function() {
  if (movementDirections.left) {
    rectangle.x_velocity -= 0.5;
  }
  if (movementDirections.right) {
    rectangle.x_velocity += 0.5;
  }

  // Check if the rectangle is jumping
  if (movementDirections.up && !isJumping) {
    rectangle.jumping = true;
    rectangle.y_velocity = -50;
  }

  rectangle.y_velocity += 1.8; // gravity
  rectangle.x += rectangle.x_velocity;
  rectangle.y += rectangle.y_velocity;
  rectangle.x_velocity *= 0.9; // friction
  rectangle.y_velocity *= 0.9; // friction

  // Check if the rectangle is on the platform
  if (
    rectangle.y + rectangle.height >= platform.y &&
    rectangle.y <= platform.y + platform.height &&
    rectangle.x + rectangle.width >= platform.x &&
    rectangle.x <= platform.x + platform.width
  ) {
    rectangle.jumping = false;
    rectangle.y = platform.y - rectangle.height;
  }
    // If the rectangle was on the platform and has now passed through it, mark it
    if (rectangle.y + rectangle.height < platform.y && rectangle.y_velocity > 0) {
      passedThroughPlatform = true;
    }
    if (!passedThroughPlatform) {
      rectangle.jumping = false;
      rectangle.y = platform.y - rectangle.height;
  }

  // Reset the isJumping flag when the rectangle touches the ground
  if (rectangle.y > context.canvas.height - rectangle.height) {
    isJumping = false;
    rectangle.y = context.canvas.height - rectangle.height;
    rectangle.y_velocity = 0;
  }
    
  if (rectangle.y > 380 - 16 - 32) {
    rectangle.jumping = false;
    rectangle.y = 380 - 16 - 32;
  }

  if (rectangle.x < -32) {
    rectangle.x = 832;
  } else if (rectangle.x > 832) {
    rectangle.x = -32;
  }


  context.fillStyle = "darkgrey";
  context.fillRect(0, 0, 800, 400);

  context.fillStyle = "blue";
  context.fillRect(platform.x, platform.y, platform.width, platform.height);

  context.fillStyle = "firebrick";
  context.beginPath();
  context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
  context.fill();

  context.strokeStyle = "black";
  context.lineWidth = 4;
  context.beginPath();
  context.moveTo(0, 364);
  context.lineTo(800, 364);
  context.stroke();
  

  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);


