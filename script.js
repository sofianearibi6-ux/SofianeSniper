const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game State
let gameState = 'start'; // start, playing, gameover
let score = 0;
let health = 3;
let animationId;

// DOM Elements
const scoreElement = document.getElementById('score');
const healthElement = document.getElementById('health');
const finalScoreElement = document.getElementById('final-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');

// Input
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'Space' && !keys.Space) {
        keys.Space = true;
        if (gameState === 'playing') player.shoot();
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'Space') keys.Space = false;
});

// Classes
class Player {
    constructor() {
        this.width = 50;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 30;
        this.speed = 7;
        this.color = '#00ffcc';
        this.cooldown = 0;
    }

    draw() {
        // Draw Ship Body
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); // top tip
        ctx.lineTo(this.x + this.width, this.y + this.height); // bottom right
        ctx.lineTo(this.x + this.width / 2 + 10, this.y + this.height - 8); // inner tail right
        ctx.lineTo(this.x + this.width / 2 - 10, this.y + this.height - 8); // inner tail left
        ctx.lineTo(this.x, this.y + this.height); // bottom left
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // Engine glow
        if (keys.ArrowLeft || keys.ArrowRight) {
            ctx.fillStyle = '#ffaa00';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffaa00';
            ctx.beginPath();
            ctx.moveTo(this.x + this.width / 2 - 8, this.y + this.height - 8);
            ctx.lineTo(this.x + this.width / 2 + 8, this.y + this.height - 8);
            ctx.lineTo(this.x + this.width / 2, this.y + this.height + 10 + Math.random() * 10);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    update() {
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
        if (keys.ArrowRight && this.x < canvas.width - this.width) {
            this.x += this.speed;
        }
        if (this.cooldown > 0) this.cooldown--;
    }

    shoot() {
        if (this.cooldown <= 0) {
            projectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y, -12, '#00ffcc'));
            this.cooldown = 12; // Adjusted firerate
            createParticles(this.x + this.width / 2, this.y, 8, '#00ffcc', 2);
        }
    }
}

class Projectile {
    constructor(x, y, velocityY, color) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 18;
        this.velocityY = velocityY;
        this.color = color;
        this.markedForDeletion = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(this.x + 1, this.y + (this.velocityY < 0 ? 0 : this.height - 4), 2, 4);
        ctx.shadowBlur = 0;
    }

    update() {
        this.y += this.velocityY;
        if (this.y < -this.height || this.y > canvas.height + this.height) {
            this.markedForDeletion = true;
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 44;
        this.height = 34;
        this.color = '#ff00ff';
        this.markedForDeletion = false;
        this.shootTimer = Math.random() * 300 + 100;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.baseY = y;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        // Draw alien shape
        ctx.fillRect(this.x + 4, this.y, this.width - 8, this.height);
        ctx.fillRect(this.x, this.y + 8, this.width, this.height - 16);
        
        // Eyes
        ctx.fillStyle = '#1a1a3a';
        ctx.shadowBlur = 0;
        ctx.fillRect(this.x + 8, this.y + 12, 8, 8);
        ctx.fillRect(this.x + this.width - 16, this.y + 12, 8, 8);
    }

    update() {
        // Subtle vertical bobbing
        this.y = this.baseY + Math.sin((frames * 0.05) + this.bobOffset) * 5;
        
        this.shootTimer--;
        if (this.shootTimer <= 0) {
            enemyProjectiles.push(new Projectile(this.x + this.width / 2 - 2, this.y + this.height, 6, '#ff00ff'));
            this.shootTimer = Math.random() * 300 + 150;
        }
    }
}

class Particle {
    constructor(x, y, color, speedMultiplier = 1) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = (Math.random() - 0.5) * 8 * speedMultiplier;
        this.speedY = (Math.random() - 0.5) * 8 * speedMultiplier;
        this.color = color;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 0;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.speedX *= 0.95; // friction
        this.speedY *= 0.95;
    }
}

// Variables
let player;
let projectiles = [];
let enemyProjectiles = [];
let enemies = [];
let particles = [];
let enemyDirection = 1;
let enemySpeed = 1.2;
let frames = 0;

function init() {
    player = new Player();
    projectiles = [];
    enemyProjectiles = [];
    enemies = [];
    particles = [];
    score = 0;
    health = 3;
    enemyDirection = 1;
    enemySpeed = 1.5;
    frames = 0;
    updateUI();
    createEnemies();
}

function createEnemies() {
    const rows = 4;
    const cols = 9;
    const paddingX = 25;
    const paddingY = 20;
    const offsetX = (canvas.width - (cols * 44 + (cols - 1) * paddingX)) / 2;
    const offsetY = 70;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            enemies.push(new Enemy(
                offsetX + c * (44 + paddingX),
                offsetY + r * (34 + paddingY)
            ));
        }
    }
}

function createParticles(x, y, amount, color, speedMultiplier = 1) {
    for (let i = 0; i < amount; i++) {
        particles.push(new Particle(x, y, color, speedMultiplier));
    }
}

function updateUI() {
    scoreElement.innerText = score;
    healthElement.innerText = health;
}

function checkCollisions() {
    // Player projectiles hit enemies
    projectiles.forEach(p => {
        enemies.forEach(e => {
            if (!p.markedForDeletion && !e.markedForDeletion &&
                p.x < e.x + e.width && p.x + p.width > e.x &&
                p.y < e.y + e.height && p.y + p.height > e.y) {
                
                p.markedForDeletion = true;
                e.markedForDeletion = true;
                score += 100;
                updateUI();
                createParticles(e.x + e.width/2, e.y + e.height/2, 20, e.color, 1.5);

                if (score % 2000 === 0) {
                    enemySpeed += 0.8;
                }
            }
        });
    });

    // Enemy projectiles hit player
    enemyProjectiles.forEach(p => {
        if (!p.markedForDeletion &&
            p.x < player.x + player.width && p.x + p.width > player.x &&
            p.y < player.y + player.height && p.y + p.height > player.y) {
            
            p.markedForDeletion = true;
            health--;
            updateUI();
            
            // Screen shake effect
            canvas.style.transform = `translate(${(Math.random()-0.5)*20}px, ${(Math.random()-0.5)*20}px)`;
            setTimeout(() => canvas.style.transform = 'translate(0, 0)', 50);

            createParticles(player.x + player.width/2, player.y + player.height/2, 30, player.color, 2);

            if (health <= 0) {
                createParticles(player.x + player.width/2, player.y + player.height/2, 100, player.color, 4);
                gameOver();
            }
        }
    });
}

function updateEnemies() {
    let touchedEdge = false;
    
    // Find left/right bounds of enemy group
    let minX = canvas.width;
    let maxX = 0;
    enemies.forEach(e => {
        if(e.x < minX) minX = e.x;
        if(e.x + e.width > maxX) maxX = e.x + e.width;
    });

    if (maxX + enemySpeed * enemyDirection > canvas.width - 20 || minX + enemySpeed * enemyDirection < 20) {
        touchedEdge = true;
    }

    if (touchedEdge && frames % 10 === 0) { // Limit how often they drop down
        enemyDirection *= -1;
        enemies.forEach(e => {
            e.baseY += 35; // Move down
            // Check if enemies reached player
            if (e.baseY + e.height >= player.y) {
                gameOver();
            }
        });
    }

    enemies.forEach(e => {
        e.x += enemySpeed * enemyDirection;
    });
}

// Background stars
const stars = Array(120).fill().map(() => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 1.5 + 0.5,
    speed: Math.random() * 0.8 + 0.2,
    alpha: Math.random()
}));

function drawBackground() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    stars.forEach(star => {
        star.alpha += (Math.random() - 0.5) * 0.1;
        if(star.alpha > 1) star.alpha = 1;
        if(star.alpha < 0.2) star.alpha = 0.2;

        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
        
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
    ctx.globalAlpha = 1.0;
}

function animate() {
    if (gameState !== 'playing') return;
    
    drawBackground();

    player.update();
    player.draw();

    updateEnemies();
    
    [...enemies, ...projectiles, ...enemyProjectiles, ...particles].forEach(obj => {
        if(obj.update && obj !== player) obj.update();
        if(obj.draw && obj !== player) obj.draw();
    });

    projectiles = projectiles.filter(p => !p.markedForDeletion);
    enemyProjectiles = enemyProjectiles.filter(p => !p.markedForDeletion);
    enemies = enemies.filter(e => !e.markedForDeletion);
    particles = particles.filter(p => p.life > 0);

    checkCollisions();

    // Spawn new wave if all enemies are defeated
    if (enemies.length === 0) {
        createEnemies();
        enemySpeed += 0.6;
        health = Math.min(health + 1, 5); // Reward player with health
        updateUI();
    }

    frames++;
    animationId = requestAnimationFrame(animate);
}

function startGame() {
    if(gameState === 'playing') return;
    gameState = 'playing';
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    canvas.style.transform = 'translate(0, 0)';
    init();
    animate();
}

function gameOver() {
    gameState = 'gameover';
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        finalScoreElement.innerText = score;
        gameOverScreen.classList.add('active');
        drawBackground(); // Just to keep stars rendering briefly or freeze
    }, 100);
}

startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

// Initial draw for background before start
let initAnimationId;
function initAnimate() {
    if (gameState === 'start') {
        drawBackground();
        initAnimationId = requestAnimationFrame(initAnimate);
    } else {
        cancelAnimationFrame(initAnimationId);
    }
}
initAnimate();
