// ============================================
//  HAPPY EID GAME — SCENE 1 (FIXED)
//  Dialogue engine + typing effect + fade-out
// ============================================

// ── Dialogue content ──────────────────────────
const DIALOGUES = [
  "To the one who smiles like the moon, burns the tea every morning , and has the biggest heart — Mariam ❤️ Happy Eid!",
  "I made something special for you... a small game 😎",
  "Are you ready? Let's go!"
];

// ── State ─────────────────────────────────────
let currentIndex  = 0;
let isTyping      = false;
let typingTimeout = null;
let currentFullText = "";  // Store current text being typed

// ── DOM refs ──────────────────────────────────
const scene       = document.getElementById('scene');
const dialogueEl  = document.getElementById('dialogue-text');
const nextBtn     = document.getElementById('next-btn');

// ============================================
//  TYPEWRITER (FIXED)
// ============================================

function typeText(text, onDone) {
  dialogueEl.textContent = '';
  dialogueEl.classList.add('typing');
  isTyping = true;
  currentFullText = text;

  let charIndex = 0;
  // Use Array.from for better emoji handling
  const chars = Array.from(text);

  function typeNext() {
    if (charIndex < chars.length) {
      dialogueEl.textContent += chars[charIndex];
      charIndex++;
      typingTimeout = setTimeout(typeNext, 45);
    } else {
      finishTyping(onDone);
    }
  }

  typeNext();
}

function skipTyping() {
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  // Set the complete text at once
  dialogueEl.textContent = currentFullText;
  finishTyping(null);
}

function finishTyping(onDone) {
  isTyping = false;
  dialogueEl.classList.remove('typing');
  if (typingTimeout) {
    clearTimeout(typingTimeout);
    typingTimeout = null;
  }
  if (onDone && typeof onDone === 'function') {
    onDone();
  }
}

// ============================================
//  DIALOGUE FLOW
// ============================================

function showDialogue(index) {
  // Safety check
  if (index >= DIALOGUES.length) {
    console.error("Index out of bounds:", index);
    return;
  }

  const text = DIALOGUES[index];
  animateBubble();

  typeText(text, () => {
    if (index === DIALOGUES.length - 1) {
      nextBtn.textContent = "Let's go! ›";
    }
  });

  if (index < DIALOGUES.length - 1) {
    nextBtn.textContent = "Next ›";
  }
}

function handleNext() {
  // Safety check
  if (currentIndex >= DIALOGUES.length) {
    endScene();
    return;
  }

  if (isTyping) {
    skipTyping();
    if (currentIndex === DIALOGUES.length - 1) {
      nextBtn.textContent = "Let's go! ›";
    }
    return;
  }

  if (currentIndex === DIALOGUES.length - 1) {
    endScene();
    return;
  }

  currentIndex++;
  showDialogue(currentIndex);
}

// ============================================
//  SCENE TRANSITIONS
// ============================================

function endScene() {
  nextBtn.disabled = true;
  nextBtn.style.opacity = '0.5';
  nextBtn.style.cursor = 'default';

  scene.classList.add('fade-out');

  scene.addEventListener('animationend', () => {
    console.log('Scene 1 complete — Mariam scene finished');
  }, { once: true });
}

function animateBubble() {
  const box = document.getElementById('dialogue-box');
  if (!box) return;
  box.style.animation = 'none';
  void box.offsetWidth; // Force reflow
  box.style.animation = '';
}

// ============================================
//  EVENT LISTENERS
// ============================================

nextBtn.addEventListener('click', handleNext);

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  setTimeout(() => {
    showDialogue(currentIndex);
  }, 1200);
});