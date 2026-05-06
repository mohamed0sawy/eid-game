// ============================================
//  SCENE SECRET — Only for her
//  Video → message lines → continue → scene3_7
// ============================================

// ── Message lines ─────────────────────────────
// Each object: { text, style }
// style: '' | 'italic' | 'name' | 'final'
const MESSAGE_LINES = [
  { text: "This… wasn’t part of the game.",          style: ''       },
  { text: "If you’re here, then it’s really you.", style: 'italic' },
  { text: "I just wanted a moment… that’s only yours.", style: ''       },
  { text: "A moment that no one else gets to see.",           style: 'italic' },
  { text: "Mariam…",                                   style: 'name'   },
  { text: "You’re more beautiful than any moment I could ever create.",   style: ''       },
  { text: "Your eyes…",                                style: 'italic' },
  { text: "they have something special.",              style: ''       },
  { text: "Calm… soft… and full of life.",             style: 'italic' },
  { text: "I can't really explain it…",               style: ''       },
  { text: "but they make everything feel better.",     style: ''       },
  { text: "And you…",                                  style: 'italic' },
  { text: "you are just… perfect in your own way.",   style: ''       },
  { text: "Simple… real… and beautiful.",             style: 'italic' },
  { text: "So this moment… is only for you.",        style: ''       },
  { text: "You really are something special, Mariom.", style: 'italic'  },
  { text: "Just… stay like this.",                     style: 'final'  },
];

// Delay between each line appearing (ms)
const LINE_DELAY    = 2500;
// Duration of each fade-in animation (ms) — matches CSS
const LINE_DURATION = 1100;

// ── DOM refs ──────────────────────────────────
const secretScene   = document.getElementById('secret-scene');
const video         = document.getElementById('secret-video');
const videoOverlay  = document.getElementById('video-overlay');
const messageWrap   = document.getElementById('message-wrap');
const messageLines  = document.getElementById('message-lines');
const continueBtn   = document.getElementById('continue-btn');
const secretMusic   = document.getElementById('secret-music');

// ============================================
//  START — play music + video together
// ============================================

window.addEventListener('load', () => {
  // Small delay to let page fade in first
  setTimeout(() => {
    startSecret();
  }, 400);
});

function startSecret() {
  // Start secret music softly
  secretMusic.volume = 0.75;
  secretMusic.play().catch(() => {});

  // Start video
  video.play().catch(() => {});

  // Listen for video end
  video.addEventListener('ended', onVideoEnd, { once: true });
}

// ============================================
//  VIDEO ENDS
// ============================================

function onVideoEnd() {
  // Show dark blur overlay over last frame
  videoOverlay.classList.remove('hidden');
  void videoOverlay.offsetWidth;
  videoOverlay.classList.add('visible');

  // Wait for overlay to settle, then show message
  setTimeout(() => {
    showMessage();
  }, 700);
}

// ============================================
//  MESSAGE SYSTEM
// ============================================

function showMessage() {
  messageWrap.classList.remove('hidden');
  messageLines.innerHTML = '';

  MESSAGE_LINES.forEach((line, i) => {
    const el = document.createElement('p');
    el.className = `msg-line ${line.style}`.trim();
    el.textContent = line.text;

    // Stagger each line's animation start
    const delay = i * LINE_DELAY;
    el.style.animationDelay      = delay + 'ms';
    el.style.animationPlayState  = 'running';

    messageLines.appendChild(el);
  });

  // Show continue button after all lines have appeared
  const totalDelay = MESSAGE_LINES.length * LINE_DELAY + LINE_DURATION + 1000;
  setTimeout(() => showContinueBtn(), totalDelay);
}

// ============================================
//  CONTINUE BUTTON
// ============================================

function showContinueBtn() {
  continueBtn.classList.remove('hidden');
  continueBtn.style.animationPlayState = 'running';

  continueBtn.addEventListener('click', onContinue, { once: true });
}

function onContinue() {
  // Fade scene to black
  secretScene.classList.add('fade-out');

  // Stop secret music gracefully
  fadeOutAudio(secretMusic, 1000);

  secretScene.addEventListener('animationend', () => {
    console.log('Secret scene complete');
    window.location.href = 'scene3_7.html';
  }, { once: true });
}

// ============================================
//  AUDIO HELPERS
// ============================================

// Gradually fade out an audio element over `duration` ms
function fadeOutAudio(audioEl, duration) {
  const steps    = 20;
  const interval = duration / steps;
  const decrement = audioEl.volume / steps;

  const timer = setInterval(() => {
    if (audioEl.volume > decrement) {
      audioEl.volume -= decrement;
    } else {
      audioEl.volume = 0;
      audioEl.pause();
      clearInterval(timer);
    }
  }, interval);
}