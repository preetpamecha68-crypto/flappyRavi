// ===============================
// FLAPPY RAVI
// ===============================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 400;
canvas.height = 600;


// ===============================
// ASSETS
// ===============================

const raviImg = new Image();
raviImg.src = "assets/ravi.webp";

const pipeImg = new Image();
pipeImg.src = "assets/manojtiwari.webp";


// ===============================
// SOUNDS
// ===============================

const flapSound = new Audio("assets/flap.mp3");

const gameOverSound = new Audio("assetsgameover.mp3");

gameOverSound.volume = 0.9;


// Background music
const musicTracks = [
    new Audio("assets/peshaan-ravi-kishan.mp3"),
    new Audio("assets/koteshwaraye-ravi-kishan.mp3"),
    new Audio("assets/mai-teri-queen-ravi-kishan.mp3")
];

musicTracks.forEach(function(track) {
    track.volume = 0.35;
});

let currentMusic = 0;
let musicPlaying = false;


// ===============================
// SETTINGS
// ===============================

const GRAVITY = 0.42;
const FLAP_POWER = -7.2;

const RAVI_SIZE = 42;

const PIPE_WIDTH = 70;

const START_GAP = 110;
const MIN_GAP = 90;

const START_SPEED = 3.1;
const MAX_SPEED = 5.2;

const PIPE_DISTANCE = 250;


// ===============================
// GAME STATE
// ===============================

let ravi = {
    x: 80,
    y: 280,
    velocity: 0,
    rotation: 0
};

let pipes = [];

let score = 0;

let started = false;
let gameOver = false;

let pipeSpeed = START_SPEED;
let pipeGap = START_GAP;


// ===============================
// BACKGROUND
// ===============================

function drawBackground() {

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(255,255,255,0.75)";

    drawCloud(70, 100, 1);
    drawCloud(300, 160, 0.8);
    drawCloud(180, 50, 0.6);

    ctx.fillStyle = "#65b84f";
    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        55
    );

    ctx.fillStyle = "#4d963c";
    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        8
    );
}


function drawCloud(x, y, scale) {

    ctx.beginPath();

    ctx.arc(
        x,
        y,
        20 * scale,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 25 * scale,
        y - 10 * scale,
        25 * scale,
        0,
        Math.PI * 2
    );

    ctx.arc(
        x + 55 * scale,
        y,
        20 * scale,
        0,
        Math.PI * 2
    );

    ctx.fill();
}


// ===============================
// RAVI
// ===============================

function drawRavi() {

    ctx.save();

    const centerX = ravi.x + RAVI_SIZE / 2;
    const centerY = ravi.y + RAVI_SIZE / 2;

    ctx.translate(centerX, centerY);

    ravi.rotation = Math.min(
        Math.max(ravi.velocity * 3.5, -25),
        90
    );

    ctx.rotate(
        ravi.rotation * Math.PI / 180
    );

    if (
        raviImg.complete &&
        raviImg.naturalWidth > 0
    ) {

        ctx.drawImage(
            raviImg,
            -RAVI_SIZE / 2,
            -RAVI_SIZE / 2,
            RAVI_SIZE,
            RAVI_SIZE
        );

    } else {

        ctx.fillStyle = "#ffcc00";

        ctx.beginPath();

        ctx.arc(
            0,
            0,
            20,
            0,
            Math.PI * 2
        );

        ctx.fill();
    }

    ctx.restore();
}


// ===============================
// PIPES
// ===============================

function drawPipe(pipe) {

    const topHeight = pipe.gapY;
    const bottomY = pipe.gapY + pipe.gap;

    if (
        pipeImg.complete &&
        pipeImg.naturalWidth > 0
    ) {

        // TOP PIPE

        ctx.save();

        ctx.translate(
            pipe.x + PIPE_WIDTH / 2,
            topHeight
        );

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
    }
}


// ===============================
// PIPE CREATION
// ===============================

function createPipe(x) {

    const minTop = 55;

    const maxTop =
        canvas.height -
        55 -
        pipeGap -
        55;

    const gapY =
        Math.floor(
            Math.random() *
            (maxTop - minTop)
        ) + minTop;

    pipes.push({
        x: x,
        gapY: gapY,
        gap: pipeGap,
        passed: false
    });
}


// ===============================
// MUSIC
// ===============================

function playMusic() {

    if (musicPlaying) return;

    musicPlaying = true;

    playCurrentMusic();
}


function playCurrentMusic() {

    if (gameOver) return;

    const track = musicTracks[currentMusic];

    track.currentTime = 0;

    track.play().catch(function() {});

    track.onended = function() {

        if (gameOver) return;

        currentMusic++;

        if (
            currentMusic >= musicTracks.length
        ) {
            currentMusic = 0;
        }

        playCurrentMusic();
    };
}


function stopMusic() {

    musicTracks.forEach(function(track) {

        track.pause();
        track.currentTime = 0;
        track.onended = null;

    });

    musicPlaying = false;
}


// ===============================
// RESET
// ===============================

function resetGame() {

    ravi.x = 80;
    ravi.y = 280;
    ravi.velocity = 0;
    ravi.rotation = 0;

    pipes = [];

    score = 0;

    pipeSpeed = START_SPEED;
    pipeGap = START_GAP;

    started = false;
    gameOver = false;

    createPipe(canvas.width + 120);
}


// ===============================
// START GAME
// ===============================

function startGame() {

    console.log("FLAPPY RAVI STARTED");

    if (gameOver) {
        stopMusic();
        resetGame();
    }

    started = true;
    gameOver = false;

    playMusic();

    ravi.velocity = FLAP_POWER;

    flapSound.currentTime = 0;
    flapSound.play().catch(function() {});
}


// ===============================
// FLAP
// ===============================

function flap() {

    if (!started) {
        startGame();
        return;
    }

    if (gameOver) {
        startGame();
        return;
    }

    ravi.velocity = FLAP_POWER;

    flapSound.currentTime = 0;
    flapSound.play().catch(function() {});
}


// ===============================
// COLLISION
// ===============================

function checkCollision(pipe) {

    const padding = 6;

    const raviLeft = ravi.x + padding;
    const raviRight =
        ravi.x + RAVI_SIZE - padding;

    const raviTop = ravi.y + padding;
    const raviBottom =
        ravi.y + RAVI_SIZE - padding;

    const pipeLeft = pipe.x;
    const pipeRight =
        pipe.x + PIPE_WIDTH;

    const topBottom = pipe.gapY;

    const bottomTop =
        pipe.gapY + pipe.gap;

    if (
        raviRight > pipeLeft &&
        raviLeft < pipeRight
    ) {

        if (
            raviTop < topBottom ||
            raviBottom > bottomTop
        ) {
            return true;
        }
    }

    return false;
}


// ===============================
// GAME OVER
// ===============================

function endGame() {

    if (gameOver) return;

    gameOver = true;

    stopMusic();

    flapSound.pause();
    flapSound.currentTime = 0;

    gameOverSound.pause();
    gameOverSound.currentTime = 0;

    gameOverSound.play().catch(function(error) {
        console.log("Game over audio:", error);
    });
}


// ===============================
// UPDATE
// ===============================

function update() {

    if (!started || gameOver) return;

    ravi.velocity += GRAVITY;
    ravi.y += ravi.velocity;


    // Difficulty increases
    pipeSpeed = Math.min(
        START_SPEED + score * 0.10,
        MAX_SPEED
    );

    pipeGap = Math.max(
        START_GAP - score * 1.5,
        MIN_GAP
    );


    // Move pipes

    for (
        let i = pipes.length - 1;
        i >= 0;
        i--
    ) {

        const pipe = pipes[i];

        pipe.x -= pipeSpeed;


        // Score

        if (
            !pipe.passed &&
            pipe.x + PIPE_WIDTH < ravi.x
        ) {

            pipe.passed = true;
            score++;
        }


        // Collision

        if (checkCollision(pipe)) {

            endGame();
            return;
        }


        // Delete old pipe

        if (
            pipe.x + PIPE_WIDTH < -20
        ) {

            pipes.splice(i, 1);
        }
    }


    // Create next pipe

    const lastPipe =
        pipes[pipes.length - 1];

    if (
        !lastPipe ||
        lastPipe.x <
        canvas.width - PIPE_DISTANCE
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
            canvas.height -
            55 -
            RAVI_SIZE;

        endGame();
    }
}


// ===============================
// SCORE
// ===============================

function drawScore() {

    ctx.save();

    ctx.font = "bold 42px Arial";
    ctx.textAlign = "center";

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

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


// ===============================
// START SCREEN
// ===============================

function drawStartScreen() {

    if (started || gameOver) return;

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";

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


// ===============================
// GAME OVER SCREEN
// ===============================

function drawGameOver() {

    ctx.save();

    ctx.fillStyle =
        "rgba(0,0,0,0.55)";

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
        "Score: " + score,
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


// ===============================
// DRAW
// ===============================

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


// ===============================
// GAME LOOP
// ===============================

function gameLoop() {

    update();
    draw();

    requestAnimationFrame(gameLoop);
}


// ===============================
// CONTROLS
// ===============================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();
            flap();
        }
    }
);


canvas.addEventListener(
    "click",
    function() {
        flap();
    }
);


canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();
        flap();

    },
    { passive: false }
);


// ===============================
// 🔥 START BUTTON FIX
// ===============================
//
// Finds ANY button whose text says:
// START, PLAY, BEGIN, etc.
// So we don't need to know its ID.
//

function connectStartButton() {

    const buttons =
        document.querySelectorAll("button");

    buttons.forEach(function(button) {

        const text =
            button.textContent
                .trim()
                .toLowerCase();

        if (
            text.includes("start") ||
            text.includes("play") ||
            text.includes("begin")
        ) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();

                    startGame();

                    // Hide the button if it's an overlay
                    button.style.display = "none";
                }
            );
        }
    });
}


// ===============================
// INITIALIZE
// ===============================

function initializeGame() {

    resetGame();

    gameLoop();

    connectStartButton();
}


// If HTML has already loaded
if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGame
    );

} else {

    initializeGame();
}
