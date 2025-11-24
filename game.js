/**
 * Simple Platformer Game
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRAVITY = 0.5;
const FRICTION = 0.8;
const JUMP_STRENGTH = 12;
const SPEED = 5;

// Game State
let keys = {
    right: false,
    left: false,
    up: false
};

// Player Object
const player = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    dx: 0,
    dy: 0,
    grounded: false,
    color: '#e94560'
};

// Platforms
const platforms = [
    { x: 0, y: 550, width: 800, height: 50 }, // Ground
    { x: 200, y: 400, width: 200, height: 20 },
    { x: 500, y: 300, width: 200, height: 20 },
    { x: 50, y: 250, width: 100, height: 20 }
];

// Obstacles (Spikes/Lava)
const obstacles = [
    { x: 300, y: 530, width: 40, height: 20, color: '#ff0000' },
    { x: 600, y: 280, width: 30, height: 20, color: '#ff0000' }
];

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
        if (player.grounded) {
            player.dy = -JUMP_STRENGTH;
            player.grounded = false;
        }
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
});

function resetGame() {
    player.x = 100;
    player.y = 100;
    player.dx = 0;
    player.dy = 0;
}

function update() {
    // Movement
    if (keys.right) {
        player.dx = SPEED;
    } else if (keys.left) {
        player.dx = -SPEED;
    } else {
        player.dx *= FRICTION;
    }

    player.dy += GRAVITY;

    player.x += player.dx;
    player.y += player.dy;

    // Collision Detection
    player.grounded = false;

    // Check platform collisions
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y < platform.y + platform.height &&
            player.y + player.height > platform.y) {

            // Simple collision resolution
            if (player.dy > 0 && player.y + player.height - player.dy <= platform.y) {
                player.grounded = true;
                player.dy = 0;
                player.y = platform.y - player.height;
            }
        }
    });

    // Check obstacle collisions
    obstacles.forEach(obstacle => {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            resetGame();
        }
    });

    // Screen boundaries
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y > canvas.height) { // Reset if falls off
        resetGame();
    }
}

function draw() {
    // Clear Screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Platforms
    ctx.fillStyle = '#0f3460';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw Obstacles
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game
gameLoop();
