"use strict";

/* ============================================================
   BIRTHDAY GIFT EXPERIENCE
   Aa, M Gilang Ramadhan
============================================================ */

/* ============================================================
   STATE
============================================================ */

const state = {
  pinUnlocked: false,
  currentScene: "opening",
  previousScene: null,
  musicPlaying: false,
  musicMuted: false,
  currentPhoto: 1,

  cakeBlown: false,

  math: {
    question: 0,
    score: 0,
    questions: []
  },

  english: {
    question: 0,
    score: 0
  },

  star: {
    running: false,
    score: 0,
    combo: 0,
    time: 20
  }
};

/* ============================================================
   DOM HELPERS
============================================================ */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/* ============================================================
   ELEMENTS
============================================================ */

const pinScreen = $("#pinScreen");
const pinCard = $(".pin-card");
const pinInput = $("#pinInput");
const pinButton = $("#pinButton");
const pinError = $("#pinError");
const pinDots = $$("#pinDots i");

const app = $("#app");
const navigation = $("#navigation");
const menuButton = $("#menuButton");
const closeMenu = $("#closeMenu");

const musicButton = $("#musicButton");
const musicPlayer = $("#musicPlayer");
const birthdayAudio = $("#birthdayAudio");

const playMusic = $("#playMusic");
const pauseMusic = $("#pauseMusic");
const muteMusic = $("#muteMusic");
const musicStatus = $("#musicStatus");
const musicProgress = $("#musicProgress");

const sceneContainer = $("#sceneContainer");
const scenes = $$(".scene");

const giftBox = $("#giftBox");
const openGift = $("#openGift");
const giftText = $("#giftText");

const blowCandles = $("#blowCandles");
const cake = $("#cake");
const candleStatus = $("#candleStatus");
const smokeContainer = $("#smokeContainer");

const wishInput = $("#wishInput");
const wishCount = $("#wishCount");
const releaseWish = $("#releaseWish");
const wishSky = $("#wishSky");

/* ============================================================
   DECORATIONS
   58 CODE-GENERATED INSTANCES
============================================================ */

function createDecorations() {

  const container = $("#decorations");

  if (!container) return;

  const types = [
    "dot",
    "star",
    "ring",
    "square",
    "cross",
    "line"
  ];

  const positions = [
    [6,12],[16,8],[28,15],[42,7],[58,13],[72,9],[87,17],
    [93,30],[8,33],[19,27],[31,38],[49,30],[65,35],[78,27],
    [3,52],[14,47],[26,59],[38,51],[53,58],[68,49],[84,56],
    [96,63],[7,72],[21,67],[34,76],[48,69],[62,78],[79,70],
    [92,82],[12,89],[29,91],[45,87],[58,94],[74,89],[88,93],
    [5,23],[23,18],[37,24],[55,20],[70,22],[90,20],
    [11,42],[29,45],[44,41],[59,45],[76,42],[89,48],
    [17,60],[40,63],[57,61],[73,62],[95,70],
    [18,82],[35,84],[52,82],[68,86],[82,79],[95,88]
  ];

  positions.forEach((position, index) => {

    const element = document.createElement("span");

    const type = types[index % types.length];

    element.className = `decor decor-${type}`;

    const size = type === "line"
      ? `${35 + (index % 4) * 15}px`
      : `${3 + (index % 4)}px`;

    element.style.left = `${position[0]}%`;
    element.style.top = `${position[1]}%`;
    element.style.setProperty("--size", size);
    element.style.setProperty(
      "--duration",
      `${4 + (index % 6)}s`
    );

    element.style.setProperty(
      "--rotation",
      `${-35 + (index % 7) * 12}deg`
    );

    container.appendChild(element);
  });
}

createDecorations();

/* ============================================================
   PIN SYSTEM
============================================================ */

const CORRECT_PIN = "230226";

function updatePinDots() {

  const value = pinInput.value;

  pinDots.forEach((dot, index) => {
    dot.classList.toggle(
      "filled",
      index < value.length
    );
  });
}

function submitPin() {

  const value = pinInput.value.trim();

  if (value === CORRECT_PIN) {

    state.pinUnlocked = true;

    pinError.textContent = "";

    pinDots.forEach(dot => {
      dot.classList.add("filled");
    });

    pinCard.style.boxShadow =
      "0 0 80px rgba(91,145,255,.35)";

    setTimeout(() => {

      pinScreen.classList.add("exit");
      app.classList.remove("locked");

      playMusicAutomatically();

      setTimeout(() => {
        pinScreen.remove();
      }, 850);

    }, 500);

    return;
  }

  pinError.textContent =
    "PIN belum tepat. coba lagi.";

  pinCard.classList.remove("error");

  void pinCard.offsetWidth;

  pinCard.classList.add("error");

  pinInput.value = "";

  updatePinDots();
}

pinInput.addEventListener("input", () => {

  pinInput.value =
    pinInput.value.replace(/\D/g, "").slice(0, 6);

  updatePinDots();

  if (pinInput.value.length === 6) {
    submitPin();
  }
});

pinButton.addEventListener("click", submitPin);

pinScreen.addEventListener("click", event => {

  if (
    event.target === pinScreen ||
    event.target === pinCard ||
    event.target.closest(".pin-card")
  ) {
    pinInput.focus();
  }
});

/* ============================================================
   SCENE MANAGEMENT
============================================================ */

function getSceneElement(name) {
  return document.querySelector(
    `.scene[data-scene="${name}"]`
  );
}

function showScene(name, direction = "forward") {

  const nextScene = getSceneElement(name);

  if (!nextScene) return;

  const currentScene =
    getSceneElement(state.currentScene);

  if (currentScene === nextScene) return;

  scenes.forEach(scene => {
    scene.classList.remove("active", "exit-left");
  });

  if (currentScene) {

    if (direction === "back") {
      currentScene.classList.add("exit-left");
    }
  }

  state.previousScene = state.currentScene;
  state.currentScene = name;

  nextScene.classList.add("active");

  updateNavigation();

  closeNavigation();

  window.dispatchEvent(
    new CustomEvent("scenechange", {
      detail: {
        scene: name
      }
    })
  );
}

function goNext(name) {
  showScene(name, "forward");
}

function goBack(name) {
  showScene(name, "back");
}

$$(".scene-next").forEach(button => {

  button.addEventListener("click", () => {

    const next = button.dataset.next;

    if (next) {
      goNext(next);
    }
  });
});

$$(".scene-back").forEach(button => {

  button.addEventListener("click", () => {

    const back = button.dataset.back;

    if (back) {
      goBack(back);
    }
  });
});

/* ============================================================
   NAVIGATION
============================================================ */

function openNavigation() {

  navigation.classList.add("open");

  menuButton.setAttribute(
    "aria-expanded",
    "true"
  );
}

function closeNavigation() {

  navigation.classList.remove("open");

  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );
}

menuButton.addEventListener(
  "click",
  openNavigation
);

closeMenu.addEventListener(
  "click",
  closeNavigation
);

$$("#navLinks button").forEach(button => {

  button.addEventListener("click", () => {

    const target = button.dataset.scene;

    if (target) {
      showScene(target);
    }
  });
});

function updateNavigation() {

  $$("#navLinks button").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.scene === state.currentScene
    );
  });
}

updateNavigation();

/* ============================================================
   KEYBOARD NAVIGATION
============================================================ */

document.addEventListener("keydown", event => {

  if (!state.pinUnlocked) return;

  if (event.key === "Escape") {
    closeNavigation();
  }

});

/* ============================================================
   MUSIC
============================================================ */

async function playMusic() {

  try {

    birthdayAudio.volume = .42;

    await birthdayAudio.play();

    state.musicPlaying = true;

    musicButton.classList.add("playing");

    musicStatus.textContent = "music playing";

  } catch (error) {

    state.musicPlaying = false;

    musicStatus.textContent =
      "tap play to start music";

  }
}

function playMusicAutomatically() {

  /*
    Browser autoplay policies may block this.
    We intentionally ignore the rejection.
  */

  playMusic();
}

function pauseMusic() {

  birthdayAudio.pause();

  state.musicPlaying = false;

  musicButton.classList.remove("playing");

  musicStatus.textContent = "music paused";
}

function toggleMusic() {

  if (state.musicPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
}

musicButton.addEventListener(
  "click",
  toggleMusic
);

playMusic.addEventListener(
  "click",
  playMusic
);

pauseMusic.addEventListener(
  "click",
  pauseMusic
);

muteMusic.addEventListener("click", () => {

  birthdayAudio.muted =
    !birthdayAudio.muted;

  state.musicMuted =
    birthdayAudio.muted;

  muteMusic.textContent =
    birthdayAudio.muted
      ? "unmute"
      : "mute";
});

birthdayAudio.addEventListener(
  "timeupdate",
  () => {

    if (!birthdayAudio.duration) return;

    const percentage =
      birthdayAudio.currentTime /
      birthdayAudio.duration *
      100;

    musicProgress.style.width =
      `${percentage}%`;
  }
);

birthdayAudio.addEventListener(
  "error",
  () => {

    musicStatus.textContent =
      "music file unavailable";
  }
);

/*
  If autoplay was blocked, the first interaction
  starts music.
*/

document.addEventListener(
  "pointerdown",
  () => {

    if (
      state.pinUnlocked &&
      !state.musicPlaying &&
      !state.musicMuted
    ) {
      playMusic();
    }

  },
  {
    once: true,
    passive: true
  }
);

/* ============================================================
   GIFT
============================================================ */

function createGiftParticles() {

  const container = $("#giftParticles");

  if (!container) return;

  container.innerHTML = "";

  for (let i = 0; i < 18; i++) {

    const particle =
      document.createElement("span");

    const x =
      `${Math.round(
        Math.random() * 180 - 90
      )}px`;

    const y =
      `${Math.round(
        -60 - Math.random() * 100
      )}px`;

    particle.style.setProperty(
      "--x",
      x
    );

    particle.style.setProperty(
      "--y",
      y
    );

    particle.style.left =
      `${40 + Math.random() * 20}%`;

    particle.style.top =
      `${40 + Math.random() * 15}%`;

    container.appendChild(particle);
  }
}

createGiftParticles();

function openGiftBox() {

  if (giftBox.classList.contains("opened")) {

    goNext("letter");

    return;
  }

  giftBox.classList.add("opened");

  giftText.textContent =
    "hadiahnya terbuka.";

  openGift.textContent =
    "Lanjut";

  createGiftParticles();
}

giftBox.addEventListener(
  "click",
  openGiftBox
);

openGift.addEventListener(
  "click",
  openGiftBox
);

/* ============================================================
   REAL-TIME CLOCK
============================================================ */

const clockConfig = [
  {
    id: "Jakarta",
    timeZone: "Asia/Jakarta",
    locale: "id-ID"
  },
  {
    id: "Makassar",
    timeZone: "Asia/Makassar",
    locale: "id-ID"
  },
  {
    id: "Jayapura",
    timeZone: "Asia/Jayapura",
    locale: "id-ID"
  },
  {
    id: "Tokyo",
    timeZone: "Asia/Tokyo",
    locale: "ja-JP"
  }
];

function getTimeParts(timeZone) {

  const date = new Date();

  const formatter =
    new Intl.DateTimeFormat(
      "en-GB",
      {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      }
    );

  return formatter.format(date);
}

function getDateParts(
  timeZone,
  locale = "id-ID"
) {

  return new Intl.DateTimeFormat(
    locale,
    {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(new Date());
}

function updateClocks() {

  clockConfig.forEach(config => {

    const clock =
      $(`#clock${config.id}`);

    const date =
      $(`#date${config.id}`);

    if (!clock || !date) return;

    clock.textContent =
      getTimeParts(config.timeZone);

    date.textContent =
      getDateParts(
        config.timeZone,
        config.locale
      );
  });
}

updateClocks();

setInterval(
  updateClocks,
  1000
);

/* ============================================================
   CAKE
============================================================ */

let cakePointer = {
  x: 0,
  y: 0
};

cake.addEventListener(
  "pointermove",
  event => {

    const rect =
      cake.getBoundingClientRect();

    const x =
      (event.clientX - rect.left) /
      rect.width;

    const y =
      (event.clientY - rect.top) /
      rect.height;

    cakePointer.x =
      (x - .5) * 2;

    cakePointer.y =
      (y - .5) * 2;

    cake.style.transform =
      `
      rotateX(${7 - cakePointer.y * 6}deg)
      rotateY(${cakePointer.x * 10}deg)
      `;
  },
  {
    passive: true
  }
);

cake.addEventListener(
  "pointerleave",
  () => {

    cake.style.transform =
      "rotateX(7deg) rotateY(0deg)";
  }
);

function blowOutCandles() {

  if (state.cakeBlown) return;

  state.cakeBlown = true;

  cake.classList.add("blown");

  candleStatus.textContent =
    "wish made.";

  createSmoke();

  createCakeParticles();
}

function createSmoke() {

  const positions = [
    104,
    124,
    144
  ];

  positions.forEach((left, index) => {

    const smoke =
      document.createElement("span");

    smoke.className = "smoke";

    smoke.style.left =
      `${left}px`;

    smoke.style.bottom =
      `${228 + index * 2}px`;

    smoke.style.setProperty(
      "--sx",
      `${index % 2 === 0 ? -12 : 13}px`
    );

    smokeContainer.appendChild(smoke);

    setTimeout(() => {
      smoke.remove();
    }, 1800);
  });
}

function createCakeParticles() {

  for (let i = 0; i < 18; i++) {

    const particle =
      document.createElement("span");

    particle.className =
      "decor decor-star";

    particle.style.position =
      "absolute";

    particle.style.left =
      `${50 + Math.random() * 30 - 15}%`;

    particle.style.top =
      `${40 + Math.random() * 20}%`;

    particle.style.setProperty(
      "--size",
      `${3 + Math.random() * 4}px`
    );

    particle.style.setProperty(
      "--duration",
      "1.5s"
    );

    cake.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 1500);
  }
}

blowCandles.addEventListener(
  "click",
  blowOutCandles
);

/* ============================================================
   OPTIONAL MICROPHONE SUPPORT
============================================================ */

async function tryMicrophoneBlowDetection() {

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    return;
  }

  /*
    Microphone remains optional.
    The main interaction never depends on it.
  */

  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio: true
      });

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContext) {

      stream.getTracks().forEach(
        track => track.stop()
      );

      return;
    }

    const context =
      new AudioContext();

    const analyser =
      context.createAnalyser();

    analyser.fftSize = 512;

    const source =
      context.createMediaStreamSource(stream);

    source.connect(analyser);

    const data =
      new Uint8Array(
        analyser.fftSize
      );

    let started = false;

    function detect() {

      if (state.cakeBlown) {

        stream.getTracks().forEach(
          track => track.stop()
        );

        context.close();

        return;
      }

      analyser.getByteTimeDomainData(data);

      let sum = 0;

      for (let i = 0; i < data.length; i++) {

        const value =
          (data[i] - 128) / 128;

        sum += value * value;
      }

      const rms =
        Math.sqrt(sum / data.length);

      if (rms > .18) {

        started = true;

      } else if (
        started &&
        rms < .06
      ) {

        blowOutCandles();

        stream.getTracks().forEach(
          track => track.stop()
        );

        context.close();

        return;
      }

      requestAnimationFrame(detect);
    }

    detect();

  } catch {
    /*
      Permission denied or unavailable.
      Click fallback remains functional.
    }
  }
}

/*
  The microphone function exists as an optional enhancement.
  It is intentionally not automatically requested.
*/

window.enableOptionalBlowDetection =
  tryMicrophoneBlowDetection;

/* ============================================================
   WISH
============================================================ */

wishInput.addEventListener(
  "input",
  () => {

    wishCount.textContent =
      `${wishInput.value.length} / 120`;
  }
);

function releaseWishIntoSky() {

  const text =
    wishInput.value.trim();

  if (!text) {

    wishInput.focus();

    return;
  }

  const object =
    document.createElement("div");

  object.className =
    "wish-object";

  object.textContent = text;

  object.style.setProperty(
    "--drift",
    `${Math.round(
      Math.random() * 120 - 60
    )}px`
  );

  wishSky.appendChild(object);

  wishInput.value = "";

  wishCount.textContent =
    "0 / 120";

  setTimeout(() => {
    object.remove();
  }, 4200);
}

releaseWish.addEventListener(
  "click",
  releaseWishIntoSky
);

wishInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {

      event.preventDefault();

      releaseWishIntoSky();
    }
  }
);

/* ============================================================
   LOVE THREAD
============================================================ */

const heartCanvas = $("#heartCanvas");
const heartContext =
  heartCanvas.getContext("2d");

let heartPoints = [];
let heartAnimationFrame = null;

function resizeHeartCanvas() {

  const rect =
    heartCanvas.getBoundingClientRect();

  const dpr =
    Math.min(window.devicePixelRatio || 1, 2);

  heartCanvas.width =
    rect.width * dpr;

  heartCanvas.height =
    rect.height * dpr;

  heartContext.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  createHeartPoints();
}

function createHeartPoints() {

  heartPoints = [];

  const rect =
    heartCanvas.getBoundingClientRect();

  const width = rect.width;
  const height = rect.height;

  const scale =
    Math.min(width, height) / 38;

  const centerX =
    width / 2;

  const centerY =
    height / 2 + 7;

  for (
    let t = 0;
    t < Math.PI * 2;
    t += .035
  ) {

    const x =
      16 *
      Math.pow(Math.sin(t), 3);

    const y =
      -(
        13 * Math.cos(t)
        - 5 * Math.cos(2 * t)
        - 2 * Math.cos(3 * t)
        - Math.cos(4 * t)
      );

    heartPoints.push({
      x: centerX + x * scale,
      y: centerY + y * scale
    });
  }
}

function drawHeart(time = 0) {

  const rect =
    heartCanvas.getBoundingClientRect();

  heartContext.clearRect(
    0,
    0,
    rect.width,
    rect.height
  );

  if (!heartPoints.length) {

    heartAnimationFrame =
      requestAnimationFrame(drawHeart);

    return;
  }

  const progress =
    Math.min(
      1,
      (performance.now() - heartStart) / 2600
    );

  const visible =
    Math.max(
      2,
      Math.floor(
        heartPoints.length * progress
      )
    );

  heartContext.save();

  heartContext.lineWidth = 1.2;
  heartContext.lineCap = "round";
  heartContext.lineJoin = "round";

  for (let layer = 0; layer < 3; layer++) {

    heartContext.beginPath();

    const depth =
      layer * 1.8;

    for (
      let i = 0;
      i < visible;
      i++
    ) {

      const point =
        heartPoints[i];

      const wave =
        Math.sin(
          time * .0015 +
          i * .05
        ) * .7;

      const x =
        point.x + wave + depth;

      const y =
        point.y +
        Math.cos(
          time * .0012 +
          i * .06
        ) * .7 +
        depth;

      if (i === 0) {
        heartContext.moveTo(x, y);
      } else {
        heartContext.lineTo(x, y);
      }
    }

    heartContext.strokeStyle =
      layer === 0
        ? "rgba(188,53,75,.92)"
        : layer === 1
          ? "rgba(131,33,51,.55)"
          : "rgba(90,26,41,.4)";

    heartContext.shadowBlur =
      layer === 0 ? 10 : 3;

    heartContext.shadowColor =
      "rgba(154,36,57,.45)";

    heartContext.stroke();
  }

  heartContext.restore();

  heartAnimationFrame =
    requestAnimationFrame(drawHeart);
}

let heartStart = performance.now();

function startHeartAnimation() {

  if (heartAnimationFrame) {

    cancelAnimationFrame(
      heartAnimationFrame
    );
  }

  heartStart = performance.now();

  createHeartPoints();

  heartAnimationFrame =
    requestAnimationFrame(drawHeart);
}

window.addEventListener(
  "resize",
  resizeHeartCanvas
);

resizeHeartCanvas();

window.addEventListener(
  "scenechange",
  event => {

    if (
      event.detail.scene === "thread"
    ) {
      setTimeout(
        startHeartAnimation,
        100
      );
    }
  }
);

/* ============================================================
   MATH GAME
============================================================ */

function generateMathQuestion() {

  const type =
    Math.floor(Math.random() * 4);

  let a;
  let b;
  let answer;
  let symbol;

  if (type === 0) {

    a =
      Math.floor(Math.random() * 20) + 1;

    b =
      Math.floor(Math.random() * 20) + 1;

    answer = a + b;
    symbol = "+";

  } else if (type === 1) {

    a =
      Math.floor(Math.random() * 30) + 10;

    b =
      Math.floor(Math.random() * 10) + 1;

    answer = a - b;
    symbol = "−";

  } else if (type === 2) {

    a =
      Math.floor(Math.random() * 9) + 2;

    b =
      Math.floor(Math.random() * 9) + 2;

    answer = a * b;
    symbol = "×";

  } else {

    b =
      Math.floor(Math.random() * 8) + 2;

    answer =
      Math.floor(Math.random() * 9) + 2;

    a = b * answer;

    symbol = "÷";
  }

  return {
    text: `${a} ${symbol} ${b} = ?`,
    answer
  };
}

function setupMathGame() {

  state.math.question = 0;
  state.math.score = 0;
  state.math.questions = [];

  for (let i = 0; i < 5; i++) {
    state.math.questions.push(
      generateMathQuestion()
    );
  }

  updateMathUI();
}

function updateMathUI() {

  const current =
    state.math.questions[
      state.math.question
    ];

  if (!current) return;

  $("#mathQuestion").textContent =
    current.text;

  $("#mathQuestionNumber").textContent =
    state.math.question + 1;

  $("#mathScore").textContent =
    `${state.math.score} pts`;

  $("#mathAnswer").value = "";

  $("#mathFeedback").textContent = "";
}

function checkMathAnswer() {

  const input =
    $("#mathAnswer");

  const answer =
    Number(input.value);

  const current =
    state.math.questions[
      state.math.question
    ];

  if (!current) return;

  if (answer === current.answer) {

    state.math.score += 20;

    $("#mathFeedback").textContent =
      "benar. lanjut.";

  } else {

    $("#mathFeedback").textContent =
      `belum tepat. jawabannya ${current.answer}.`;
  }

  setTimeout(() => {

    state.math.question++;

    if (
      state.math.question >= 5
    ) {

      $("#mathQuestion").textContent =
        `selesai — ${state.math.score} pts`;

      $("#mathFeedback").textContent =
        "game selesai. tekan restart untuk bermain lagi.";

      return;
    }

    updateMathUI();

  }, 700);
}

$("#mathCheck").addEventListener(
  "click",
  checkMathAnswer
);

$("#mathAnswer").addEventListener(
  "keydown",
  event => {

    if (event.key === "Enter") {
      checkMathAnswer();
    }
  }
);

$("#mathRestart").addEventListener(
  "click",
  setupMathGame
);

setupMathGame();

/* ============================================================
   ENGLISH GAME
============================================================ */

const englishQuestions = [
  {
    question: "happy",
    options: [
      "sedih",
      "bahagia",
      "marah"
    ],
    answer: 1
  },
  {
    question: "beautiful",
    options: [
      "indah",
      "cepat",
      "dingin"
    ],
    answer: 0
  },
  {
    question: "strong",
    options: [
      "lemah",
      "kuat",
      "kecil"
    ],
    answer: 1
  },
  {
    question: "tired",
    options: [
      "lelah",
      "senang",
      "tinggi"
    ],
    answer: 0
  },
  {
    question: "dream",
    options: [
      "mimpi",
      "hujan",
      "rumah"
    ],
    answer: 0
  }
];

function updateEnglishUI() {

  const item =
    englishQuestions[
      state.english.question
    ];

  if (!item) return;

  $("#englishQuestion").textContent =
    item.question;

  $("#englishQuestionNumber").textContent =
    state.english.question + 1;

  $("#englishScore").textContent =
    `${state.english.score} pts`;

  const options =
    $("#englishOptions");

  options.innerHTML = "";

  item.options.forEach(
    (option, index) => {

      const button =
        document.createElement("button");

      button.className =
        "english-option";

      button.type = "button";

      button.textContent =
        `${String.fromCharCode(65 + index)}. ${option}`;

      button.addEventListener(
        "click",
        () => checkEnglish(index)
      );

      options.appendChild(button);
    }
  );

  $("#englishFeedback").textContent = "";
}

function checkEnglish(selected) {

  const item =
    englishQuestions[
      state.english.question
    ];

  const buttons =
    $$(".english-option");

  buttons.forEach(button => {
    button.disabled = true;
  });

  if (selected === item.answer) {

    state.english.score += 20;

    $("#englishFeedback").textContent =
      "benar.";
  } else {

    $("#englishFeedback").textContent =
      `jawaban yang tepat: ${item.options[item.answer]}`;
  }

  setTimeout(() => {

    state.english.question++;

    if (
      state.english.question >=
      englishQuestions.length
    ) {

      $("#englishQuestion").textContent =
        `selesai — ${state.english.score} pts`;

      $("#englishOptions").innerHTML = "";

      $("#englishFeedback").textContent =
        "game selesai. tekan restart untuk bermain lagi.";

      return;
    }

    updateEnglishUI();

  }, 750);
}

$("#englishRestart").addEventListener(
  "click",
  () => {

    state.english.question = 0;
    state.english.score = 0;

    updateEnglishUI();
  }
);

updateEnglishUI();

/* ============================================================
   GAME HUB
============================================================ */

$$(".game-card").forEach(card => {

  card.addEventListener(
    "click",
    () => {

      const game =
        card.dataset.game;

      $$(".game-card").forEach(
        item => item.classList.remove("active")
      );

      $$(".game-panel").forEach(
        panel => panel.classList.remove("active")
      );

      card.classList.add("active");

      const target =
        $(`#${game}Game`);

      if (target) {
        target.classList.add("active");
      }
    }
  );
});

/*
  Open Math by default.
*/

const defaultGame =
  document.querySelector(
    '[data-game="math"]'
  );

if (defaultGame) {
  defaultGame.click();
}

/* ============================================================
   STAR RUN
============================================================ */

const starCanvas = $("#starCanvas");
const starContext =
  starCanvas.getContext("2d");

const starGame = {
  player: {
    x: 0,
    y: 0,
    radius: 12,
    speed: 4
  },

  stars: [],

  animation: null,
  timerInterval: null,
  lastTime: 0
};

function resizeStarCanvas() {

  const rect =
    starCanvas.getBoundingClientRect();

  const dpr =
    Math.min(
      window.devicePixelRatio || 1,
      2
    );

  starCanvas.width =
    rect.width * dpr;

  starCanvas.height =
    rect.height * dpr;

  starContext.setTransform(
    dpr,
    0,
    0,
    dpr,
    0,
    0
  );

  starGame.player.x =
    rect.width / 2;

  starGame.player.y =
    rect.height / 2;
}

function spawnStar() {

  const rect =
    starCanvas.getBoundingClientRect();

  starGame.stars.push({
    x: 20 + Math.random() * (rect.width - 40),
    y: 20 + Math.random() * (rect.height - 40),
    radius: 5 + Math.random() * 3,
    rotation: Math.random() * Math.PI,
    pulse: Math.random() * Math.PI * 2
  });
}

function drawGameStar(
  context,
  x,
  y,
  radius,
  rotation
) {

  context.save();

  context.translate(x, y);
  context.rotate(rotation);

  context.beginPath();

  for (let i = 0; i < 10; i++) {

    const angle =
      -Math.PI / 2 +
      i * Math.PI / 5;

    const r =
      i % 2 === 0
        ? radius
        : radius * .4;

    const px =
      Math.cos(angle) * r;

    const py =
      Math.sin(angle) * r;

    if (i === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }

  context.closePath();

  context.fillStyle =
    "rgba(188,215,255,.9)";

  context.shadowBlur = 10;
  context.shadowColor =
    "rgba(103,155,255,.8)";

  context.fill();

  context.restore();
}

function drawStarRun(timestamp) {

  if (!starGame.running) return;

  const rect =
    starCanvas.getBoundingClientRect();

  starContext.clearRect(
    0,
    0,
    rect.width,
    rect.height
  );

  /*
    Background
  */

  const gradient =
    starContext.createRadialGradient(
      rect.width / 2,
      rect.height / 2,
      10,
      rect.width / 2,
      rect.height / 2,
      rect.width
    );

  gradient.addColorStop(
    0,
    "rgba(34,68,136,.25)"
  );

  gradient.addColorStop(
    1,
    "rgba(1,6,17,.85)"
  );

  starContext.fillStyle =
    gradient;

  starContext.fillRect(
    0,
    0,
    rect.width,
    rect.height
  );

  /*
    Background stars
  */

  for (let i = 0; i < 25; i++) {

    const x =
      (i * 71) % rect.width;

    const y =
      (i * 43) % rect.height;

    starContext.fillStyle =
      "rgba(165,193,244,.28)";

    starContext.fillRect(
      x,
      y,
      1,
      1
    );
  }

  /*
    Game stars
  */

  starGame.stars.forEach(
    star => {

      star.pulse += .04;

      const scale =
        1 +
        Math.sin(star.pulse) * .12;

      drawGameStar(
        starContext,
        star.x,
        star.y,
        star.radius * scale,
        star.rotation
      );
    }
  );

  /*
    Player
  */

  const player =
    starGame.player;

  starContext.beginPath();

  starContext.arc(
    player.x,
    player.y,
    player.radius,
    0,
    Math.PI * 2
  );

  starContext.fillStyle =
    "rgba(123,161,235,.9)";

  starContext.shadowBlur = 18;
  starContext.shadowColor =
    "rgba(91,145,255,.8)";

  starContext.fill();

  starContext.beginPath();

  starContext.arc(
    player.x,
    player.y,
    player.radius * .35,
    0,
    Math.PI * 2
  );

  starContext.fillStyle =
    "rgba(240,247,255,.95)";

  starContext.fill();

  /*
    Collision
  */

  for (
    let i = starGame.stars.length - 1;
    i >= 0;
    i--
  ) {

    const star =
      starGame.stars[i];

    const dx =
      player.x - star.x;

    const dy =
      player.y - star.y;

    const distance =
      Math.sqrt(
        dx * dx + dy * dy
      );

    if (
      distance <
      player.radius + star.radius + 4
    ) {

      starGame.stars.splice(i, 1);

      state.star.score += 10;
      state.star.combo++;

      $("#starScore").textContent =
        state.star.score;

      $("#starCombo").textContent =
        state.star.combo;

      spawnStar();
    }
  }

  starGame.animation =
    requestAnimationFrame(
      drawStarRun
    );
}

function startStarRun() {

  if (starGame.running) return;

  resizeStarCanvas();

  starGame.running = true;
  state.star.score = 0;
  state.star.combo = 0;
  state.star.time = 20;

  starGame.stars = [];

  for (let i = 0; i < 5; i++) {
    spawnStar();
  }

  $("#starScore").textContent = "0";
  $("#starCombo").textContent = "0";
  $("#starTimer").textContent = "20";

  clearInterval(
    starGame.timerInterval
  );

  starGame.timerInterval =
    setInterval(() => {

      if (!starGame.running) return;

      state.star.time--;

      $("#starTimer").textContent =
        state.star.time;

      if (state.star.time <= 0) {
        stopStarRun();
      }

    }, 1000);

  starGame.animation =
    requestAnimationFrame(
      drawStarRun
    );
}

function stopStarRun() {

  starGame.running = false;

  clearInterval(
    starGame.timerInterval
  );

  if (starGame.animation) {

    cancelAnimationFrame(
      starGame.animation
    );

    starGame.animation = null;
  }
}

function restartStarRun() {

  stopStarRun();

  state.star.score = 0;
  state.star.combo = 0;
  state.star.time = 20;

  $("#starScore").textContent = "0";
  $("#starCombo").textContent = "0";
  $("#starTimer").textContent = "20";

  starGame.stars = [];

  resizeStarCanvas();
}

$("#starStart").addEventListener(
  "click",
  startStarRun
);

$("#starRestart").addEventListener(
  "click",
  restartStarRun
);

function movePlayer(clientX, clientY) {

  if (!starGame.running) return;

  const rect =
    starCanvas.getBoundingClientRect();

  starGame.player.x =
    Math.max(
      12,
      Math.min(
        rect.width - 12,
        clientX - rect.left
      )
    );

  starGame.player.y =
    Math.max(
      12,
      Math.min(
        rect.height - 12,
        clientY - rect.top
      )
    );
}

starCanvas.addEventListener(
  "pointermove",
  event => {

    if (
      event.pointerType === "mouse" &&
      event.buttons === 0
    ) {
      return;
    }

    movePlayer(
      event.clientX,
      event.clientY
    );
  }
);

starCanvas.addEventListener(
  "pointerdown",
  event => {

    starCanvas.setPointerCapture(
      event.pointerId
    );

    movePlayer(
      event.clientX,
      event.clientY
    );
  }
);

window.addEventListener(
  "resize",
  resizeStarCanvas
);

resizeStarCanvas();

/* ============================================================
   VISIBILITY PERFORMANCE
============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.visibilityState === "hidden"
    ) {

      /*
        Pause game animation while page
        is not visible.
      */

      if (starGame.running) {

        stopStarRun();

        $("#starTimer").textContent =
          state.star.time;
      }

    }
  }
);

/* ============================================================
   REPLAY
============================================================ */

$("#replayButton").addEventListener(
  "click",
  () => {

    state.currentScene = "opening";

    scenes.forEach(scene => {
      scene.classList.remove(
        "active",
        "exit-left"
      );
    });

    const opening =
      getSceneElement("opening");

    if (opening) {
      opening.classList.add("active");
    }

    state.cakeBlown = false;

    cake.classList.remove("blown");

    candleStatus.textContent =
      "klik untuk meniup lilin";

    state.math.question = 0;
    state.math.score = 0;

    setupMathGame();

    state.english.question = 0;
    state.english.score = 0;

    updateEnglishUI();

    restartStarRun();

    updateNavigation();

    closeNavigation();

    if (
      !state.musicPlaying
    ) {
      playMusic();
    }
  }
);

/* ============================================================
   SCENE INITIALIZATION
============================================================ */

const openingScene =
  getSceneElement("opening");

if (openingScene) {
  openingScene.classList.add("active");
}

/* ============================================================
   ERROR SAFETY
============================================================ */

window.addEventListener(
  "error",
  event => {

    /*
      Prevent accidental uncaught media errors
      from disrupting the experience.
    */

    if (
      event.target === birthdayAudio
    ) {
      musicStatus.textContent =
        "music file unavailable";
    }
  },
  true
);

/* ============================================================
   PRELOAD FIRST PHOTOS
============================================================ */

const preloadImages = [
  "photos/photo-01.jpg",
  "photos/photo-02.jpg"
];

preloadImages.forEach(src => {

  const image =
    new Image();

  image.src = src;
});

/* ============================================================
   END
============================================================ */