// ============================================
//  SCENE 3.5 — The Memory Book
//  Step machine · book animation · puzzle
// ============================================

// ── PAGE DATA ─────────────────────────────────
// Set your actual day numbers here.
// These are also used as puzzle answers.
const PAGES = [
  {
    id: 1,
    date: "12/2025",           // ← replace with real day number
    month: 12,  // Add explicit month field
    year: 2025
    // text & image handled in HTML
  },
  {
    id: 2,
    date: "1/2026",           // ← replace with real day number
    month: 1,  // Add explicit month field
    year: 2026
  },
  {
    id: 3,
    date: "2/2026",            // ← replace with real day number
    month: 2,  // Add explicit month field
    year: 2026
  },
];

// Puzzle answer = [PAGES[0].day, PAGES[1].day, PAGES[2].day]
// Extracted automatically — do NOT hardcode separately.

// ── DOM refs ──────────────────────────────────
const scene            = document.getElementById('scene');
const fianceeWrap      = document.getElementById('fiancee-wrap');
const fianceeImg       = document.getElementById('fiancee');

const bookGroundWrap   = document.getElementById('book-ground-wrap');
const bookActivatedWrap= document.getElementById('book-activated-wrap');
const bookActivatedImg = document.getElementById('book-activated-img');
const bookOverlay      = document.getElementById('book-overlay');

const bubbleFiancee    = document.getElementById('bubble-fiancee');
const labelFiancee     = document.getElementById('label-fiancee');
const textFiancee      = document.getElementById('text-fiancee');
const btnFiancee       = document.getElementById('next-btn-fiancee');

const pageIndicator    = document.getElementById('page-indicator');
const pagePrev         = document.getElementById('page-prev');
const pageNext         = document.getElementById('page-next');

const puzzleSubmit     = document.getElementById('puzzle-submit');
const puzzleFeedback   = document.getElementById('puzzle-feedback');

// ── State ─────────────────────────────────────
let stepIndex   = 0;
let currentPage = 1;  // 1-indexed, 4 pages total
const TOTAL_PAGES = 4;

let isTyping      = false;
let typingTimeout = null;
let currentText   = '';

// ── Fiancée images ────────────────────────────
const FIANCEE_IMG = {
  smile_right:   'assets/fiancee_smile_right.png',
  looking_down:  'assets/fiancee_looking_down.png',
  nervous:       'assets/fiancee_nervous.png',
};

// ── Steps ─────────────────────────────────────
//
//  type: 'walk'      — move fiancee
//  type: 'dialogue'  — show bubble + type text
//  type: 'showBook'  — drop book on ground
//  type: 'activateBook' — raise + open book sequence
//
const STEPS = [
  // 0 — fiancee walks in from off-screen
  {
    type:   'walk',
    target: 'walk-in',
  },
  // 1 — first dialogue
  {
    type:        'dialogue',
    fianceeImg:  'smile_right',
    speakerName: 'Mariam',
    speakerLabel:'mariam',
    text:        "That professor sheep was… weird 😄",
  },
  // 2 — second dialogue
  {
    type:        'dialogue',
    fianceeImg:  'smile_right',
    speakerName: 'Mariam',
    speakerLabel:'mariam',
    text:        "But I think I did pretty well 😏",
  },
  // 3 — book appears on ground
  {
    type: 'showBook',
  },
  // 4 — she looks down at it
  {
    type:        'dialogue',
    fianceeImg:  'looking_down',
    speakerName: 'Mariam',
    speakerLabel:'mariam',
    text:        "Hmm… what's this?",
  },
  // 5 — she walks toward book
  {
    type:   'walk',
    target: 'walk-to-book',
  },
  // 6 — she reacts
  {
    type:        'dialogue',
    fianceeImg:  'looking_down',
    speakerName: 'Mariam',
    speakerLabel:'mariam',
    text:        "A book?!",
  },
  // 7 — book activates (raise → open)
  {
    type: 'activateBook',
  },
];

// ============================================
//  TYPEWRITER
// ============================================

function typeText(el, text, onDone) {
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
      if (onDone) onDone();
    }
  }
  tick();
}

function skipType() {
  clearTimeout(typingTimeout);
  textFiancee.textContent = currentText;
  isTyping = false;
  textFiancee.classList.remove('typing');
}

// ============================================
//  BUBBLE HELPERS
// ============================================

function hideBubble() {
  bubbleFiancee.classList.add('hidden');
  bubbleFiancee.classList.remove('visible');
}

function positionBubble() {
  const charBottom = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue('--char-bottom')
  ) || 100;
  const charHeight = fianceeWrap.offsetHeight;
  bubbleFiancee.style.bottom = (charBottom + charHeight + 18) + 'px';
}

function showDialogue(step) {
  if (step.fianceeImg) fianceeImg.src = FIANCEE_IMG[step.fianceeImg];

  labelFiancee.textContent = step.speakerName;
  labelFiancee.className   = `dialogue-label ${step.speakerLabel}`;

  btnFiancee.textContent = 'Next ›';
  btnFiancee.disabled    = false;

  positionBubble();
  bubbleFiancee.classList.remove('hidden');
  void bubbleFiancee.offsetWidth;
  bubbleFiancee.classList.add('visible');

  typeText(textFiancee, step.text);
}

// ============================================
//  MOVE CHARACTER
// ============================================

function moveCharacter(targetClass, onDone) {
  hideBubble();
  btnFiancee.disabled = true;

  // Remove previous walk classes
  fianceeWrap.classList.remove('walk-in', 'walk-to-book');
  void fianceeWrap.offsetWidth;

  fianceeWrap.classList.add(targetClass);

  fianceeWrap.addEventListener('transitionend', () => {
    setTimeout(() => { if (onDone) onDone(); }, 300);
  }, { once: true });
}

// ============================================
//  BOOK — SHOW ON GROUND
// ============================================

function showBook(onDone) {
  hideBubble();

  // Drop the book in
  bookGroundWrap.classList.remove('hidden');

  // After short delay — shake + float
  setTimeout(() => {
    bookGroundWrap.classList.add('book-shake');
    bookGroundWrap.addEventListener('animationend', () => {
      bookGroundWrap.classList.remove('book-shake');
      bookGroundWrap.classList.add('book-float');
      if (onDone) onDone();
    }, { once: true });
  }, 400);
}

// ============================================
//  BOOK — ACTIVATE (raise → open)
// ============================================

function activateBook(onDone) {
  hideBubble();

  // Hide the ground book first
  bookGroundWrap.classList.remove('book-float');
  bookGroundWrap.classList.add('hidden');

  // Show book_front, but start it small and centered
  bookActivatedImg.src = 'assets/book_front.png';
  bookActivatedWrap.classList.remove('hidden');

  // IMPORTANT: force the element to be visible before adding class
  void bookActivatedWrap.offsetWidth;

  // Trigger rise after a tiny delay so browser registers the start state
  setTimeout(() => {
    bookActivatedWrap.classList.add('book-rise');
  }, 50);

  // Switch to open_25
  setTimeout(() => {
    bookActivatedImg.src = 'assets/book_open_25.png';
  }, 1500);

  // Switch to open_100
  setTimeout(() => {
    bookActivatedImg.src = 'assets/book_open_100.png';
    bookActivatedWrap.classList.add('book-fully-open');
  }, 2450);

  // Fade char + show overlay
  setTimeout(() => {
    fianceeWrap.classList.add('fade-char');
    bookActivatedWrap.classList.add('hidden');
    openBookOverlay();
    if (onDone) onDone();
  }, 2950);
}

// ============================================
//  BOOK OVERLAY (fully open UI)
// ============================================

function openBookOverlay() {
  // Stamp day numbers onto pages
  PAGES.forEach((p, i) => {
    const el = document.getElementById(`date-${i + 1}`);
    if (el) {
      if (i === 0) {
        // For date-1: add the extra statement
        el.innerHTML = `Date: ${p.date}<br><small>(Focus, we will need this date)</small>`;
      } else {
        // For all other dates: just the month
        el.textContent = `Date: ${p.date}`;
      }
    }
  });

  bookOverlay.classList.remove('hidden');
  renderPage(1);
}

// ============================================
//  PAGE SYSTEM
// ============================================

function renderPage(pageNum) {
  currentPage = pageNum;

  // Hide all pages
  document.querySelectorAll('.book-page').forEach(p => {
    p.classList.remove('active');
  });

  // Show target
  const target = document.getElementById(`page-${pageNum}`);
  if (target) target.classList.add('active');

  // Update indicator
  pageIndicator.textContent = `Page ${pageNum} / ${TOTAL_PAGES}`;

  // Nav buttons
  pagePrev.disabled = pageNum === 1;
  pageNext.disabled = pageNum === TOTAL_PAGES;
}

function nextPage() {
  if (currentPage < TOTAL_PAGES) renderPage(currentPage + 1);
}

function prevPage() {
  if (currentPage > 1) renderPage(currentPage - 1);
}

pagePrev.addEventListener('click', prevPage);
pageNext.addEventListener('click', nextPage);

// ============================================
//  PUZZLE VALIDATION
// ============================================

let hasTriedOnce = false;
function validatePuzzle() {
  const answers = PAGES.map(p => p.month);

  const inputs = [
    document.getElementById('p-input-1'),
    document.getElementById('p-input-2'),
    document.getElementById('p-input-3'),
  ];

  const values = inputs.map(inp => parseInt(inp.value.trim(), 10));

  // ── ADD THIS BLOCK — secret code check ──────
    const SECRET = [2, 4, 2]; // secret code
    const isSecret = values.every((val, i) => val === SECRET[i]);
    if (isSecret) {
      puzzleSubmit.disabled = true;
      inputs.forEach(inp => inp.disabled = true);
      setTimeout(() => startSecretScene(), 500);
      return; // stop here — don't show correct/wrong
    }


  const allCorrect = values.every((val, i) => val === answers[i]);

  puzzleFeedback.classList.remove('hidden', 'correct', 'wrong');

  if (allCorrect) {
    puzzleFeedback.textContent = '✅ Correct!';
    puzzleFeedback.classList.add('correct');
    puzzleSubmit.disabled = true;
    inputs.forEach(inp => inp.disabled = true);

    setTimeout(() => endScene(), 1800);
  } else {
    puzzleFeedback.textContent = 'Hmm… try again';
    puzzleFeedback.classList.add('wrong');
    if (!hasTriedOnce) {
        hasTriedOnce = true;
        document.getElementById('puzzle-hint').classList.remove('hidden');
      }

    // Shake wrong inputs
    inputs.forEach((inp, i) => {
      if (values[i] !== answers[i]) {
        inp.classList.remove('shake');
        void inp.offsetWidth;
        inp.classList.add('shake');
        inp.addEventListener('animationend', () => inp.classList.remove('shake'), { once: true });
      }
    });
  }
}

puzzleSubmit.addEventListener('click', validatePuzzle);

// Also allow Enter key to submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !bookOverlay.classList.contains('hidden')) {
    validatePuzzle();
  }
});

// Restrict all puzzle inputs to max 2 digits
const puzzleInputs = document.querySelectorAll('.puzzle-input');
puzzleInputs.forEach(input => {
  input.addEventListener('input', function(e) {
    // Remove any non-digit characters
    this.value = this.value.replace(/\D/g, '');

    // Limit to 2 digits
    if (this.value.length > 2) {
      this.value = this.value.slice(0, 2);
    }
  });
});

// ── Secret scene trigger ───────────────────────
function startSecretScene() {
  // Stop background music
  const bg = document.getElementById('bg-music');
  if (bg) { bg.pause(); bg.currentTime = 0; }

  // Create black fade overlay
  const blackout = document.createElement('div');
  blackout.id = 'secret-blackout';
  blackout.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: #000;
    opacity: 0;
    transition: opacity 1s ease;
    pointer-events: all;
  `;
  document.body.appendChild(blackout);

  // Trigger fade to black
  void blackout.offsetWidth;
  blackout.style.opacity = '1';

  // After fade completes → redirect
  setTimeout(() => {
    window.location.href = 'scene3_secret.html';
  }, 1100);
}

// ============================================
//  STEP PROCESSOR
// ============================================

function processStep(index) {
  const step = STEPS[index];
  if (!step) return;

  if (step.type === 'walk') {
    moveCharacter(step.target, () => {
      stepIndex++;
      processStep(stepIndex);
    });
    return;
  }

  if (step.type === 'showBook') {
    showBook(() => {
      stepIndex++;
      processStep(stepIndex);
    });
    return;
  }

  if (step.type === 'activateBook') {
    activateBook(() => {
      // Book is now open — puzzle flow takes over
    });
    return;
  }

  if (step.type === 'dialogue') {
    showDialogue(step);
  }
}

// ── Next button ───────────────────────────────
btnFiancee.addEventListener('click', () => {
  if (isTyping) {
    skipType();
    return;
  }

  stepIndex++;
  processStep(stepIndex);
});

// ============================================
//  SCENE END
// ============================================

function endScene() {
  bookOverlay.classList.add('hidden');
  scene.classList.add('fade-out');

  scene.addEventListener('animationend', () => {
    console.log('Scene 3.5 complete — Go to Scene 4');
    window.location.href = 'scene3_7.html';
  }, { once: true });
}

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  setTimeout(() => processStep(0), 1200);
});
