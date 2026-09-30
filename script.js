"use strict";

/* ============================================================
   BIRTHDAY GIFT
   CORE APPLICATION
============================================================ */

/* ============================================================
   HELPERS
============================================================ */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  [...parent.querySelectorAll(selector)];

/* ============================================================
   DOM
============================================================ */

const app = $("#app");

const pinScreen = $("#pinScreen");
const pinCard = $("#pinCard");
const pinDots = $$("#pinDots span");
const pinKeypad = $("#pinKeypad");
const pinSubmit = $("#pinSubmit");
const pinError = $("#pinError");

const topbar = $("#topbar");

const navigation = $("#navigation");
const menuButton = $("#menuButton");
const closeMenu = $("#closeMenu");
const menuBackdrop = $("#menuBackdrop");

const bottomNav = $("#bottomNav");
const backButton = $("#backButton");
const nextButton = $("#nextButton");

const sceneName = $("#sceneName");
const progressBar = $("#progressBar");

const musicButton = $("#musicButton");
const musicPanel = $("#musicPanel");
const musicToggle = $("#musicToggle");
const audio = $("#audio");
const musicProgress = $("#musicProgress");

const scenes = $$(".scene");

/* ============================================================
   APPLICATION STATE
============================================================ */

const state = {

  pinUnlocked: false,

  currentScene: "opening",

  musicPlaying: false,

  musicPanelVisible: false,

  pin: "",

  giftOpened: false,

  candlesOff: false,

  wishReleased: false,

  mathIndex: 0,
  mathScore: 0,

  englishIndex: 0,
  englishScore: 0,

  starRunning: false,
  starScore: 0,
  starTime: 20

};

/* ============================================================
   SCENE ORDER
============================================================ */

const sceneOrder = [
  "opening",
  "birthday",
  "gift",
  "letter",
  "time",

  "memory01",
  "memory02",
  "memory03",
  "memory04",
  "memory05",
  "memory06",
  "memory07",
  "memory08",

  "thread",
  "cake",
  "wish",

  "games",
  "math",
  "star",
  "english",

  "finale"
];

/* ============================================================
   SCENE TITLES
============================================================ */

const sceneTitles = {

  opening: "HOME",
  birthday: "BIRTHDAY",
  gift: "GIFT",
  letter: "LETTER",
  time: "TIME BETWEEN US",

  memory01: "MEMORIES",
  memory02: "MEMORIES",
  memory03: "MEMORIES",
  memory04: "MEMORIES",
  memory05: "MEMORIES",
  memory06: "MEMORIES",
  memory07: "MEMORIES",
  memory08: "MEMORIES",

  thread: "LOVE THREAD",
  cake: "CAKE",
  wish: "MAKE A WISH",

  games: "GAMES",
  math: "BASIC MATH",
  star: "STAR RUN",
  english: "EASY ENGLISH",

  finale: "FINALE"

};

/* ============================================================
   NAVIGATION
============================================================ */

function getSceneIndex(name) {
  return sceneOrder.indexOf(name);
}

function getCurrentSceneElement() {
  return $(`.scene[data-scene="${state.currentScene}"]`);
}

function updateNavigation() {

  const index = getSceneIndex(state.currentScene);

  const total = sceneOrder.length;

  const percentage =
    ((index + 1) / total) * 100;

  sceneName.textContent =
    sceneTitles[state.currentScene] || "SCENE";

  progressBar.style.width =
    `${percentage}%`;

  backButton.disabled =
    index <= 0;

  nextButton.disabled =
    index >= total - 1;

  $$(".nav-list button").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.go === state.currentScene
    );

  });

}

function navigateTo(name) {

  if (!state.pinUnlocked) return;

  if (!sceneOrder.includes(name)) return;

  if (name === state.currentScene) {

    closeNavigation();

    return;
  }

  const current =
    getCurrentSceneElement();

  const next =
    $(`.scene[data-scene="${name}"]`);

  if (!next) return;

  current.classList.remove("active");
  current.classList.add("exit-left");

  next.classList.remove("exit-left");

  /*
   * Force browser to register the state
   * before activating the next scene.
   */
  requestAnimationFrame(() => {

    requestAnimationFrame(() => {

      next.classList.add("active");

    });

  });

  state.currentScene = name;

  updateNavigation();

  closeNavigation();

  /*
   * Scroll every scene back to top.
   */
  const inner =
    $(".scene-inner", next);

  if (inner) {
    inner.scrollTop = 0;
  }

  /*
   * Start visual systems when required.
   */
  if (name === "thread") {
    startHeartAnimation();
  }

  if (name === "star") {
    resetStarGame();
  }

  /*
   * Remove exit class after transition.
   */
  setTimeout(() => {

    current.classList.remove("exit-left");

  }, 800);

}

/* ============================================================
   NEXT / BACK
============================================================ */

function goNext() {

  const index =
    getSceneIndex(state.currentScene);

  if (index >= sceneOrder.length - 1) return;

  navigateTo(
    sceneOrder[index + 1]
  );

}

function goBack() {

  const index =
    getSceneIndex(state.currentScene);

  if (index <= 0) return;

  navigateTo(
    sceneOrder[index - 1]
  );

}

nextButton.addEventListener(
  "click",
  goNext
);

backButton.addEventListener(
  "click",
  goBack
);

$$("[data-next]").forEach(button => {

  button.addEventListener(
    "click",
    () => navigateTo(button.dataset.next)
  );

});

$$("[data-go]").forEach(button => {

  button.addEventListener(
    "click",
    () => navigateTo(button.dataset.go)
  );

});

document.addEventListener(
  "keydown",
  event => {

    if (!state.pinUnlocked) return;

    if (
      event.key === "ArrowRight"
    ) {
      goNext();
    }

    if (
      event.key === "ArrowLeft"
    ) {
      goBack();
    }

    if (
      event.key === "Escape"
    ) {
      closeNavigation();
    }

  }
);

/* ============================================================
   MENU
============================================================ */

function openNavigation() {

  navigation.classList.add("open");
  menuBackdrop.classList.add("show");

}

function closeNavigation() {

  navigation.classList.remove("open");
  menuBackdrop.classList.remove("show");

}

menuButton.addEventListener(
  "click",
  openNavigation
);

closeMenu.addEventListener(
  "click",
  closeNavigation
);

menuBackdrop.addEventListener(
  "click",
  closeNavigation
);

/* ============================================================
   PIN SYSTEM
============================================================ */

const CORRECT_PIN = "230226";

function updatePinDots() {

  pinDots.forEach(
    (dot, index) => {

      dot.classList.toggle(
        "filled",
        index < state.pin.length
      );

    }
  );

}

function pinErrorMessage(message) {

  pinError.textContent =
    message;

  pinCard.classList.remove("shake");

  /*
   * Restart animation.
   */
  void pinCard.offsetWidth;

  pinCard.classList.add("shake");

}

function clearPin() {

  state.pin = "";

  updatePinDots();

}

function deletePinDigit() {

  if (!state.pin.length) return;

  state.pin =
    state.pin.slice(0, -1);

  pinError.textContent = "";

  updatePinDots();

}

function addPinDigit(digit) {

  if (state.pin.length >= 6) {
    return;
  }

  state.pin += digit;

  pinError.textContent = "";

  updatePinDots();

}

function unlock() {

  state.pinUnlocked = true;

  pinCard.classList.remove("shake");

  pinCard.classList.add("unlock");

  pinDots.forEach(
    dot => dot.classList.add("filled")
  );

  $$(".pin-key").forEach(
    button => {
      button.disabled = true;
    }
  );

  /*
   * Start audio only after user interaction.
   */
  setTimeout(
    playMusicAutomatically,
    350
  );

  setTimeout(() => {

    pinScreen.classList.add("exit");

    app.classList.remove("locked");

  }, 600);

  setTimeout(() => {

    updateNavigation();

    /*
     * We don't remove the screen from DOM immediately.
     * This keeps the transition clean.
     */

  }, 900);

}

function verifyPin() {

  if (state.pin.length !== 6) {

    pinErrorMessage(
      "masukkan 6 digit PIN."
    );

    return;
  }

  if (
    state.pin === CORRECT_PIN
  ) {

    unlock();

    return;
  }

  pinErrorMessage(
    "PIN belum tepat. coba lagi."
  );

  setTimeout(
    clearPin,
    320
  );

}

$$(".pin-key").forEach(
  button => {

    button.addEventListener(
      "click",
      () => {

        const digit =
          button.dataset.digit;

        const action =
          button.dataset.action;

        if (digit !== undefined) {

          addPinDigit(digit);

          /*
           * Auto-check after 6th digit.
           */
          if (
            state.pin.length === 6
          ) {

            setTimeout(
              verifyPin,
              150
            );

          }

          return;
        }

        if (
          action === "delete"
        ) {

          deletePinDigit();

        }

      }
    );

  }
);

pinSubmit.addEventListener(
  "click",
  verifyPin
);

updatePinDots();

/* ============================================================
   MUSIC
============================================================ */

function updateMusicUI() {

  musicButton.classList.toggle(
    "playing",
    state.musicPlaying
  );

  musicToggle.textContent =
    state.musicPlaying
      ? "Pause"
      : "Play";

}

async function playMusic() {

  try {

    await audio.play();

    state.musicPlaying = true;

    updateMusicUI();

  } catch (error) {

    /*
     * Browser may reject playback.
     * This is expected until interaction.
     */

    state.musicPlaying = false;

    updateMusicUI();

  }

}

function playMusicAutomatically() {

  playMusic();

}

function pauseMusic() {

  audio.pause();

  state.musicPlaying = false;

  updateMusicUI();

}

musicButton.addEventListener(
  "click",
  event => {

    event.stopPropagation();

    musicPanel.classList.toggle(
      "show"
    );

  }
);

musicToggle.addEventListener(
  "click",
  () => {

    if (
      audio.paused
    ) {
      playMusic();
    } else {
      pauseMusic();
    }

  }
);

audio.addEventListener(
  "play",
  () => {

    state.musicPlaying = true;

    updateMusicUI();

  }
);

audio.addEventListener(
  "pause",
  () => {

    state.musicPlaying = false;

    updateMusicUI();

  }
);

audio.addEventListener(
  "timeupdate",
  () => {

    if (!audio.duration) return;

    const percentage =
      (audio.currentTime /
      audio.duration) * 100;

    musicProgress.style.width =
      `${percentage}%`;

  }
);

audio.addEventListener(
  "error",
  () => {

    musicToggle.textContent =
      "Audio unavailable";

    musicToggle.disabled = true;

  }
);

/* ============================================================
   GIFT
============================================================ */

const giftBox =
  $("#giftBox");

const giftButton =
  $("#giftButton");

function openGift() {

  if (state.giftOpened) {

    navigateTo("letter");

    return;

  }

  state.giftOpened = true;

  giftBox.classList.add(
    "opened"
  );

  giftButton.querySelector(
    "span"
  ).textContent =
    "Lanjut";

  createGiftParticles();

}

giftButton.addEventListener(
  "click",
  openGift
);

giftBox.addEventListener(
  "click",
  openGift
);

function createGiftParticles() {

  for (
    let i = 0;
    i < 18;
    i++
  ) {

    const particle =
      document.createElement("span");

    particle.className =
      "decoration dot";

    particle.style.position =
      "absolute";

    particle.style.left =
      `${45 + Math.random() * 10}%`;

    particle.style.top =
      `${42 + Math.random() * 12}%`;

    particle.style.transition =
      "transform 1.4s ease, opacity 1.4s ease";

    giftBox.appendChild(
      particle
    );

    requestAnimationFrame(
      () => {

        particle.style.transform =
          `translate(
            ${(Math.random() - .5) * 150}px,
            ${-40 - Math.random() * 120}px
          ) scale(${.5 + Math.random()})`;

        particle.style.opacity = "0";

      }
    );

    setTimeout(
      () => particle.remove(),
      1500
    );

  }

}

/* ============================================================
   REAL TIME CLOCKS
============================================================ */

const timeZones = {

  clockJakarta: "Asia/Jakarta",
  clockMakassar: "Asia/Makassar",
  clockJayapura: "Asia/Jayapura",
  clockTokyo: "Asia/Tokyo"

};

function formatClock(
  timeZone
) {

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }
  ).format(
    new Date()
  );

}

function formatDate(
  timeZone
) {

  return new Intl.DateTimeFormat(
    "id-ID",
    {
      timeZone,
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  ).format(
    new Date()
  );

}

function updateClocks() {

  Object.entries(
    timeZones
  ).forEach(
    ([id, zone]) => {

      const element =
        document.getElementById(id);

      if (!element) return;

      element.textContent =
        formatClock(zone);

    }
  );

  const date =
    $("#clockDate");

  if (date) {

    date.textContent =
      formatDate(
        "Asia/Tokyo"
      );

  }

}

updateClocks();

setInterval(
  updateClocks,
  1000
);

/* ============================================================
   CANDLE / CAKE
============================================================ */

const cake =
  $("#cake");

const blowButton =
  $("#blowButton");

const candleStatus =
  $("#candleStatus");

const candles =
  $$(".candle");

let cakeTiltX = 10;
let cakeTiltY = -18;

function updateCakeTilt(
  x,
  y
) {

  if (state.candlesOff) return;

  cakeTiltY =
    -18 + x * 9;

  cakeTiltX =
    10 - y * 7;

  cake.style.transform =
    `rotateX(${cakeTiltX}deg)
     rotateY(${cakeTiltY}deg)`;

}

function handleCakePointer(
  event
) {

  const rect =
    cake.getBoundingClientRect();

  const point =
    event.touches
      ? event.touches[0]
      : event;

  const x =
    ((point.clientX - rect.left) /
      rect.width) - .5;

  const y =
    ((point.clientY - rect.top) /
      rect.height) - .5;

  updateCakeTilt(x, y);

}

cake.addEventListener(
  "pointermove",
  handleCakePointer
);

cake.addEventListener(
  "pointerleave",
  () => {

    cake.style.transform =
      "rotateX(10deg) rotateY(-18deg)";

  }
);

function extinguishCandles() {

  if (state.candlesOff) return;

  state.candlesOff = true;

  candles.forEach(
    candle => {

      candle.classList.add(
        "off"
      );

    }
  );

  candleStatus.textContent =
    "wish made. sekarang simpan harapannya.";

  blowButton.querySelector(
    "span"
  ).textContent =
    "lanjut";

  createCandleParticles();

}

blowButton.addEventListener(
  "click",
  () => {

    if (
      state.candlesOff
    ) {

      navigateTo("wish");

      return;

    }

    extinguishCandles();

  }
);

function createCandleParticles() {

  for (
    let i = 0;
    i < 24;
    i++
  ) {

    const particle =
      document.createElement("span");

    particle.className =
      "decoration dot";

    particle.style.left =
      `${45 + Math.random() * 10}%`;

    particle.style.top =
      `${38 + Math.random() * 12}%`;

    particle.style.transition =
      "transform 1.3s ease, opacity 1.3s ease";

    cake.parentElement.appendChild(
      particle
    );

    requestAnimationFrame(
      () => {

        particle.style.transform =
          `translate(
            ${(Math.random() - .5) * 170}px,
            ${-50 - Math.random() * 120}px
          )`;

        particle.style.opacity =
          "0";

      }
    );

    setTimeout(
      () => particle.remove(),
      1400
    );

  }

}

/* ============================================================
   OPTIONAL MICROPHONE BLOW
============================================================ */

async function tryMicrophoneBlow() {

  /*
   * Optional feature.
   * The website does not depend on microphone permission.
   */

  if (
    !navigator.mediaDevices ||
    !navigator.mediaDevices.getUserMedia
  ) {
    return;
  }

  /*
   * We deliberately don't request microphone
   * automatically.
   *
   * This keeps the experience private
   * and permission-free by default.
   */

}

/* ============================================================
   WISH
============================================================ */

const wishInput =
  $("#wishInput");

const wishButton =
  $("#wishButton");

const wishSky =
  $("#wishSky");

function releaseWish() {

  const text =
    wishInput.value.trim();

  if (!text) {

    wishInput.focus();

    return;

  }

  const wish =
    document.createElement("div");

  wish.className =
    "wish-object";

  wish.textContent =
    text;

  wish.style.left =
    `${30 + Math.random() * 40}%`;

  wishSky.appendChild(
    wish
  );

  state.wishReleased = true;

  wishInput.value = "";

}

wishButton.addEventListener(
  "click",
  releaseWish
);

wishInput.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      releaseWish();

    }

  }
);

/* ============================================================
   MATH GAME
============================================================ */

const mathQuestions = [
  {
    question: "4 + 7 = ?",
    answer: 11
  },
  {
    question: "15 - 6 = ?",
    answer: 9
  },
  {
    question: "5 × 4 = ?",
    answer: 20
  },
  {
    question: "18 ÷ 3 = ?",
    answer: 6
  },
  {
    question: "9 + 8 = ?",
    answer: 17
  }
];

const mathQuestion =
  $("#mathQuestion");

const mathAnswer =
  $("#mathAnswer");

const mathCheck =
  $("#mathCheck");

const mathFeedback =
  $("#mathFeedback");

const mathProgress =
  $("#mathProgress");

const mathScore =
  $("#mathScore");

function renderMath() {

  const item =
    mathQuestions[state.mathIndex];

  mathQuestion.textContent =
    item.question;

  mathProgress.textContent =
    `${state.mathIndex + 1} / ${mathQuestions.length}`;

  mathScore.textContent =
    state.mathScore;

  mathAnswer.value = "";

  mathFeedback.textContent = "";

}

function checkMath() {

  const item =
    mathQuestions[state.mathIndex];

  const answer =
    Number(
      mathAnswer.value
    );

  if (
    answer === item.answer
  ) {

    state.mathScore++;

    mathFeedback.textContent =
      "benar. lanjut.";

  } else {

    mathFeedback.textContent =
      `belum tepat. jawabannya ${item.answer}.`;

  }

  mathScore.textContent =
    state.mathScore;

  setTimeout(
    () => {

      state.mathIndex++;

      if (
        state.mathIndex >=
        mathQuestions.length
      ) {

        mathFeedback.textContent =
          `selesai. score Aa: ${state.mathScore}/${mathQuestions.length}`;

        mathCheck.querySelector(
          "span"
        ).textContent =
          "Ulangi";

        return;

      }

      renderMath();

    },
    850
  );

}

function resetMath() {

  state.mathIndex = 0;
  state.mathScore = 0;

  mathCheck.querySelector(
    "span"
  ).textContent =
    "Check";

  renderMath();

}

mathCheck.addEventListener(
  "click",
  () => {

    if (
      state.mathIndex >=
      mathQuestions.length
    ) {

      resetMath();

      return;

    }

    checkMath();

  }
);

mathAnswer.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter"
    ) {

      checkMath();

    }

  }
);

renderMath();

/* ============================================================
   ENGLISH GAME
============================================================ */

const englishQuestions = [

  {
    question: "happy means...",
    options: [
      "sedih",
      "bahagia",
      "marah"
    ],
    answer: 1
  },

  {
    question: "big means...",
    options: [
      "besar",
      "kecil",
      "cepat"
    ],
    answer: 0
  },

  {
    question: "I ___ tired.",
    options: [
      "am",
      "is",
      "are"
    ],
    answer: 0
  },

  {
    question: "good means...",
    options: [
      "buruk",
      "baik",
      "jauh"
    ],
    answer: 1
  },

  {
    question: "thank you means...",
    options: [
      "selamat tinggal",
      "terima kasih",
      "sampai nanti"
    ],
    answer: 1
  }

];

const englishQuestion =
  $("#englishQuestion");

const englishOptions =
  $("#englishOptions");

const englishFeedback =
  $("#englishFeedback");

const englishProgress =
  $("#englishProgress");

const englishScore =
  $("#englishScore");

function renderEnglish() {

  const item =
    englishQuestions[
      state.englishIndex
    ];

  englishQuestion.textContent =
    item.question;

  englishProgress.textContent =
    `${state.englishIndex + 1} / ${englishQuestions.length}`;

  englishScore.textContent =
    state.englishScore;

  englishFeedback.textContent =
    "";

  englishOptions.innerHTML = "";

  item.options.forEach(
    (option, index) => {

      const button =
        document.createElement("button");

      button.type =
        "button";

      button.className =
        "english-option";

      button.textContent =
        `${String.fromCharCode(65 + index)}. ${option}`;

      button.addEventListener(
        "click",
        () => answerEnglish(index)
      );

      englishOptions.appendChild(
        button
      );

    }
  );

}

function answerEnglish(index) {

  const item =
    englishQuestions[
      state.englishIndex
    ];

  if (
    index === item.answer
  ) {

    state.englishScore++;

    englishFeedback.textContent =
      "benar.";

  } else {

    englishFeedback.textContent =
      `belum tepat. jawabannya ${item.options[item.answer]}.`;

  }

  englishScore.textContent =
    state.englishScore;

  $$(".english-option").forEach(
    button => {
      button.disabled = true;
    }
  );

  setTimeout(
    () => {

      state.englishIndex++;

      if (
        state.englishIndex >=
        englishQuestions.length
      ) {

        englishQuestion.textContent =
          "selesai.";

        englishOptions.innerHTML = "";

        englishFeedback.textContent =
          `score Aa: ${state.englishScore}/${englishQuestions.length}`;

        return;

      }

      renderEnglish();

    },
    850
  );

}

renderEnglish();

/* ============================================================
   STAR RUN
============================================================ */

const starCanvas =
  $("#starCanvas");

const starCtx =
  starCanvas.getContext("2d");

const starStart =
  $("#starStart");

const starOverlay =
  $("#starStartOverlay");

const starScore =
  $("#starScore");

const starTime =
  $("#starTime");

let starAnimationId = null;

let starTimerId = null;

const starPlayer = {
  x: 360,
  y: 760,
  radius: 22,
  targetX: 360,
  targetY: 760
};

let stars = [];

function createStar() {

  return {
    x: 30 + Math.random() * 660,
    y: 70 + Math.random() * 720,
    radius: 10,
    phase: Math.random() * Math.PI * 2
  };

}

function resetStarGame() {

  stopStarGame();

  state.starScore = 0;
  state.starTime = 20;

  starScore.textContent = "0";
  starTime.textContent = "20";

  starPlayer.x = 360;
  starPlayer.y = 760;
  starPlayer.targetX = 360;
  starPlayer.targetY = 760;

  stars = [];

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    stars.push(
      createStar()
    );

  }

  starOverlay.classList.remove(
    "hidden"
  );

  drawStarScene();

}

function drawStarScene() {

  const width =
    starCanvas.width;

  const height =
    starCanvas.height;

  starCtx.clearRect(
    0,
    0,
    width,
    height
  );

  /*
   * Background
   */
  starCtx.fillStyle =
    "#020a1d";

  starCtx.fillRect(
    0,
    0,
    width,
    height
  );

  /*
   * Small ambient stars
   */
  for (
    let i = 0;
    i < 35;
    i++
  ) {

    const x =
      (i * 137) % width;

    const y =
      (i * 83) % height;

    starCtx.fillStyle =
      "rgba(159,191,246,.35)";

    starCtx.fillRect(
      x,
      y,
      2,
      2
    );

  }

  /*
   * Game stars
   */
  stars.forEach(
    star => {

      const pulse =
        1 +
        Math.sin(
          performance.now() / 350 +
          star.phase
        ) * .12;

      drawStar(
        star.x,
        star.y,
        star.radius * pulse
      );

    }
  );

  /*
   * Player
   */
  const gradient =
    starCtx.createRadialGradient(
      starPlayer.x - 5,
      starPlayer.y - 7,
      2,
      starPlayer.x,
      starPlayer.y,
      starPlayer.radius
    );

  gradient.addColorStop(
    0,
    "#dbeaff"
  );

  gradient.addColorStop(
    .45,
    "#6f9eea"
  );

  gradient.addColorStop(
    1,
    "rgba(50,93,168,.2)"
  );

  starCtx.beginPath();

  starCtx.arc(
    starPlayer.x,
    starPlayer.y,
    starPlayer.radius,
    0,
    Math.PI * 2
  );

  starCtx.fillStyle =
    gradient;

  starCtx.fill();

  if (
    state.starRunning
  ) {

    starAnimationId =
      requestAnimationFrame(
        drawStarScene
      );

  }

}

function drawStar(
  x,
  y,
  size
) {

  starCtx.save();

  starCtx.translate(
    x,
    y
  );

  starCtx.rotate(
    Math.PI / 4
  );

  starCtx.fillStyle =
    "#dbe8ff";

  starCtx.shadowBlur =
    18;

  starCtx.shadowColor =
    "rgba(122,171,255,.8)";

  starCtx.fillRect(
    -size / 2,
    -size / 2,
    size,
    size
  );

  starCtx.restore();

}

function updateStarPlayer() {

  starPlayer.x +=
    (starPlayer.targetX -
      starPlayer.x) * .16;

  starPlayer.y +=
    (starPlayer.targetY -
      starPlayer.y) * .16;

}

function checkStarCollision() {

  stars.forEach(
    (star, index) => {

      const dx =
        star.x -
        starPlayer.x;

      const dy =
        star.y -
        starPlayer.y;

      const distance =
        Math.sqrt(
          dx * dx +
          dy * dy
        );

      if (
        distance <
        star.radius +
        starPlayer.radius
      ) {

        stars.splice(
          index,
          1
        );

        state.starScore++;

        starScore.textContent =
          state.starScore;

        stars.push(
          createStar()
        );

      }

    }
  );

}

function starLoop() {

  if (!state.starRunning) {
    return;
  }

  updateStarPlayer();

  checkStarCollision();

}

function startStarGame() {

  if (state.starRunning) {
    return;
  }

  state.starRunning = true;

  state.starScore = 0;
  state.starTime = 20;

  starScore.textContent = "0";
  starTime.textContent = "20";

  stars = [];

  for (
    let i = 0;
    i < 5;
    i++
  ) {

    stars.push(
      createStar()
    );

  }

  starOverlay.classList.add(
    "hidden"
  );

  function frame() {

    if (!state.starRunning) {
      return;
    }

    starLoop();

    drawStarScene();

  }

  function timer() {

    if (!state.starRunning) {
      return;
    }

    state.starTime--;

    starTime.textContent =
      state.starTime;

    if (
      state.starTime <= 0
    ) {

      stopStarGame();

      starOverlay.classList.remove(
        "hidden"
      );

      return;

    }

    starTimerId =
      setTimeout(
        timer,
        1000
      );

  }

  timer();

  function animation() {

    if (!state.starRunning) {
      return;
    }

    frame();

    starAnimationId =
      requestAnimationFrame(
        animation
      );

  }

  animation();

}

function stopStarGame() {

  state.starRunning = false;

  if (
    starAnimationId
  ) {

    cancelAnimationFrame(
      starAnimationId
    );

    starAnimationId = null;

  }

  if (
    starTimerId
  ) {

    clearTimeout(
      starTimerId
    );

    starTimerId = null;

  }

}

starStart.addEventListener(
  "click",
  startStarGame
);

/*
 * Touch control.
 */

starCanvas.addEventListener(
  "pointermove",
  event => {

    if (
      !state.starRunning
    ) return;

    const rect =
      starCanvas.getBoundingClientRect();

    const scaleX =
      starCanvas.width /
      rect.width;

    const scaleY =
      starCanvas.height /
      rect.height;

    starPlayer.targetX =
      (event.clientX -
        rect.left) *
      scaleX;

    starPlayer.targetY =
      (event.clientY -
        rect.top) *
      scaleY;

  }
);

/*
 * Touch start.
 */

starCanvas.addEventListener(
  "pointerdown",
  event => {

    if (
      !state.starRunning
    ) return;

    const rect =
      starCanvas.getBoundingClientRect();

    const scaleX =
      starCanvas.width /
      rect.width;

    const scaleY =
      starCanvas.height /
      rect.height;

    starPlayer.targetX =
      (event.clientX -
        rect.left) *
      scaleX;

    starPlayer.targetY =
      (event.clientY -
        rect.top) *
      scaleY;

  }
);

/*
 * Keyboard fallback.
 */

document.addEventListener(
  "keydown",
  event => {

    if (
      !state.starRunning
    ) return;

    const amount = 35;

    if (
      event.key === "ArrowLeft"
    ) {

      starPlayer.targetX -= amount;

    }

    if (
      event.key === "ArrowRight"
    ) {

      starPlayer.targetX += amount;

    }

    if (
      event.key === "ArrowUp"
    ) {

      starPlayer.targetY -= amount;

    }

    if (
      event.key === "ArrowDown"
    ) {

      starPlayer.targetY += amount;

    }

    starPlayer.targetX =
      Math.max(
        25,
        Math.min(
          695,
          starPlayer.targetX
        )
      );

    starPlayer.targetY =
      Math.max(
        25,
        Math.min(
          875,
          starPlayer.targetY
        )
      );

  }
);

resetStarGame();

/* ============================================================
   LOVE THREAD CANVAS
============================================================ */

const heartCanvas =
  $("#heartCanvas");

const heartCtx =
  heartCanvas.getContext("2d");

let heartAnimationRunning =
  false;

let heartStartTime =
  0;

const heartPoints = [];

function buildHeartPoints() {

  heartPoints.length = 0;

  const count = 480;

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const t =
      (i / count) *
      Math.PI * 2;

    /*
     * Parametric heart.
     */
    const x =
      16 *
      Math.pow(
        Math.sin(t),
        3
      );

    const y =
      -(
        13 * Math.cos(t) -
        5 * Math.cos(2 * t) -
        2 * Math.cos(3 * t) -
        Math.cos(4 * t)
      );

    heartPoints.push({
      x,
      y
    });

  }

}

function drawHeartThread(
  progress
) {

  const width =
    heartCanvas.width;

  const height =
    heartCanvas.height;

  heartCtx.clearRect(
    0,
    0,
    width,
    height
  );

  const centerX =
    width / 2;

  const centerY =
    height / 2;

  const scale =
    11.5;

  const count =
    Math.floor(
      heartPoints.length *
      progress
    );

  heartCtx.save();

  heartCtx.translate(
    centerX,
    centerY
  );

  /*
   * Soft glow.
   */
  heartCtx.shadowBlur = 12;

  heartCtx.shadowColor =
    "rgba(150,37,67,.7)";

  heartCtx.strokeStyle =
    "rgba(137,43,66,.8)";

  heartCtx.lineWidth = 1.2;

  heartCtx.beginPath();

  for (
    let i = 0;
    i < count;
    i++
  ) {

    const point =
      heartPoints[i];

    const x =
      point.x * scale;

    const y =
      point.y * scale;

    if (
      i === 0
    ) {

      heartCtx.moveTo(
        x,
        y
      );

    } else {

      heartCtx.lineTo(
        x,
        y
      );

    }

  }

  heartCtx.stroke();

  /*
   * Thread crossing lines.
   */
  heartCtx.globalAlpha =
    .35;

  heartCtx.strokeStyle =
    "#bd5068";

  heartCtx.lineWidth = .6;

  const threads =
    Math.min(
      35,
      Math.floor(progress * 35)
    );

  for (
    let i = 0;
    i < threads;
    i++
  ) {

    const a =
      heartPoints[
        Math.floor(
          Math.random() *
          Math.max(1, count)
        )
      ];

    const b =
      heartPoints[
        Math.floor(
          Math.random() *
          Math.max(1, count)
        )
      ];

    if (!a || !b) continue;

    heartCtx.beginPath();

    heartCtx.moveTo(
      a.x * scale,
      a.y * scale
    );

    heartCtx.lineTo(
      b.x * scale,
      b.y * scale
    );

    heartCtx.stroke();

  }

  heartCtx.restore();

}

function heartAnimation(
  timestamp
) {

  if (!heartAnimationRunning) {
    return;
  }

  if (!heartStartTime) {
    heartStartTime =
      timestamp;
  }

  const elapsed =
    timestamp -
    heartStartTime;

  const progress =
    Math.min(
      elapsed / 3500,
      1
    );

  drawHeartThread(
    progress
  );

  if (
    progress < 1
  ) {

    requestAnimationFrame(
      heartAnimation
    );

  } else {

    drawHeartThread(1);

  }

}

function startHeartAnimation() {

  if (
    heartAnimationRunning
  ) {
    return;
  }

  heartAnimationRunning = true;

  heartStartTime = 0;

  requestAnimationFrame(
    heartAnimation
  );

}

buildHeartPoints();

drawHeartThread(0);

/* ============================================================
   50+ DECORATIVE INSTANCES
============================================================ */

function createDecorations() {

  const container =
    $("#decorations");

  const types = [
    "dot",
    "dot",
    "dot",
    "ring",
    "square",
    "line",
    "cross"
  ];

  for (
    let i = 0;
    i < 72;
    i++
  ) {

    const type =
      types[
        Math.floor(
          Math.random() *
          types.length
        )
      ];

    const element =
      document.createElement("span");

    element.className =
      `decoration ${type}`;

    element.style.left =
      `${Math.random() * 100}%`;

    element.style.top =
      `${Math.random() * 100}%`;

    element.style.opacity =
      `${.18 + Math.random() * .45}`;

    element.style.transform +=
      ` rotate(${Math.random() * 360}deg)`;

    if (
      type === "ring"
    ) {

      const size =
        35 +
        Math.random() * 100;

      element.style.width =
        `${size}px`;

      element.style.height =
        `${size}px`;

    }

    if (
      type === "line"
    ) {

      element.style.width =
        `${35 + Math.random() * 80}px`;

      element.style.transform +=
        ` rotate(${Math.random() * 180}deg)`;

    }

    container.appendChild(
      element
    );

  }

}

createDecorations();

/* ============================================================
   PAGE VISIBILITY PERFORMANCE
============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (
      document.hidden
    ) {

      /*
       * Pause heavier canvas systems.
       */
      heartAnimationRunning =
        false;

      stopStarGame();

    } else {

      if (
        state.currentScene ===
        "thread"
      ) {

        heartAnimationRunning =
          true;

        heartStartTime = 0;

        requestAnimationFrame(
          heartAnimation
        );

      }

    }

  }
);

/* ============================================================
   REPLAY
============================================================ */

const replayButton =
  $("#replayButton");

replayButton.addEventListener(
  "click",
  () => {

    state.currentScene =
      "opening";

    state.giftOpened =
      false;

    state.candlesOff =
      false;

    state.wishReleased =
      false;

    state.pin =
      "";

    giftBox.classList.remove(
      "opened"
    );

    candles.forEach(
      candle => {
        candle.classList.remove(
          "off"
        );
      }
    );

    candleStatus.textContent =
      "klik untuk meniup lilin";

    blowButton.querySelector(
      "span"
    ).textContent =
      "Make a Wish";

    wishInput.value = "";

    $$(".wish-object").forEach(
      element => element.remove()
    );

    $$(".scene").forEach(
      scene => {

        scene.classList.remove(
          "active",
          "exit-left"
        );

      }
    );

    const opening =
      $(`.scene[data-scene="opening"]`);

    opening.classList.add(
      "active"
    );

    updateNavigation();

    if (
      !audio.paused
    ) {

      audio.currentTime = 0;

    }

  }
);

/* ============================================================
   INITIAL STATE
============================================================ */

updateNavigation();

app.classList.add(
  "locked"
);

/*
 * Do not focus any input.
 *
 * This is intentional.
 *
 * The PIN is entered exclusively through
 * the on-screen keypad.
 */