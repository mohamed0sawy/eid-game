// ============================================
//  SCENE 2 — Professor Sheep
//  State machine · typing engine · sheep walk-in
// ============================================

// ── Asset map ─────────────────────────────────
// When you add real images, update these paths.
// The placeholder divs in HTML will be replaced
// by <img> tags — the JS image-switching below
// targets #fiancee and #sheep img elements.
const FIANCEE_IMAGES = {
  smile_right: 'assets/fiancee_smile_right.png',
  nervous:     'assets/fiancee_nervous.png',
  thinking:    'assets/fiancee_thinking.png',
};

const SHEEP_IMAGES = {
  professor: 'assets/sheep_professor.png',
};

// ── Step definitions ──────────────────────────
//
//  Each step is one of three shapes:
//
//  { type: 'dialogue', speaker: 'fiancee'|'sheep',
//    fianceeImg: <key>, text: <string> }
//
//  { type: 'enter' }          ← sheep walk-in, no text
//
//  { type: 'end' }            ← fade-out + complete
//
const STEPS = [
  {
    type:      'dialogue',
    speaker:   'fiancee',
    fianceeImg:'smile_right',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:      "What a beautiful day... Eid vibes are everywhere ☀️",
  },
  {
    type: 'enter',            // sheep walks in from right
  },
  {
    type:      'dialogue',
    speaker:   'fiancee',
    fianceeImg:'nervous',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:      "Umm... is that a talking sheep?! 😳",
  },
  {
    type:      'dialogue',
    speaker:   'sheep',
    fianceeImg:'nervous',
    speakerName: 'Prof. Sheep',
    speakerLabel: 'sheep',
    text:      "Welcome! I am Professor Sheep",
  },
  {
    type:      'dialogue',
    speaker:   'sheep',
    fianceeImg:'nervous',
    speakerName: 'Prof. Sheep',
    speakerLabel: 'sheep',
    text:      "I have prepared a few questions for you today!",
  },
  {
    type:      'dialogue',
    speaker:   'fiancee',
    fianceeImg:'thinking',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:      "Hmm... questions?",
  },
  {
    type:      'dialogue',
    speaker:   'fiancee',
    fianceeImg:'smile_right',
    speakerName: 'Mariam',
    speakerLabel: 'mariam',
    text:      "Alright... let's do it! 😄",
    isLast:    true,
  },
  {
    type: 'end',
  },
];

// ── State ─────────────────────────────────────
let stepIndex     = 0;
let isTyping      = false;
let typingTimeout = null;
let currentText   = '';      // full text of current dialogue step

// ── DOM refs ──────────────────────────────────
const scene         = document.getElementById('scene');

const fianceeWrap   = document.getElementById('fiancee-wrap');
const sheepWrap     = document.getElementById('sheep-wrap');

const bubbleFiancee = document.getElementById('bubble-fiancee');
const bubbleSheep   = document.getElementById('bubble-sheep');

const textFiancee   = document.getElementById('text-fiancee');
const textSheep     = document.getElementById('text-sheep');

const btnFiancee    = document.getElementById('next-btn-fiancee');
const btnSheep      = document.getElementById('next-btn-sheep');

// ============================================
//  TYPEWRITER ENGINE
// ============================================

function typeText(el, text, onDone) {
  el.textContent = '';
  el.classList.add('typing');
  isTyping = true;
  currentText = text;

  const chars = [...text]; // emoji-safe spread
  let i = 0;

  function tick() {
    if (i < chars.length) {
      el.textContent += chars[i++];
      typingTimeout = setTimeout(tick, 45);
    } else {
      finishTyping(el, onDone);
    }
  }
  tick();
}

function skipType(el) {
  clearTimeout(typingTimeout);
  el.textContent = currentText;
  finishTyping(el, null);
}

function finishTyping(el, onDone) {
  isTyping = false;
  el.classList.remove('typing');
  if (onDone) onDone();
}

// ============================================
//  CHARACTER HELPERS
// ============================================

/**
 * Switch the fiancée image instantly.
 * Works whether the element is an <img> or the
 * placeholder <div> (placeholder is ignored).
 */
function setFianceeImage(key) {
  const img = fianceeWrap.querySelector('img');
  if (img && key) img.src = FIANCEE_IMAGES[key];
  // If still using placeholder div, no action needed —
  // swap the div out for an <img> when you add assets.
}

// ============================================
//  BUBBLE HELPERS
// ============================================

/**
 * Hide both bubbles, show the one for `speaker`,
 * position it above the correct character,
 * then type the text.
 */
function showBubble(speaker, text, btnLabel, speakerName, speakerLabel, onDone) {
  // Hide both
  hideBubble(bubbleFiancee);
  hideBubble(bubbleSheep);

  const bubble = speaker === 'fiancee' ? bubbleFiancee : bubbleSheep;
  const textEl = speaker === 'fiancee' ? textFiancee   : textSheep;
  const btn    = speaker === 'fiancee' ? btnFiancee     : btnSheep;

  const labelId = speaker === 'fiancee' ? 'label-fiancee' : 'label-sheep';
  const labelEl = document.getElementById(labelId);
  if (labelEl) { labelEl.textContent = speakerName; labelEl.className = `dialogue-label ${speakerLabel}`; }

  // Position bubble above the right character
  positionBubble(bubble, speaker);

  btn.textContent = btnLabel || 'Next ›';
  btn.disabled    = false;

  bubble.classList.remove('hidden');
  bubble.classList.add('visible');

  typeText(textEl, text, onDone);
}

function hideBubble(bubbleEl) {
  bubbleEl.classList.add('hidden');
  bubbleEl.classList.remove('visible');
}

/**
 * Positions the bubble above its character.
 * The bubble's bottom edge = top of char wrap + a gap.
 */
function positionBubble(bubble, speaker) {
  const charWrap    = speaker === 'fiancee' ? fianceeWrap : sheepWrap;
  const charBottom  = parseInt(getComputedStyle(document.documentElement)
                        .getPropertyValue('--char-bottom')) || 100;
  const charHeight  = charWrap.offsetHeight;
  const gap         = 18; // px gap between char top and bubble bottom

  bubble.style.bottom = (charBottom + charHeight + gap) + 'px';
}

// ============================================
//  STEP PROCESSOR
// ============================================

function processStep(index) {
  const step = STEPS[index];
  if (!step) return;

  if (step.type === 'end') {
    endScene();
    return;
  }

  if (step.type === 'enter') {
    doSheepEntrance();
    return;
  }

  if (step.type === 'dialogue') {
    // Switch fiancée image instantly before typing
    setFianceeImage(step.fianceeImg);

    const isLast   = !!step.isLast;
    const btnLabel = isLast ? "Let's go!" : 'Next ›';

    showBubble(step.speaker, step.text, btnLabel, step.speakerName, step.speakerLabel, () => {});
  }
}

// ============================================
//  NEXT BUTTON HANDLER (shared logic)
// ============================================

function handleNext(speaker) {
  const step   = STEPS[stepIndex];
  const textEl = speaker === 'fiancee' ? textFiancee : textSheep;

  // If still typing → skip to full text
  if (isTyping) {
    skipType(textEl);
    if (step.isLast) {
      const btn = speaker === 'fiancee' ? btnFiancee : btnSheep;
      btn.textContent = "Let's go! 🎮";
    }
    return;
  }

  // Advance
  stepIndex++;
  processStep(stepIndex);
}

btnFiancee.addEventListener('click', () => handleNext('fiancee'));
btnSheep.addEventListener('click',   () => handleNext('sheep'));

// ============================================
//  SHEEP WALK-IN
// ============================================

function doSheepEntrance() {
  // Hide any open bubbles & disable interaction during walk
  hideBubble(bubbleFiancee);
  hideBubble(bubbleSheep);

  // Trigger CSS transition: right: -280px → right: 8vw
  // (The CSS handles the animation via transition property)
  sheepWrap.classList.add('sheep-enter');

  // Listen for transition end, then auto-advance
  sheepWrap.addEventListener('transitionend', onSheepArrived, { once: true });
}

function onSheepArrived() {
  // Small pause so the arrival feels natural
  setTimeout(() => {
    stepIndex++;
    processStep(stepIndex);
  }, 350);
}

// ============================================
//  SCENE TRANSITIONS
// ============================================

function endScene() {
  // Disable all buttons
  btnFiancee.disabled = true;
  btnSheep.disabled   = true;

  // Hide bubbles
  hideBubble(bubbleFiancee);
  hideBubble(bubbleSheep);

  scene.classList.add('fade-out');
  scene.addEventListener('animationend', () => {
    console.log('Scene 2 complete');
    // TODO: window.location.href = 'scene3.html';
    window.location.href = 'scene3.html';
  }, { once: true });
}

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  // Wait for fade-in, then start
  setTimeout(() => processStep(0), 1200);
});
