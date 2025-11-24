/**
 * Simple Platformer Game V2
 */

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('scoreBoard');

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
let score = 0;

// Player Object
const player = {
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    dx: 0,
    dy: 0,
    grounded: false,
    jumpCount: 0,
    maxJumps: 2,
    color: '#e94560',
    facingRight: true
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

// Collectibles (Coins)
let coins = [
    { x: 250, y: 350, radius: 10, collected: false },
    { x: 550, y: 250, radius: 10, collected: false },
    { x: 80, y: 200, radius: 10, collected: false },
    { x: 400, y: 500, radius: 10, collected: false }
];

// Particles
let particles = [];

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            size: Math.random() * 4 + 2,
            color: color,
            life: 30
        });
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
    if (e.code === 'ArrowUp' || e.code === 'Space' || e.code === 'KeyW') {
        if (player.jumpCount < player.maxJumps) {
            player.dy = -JUMP_STRENGTH;
            player.jumpCount++;
            player.grounded = false;
            createParticles(player.x + player.width / 2, player.y + player.height, '#ffffff');
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
    player.jumpCount = 0;
    score = 0;
    scoreElement.innerText = 'Score: ' + score;
    // Reset coins
    coins.forEach(coin => coin.collected = false);
}

function update() {
    // Movement
    if (keys.right) {
        player.dx = SPEED;
        player.facingRight = true;
    } else if (keys.left) {
        player.dx = -SPEED;
        player.facingRight = false;
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
                if (!player.grounded) {
                    // Landed
                    createParticles(player.x + player.width / 2, platform.y, '#ffffff');
                }
                player.grounded = true;
                player.dy = 0;
                player.y = platform.y - player.height;
                player.jumpCount = 0; // Reset jumps on ground
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

    // Check coin collisions
    coins.forEach(coin => {
        if (!coin.collected) {
            // Circle collision approximation
            let dx = (player.x + player.width / 2) - coin.x;
            let dy = (player.y + player.height / 2) - coin.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < coin.radius + player.width / 2) {
                coin.collected = true;
                score += 10;
                scoreElement.innerText = 'Score: ' + score;
                createParticles(coin.x, coin.y, '#ffd700');
            }
        }
    });

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx;
        p.y += p.dy;
        p.life--;
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }

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

    // Draw Coins
    ctx.fillStyle = '#ffd700';
    coins.forEach(coin => {
        if (!coin.collected) {
            ctx.beginPath();
            ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Draw Particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
    });

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw Eyes
    ctx.fillStyle = 'white';
    let eyeOffsetX = player.facingRight ? 4 : -4;

    // Left Eye
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 8 + eyeOffsetX, player.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Right Eye
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 8 + eyeOffsetX, player.y + 10, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = 'black';
    // Left Pupil
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 - 8 + eyeOffsetX + (player.facingRight ? 2 : -2), player.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
    // Right Pupil
    ctx.beginPath();
    ctx.arc(player.x + player.width / 2 + 8 + eyeOffsetX + (player.facingRight ? 2 : -2), player.y + 10, 2, 0, Math.PI * 2);
    ctx.fill();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start Game
gameLoop();
