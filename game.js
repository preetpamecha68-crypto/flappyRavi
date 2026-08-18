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

// GAME OVER SOUND
const gameOverSound = new Audio("assetsgameover.mp3");
gameOverSound.volume = 0.9;


// CONTINUOUS MUSIC
// These tracks play one after another.

const musicTracks = [
    new Audio("assets/peshaan-ravi-kishan.mp3"),
    new Audio("assets/koteshwaraye-ravi-kishan.mp3"),
    new Audio("assets/mai-teri-queen-ravi-kishan.mp3")
];

let currentMusic = 0;
let musicStarted = false;

musicTracks.forEach(track => {
    track.volume = 0.35;
});


// ===============================
// GAME SETTINGS
// ===============================

const GRAVITY = 0.42;
const FLAP_POWER = -7.2;

const RAVI_SIZE = 42;

const PIPE_WIDTH = 70;


// MUCH HARDER
const START_GAP = 110;
const MIN_GAP = 90;


// SPEED
const START_SPEED = 3.1;
const MAX_SPEED = 5.2;


// DISTANCE BETWEEN PIPES
const PIPE_DISTANCE = 250;


// ===============================
// RAVI
// ===============================

let ravi = {
    x: 80,
    y: 280,
    velocity: 0,
    rotation: 0
};


// ===============================
// GAME STATE
// ===============================

let pipes = [];
let score = 0;

let gameOver = false;
let started = false;

let pipeSpeed = START_SPEED;
let pipeGap = START_GAP;


// ===============================
// BACKGROUND
// ===============================

function drawBackground() {

    ctx.fillStyle = "#87CEEB";
    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Clouds

    ctx.fillStyle = "rgba(255,255,255,0.75)";

    drawCloud(70, 100, 1);
    drawCloud(300, 160, 0.8);
    drawCloud(180, 50, 0.6);


    // Ground

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
// DRAW RAVI
// ===============================

function drawRavi() {

    ctx.save();

    const centerX =
        ravi.x + RAVI_SIZE / 2;

    const centerY =
        ravi.y + RAVI_SIZE / 2;


    ctx.translate(
        centerX,
        centerY
    );


    ravi.rotation = Math.min(
        Math.max(
            ravi.velocity * 3.5,
            -25
        ),
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
// DRAW PIPE
// ===============================

function drawPipe(pipe) {

    const topHeight = pipe.gapY;

    const bottomY =
        pipe.gapY + pipe.gap;


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

        // FALLBACK PIPE

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


// ===============================
// CREATE PIPE
// ===============================

function createPipe(x) {

    // Keep pipes away from the extreme top/bottom

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
        ) +
        minTop;


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

function playNextMusic() {

    if (gameOver) return;

    const track =
        musicTracks[currentMusic];


    track.currentTime = 0;

    track.play().catch(() => {});


    track.onended = function() {

        if (!gameOver) {

            currentMusic =
                (currentMusic + 1) %
                musicTracks.length;

            playNextMusic();
        }
    };
}


function startMusic() {

    if (musicStarted) return;

    musicStarted = true;

    currentMusic = 0;

    playNextMusic();
}


function stopMusic() {

    musicTracks.forEach(track => {

        track.pause();

        track.currentTime = 0;

        track.onended = null;

    });

    musicStarted = false;
}


// ===============================
// RESET GAME
// ===============================

function resetGame() {

    ravi.x = 80;

    ravi.y = 280;

    ravi.velocity = 0;

    ravi.rotation = 0;


    pipes = [];

    score = 0;


    pipeSpeed =
        START_SPEED;

    pipeGap =
        START_GAP;


    gameOver = false;

    started = false;


    // FIRST PIPE

    createPipe(
        canvas.width + 120
    );
}


// ===============================
// FLAP
// ===============================

function flap() {

    // If dead, restart

    if (gameOver) {

        stopMusic();

        resetGame();

        return;
    }


    started = true;


    // Start music after user interaction

    startMusic();


    ravi.velocity =
        FLAP_POWER;


    flapSound.currentTime = 0;

    flapSound.play().catch(() => {});
}


// ===============================
// COLLISION
// ===============================

function checkCollision(pipe) {

    // Small hitbox padding

    const padding = 6;


    const raviLeft =
        ravi.x + padding;

    const raviRight =
        ravi.x +
        RAVI_SIZE -
        padding;

    const raviTop =
        ravi.y + padding;

    const raviBottom =
        ravi.y +
        RAVI_SIZE -
        padding;


    const pipeLeft =
        pipe.x;

    const pipeRight =
        pipe.x +
        PIPE_WIDTH;


    const topPipeBottom =
        pipe.gapY;


    const bottomPipeTop =
        pipe.gapY +
        pipe.gap;


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


// ===============================
// GAME OVER
// ===============================

function endGame() {

    if (gameOver) return;


    gameOver = true;


    // STOP MUSIC

    stopMusic();


    // STOP FLAP

    flapSound.pause();

    flapSound.currentTime = 0;


    // GAME OVER SOUND 💀

    gameOverSound.pause();

    gameOverSound.currentTime = 0;

    gameOverSound.play().catch(() => {});


    drawGameOver();
}


// ===============================
// UPDATE
// ===============================

function update() {

    if (
        !started ||
        gameOver
    ) {

        return;
    }


    // GRAVITY

    ravi.velocity += GRAVITY;

    ravi.y += ravi.velocity;


    // ===========================
    // DIFFICULTY
    // ===========================

    pipeSpeed =
        Math.min(
            START_SPEED +
            score * 0.10,

            MAX_SPEED
        );


    pipeGap =
        Math.max(
            START_GAP -
            score * 1.5,

            MIN_GAP
        );


    // ===========================
    // MOVE PIPES
    // ===========================

    for (
        let i = pipes.length - 1;
        i >= 0;
        i--
    ) {

        const pipe =
            pipes[i];


        pipe.x -= pipeSpeed;


        // SCORE

        if (
            !pipe.passed &&
            pipe.x +
            PIPE_WIDTH <
            ravi.x
        ) {

            pipe.passed = true;

            score++;
        }


        // COLLISION

        if (
            checkCollision(pipe)
        ) {

            endGame();

            return;
        }


        // REMOVE OLD PIPE

        if (
            pipe.x +
            PIPE_WIDTH <
            -20
        ) {

            pipes.splice(i, 1);
        }
    }


    // ===========================
    // NEXT PIPE
    // ===========================

    const lastPipe =
        pipes[pipes.length - 1];


    if (
        !lastPipe ||
        lastPipe.x <
        canvas.width -
        PIPE_DISTANCE
    ) {

        createPipe(
            canvas.width + 40
        );
    }


    // ===========================
    // CEILING
    // ===========================

    if (ravi.y <= 0) {

        ravi.y = 0;

        endGame();

        return;
    }


    // ===========================
    // GROUND
    // ===========================

    if (
        ravi.y +
        RAVI_SIZE >=
        canvas.height - 55
    ) {

        ravi.y =
            canvas.height -
            55 -
            RAVI_SIZE;


        endGame();

        return;
    }
}


// ===============================
// SCORE
// ===============================

function drawScore() {

    ctx.save();


    ctx.font =
        "bold 42px Arial";

    ctx.textAlign =
        "center";


    // Shadow

    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillText(
        score,
        canvas.width / 2 + 2,
        62
    );


    // Score

    ctx.fillStyle =
        "white";


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

    if (
        started ||
        gameOver
    ) {

        return;
    }


    ctx.save();


    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillRect(
        35,
        215,
        canvas.width - 70,
        145
    );


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 30px Arial";


    ctx.fillText(
        "FLAPPY RAVI",
        canvas.width / 2,
        260
    );


    ctx.font =
        "bold 20px Arial";


    ctx.fillText(
        "CLICK / SPACE TO FLY",
        canvas.width / 2,
        300
    );


    ctx.font =
        "16px Arial";


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


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "white";


    ctx.font =
        "bold 48px Arial";


    ctx.fillText(
        "GAME OVER",
        canvas.width / 2,
        235
    );


    ctx.font =
        "bold 28px Arial";


    ctx.fillText(
        `Score: ${score}`,
        canvas.width / 2,
        285
    );


    ctx.font =
        "bold 19px Arial";


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


    for (
        const pipe of pipes
    ) {

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

    requestAnimationFrame(
        gameLoop
    );
}


// ===============================
// KEYBOARD
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


// ===============================
// MOUSE
// ===============================

canvas.addEventListener(
    "click",
    function() {

        flap();
    }
);


// ===============================
// MOBILE
// ===============================

canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        flap();

    },
    {
        passive: false
    }
);


// ===============================
// START
// ===============================

resetGame();

gameLoop();
