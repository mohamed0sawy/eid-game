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
  { text: "So this moment… is only for you.",         style: ''       },
  { text: "You really are something special.",         style: 'italic'  },
  { text: "Just… stay like this.",                     style: 'final'  },
];

// REMOVE the old MESSAGE_LINES array and replace with:
const MESSAGE_CHUNKS = [
  {
    lines: [
      { text: "This… wasn’t part of the game.",              style: ''       },
      { text: "If you’re here, then it’s really you.",  style: 'italic' },
      { text: "I just wanted a moment… that’s only yours.",   style: ''       },
      { text: "A moment that no one else gets to see.",             style: 'italic' },
    ]
  },
  {
    lines: [
      { text: "Mariam…",                                     style: 'name'   },
      { text: "You’re more beautiful than any moment I could ever create.",     style: ''       },
    ]
  },
  {
    lines: [
      { text: "Your eyes…",                                  style: 'italic' },
      { text: "they have something special.",                style: ''       },
      { text: "Calm… soft… and full of life.",               style: 'italic' },
    ]
  },
  {
    lines: [
      { text: "I can't really explain it…",                 style: ''       },
      { text: "but they make everything feel better.",       style: ''       },
    ]
  },
  {
    lines: [
      { text: "And you…",                                    style: 'italic' },
      { text: "you are just… perfect in your own way.",     style: ''       },
      { text: "Simple… real… and beautiful.",               style: 'italic' },
    ]
  },
  {
    lines: [
      { text: "So this moment… is only for you.",                             style: ''       },
      { text: "You really are something special.",                            style: 'italic' },
      { text: "Just… stay like this.",                          style: 'final'  },
    ]
  },
];

const CHUNK_DELAY    = 5000; // ms between chunks appearing
const CHUNK_DURATION = 1100;  // ms for fade-in animation

// Delay between each line appearing (ms)
const LINE_DELAY    = 2500;
// Duration of each fade-in animation (ms) — matches CSS
const LINE_DURATION = 1100;

// ── DOM refs ──────────────────────────────────
const secretScene   = document.getElementById('secret-scene');
const video         = document.getElementById('secret-video');
const videoOverlay  = document.getElementById('video-overlay');
const messageWrap   = document.getElementById('message-wrap');
const chunksContainer = document.getElementById('chunks-container');
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
  secretMusic.volume = 0.95;
  secretMusic.play().catch(() => {});

  // Start video
  setTimeout(() => {
    video.play().catch(() => {});
  }, 1000);

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
  chunksContainer.innerHTML = '';

  MESSAGE_CHUNKS.forEach((chunk, chunkIndex) => {
    const delay = chunkIndex * CHUNK_DELAY;

    setTimeout(() => {
      // ── Build chunk element ──────────────────
      const chunkEl = document.createElement('div');
      chunkEl.className = 'msg-chunk'; // starts opacity:0

      chunk.lines.forEach(line => {
        const p = document.createElement('p');
        p.className = `msg-line ${line.style}`.trim();
        p.textContent = line.text;
        chunkEl.appendChild(p);
      });

      chunksContainer.appendChild(chunkEl);

      // ── Trigger fade-in on next frame ────────
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          chunkEl.classList.add('active');
        });
      });

      // ── Dim previous chunks ──────────────────
      const allChunks = chunksContainer.querySelectorAll('.msg-chunk');
      allChunks.forEach((el, i) => {
        const age = allChunks.length - 1 - i; // 0 = newest
        el.classList.remove('active', 'dim-1', 'dim-2');
        if (age === 0) el.classList.add('active');
        else if (age === 1) el.classList.add('dim-1');
        else el.classList.add('dim-2');
      });

      // ── Push container up so new chunk centers ─
      shiftContainerUp();

      // ── Show continue after last chunk ───────
      const isLast = chunkIndex === MESSAGE_CHUNKS.length - 1;
      if (isLast) {
        setTimeout(() => showContinueBtn(), CHUNK_DURATION + 1000);
      }

    }, delay);
  });
}

function shiftContainerUp() {
  // Measure how tall the container is now
  // and offset it so the latest chunk stays near center
  requestAnimationFrame(() => {
    const containerH  = chunksContainer.scrollHeight;
    const viewportH   = window.innerHeight;
    const targetShift = Math.max(0, (containerH - viewportH * 0.55) / 2);
    chunksContainer.style.transform = `translateY(-${targetShift}px)`;
  });
}

// ============================================
//  CONTINUE BUTTON
// ============================================

function showContinueBtn() {
  continueBtn.classList.remove('hidden');
  // Force reflow before transition
  void continueBtn.offsetWidth;
  continueBtn.classList.add('revealed');
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