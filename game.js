// ==========================================
// FLAPPY RAVI
// CLEAN VERSION
// ==========================================


// ==========================================
// CANVAS
// ==========================================

const canvas =
    document.getElementById("gameCanvas");

const ctx =
    canvas.getContext("2d");


// ==========================================
// SCREENS
// ==========================================

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");

const finalScore =
    document.getElementById("finalScore");


// ==========================================
// ASSETS
// ==========================================

const raviImg =
    new Image();

raviImg.src =
    "assets/ravi.webp";


const pipeImg =
    new Image();

pipeImg.src =
    "assets/manojtiwari.webp";


// ==========================================
// SOUNDS
// ==========================================

const flapSound =
    new Audio("assets/flap.mp3");


const gameOverSound =
    new Audio("assets/assetsgameover.mp3");


// ==========================================
// BACKGROUND MUSIC
// ==========================================

const musicTracks = [

    new Audio(
        "assets/peshaan-ravi-kishan.mp3"
    ),

    new Audio(
        "assets/koteshwaraye-ravi-kishan.mp3"
    ),

    new Audio(
        "assets/mai-teri-queen-ravi-kishan.mp3"
    )

];


musicTracks.forEach(
    function(track) {

        track.volume = 0.32;

    }
);


let currentMusic = 0;


// ==========================================
// GAME SETTINGS
// ==========================================

const GRAVITY = 0.42;

const FLAP_POWER = -7.2;

const RAVI_SIZE = 42;

const PIPE_WIDTH = 70;


// HARDER GAP

const START_GAP = 105;

const MIN_GAP = 85;


// SPEED

const START_SPEED = 3.0;

const MAX_SPEED = 5.0;


// SPACE BETWEEN PIPES

const PIPE_DISTANCE = 250;


// ==========================================
// GAME VARIABLES
// ==========================================

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

let musicPlaying = false;

let pipeSpeed =
    START_SPEED;

let pipeGap =
    START_GAP;


// ==========================================
// BACKGROUND
// ==========================================

function drawBackground() {

    ctx.fillStyle =
        "#87CEEB";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // Clouds

    ctx.fillStyle =
        "rgba(255,255,255,0.75)";


    drawCloud(
        70,
        100,
        1
    );


    drawCloud(
        300,
        160,
        0.8
    );


    drawCloud(
        180,
        50,
        0.6
    );


    // Ground

    ctx.fillStyle =
        "#65b84f";

    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        55
    );


    ctx.fillStyle =
        "#4d963c";

    ctx.fillRect(
        0,
        canvas.height - 55,
        canvas.width,
        8
    );
}


function drawCloud(
    x,
    y,
    scale
) {

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


// ==========================================
// DRAW RAVI
// ==========================================

function drawRavi() {

    ctx.save();


    const centerX =
        ravi.x +
        RAVI_SIZE / 2;


    const centerY =
        ravi.y +
        RAVI_SIZE / 2;


    ctx.translate(
        centerX,
        centerY
    );


    ravi.rotation =
        Math.min(
            Math.max(
                ravi.velocity * 3.5,
                -25
            ),
            90
        );


    ctx.rotate(
        ravi.rotation *
        Math.PI /
        180
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

    }


    ctx.restore();
}


// ==========================================
// DRAW PIPES
// ==========================================

function drawPipe(pipe) {

    const topHeight =
        pipe.gapY;


    const bottomY =
        pipe.gapY +
        pipe.gap;


    if (
        pipeImg.complete &&
        pipeImg.naturalWidth > 0
    ) {

        // TOP PIPE

        ctx.save();


        ctx.translate(

            pipe.x +
            PIPE_WIDTH / 2,

            topHeight

        );


        ctx.rotate(
            Math.PI
        );


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

            canvas.height -
            bottomY

        );

    }
}


// ==========================================
// CREATE PIPE
// ==========================================

function createPipe(x) {

    const minTop =
        55;


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


// ==========================================
// MUSIC
// ==========================================

function playMusic() {

    if (
        musicPlaying
    ) {

        return;
    }


    musicPlaying =
        true;


    playCurrentTrack();
}


function playCurrentTrack() {

    if (
        !musicPlaying
    ) {

        return;
    }


    const track =
        musicTracks[
            currentMusic
        ];


    track.currentTime =
        0;


    track.play()
        .catch(
            function(error) {

                console.log(
                    "Music:",
                    error
                );

            }
        );


    track.onended =
        function() {

            if (
                !musicPlaying
            ) {

                return;
            }


            currentMusic++;


            if (
                currentMusic >=
                musicTracks.length
            ) {

                currentMusic =
                    0;

            }


            playCurrentTrack();

        };
}


function stopMusic() {

    musicTracks.forEach(

        function(track) {

            track.pause();

            track.currentTime =
                0;

            track.onended =
                null;

        }

    );


    musicPlaying =
        false;
}


// ==========================================
// RESET
// ==========================================

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


    gameOver =
        false;


    createPipe(
        canvas.width + 100
    );
}


// ==========================================
// START GAME
// ==========================================

function startGame() {

    if (
        started &&
        !gameOver
    ) {

        return;
    }


    stopMusic();


    resetGame();


    started =
        true;


    startScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.add(
        "hidden"
    );


    // Initial jump

    ravi.velocity =
        FLAP_POWER;


    flapSound.currentTime =
        0;


    flapSound.play()
        .catch(
            function() {}
        );


    // Music starts AFTER
    // button interaction

    currentMusic =
        0;


    playMusic();
}


// ==========================================
// FLAP
// ==========================================

function flap() {

    if (
        !started
    ) {

        startGame();

        return;
    }


    if (
        gameOver
    ) {

        startGame();

        return;
    }


    ravi.velocity =
        FLAP_POWER;


    flapSound.currentTime =
        0;


    flapSound.play()
        .catch(
            function() {}
        );
}


// ==========================================
// COLLISION
// ==========================================

function checkCollision(pipe) {

    const padding =
        5;


    const raviLeft =
        ravi.x +
        padding;


    const raviRight =
        ravi.x +
        RAVI_SIZE -
        padding;


    const raviTop =
        ravi.y +
        padding;


    const raviBottom =
        ravi.y +
        RAVI_SIZE -
        padding;


    const pipeLeft =
        pipe.x;


    const pipeRight =
        pipe.x +
        PIPE_WIDTH;


    if (
        raviRight <=
        pipeLeft ||

        raviLeft >=
        pipeRight
    ) {

        return false;
    }


    const topPipeBottom =
        pipe.gapY;


    const bottomPipeTop =
        pipe.gapY +
        pipe.gap;


    if (
        raviTop <
        topPipeBottom ||

        raviBottom >
        bottomPipeTop
    ) {

        return true;
    }


    return false;
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    if (
        gameOver
    ) {

        return;
    }


    gameOver =
        true;


    stopMusic();


    flapSound.pause();


    gameOverSound.pause();

    gameOverSound.currentTime =
        0;


    gameOverSound.play()
        .catch(
            function(error) {

                console.log(
                    "Game over sound:",
                    error
                );

            }
        );


    finalScore.textContent =
        score;


    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ==========================================
// UPDATE
// ==========================================

function update() {

    if (
        !started ||
        gameOver
    ) {

        return;
    }


    // Gravity

    ravi.velocity +=
        GRAVITY;


    ravi.y +=
        ravi.velocity;


    // Difficulty

    pipeSpeed =
        Math.min(

            START_SPEED +
            score * 0.12,

            MAX_SPEED

        );


    pipeGap =
        Math.max(

            START_GAP -
            score * 1.5,

            MIN_GAP

        );


    // Move pipes

    for (
        let i =
            pipes.length - 1;

        i >= 0;

        i--
    ) {

        const pipe =
            pipes[i];


        pipe.x -=
            pipeSpeed;


        // Score

        if (
            !pipe.passed &&

            pipe.x +
            PIPE_WIDTH <
            ravi.x
        ) {

            pipe.passed =
                true;


            score++;
        }


        // Collision

        if (
            checkCollision(
                pipe
            )
        ) {

            endGame();

            return;
        }


        // Remove old pipe

        if (
            pipe.x +
            PIPE_WIDTH <
            -20
        ) {

            pipes.splice(
                i,
                1
            );
        }

    }


    // New pipe

    const lastPipe =
        pipes[
            pipes.length - 1
        ];


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


    // Ceiling

    if (
        ravi.y <= 0
    ) {

        ravi.y =
            0;


        endGame();

        return;
    }


    // Ground

    if (
        ravi.y +
        RAVI_SIZE >=
        canvas.height -
        55
    ) {

        ravi.y =
            canvas.height -
            55 -
            RAVI_SIZE;


        endGame();

    }
}


// ==========================================
// SCORE
// ==========================================

function drawScore() {

    if (
        !started
    ) {

        return;
    }


    ctx.save();


    ctx.font =
        "bold 42px Arial";


    ctx.textAlign =
        "center";


    ctx.fillStyle =
        "rgba(0,0,0,0.35)";


    ctx.fillText(

        score,

        canvas.width / 2 + 2,

        62

    );


    ctx.fillStyle =
        "white";


    ctx.fillText(

        score,

        canvas.width / 2,

        58

    );


    ctx.restore();
}


// ==========================================
// DRAW
// ==========================================

function draw() {

    drawBackground();


    for (
        const pipe of pipes
    ) {

        drawPipe(pipe);

    }


    drawRavi();


    drawScore();
}


// ==========================================
// GAME LOOP
// ==========================================

function gameLoop() {

    update();

    draw();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// START BUTTON
// ==========================================

startButton.addEventListener(

    "click",

    function() {

        startGame();

    }

);


// ==========================================
// RESTART BUTTON
// ==========================================

restartButton.addEventListener(

    "click",

    function() {

        startGame();

    }

);


// ==========================================
// KEYBOARD
// ==========================================

document.addEventListener(

    "keydown",

    function(event) {

        if (
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            flap();

        }

    }

);


// ==========================================
// CANVAS CLICK
// ==========================================

canvas.addEventListener(

    "click",

    function() {

        flap();

    }

);


// ==========================================
// MOBILE
// ==========================================

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


// ==========================================
// INITIALIZE
// ==========================================

resetGame();

gameLoop();
