const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");

const startScreen =
  document.getElementById("startScreen");

const gameOverScreen =
  document.getElementById("gameOverScreen");

const startBtn =
  document.getElementById("startBtn");

const restartBtn =
  document.getElementById("restartBtn");

const finalScoreEl =
  document.getElementById("finalScore");

const bestScoreEl =
  document.getElementById("bestScore");

const muteBtn =
  document.getElementById("muteBtn");

const tapHint =
  document.getElementById("tapHint");


/* =========================================
   CHARACTER
========================================= */

const raviImg = new Image();

raviImg.src = "assets/ravi.png";


/* =========================================
   MANOJ TIWARI
========================================= */

const manojImg = new Image();

manojImg.src = "assets/manoj-tiwari.webp";


/* =========================================
   MUSIC
========================================= */

const tracks = [

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

tracks.forEach(audio => {

  audio.preload = "auto";

  audio.volume = 0.72;

});


/* =========================================
   GAME OVER AUDIO
========================================= */

const gameOverAudio =
  new Audio(
    "assets/game-over-manoj-tiwari.mp3"
  );

gameOverAudio.preload = "auto";

gameOverAudio.volume = 0.9;


/* =========================================
   AUDIO SYSTEM
========================================= */

let currentTrack = -1;

let muted = false;


tracks.forEach((audio, i) => {

  audio.addEventListener(
    "ended",
    () => {

      if (running && !muted) {

        playNextTrack(i);

      }

    }
  );

});


function playNextTrack(previous = currentTrack) {

  tracks.forEach(audio => {

    audio.pause();

    audio.currentTime = 0;

  });


  let next =
    (previous + 1) % tracks.length;


  currentTrack = next;


  if (!muted) {

    tracks[currentTrack]
      .play()
      .catch(() => {});

  }

}


function stopMusic() {

  tracks.forEach(audio => {

    audio.pause();

    audio.currentTime = 0;

  });

}


/* =========================================
   MUTE
========================================= */

muteBtn.addEventListener(
  "click",
  (e) => {

    e.stopPropagation();

    muted = !muted;

    muteBtn.textContent =
      muted ? "🔇" : "🔊";


    if (muted) {

      tracks.forEach(audio =>
        audio.pause()
      );

      gameOverAudio.pause();

    }

    else if (running) {

      tracks[currentTrack]
        .play()
        .catch(() => {});

    }

  }
);


/* =========================================
   CANVAS
========================================= */

let W = 520;

let H = 920;

let dpr =
  Math.min(
    window.devicePixelRatio || 1,
    2
  );


function resize() {

  const rect =
    canvas.getBoundingClientRect();


  W = rect.width;

  H = rect.height;


  dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );


  canvas.width =
    Math.floor(W * dpr);

  canvas.height =
    Math.floor(H * dpr);


  ctx.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

}


window.addEventListener(
  "resize",
  resize
);

resize();


/* =========================================
   GAME SETTINGS
========================================= */

const state = {

  gravity: 1250,

  flap: -395,

  speed: 205,

  gap: 190,

  pipeWidth: 72,

  ground: 72

};


/* =========================================
   GAME VARIABLES
========================================= */

let ravi;

let pipes = [];

let particles = [];

let score = 0;

let best =
  Number(
    localStorage.getItem(
      "flappyRaviBest"
    ) || 0
  );

let running = false;

let lastTime = 0;

let spawnTimer = 0;


bestScoreEl.textContent = best;


/* =========================================
   RESET
========================================= */

function resetGame() {

  score = 0;

  scoreEl.textContent = "0";

  pipes = [];

  particles = [];

  spawnTimer = 0;


  ravi = {

    x: W * 0.25,

    y: H * 0.45,

    vy: 0,

    rotation: 0,

    w: Math.min(
      112,
      W * 0.23
    ),

    h: Math.min(
      76,
      W * 0.16
    )

  };


  for (
    let i = 0;
    i < 3;
    i++
  ) {

    spawnPipe(
      W + 100 + i * 260
    );

  }

}


/* =========================================
   CREATE PIPE
========================================= */

function spawnPipe(x) {

  const topMin = 100;

  const bottomMin = 130;

  const playableBottom =
    H - state.ground;


  const gap =
    Math.max(
      150,
      Math.min(
        state.gap,
        H * 0.25
      )
    );


  const maxTop =
    playableBottom -
    bottomMin -
    gap;


  const top =
    topMin +
    Math.random() *
    Math.max(
      20,
      maxTop - topMin
    );


  pipes.push({

    x,

    top,

    gap,

    scored: false,

    /* Random Manoj appearance */

    hasManoj:
      Math.random() < 0.48,

    /* Top or bottom pipe */

    manojOnTop:
      Math.random() < 0.5,

    manojScale:
      0.82 +
      Math.random() * 0.28

  });

}


/* =========================================
   FLAP
========================================= */

function flap() {

  if (!running) return;


  ravi.vy =
    state.flap;


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    particles.push({

      x:
        ravi.x -
        ravi.w * 0.35,

      y:
        ravi.y +
        ravi.h * 0.2,

      vx:
        -70 -
        Math.random() * 80,

      vy:
        (Math.random() - 0.5) *
        80,

      life:
        0.35 +
        Math.random() * 0.2

    });

  }

}


/* =========================================
   START GAME
========================================= */

function startGame() {

  gameOverAudio.pause();

  gameOverAudio.currentTime = 0;


  resetGame();


  running = true;


  startScreen
    .classList
    .add("hidden");


  gameOverScreen
    .classList
    .add("hidden");


  tapHint
    .classList
    .remove("hidden");


  playNextTrack();


  lastTime =
    performance.now();


  requestAnimationFrame(loop);

}


/* =========================================
   GAME OVER
========================================= */

function gameOver() {

  if (!running) return;


  running = false;


  best =
    Math.max(
      best,
      score
    );


  localStorage.setItem(
    "flappyRaviBest",
    best
  );


  finalScoreEl.textContent =
    score;


  bestScoreEl.textContent =
    best;


  gameOverScreen
    .classList
    .remove("hidden");


  tapHint
    .classList
    .add("hidden");


  stopMusic();


  /* GAME OVER SOUND */

  gameOverAudio.currentTime = 0;


  if (!muted) {

    gameOverAudio
      .play()
      .catch(() => {});

  }


  /* Crash particles */

  for (
    let i = 0;
    i < 18;
    i++
  ) {

    particles.push({

      x: ravi.x,

      y: ravi.y,

      vx:
        (Math.random() - 0.5) *
        400,

      vy:
        (Math.random() - 0.5) *
        400,

      life:
        0.5 +
        Math.random() * 0.6

    });

  }

}


/* =========================================
   UPDATE
========================================= */

function update(dt) {

  ravi.vy +=
    state.gravity * dt;


  ravi.y +=
    ravi.vy * dt;


  const targetRotation =
    Math.max(
      -0.45,
      Math.min(
        1.15,
        ravi.vy / 500
      )
    );


  ravi.rotation +=
    (
      targetRotation -
      ravi.rotation
    ) *
    Math.min(
      1,
      dt * 8
    );


  spawnTimer += dt;


  if (spawnTimer > 1.55) {

    spawnTimer = 0;

    spawnPipe(
      W + 30
    );

  }


  for (const p of pipes) {

    p.x -=
      state.speed * dt;


    if (
      !p.scored &&
      p.x + state.pipeWidth <
      ravi.x - ravi.w * 0.3
    ) {

      p.scored = true;

      score++;

      scoreEl.textContent =
        score;

    }

  }


  pipes =
    pipes.filter(
      p =>
        p.x >
        -state.pipeWidth - 20
    );


  for (const particle of particles) {

    particle.x +=
      particle.vx * dt;

    particle.y +=
      particle.vy * dt;

    particle.life -= dt;

  }


  particles =
    particles.filter(
      p => p.life > 0
    );


  /* Ravi hitbox */

  const rx =
    ravi.x -
    ravi.w * 0.30;

  const ry =
    ravi.y -
    ravi.h * 0.28;

  const rw =
    ravi.w * 0.60;

  const rh =
    ravi.h * 0.56;


  /* Ground / ceiling */

  if (
    ravi.y +
      ravi.h * 0.3 >
      H - state.ground ||

    ravi.y -
      ravi.h * 0.3 <
      0
  ) {

    gameOver();

    return;

  }


  /* Pipes */

  for (const p of pipes) {

    const hitX =
      rx + rw > p.x &&
      rx <
        p.x +
        state.pipeWidth;


    const hitTop =
      ry < p.top;


    const hitBottom =
      ry + rh >
      p.top + p.gap;


    if (
      hitX &&
      (hitTop || hitBottom)
    ) {

      gameOver();

      return;

    }

  }

}


/* =========================================
   BACKGROUND
========================================= */

function drawBackground() {

  const sky =
    ctx.createLinearGradient(
      0,
      0,
      0,
      H
    );


  sky.addColorStop(
    0,
    "#55d8ef"
  );


  sky.addColorStop(
    1,
    "#b5f4ff"
  );


  ctx.fillStyle = sky;

  ctx.fillRect(
    0,
    0,
    W,
    H
  );


  /* Clouds */

  ctx.fillStyle =
    "rgba(255,255,255,.72)";


  for (
    let i = 0;
    i < 5;
    i++
  ) {

    const x =
      (
        (
          i * 150 -
          (performance.now() / 90) %
          900
        ) +
        900
      ) %
      900 -
      100;


    const y =
      95 +
      (i % 3) * 80;


    ctx.beginPath();


    ctx.arc(
      x,
      y,
      28,
      0,
      Math.PI * 2
    );


    ctx.arc(
      x + 28,
      y - 12,
      38,
      0,
      Math.PI * 2
    );


    ctx.arc(
      x + 62,
      y,
      28,
      0,
      Math.PI * 2
    );


    ctx.fill();

  }


  /* City */

  ctx.fillStyle =
    "rgba(104,185,196,.45)";


  for (
    let i = 0;
    i < 12;
    i++
  ) {

    const bw =
      35 +
      (i % 4) * 12;


    const bh =
      50 +
      (i % 5) * 25;


    const x =
      i * 55 - 10;


    ctx.fillRect(
      x,
      H -
        state.ground -
        bh,
      bw,
      bh
    );

  }


  /* Grass */

  ctx.fillStyle =
    "#62d85b";


  ctx.fillRect(
    0,
    H - state.ground,
    W,
    state.ground
  );


  ctx.fillStyle =
    "#42ad43";


  ctx.fillRect(
    0,
    H - state.ground,
    W,
    9
  );


  ctx.fillStyle =
    "#e5c76a";


  ctx.fillRect(
    0,
    H - 16,
    W,
    16
  );

}


/* =========================================
   PIPE
========================================= */

function drawPipe(
  x,
  y,
  height,
  capAtBottom
) {

  const capH = 24;

  const capW =
    state.pipeWidth + 12;

  const capX =
    x - 6;


  ctx.fillStyle =
    "#4ab82c";


  ctx.strokeStyle =
    "#236b19";


  ctx.lineWidth = 4;


  if (capAtBottom) {

    ctx.fillRect(
      x,
      y,
      state.pipeWidth,
      height
    );


    ctx.strokeRect(
      x,
      y,
      state.pipeWidth,
      height
    );


    ctx.fillRect(
      capX,
      y + height - capH,
      capW,
      capH
    );


    ctx.strokeRect(
      capX,
      y + height - capH,
      capW,
      capH
    );

  }

  else {

    ctx.fillRect(
      x,
      y,
      state.pipeWidth,
      height
    );


    ctx.strokeRect(
      x,
      y,
      state.pipeWidth,
      height
    );


    ctx.fillRect(
      capX,
      y,
      capW,
      capH
    );


    ctx.strokeRect(
      capX,
      y,
      capW,
      capH
    );

  }


  ctx.fillStyle =
    "rgba(255,255,255,.22)";


  ctx.fillRect(
    x + 10,
    y +
      (
        capAtBottom
          ? 0
          : capH
      ),
    8,
    Math.max(
      0,
      height - capH
    )
  );

}


/* =========================================
   MANOJ TIWARI PIPE STICKER
========================================= */

function drawManojSticker(
  p,
  pipeY,
  pipeHeight,
  onTop
) {

  if (
    !p.hasManoj ||
    !manojImg.complete ||
    pipeHeight < 85
  ) {

    return;

  }


  const size =
    Math.min(
      64,
      state.pipeWidth * 0.88
    ) *
    p.manojScale;


  const cx =
    p.x +
    state.pipeWidth / 2;


  const cy =
    onTop

      ? pipeY +
        Math.min(
          pipeHeight -
            size / 2,
          48 +
            size / 2
        )

      : pipeY +
        Math.max(
          size / 2,
          pipeHeight -
            48 -
            size / 2
        );


  ctx.save();


  /* Sticker background */

  ctx.fillStyle =
    "#fff4c7";


  ctx.strokeStyle =
    "#171717";


  ctx.lineWidth = 4;


  ctx.fillRect(
    cx -
      size / 2 -
      4,

    cy -
      size / 2 -
      4,

    size + 8,

    size + 8
  );


  ctx.strokeRect(
    cx -
      size / 2 -
      4,

    cy -
      size / 2 -
      4,

    size + 8,

    size + 8
  );


  /* Clip photo */

  ctx.beginPath();


  ctx.rect(
    cx - size / 2,
    cy - size / 2,
    size,
    size
  );


  ctx.clip();


  ctx.drawImage(
    manojImg,

    cx -
      size / 2,

    cy -
      size / 2,

    size,
    size
  );


  ctx.restore();

}


/* =========================================
   DRAW PIPES
========================================= */

function drawPipes() {

  for (const p of pipes) {

    /* Top pipe */

    drawPipe(
      p.x,
      0,
      p.top,
      true
    );


    /* Bottom pipe */

    const bottomY =
      p.top + p.gap;


    const bottomHeight =
      H -
      state.ground -
      bottomY;


    drawPipe(
      p.x,
      bottomY,
      bottomHeight,
      false
    );


    /* Random Manoj */

    if (p.manojOnTop) {

      drawManojSticker(
        p,
        0,
        p.top,
        true
      );

    }

    else {

      drawManojSticker(
        p,
        bottomY,
        bottomHeight,
        false
      );

    }

  }

}


/* =========================================
   DRAW RAVI
========================================= */

function drawRavi() {

  if (!raviImg.complete)
    return;


  ctx.save();


  ctx.translate(
    ravi.x,
    ravi.y
  );


  ctx.rotate(
    ravi.rotation
  );


  /*
    IMPORTANT:

    No circle.
    No egg blob.
    No background shape.

    Ravi PNG is transparent.
  */


  ctx.drawImage(

    raviImg,

    -ravi.w / 2,

    -ravi.h / 2,

    ravi.w,

    ravi.h

  );


  ctx.restore();

}


/* =========================================
   PARTICLES
========================================= */

function drawParticles() {

  for (const p of particles) {

    ctx.globalAlpha =
      Math.max(
        0,
        p.life
      );


    ctx.fillStyle =
      "#ffb000";


    ctx.fillRect(
      p.x,
      p.y,
      5,
      5
    );

  }


  ctx.globalAlpha = 1;

}


/* =========================================
   DRAW EVERYTHING
========================================= */

function draw() {

  drawBackground();

  drawPipes();

  drawParticles();

  drawRavi();

}


/* =========================================
   GAME LOOP
========================================= */

function loop(now) {

  if (!running) {

    draw();

    return;

  }


  const dt =
    Math.min(
      0.032,
      (now - lastTime) /
      1000
    );


  lastTime = now;


  update(dt);

  draw();


  if (running) {

    requestAnimationFrame(
      loop
    );

  }

}


/* =========================================
   CONTROLS
========================================= */

function userFlap(e) {

  if (e)
    e.preventDefault();

  flap();

}


startBtn.addEventListener(
  "click",
  startGame
);


restartBtn.addEventListener(
  "click",
  startGame
);


canvas.addEventListener(
  "pointerdown",
  userFlap
);


window.addEventListener(
  "keydown",
  (e) => {

    if (e.code === "Space") {

      e.preventDefault();


      if (!running) {

        startGame();

      }

      else {

        flap();

      }

    }

  }
);


/* =========================================
   INITIALIZE
========================================= */

resetGame();

draw();
