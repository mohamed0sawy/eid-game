// ============================================
//  SCENE 4 — The Finale
//  Step machine · walk animations · confetti
// ============================================

// ── Image maps ────────────────────────────────
const FIANCEE_IMG = {
  smile_right: 'assets/fiancee_smile_right.png',
  look_right: 'assets/fiancee_right.png',
  blush:       'assets/fiancee_blush.png',
};

const ME_IMG = {
  hands_down: 'assets/me_left_hands_down.png',
  waving:     'assets/me_waving.png',
};

// ── DOM refs ──────────────────────────────────
const scene        = document.getElementById('scene');
const fianceeWrap  = document.getElementById('fiancee-wrap');
const meWrap       = document.getElementById('me-wrap');
const fianceeImg   = document.getElementById('fiancee');
const meImg        = document.getElementById('me');

const bubbleFiancee = document.getElementById('bubble-fiancee');
const bubbleMe      = document.getElementById('bubble-me');
const textFiancee   = document.getElementById('text-fiancee');
const textMe        = document.getElementById('text-me');
const btnFiancee    = document.getElementById('next-btn-fiancee');
const btnMe         = document.getElementById('next-btn-me');

const finalOverlay  = document.getElementById('final-overlay');
const restartBtn    = document.getElementById('restart-btn');
const confettiCanvas= document.getElementById('confetti-canvas');

// ── Typing state ──────────────────────────────
let isTyping      = false;
let typingTimeout = null;
let currentText   = '';

// ── Step index ────────────────────────────────
let stepIndex = 0;

// ============================================
//  STEP DEFINITIONS
//
//  type: 'dialogue' — show bubble + type text
//  type: 'walk'     — animate a character
//  type: 'meet'     — both slide to center
//  type: 'confetti' — fire confetti + show overlay
//
// ============================================
const STEPS = [
  // ── STEP 0: Fiancée walks in
  {
    type:   'walk',
    target: 'fiancee',
    to:     'in',   // fiancee-wrap gets class 'walk-in'
  },
  // ── STEP 1: Fiancée first dialogue
  {
    type:    'dialogue',
    speaker: 'fiancee',
    fianceeImg: 'smile_right',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:    "I can't believe there was a memory book… 😊",
  },
  // ── STEP 2: Fiancée second dialogue
  {
    type:    'dialogue',
    speaker: 'fiancee',
    fianceeImg: 'smile_right',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:    "But I solved it! 😏",
  },
  // ── STEP 3: Me walks in (Next click triggers it)
  {
    type:   'walk',
    target: 'me',
    to:     'in',
  },
  // ── STEP 4: She notices me
  {
    type:    'dialogue',
    speaker: 'fiancee',
    fianceeImg: 'look_right',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:    "Oh! You're here! 😄",
  },
  // ── STEP 5: I greet (waving)
  {
    type:    'dialogue',
    speaker: 'me',
    meImg:   'waving',
  speakerName: 'Mohamed',
  speakerLabel: 'mohamed',
    text:    "Of course… I was waiting for you",
  },
  // ── STEP 6: I continue
  {
    type:    'dialogue',
    speaker: 'me',
    meImg:   'waving',
  speakerName: 'Mohamed',
  speakerLabel: 'mohamed',
    text:    "You did great back there 😊",
  },
  // ── STEP 7: She blushes
  {
    type:    'dialogue',
    speaker: 'fiancee',
    fianceeImg: 'blush',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:    "Hehe… thank you 😊",
  },
  // ── STEP 8: Walk toward each other
  {
    type: 'meet',
  },
  // ── STEP 9: Final dialogue — me
  {
    type:    'dialogue',
    speaker: 'me',
    meImg:   'hands_down',
  speakerName: 'Mohamed',
  speakerLabel: 'mohamed',
    text:    "I just wanted to say you are such a sweet person 🤍",
  },
  // ── STEP 10: Final dialogue — me again
  {
    type:    'dialogue',
    speaker: 'me',
    meImg:   'hands_down',
  speakerName: 'Mohamed',
  speakerLabel: 'mohamed',
    text:    "Happy Eid, Mariam 🤍",
    isLast:  true,
  },
  // ── STEP 11: Confetti + finale
  {
    type: 'confetti',
  },
];

// ============================================
//  HELPERS — Images
// ============================================

function setFiancee(key) {
  if (key && FIANCEE_IMG[key]) fianceeImg.src = FIANCEE_IMG[key];
}

function setMe(key) {
  if (key && ME_IMG[key]) meImg.src = ME_IMG[key];
}

// ============================================
//  HELPERS — Bubbles
// ============================================

function hideBubble(el) {
  el.classList.add('hidden');
  el.classList.remove('visible');
}

function hideAllBubbles() {
  hideBubble(bubbleFiancee);
  hideBubble(bubbleMe);
}

function positionBubble(bubble, charWrap) {
  const charBottom = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--char-bottom')
  ) || 100;
  const charHeight = charWrap.offsetHeight;
  bubble.style.bottom = (charBottom + charHeight + 18) + 'px';
}

function showBubble(speaker, text, btnLabel, speakerName, speakerLabel) {
  hideAllBubbles();

  const bubble  = speaker === 'fiancee' ? bubbleFiancee : bubbleMe;
  const textEl  = speaker === 'fiancee' ? textFiancee   : textMe;
  const btn     = speaker === 'fiancee' ? btnFiancee    : btnMe;
  const charWrap= speaker === 'fiancee' ? fianceeWrap   : meWrap;

  const labelId = speaker === 'fiancee' ? 'label-fiancee' : 'label-me';
  const labelEl = document.getElementById(labelId);
  if (labelEl) { labelEl.textContent = speakerName; labelEl.className = `dialogue-label ${speakerLabel}`; }

  positionBubble(bubble, charWrap);

  btn.textContent = btnLabel || 'Next ›';
  btn.disabled    = false;

  bubble.classList.remove('hidden');
  // force reflow for re-animation
  void bubble.offsetWidth;
  bubble.classList.add('visible');

  typeText(textEl, text);
}

// ============================================
//  TYPEWRITER
// ============================================

function typeText(el, text) {
  clearTimeout(typingTimeout);
  el.textContent = '';
  el.classList.add('typing');
  isTyping    = true;
  currentText = text;

  const chars = [...text];
  let i = 0;

  function tick() {
    if (i < chars.length) {
      el.textContent += chars[i++];
      typingTimeout = setTimeout(tick, 45);
    } else {
      isTyping = false;
      el.classList.remove('typing');
    }
  }
  tick();
}

function skipType(speaker) {
  clearTimeout(typingTimeout);
  const el = speaker === 'fiancee' ? textFiancee : textMe;
  el.textContent = currentText;
  isTyping = false;
  el.classList.remove('typing');
}

// ============================================
//  CHARACTER MOVEMENT
// ============================================

/**
 * Move a character to their "walked-in" resting position.
 * Fiancée lands at left: 6vw, Me lands at right: 6vw.
 * Both use CSS transitions triggered by inline transform.
 */
function moveCharacter(target, to, onDone) {
  const wrap = target === 'fiancee' ? fianceeWrap : meWrap;

  if (to === 'in') {
    // Trigger the CSS transition by setting transform
    if (target === 'fiancee') {
      // Start: translateX(-120vw) → land at translateX(6vw) from left:0
      wrap.style.transform = 'translateX(6vw)';
    } else {
      // Start: translateX(120vw)  → land at translateX(-6vw) from right:0
      wrap.style.transform = 'translateX(-6vw)';
    }
  }

  wrap.addEventListener('transitionend', () => {
    if (onDone) onDone();
  }, { once: true });
}

/**
 * Move both characters toward center simultaneously.
 */
function meetAtCenter(onDone) {
  // Fiancée slides right from ~6vw to ~38vw offset
  fianceeWrap.style.transform = 'translateX(20vw)';
  // Me slides left from ~-6vw to ~-38vw offset
  meWrap.style.transform      = 'translateX(-20vw)';

  // Scale up images
  fianceeImg.style.transition = 'transform 0.4s ease 1.4s';
  meImg.style.transition      = 'transform 0.4s ease 1.4s';
  fianceeImg.style.transform  = 'scale(1.09)';
  meImg.style.transform       = 'scale(1.09)';

  // Wait for the longest transition (1.8s walk + a touch)
  setTimeout(() => {
    if (onDone) onDone();
  }, 2000);
}

// ============================================
//  STEP PROCESSOR
// ============================================

function processStep(index) {
  const step = STEPS[index];
  if (!step) return;

  // ── Walk step ────────────────────────────────
  if (step.type === 'walk') {
    hideAllBubbles();

    moveCharacter(step.target, step.to, () => {
      setTimeout(() => {
        stepIndex++;
        processStep(stepIndex);
      }, 350);
    });
    return;
  }

  // ── Meet step ────────────────────────────────
  if (step.type === 'meet') {
    hideAllBubbles();

    meetAtCenter(() => {
      setTimeout(() => {
        stepIndex++;
        processStep(stepIndex);
      }, 500);
    });
    return;
  }

  // ── Confetti + finale ────────────────────────
  if (step.type === 'confetti') {
    hideAllBubbles();
    fireConfetti();

    setTimeout(() => {
      showFinalOverlay();
    }, 800);
    return;
  }

  // ── Dialogue step ─────────────────────────────
  if (step.type === 'dialogue') {
    if (step.fianceeImg) setFiancee(step.fianceeImg);
    if (step.meImg)      setMe(step.meImg);

    const isLast   = !!step.isLast;
    const btnLabel = isLast ? 'Finish' : 'Next ›';

    showBubble(step.speaker, step.text, btnLabel, step.speakerName, step.speakerLabel);
  }
}

// ============================================
//  NEXT BUTTON HANDLER
// ============================================

function handleNext(speaker) {
  const step = STEPS[stepIndex];

  // If still typing → skip
  if (isTyping) {
    skipType(speaker);
    if (step && step.isLast) {
      const btn = speaker === 'fiancee' ? btnFiancee : btnMe;
      btn.textContent = 'Finish';
    }
    return;
  }

  stepIndex++;
  processStep(stepIndex);
}

btnFiancee.addEventListener('click', () => handleNext('fiancee'));
btnMe.addEventListener('click',      () => handleNext('me'));

// ============================================
//  CONFETTI
// ============================================

function fireConfetti() {
  // Use canvas-confetti pointed at our canvas element
  const myConfetti = confetti.create(confettiCanvas, { resize: true });

  const colors = ['#C1694F', '#F5CBA7', '#7EC8A4', '#85C1E9', '#F8C471', '#E8A87C'];

  // Burst 1 — center
  myConfetti({
    particleCount: 80,
    spread: 70,
    origin: { x: 0.5, y: 0.5 },
    colors,
  });

  // Burst 2 — left
  setTimeout(() => {
    myConfetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.1, y: 0.6 },
      colors,
    });
  }, 400);

  // Burst 3 — right
  setTimeout(() => {
    myConfetti({
      particleCount: 50,
      angle: 120,
      spread: 55,
      origin: { x: 0.9, y: 0.6 },
      colors,
    });
  }, 700);

  // Burst 4 — top center
  setTimeout(() => {
    myConfetti({
      particleCount: 60,
      spread: 100,
      startVelocity: 20,
      origin: { x: 0.5, y: 0.2 },
      colors,
    });
  }, 1200);

  // Burst 5 — finale shower
  setTimeout(() => {
    myConfetti({
      particleCount: 100,
      spread: 120,
      origin: { x: 0.5, y: 0.4 },
      colors,
    });
  }, 2000);
}

// ============================================
//  FINAL OVERLAY
// ============================================

function showFinalOverlay() {
  finalOverlay.classList.remove('hidden');

  // Step 1 — burst sparkles around center
  spawnSparkles();

  // Step 2 — after 1s, reveal the text
  setTimeout(() => {
    document.getElementById('eid-text').classList.add('revealed');
  }, 2000);
}

function spawnSparkles() {
  const container = document.getElementById('eid-sparkles');
  container.innerHTML = '';

  // Sparkle positions scattered around center
  const positions = [
    { top: '10%',  left: '10%',  delay: '0s'    },
    { top: '5%',   left: '40%',  delay: '0.1s'  },
    { top: '15%',  left: '75%',  delay: '0.05s' },
    { top: '50%',  left: '5%',   delay: '0.2s'  },
    { top: '50%',  left: '90%',  delay: '0.15s' },
    { top: '80%',  left: '20%',  delay: '0.25s' },
    { top: '85%',  left: '55%',  delay: '0.1s'  },
    { top: '70%',  left: '85%',  delay: '0.3s'  },
    { top: '30%',  left: '30%',  delay: '0.18s' },
    { top: '30%',  left: '65%',  delay: '0.22s' },
    { top: '60%',  left: '48%',  delay: '0.08s' },
  ];

  positions.forEach(pos => {
    const dot = document.createElement('div');
    dot.className = 'sparkle';
    dot.style.top             = pos.top;
    dot.style.left            = pos.left;
    dot.style.animationDelay  = pos.delay;
    // Slight size variation for natural feel
    const size = 5 + Math.random() * 7;
    dot.style.width  = size + 'px';
    dot.style.height = size + 'px';
    // Color variation: gold / terracotta / warm white
    const colors = ['#F5C842', '#E8A87C', '#FFF5CC', '#C1694F', '#FFD700'];
    dot.style.background = colors[Math.floor(Math.random() * colors.length)];
    container.appendChild(dot);
  });
}

restartBtn.addEventListener('click', () => {
  window.location.href = 'index.html';
});

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  // Scene fades in, then after 1.2s kick off step 0 (fiancée walks in)
  setTimeout(() => {
    processStep(0);
  }, 1200);
});
