const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreElement =
    document.getElementById("score");

const finalScoreElement =
    document.getElementById("finalScore");

const startScreen =
    document.getElementById("startScreen");

const gameOverScreen =
    document.getElementById("gameOverScreen");

const startButton =
    document.getElementById("startButton");

const restartButton =
    document.getElementById("restartButton");


// =============================
// GAME SETTINGS
// =============================

const GAME_WIDTH = 360;
const GAME_HEIGHT = 640;

canvas.width = GAME_WIDTH;
canvas.height = GAME_HEIGHT;


// =============================
// RAVI IMAGE
// =============================

const raviImage = new Image();

raviImage.src = "ravi.jpg";


// =============================
// GAME VARIABLES
// =============================

let gameRunning = false;
let gameStarted = false;

let score = 0;

let gravity = 0.42;

let jumpStrength = -7.5;

let pipeSpeed = 2.6;

let frame = 0;


// =============================
// RAVI
// =============================

const ravi = {

    x: 80,

    y: 300,

    width: 58,

    height: 58,

    velocity: 0,

    rotation: 0

};


// =============================
// PIPES
// =============================

let pipes = [];

const pipeWidth = 65;

const pipeGap = 165;


function createPipe() {

    const minTop = 80;

    const maxTop =
        GAME_HEIGHT -
        pipeGap -
        100;

    const topHeight =
        Math.floor(
            Math.random() *
            (maxTop - minTop)
        ) + minTop;

    pipes.push({

        x: GAME_WIDTH,

        top: topHeight,

        bottom:
            topHeight + pipeGap,

        passed: false

    });
}


// =============================
// RESET
// =============================

function resetGame() {

    score = 0;

    frame = 0;

    pipes = [];

    ravi.y = 300;

    ravi.velocity = 0;

    ravi.rotation = 0;

    scoreElement.textContent = score;

    createPipe();
}


// =============================
// START GAME
// =============================

function startGame() {

    resetGame();

    gameRunning = true;

    gameStarted = true;

    startScreen.classList.add("hidden");

    gameOverScreen.classList.add("hidden");

    requestAnimationFrame(gameLoop);
}


// =============================
// GAME OVER
// =============================

function gameOver() {

    if (!gameRunning) return;

    gameRunning = false;

    finalScoreElement.textContent = score;

    gameOverScreen.classList.remove("hidden");
}


// =============================
// JUMP
// =============================

function jump() {

    if (!gameRunning) return;

    ravi.velocity = jumpStrength;
}


// =============================
// KEYBOARD
// =============================

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.code === "Space" ||
            event.code === "ArrowUp"
        ) {

            event.preventDefault();

            if (!gameStarted) {

                startGame();

                return;
            }

            jump();
        }

    }
);


// =============================
// MOUSE
// =============================

canvas.addEventListener(
    "mousedown",
    function() {

        if (gameRunning) {

            jump();

        }

    }
);


// =============================
// TOUCH
// =============================

canvas.addEventListener(
    "touchstart",
    function(event) {

        event.preventDefault();

        if (gameRunning) {

            jump();

        }

    },
    {
        passive: false
    }
);


// =============================
// BUTTONS
// =============================

startButton.addEventListener(
    "click",
    startGame
);

restartButton.addEventListener(
    "click",
    startGame
);


// =============================
// UPDATE RAVI
// =============================

function updateRavi() {

    ravi.velocity += gravity;

    ravi.y += ravi.velocity;


    ravi.rotation =
        Math.min(
            Math.max(
                ravi.velocity * 4,
                -25
            ),
            90
        );


    // Ceiling

    if (ravi.y < 0) {

        ravi.y = 0;

        ravi.velocity = 0;
    }


    // Ground

    if (
        ravi.y +
        ravi.height >=
        GAME_HEIGHT
    ) {

        gameOver();

    }
}


// =============================
// UPDATE PIPES
// =============================

function updatePipes() {

    for (
        let i = pipes.length - 1;
        i >= 0;
        i--
    ) {

        const pipe = pipes[i];

        pipe.x -= pipeSpeed;


        // SCORE

        if (
            !pipe.passed &&
            pipe.x +
            pipeWidth <
            ravi.x
        ) {

            pipe.passed = true;

            score++;

            scoreElement.textContent =
                score;
        }


        // REMOVE PIPE

        if (
            pipe.x +
            pipeWidth <
            0
        ) {

            pipes.splice(i, 1);
        }


        // COLLISION

        if (
            checkCollision(pipe)
        ) {

            gameOver();

        }

    }


    // CREATE NEW PIPE

    if (
        pipes.length === 0 ||
        pipes[
            pipes.length - 1
        ].x < 190
    ) {

        createPipe();

    }
}


// =============================
// COLLISION
// =============================

function checkCollision(pipe) {

    const padding = 9;


    const raviLeft =
        ravi.x + padding;

    const raviRight =
        ravi.x +
        ravi.width -
        padding;

    const raviTop =
        ravi.y + padding;

    const raviBottom =
        ravi.y +
        ravi.height -
        padding;


    const pipeLeft =
        pipe.x;

    const pipeRight =
        pipe.x +
        pipeWidth;


    const touchingX =
        raviRight >
        pipeLeft &&
        raviLeft <
        pipeRight;


    const touchingTopPipe =
        raviTop <
        pipe.top;


    const touchingBottomPipe =
        raviBottom >
        pipe.bottom;


    return (
        touchingX &&
        (
            touchingTopPipe ||
            touchingBottomPipe
        )
    );
}


// =============================
// BACKGROUND
// =============================

function drawBackground() {

    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            GAME_HEIGHT
        );


    gradient.addColorStop(
        0,
        "#64c8ff"
    );

    gradient.addColorStop(
        1,
        "#d9f5ff"
    );


    ctx.fillStyle =
        gradient;

    ctx.fillRect(
        0,
        0,
        GAME_WIDTH,
        GAME_HEIGHT
    );


    // CLOUDS

    drawCloud(
        70,
        100,
        1
    );

    drawCloud(
        260,
        170,
        0.8
    );

    drawCloud(
        150,
        260,
        0.6
    );


    // GROUND

    ctx.fillStyle =
        "#75c043";

    ctx.fillRect(
        0,
        GAME_HEIGHT - 45,
        GAME_WIDTH,
        45
    );


    ctx.fillStyle =
        "#4e9228";

    ctx.fillRect(
        0,
        GAME_HEIGHT - 45,
        GAME_WIDTH,
        8
    );
}


// =============================
// CLOUD
// =============================

function drawCloud(
    x,
    y,
    scale
) {

    ctx.save();

    ctx.translate(
        x,
        y
    );

    ctx.scale(
        scale,
        scale
    );


    ctx.fillStyle =
        "rgba(255,255,255,0.8)";


    ctx.beginPath();

    ctx.arc(
        0,
        10,
        20,
        0,
        Math.PI * 2
    );

    ctx.arc(
        25,
        0,
        27,
        0,
        Math.PI * 2
    );

    ctx.arc(
        55,
        10,
        20,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
}


// =============================
// DRAW PIPES
// =============================

function drawPipes() {

    pipes.forEach(
        pipe => {

            drawPipe(
                pipe.x,
                0,
                pipeWidth,
                pipe.top,
                true
            );


            drawPipe(
                pipe.x,
                pipe.bottom,
                pipeWidth,
                GAME_HEIGHT -
                pipe.bottom,
                false
            );

        }
    );
}


function drawPipe(
    x,
    y,
    width,
    height,
    topPipe
) {

    // BODY

    ctx.fillStyle =
        "#36a852";

    ctx.fillRect(
        x,
        y,
        width,
        height
    );


    // HIGHLIGHT

    ctx.fillStyle =
        "#67d36f";

    ctx.fillRect(
        x + 8,
        y,
        10,
        height
    );


    // DARK SIDE

    ctx.fillStyle =
        "#197a38";

    ctx.fillRect(
        x + width - 10,
        y,
        10,
        height
    );


    // PIPE LIP

    const lipHeight = 22;

    const lipWidth =
        width + 12;

    const lipX =
        x - 6;

    let lipY;


    if (topPipe) {

        lipY =
            height -
            lipHeight;

    } else {

        lipY = y;

    }


    ctx.fillStyle =
        "#299847";

    ctx.fillRect(
        lipX,
        lipY,
        lipWidth,
        lipHeight
    );


    ctx.fillStyle =
        "#67d36f";

    ctx.fillRect(
        lipX + 8,
        lipY + 3,
        10,
        lipHeight - 6
    );


    ctx.fillStyle =
        "#176d32";

    ctx.fillRect(
        lipX +
        lipWidth -
        15,
        lipY,
        9,
        lipHeight
    );
}


// =============================
// DRAW RAVI
// =============================

function drawRavi() {

    ctx.save();


    ctx.translate(
        ravi.x +
        ravi.width / 2,

        ravi.y +
        ravi.height / 2
    );


    ctx.rotate(
        ravi.rotation *
        Math.PI /
        180
    );


    // ROUND IMAGE

    ctx.beginPath();

    ctx.arc(
        0,
        0,
        ravi.width / 2,
        0,
        Math.PI * 2
    );

    ctx.clip();


    if (raviImage.complete) {

        ctx.drawImage(

            raviImage,

            -ravi.width / 2,

            -ravi.height / 2,

            ravi.width,

            ravi.height

        );

    } else {

        ctx.fillStyle =
            "#ddd";

        ctx.fillRect(
            -ravi.width / 2,
            -ravi.height / 2,
            ravi.width,
            ravi.height
        );

    }


    ctx.restore();


    // BORDER

    ctx.save();

    ctx.translate(
        ravi.x +
        ravi.width / 2,

        ravi.y +
        ravi.height / 2
    );


    ctx.strokeStyle =
        "#111";

    ctx.lineWidth = 4;


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        ravi.width / 2,
        0,
        Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
}


// =============================
// SCORE ON CANVAS
// =============================

function drawCanvasScore() {

    ctx.save();


    ctx.font =
        "bold 42px Arial";

    ctx.textAlign =
        "center";


    // SHADOW

    ctx.fillStyle =
        "rgba(0,0,0,0.25)";

    ctx.fillText(
        score,
        GAME_WIDTH / 2 + 3,
        63
    );


    // SCORE

    ctx.fillStyle =
        "#ffffff";

    ctx.fillText(
        score,
        GAME_WIDTH / 2,
        60
    );


    ctx.restore();
}


// =============================
// GAME LOOP
// =============================

function gameLoop() {

    if (!gameRunning) return;


    frame++;


    updateRavi();

    updatePipes();


    drawBackground();

    drawPipes();

    drawRavi();

    drawCanvasScore();


    requestAnimationFrame(
        gameLoop
    );
}


// =============================
// INITIAL SCREEN
// =============================

drawBackground();

drawRavi();

drawCanvasScore();
