// ===============================
// FLAPPY RAVI
// ===============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// ---------- CANVAS ----------
canvas.width = 400;
canvas.height = 600;

// ---------- ASSETS ----------
const raviImg = new Image();
raviImg.src = "assets/ravi.webp";

const pipeImg = new Image();
pipeImg.src = "assets/manojtiwari.webp";

// ---------- SOUNDS ----------
const flapSound = new Audio("assets/flap.mp3");
const gameOverSound = new Audio("assets/gameover.mp3");

flapSound.volume = 0.45;
gameOverSound.volume = 0.8;

// ---------- GAME SETTINGS ----------
const GRAVITY = 0.42;
const FLAP_POWER = -7.2;

const RAVI_SIZE = 42;

const PIPE_WIDTH = 70;

// HARDER THAN BEFORE 😈
const START_GAP = 155;
const MIN_GAP = 125;

const START_SPEED = 2.8;
const MAX_SPEED = 4.6;

const PIPE_DISTANCE = 230;

// ---------- RAVI ----------
let ravi = {
    x: 80,
    y: 280,
    velocity: 0,
    rotation: 0
};

// ---------- GAME STATE ----------
let pipes = [];
let score = 0;
let gameOver = false;
let started = false;
let lastPipeX = canvas.width + 100;

let pipeSpeed = START_SPEED;
let pipeGap = START_GAP;

// ---------- BACKGROUND ----------
function drawBackground() {
    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Clouds
    ctx.fillStyle = "rgba(255,255,255,0.75)";

    drawCloud(70, 100, 1);
    drawCloud(300, 160, 0.8);
    drawCloud(180, 50, 0.6);

    // Ground
    ctx.fillStyle = "#65b84f";
    ctx.fillRect(0, canvas.height - 55, canvas.width, 55);

    ctx.fillStyle = "#4d963c";
    ctx.fillRect(0, canvas.height - 55, canvas.width, 8);
}

function drawCloud(x, y, scale) {
    ctx.beginPath();

    ctx.arc(x, y, 20 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y - 10 * scale, 25 * scale, 0, Math.PI * 2);
    ctx.arc(x + 55 * scale, y, 20 * scale, 0, Math.PI * 2);

    ctx.fill();
}

// ---------- DRAW RAVI ----------
function drawRavi() {
    ctx.save();

    const centerX = ravi.x + RAVI_SIZE / 2;
    const centerY = ravi.y + RAVI_SIZE / 2;

    ctx.translate(centerX, centerY);

    // Rotate based on velocity
    ravi.rotation = Math.min(
        Math.max(ravi.velocity * 3.5, -25),
        90
    );

    ctx.rotate(ravi.rotation * Math.PI / 180);

    if (raviImg.complete && raviImg.naturalWidth > 0) {
        ctx.drawImage(
            raviImg,
            -RAVI_SIZE / 2,
            -RAVI_SIZE / 2,
            RAVI_SIZE,
            RAVI_SIZE
        );
    } else {
        // Fallback if image hasn't loaded
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// ---------- DRAW PIPE ----------
function drawPipe(pipe) {

    const topHeight = pipe.gapY;
    const bottomY = pipe.gapY + pipe.gap;

    // TOP PIPE
    if (pipeImg.complete && pipeImg.naturalWidth > 0) {

        ctx.save();

        // Flip image upside down for top pipe
        ctx.translate(pipe.x + PIPE_WIDTH / 2, topHeight);
        ctx.rotate(Math.PI);

        ctx.drawImage(
            pipeImg,
            -PIPE_WIDTH / 2,
            0,
            PIPE_WIDTH,
            topHeight
        );

        ctx.restore();

        // BOTTOM PIPE
        ctx.drawImage(
            pipeImg,
            pipe.x,
            bottomY,
            PIPE_WIDTH,
            canvas.height - bottomY
        );

    } else {

        // Fallback pipes
        ctx.fillStyle = "#159447";

        ctx.fillRect(
            pipe.x,
            0,
            PIPE_WIDTH,
            topHeight
        );

        ctx.fillRect(
            pipe.x,
            bottomY,
            PIPE_WIDTH,
            canvas.height - bottomY
        );

        ctx.fillStyle = "#0c7134";

        ctx.fillRect(
            pipe.x - 5,
            topHeight - 20,
            PIPE_WIDTH + 10,
            20
        );

        ctx.fillRect(
            pipe.x - 5,
            bottomY,
            PIPE_WIDTH + 10,
            20
        );
    }
}

// ---------- CREATE PIPE ----------
function createPipe(x) {

    // Keep enough room from top and ground
    const minTop = 75;
    const maxTop = canvas.height - 55 - pipeGap - 75;

    const gapY =
        Math.floor(
            Math.random() * (maxTop - minTop)
        ) + minTop;

    pipes.push({
        x: x,
        gapY: gapY,
        gap: pipeGap,
        passed: false
    });
}

// ---------- RESET ----------
function resetGame() {

    ravi.x = 80;
    ravi.y = 280;
    ravi.velocity = 0;
    ravi.rotation = 0;

    pipes = [];

    score = 0;

    pipeSpeed = START_SPEED;
    pipeGap = START_GAP;

    lastPipeX = canvas.width + 100;

    gameOver = false;
    started = false;

    // First pipe
    createPipe(canvas.width + 100);
}

// ---------- FLAP ----------
function flap() {

    if (gameOver) {
        resetGame();
        return;
    }

    started = true;

    ravi.velocity = FLAP_POWER;

    flapSound.currentTime = 0;
    flapSound.play().catch(() => {});
}

// ---------- COLLISION ----------
function checkCollision(pipe) {

    // Slightly forgiving Ravi hitbox
    const padding = 7;

    const raviLeft = ravi.x + padding;
    const raviRight = ravi.x + RAVI_SIZE - padding;
    const raviTop = ravi.y + padding;
    const raviBottom = ravi.y + RAVI_SIZE - padding;

    const pipeLeft = pipe.x;
    const pipeRight = pipe.x + PIPE_WIDTH;

    const topPipeBottom = pipe.gapY;
    const bottomPipeTop = pipe.gapY + pipe.gap;

    const horizontalCollision =
        raviRight > pipeLeft &&
        raviLeft < pipeRight;

    if (!horizontalCollision) {
        return false;
    }

    if (
        raviTop < topPipeBottom ||
        raviBottom > bottomPipeTop
    ) {
        return true;
    }

    return false;
}

// ---------- GAME OVER ----------
function endGame() {

    if (gameOver) return;

    gameOver = true;

    // STOP FLAPPING SOUND
    flapSound.pause();
    flapSound.currentTime = 0;

    // PLAY GAME OVER SOUND 🔊
    gameOverSound.currentTime = 0;
    gameOverSound.play().catch(() => {});

    drawGameOver();
}

// ---------- UPDATE ----------
function update() {

    if (!started || gameOver) {
        return;
    }

    // Gravity
    ravi.velocity += GRAVITY;
    ravi.y += ravi.velocity;

    // Increase difficulty with score
    pipeSpeed = Math.min(
        START_SPEED + score * 0.07,
        MAX_SPEED
    );

    pipeGap = Math.max(
        START_GAP - score * 1.2,
        MIN_GAP
    );

    // Move pipes
    for (let i = pipes.length - 1; i >= 0; i--) {

        const pipe = pipes[i];

        pipe.x -= pipeSpeed;

        // Score when Ravi successfully passes pipe
        if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH < ravi.x
        ) {

            pipe.passed = true;
            score++;
        }

        // Remove old pipe
        if (pipe.x + PIPE_WIDTH < 0) {
            pipes.splice(i, 1);
        }

        // Collision
        if (checkCollision(pipe)) {
            endGame();
            return;
        }
    }

    // Create next pipe
    const lastPipe = pipes[pipes.length - 1];

    if (
        !lastPipe ||
        lastPipe.x < canvas.width - PIPE_DISTANCE
    ) {

        createPipe(canvas.width + 40);
    }

    // Ceiling
    if (ravi.y <= 0) {
        ravi.y = 0;
        endGame();
        return;
    }

    // Ground
    if (
        ravi.y + RAVI_SIZE >=
        canvas.height - 55
    ) {

        ravi.y =
            canvas.height - 55 - RAVI_SIZE;

        endGame();
        return;
    }
}

// ---------- SCORE ----------
function drawScore() {

    ctx.save();

    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";

    // Shadow
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillText(
        score,
        canvas.width / 2 + 2,
        62
    );

    ctx.fillStyle = "white";
    ctx.fillText(
        score,
        canvas.width / 2,
        58
    );

    ctx.restore();
}

// ---------- START SCREEN ----------
function drawStartScreen() {

    if (started || gameOver) return;

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(
        35,
        215,
        canvas.width - 70,
        145
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "white";
    ctx.font = "bold 30px Arial";

    ctx.fillText(
        "FLAPPY RAVI",
        canvas.width / 2,
        260
    );

    ctx.font = "bold 20px Arial";

    ctx.fillText(
        "CLICK / SPACE TO FLY",
        canvas.width / 2,
        300
    );

    ctx.font = "16px Arial";

    ctx.fillText(
        "Don't hit Manoj Tiwari 💀",
        canvas.width / 2,
        330
    );

    ctx.restore();
}

// ---------- GAME OVER SCREEN ----------
function drawGameOver() {

    ctx.save();

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.textAlign = "center";

    ctx.fillStyle = "white";

    ctx.font = "bold 48px Arial";

    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        235
    );

    ctx.font = "bold 28px Arial";

    ctx.fillText(
        `Score: ${score}`,
        canvas.width / 2,
        285
    );

    ctx.font = "bold 19px Arial";

    ctx.fillText(
        "CLICK / SPACE TO RETRY",
        canvas.width / 2,
        335
    );

    ctx.restore();
}

// ---------- DRAW ----------
function draw() {

    drawBackground();

    for (const pipe of pipes) {
        drawPipe(pipe);
    }

    drawRavi();

    drawScore();

    drawStartScreen();

    if (gameOver) {
        drawGameOver();
    }
}

// ---------- GAME LOOP ----------
function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}

// ---------- CONTROLS ----------
document.addEventListener("keydown", function(event) {

    if (
        event.code === "Space" ||
        event.code === "ArrowUp"
    ) {

        event.preventDefault();
        flap();
    }
});

canvas.addEventListener("click", function() {
    flap();
});

// Mobile
canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();
        flap();

    },
    { passive: false }
);

// ---------- START ----------
resetGame();
gameLoop();
