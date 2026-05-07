// ============================================
//  SCENE SECRET — Only for her
//  Video → message lines → continue → scene3_7
// ============================================

// ── Message lines ─────────────────────────────
// Each object: { text, style }
// style: '' | 'italic' | 'name' | 'final'
//const MESSAGE_LINES = [
//  { text: "This… wasn’t part of the game.",          style: ''       },
//  { text: "If you’re here, then it’s really you.", style: 'italic' },
//  { text: "I just wanted a moment… that’s only yours.", style: ''       },
//  { text: "A moment that no one else gets to see.",           style: 'italic' },
//  { text: "Mariam…",                                   style: 'name'   },
//  { text: "You’re more beautiful than any moment I could ever create.",   style: ''       },
//  { text: "Your eyes…",                                style: 'italic' },
//  { text: "they have something special.",              style: ''       },
//  { text: "Calm… soft… and full of life.",             style: 'italic' },
//  { text: "I can't really explain it…",               style: ''       },
//  { text: "but they make everything feel better.",     style: ''       },
//  { text: "And you…",                                  style: 'italic' },
//  { text: "you are just… perfect in your own way.",   style: ''       },
//  { text: "Simple… real… and beautiful.",             style: 'italic' },
//  { text: "So this moment… is only for you.",         style: ''       },
//  { text: "You really are something special.",         style: 'italic'  },
//  { text: "Just… stay like this.",                     style: 'final'  },
//];

// ── Message lines (flat, no chunks) ───────────
const MESSAGE_LINES = [
  { text: "This… wasn’t part of the game.",              style: ''       },
  { text: "If you’re here, then it’s really you.",  style: 'italic' },
  { text: "I just wanted a moment… that’s only yours.",   style: ''       },
  { text: "A moment that no one else gets to see.",             style: 'italic' },
  null, // spacer
  { text: "Mariam…",                                     style: 'name'   },
  { text: "You’re more beautiful than any moment I could ever create.",     style: ''       },
  null, // spacer
  { text: "Your eyes…",                                  style: 'italic' },
  { text: "they have something special.",                style: ''       },
  { text: "Calm… soft… and full of life.",               style: 'italic' },
  null, // spacer
  { text: "I can't really explain it…",                 style: ''       },
  { text: "but they make everything feel better.",       style: ''       },
  null, // spacer
  { text: "And you…",                                    style: 'italic' },
  { text: "you are just… perfect in your own way.",     style: ''       },
  { text: "Simple… real… and beautiful.",               style: 'italic' },
  null, // spacer
  { text: "So this moment… is only for you.",                             style: ''       },
  { text: "You really are something special.",                            style: 'italic' },
  { text: "Just… stay like this.",                          style: 'final'  },
];

// ── Scroll settings ────────────────────────────
const SCROLL_PX_PER_FRAME = 0.29;   // base speed — lower = slower
const SLOWDOWN_ZONE_PX    = 70;    // how many px from end to start slowing
const SLOWDOWN_FACTOR     = 0.3;    // speed multiplier in slowdown zone

// ── Scroll state ───────────────────────────────
let currentY      = 0;   // current translateY of track (starts positive = below)
let targetY       = 0;   // final resting translateY
let rafId         = null;
let scrollDone    = false;


// ── DOM refs ──────────────────────────────────
const secretScene   = document.getElementById('secret-scene');
const video         = document.getElementById('secret-video');
const videoOverlay  = document.getElementById('video-overlay');
const messageWrap   = document.getElementById('message-wrap');
const messageTrack = document.getElementById('message-track');
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
//  BUILD MESSAGE TRACK
// ============================================

function buildMessageTrack() {
  messageTrack.innerHTML = '';

  MESSAGE_LINES.forEach(line => {
    if (line === null) {
      // Spacer between groups
      const spacer = document.createElement('div');
      spacer.className = 'msg-spacer';
      messageTrack.appendChild(spacer);
      return;
    }

    const p = document.createElement('p');
    p.className = `msg-line ${line.style}`.trim();
    p.textContent = line.text;
    messageTrack.appendChild(p);
  });
}

// ============================================
//  SHOW MESSAGE — entry point (replaces old showMessage)
// ============================================

function showMessage() {
  buildMessageTrack();
  messageWrap.classList.remove('hidden');

  const vh = window.innerHeight;

  // Start position: top of track sits at bottom of viewport
  // so content scrolls up naturally into view
  currentY = vh * 0.85;
  messageTrack.style.transform = `translateY(${currentY}px)`;

  // Target: last line rests ~30% below center
  // We want the bottom of the track to stop at 65% down the screen
  const trackH = messageTrack.scrollHeight;
  targetY = -(trackH - vh * 0.80);

  // Small delay so overlay settles before scroll starts
  setTimeout(() => startAutoScroll(), 600);
}

// ============================================
//  AUTO SCROLL — rAF loop
// ============================================

function startAutoScroll() {
  function step() {
    if (scrollDone) return;

    const distanceLeft = currentY - targetY;

    // Determine speed — slow down near end
    let speed = SCROLL_PX_PER_FRAME;
    if (distanceLeft < SLOWDOWN_ZONE_PX) {
      // Linear ease-out in slowdown zone
      const factor = distanceLeft / SLOWDOWN_ZONE_PX;
      speed = SCROLL_PX_PER_FRAME * (SLOWDOWN_FACTOR + (1 - SLOWDOWN_FACTOR) * factor);
      speed = Math.max(speed, 0.08); // never fully stop mid-scroll
    }

    if (currentY > targetY) {
      currentY -= speed;
      if (currentY <= targetY) {
        currentY = targetY;
        messageTrack.style.transform = `translateY(${currentY}px)`;
        onScrollComplete();
        return;
      }
    } else {
      onScrollComplete();
      return;
    }

    messageTrack.style.transform = `translateY(${currentY}px)`;
    rafId = requestAnimationFrame(step);
  }

  rafId = requestAnimationFrame(step);
}

// ============================================
//  SCROLL COMPLETE
// ============================================

function onScrollComplete() {
  scrollDone = true;
  cancelAnimationFrame(rafId);

  // Pause before showing button
  setTimeout(() => {
    showContinueBtn();

    // Enable manual scrolling after button appears
    setTimeout(() => {
      enableManualScroll();
    }, 800);
  }, 1000);
}

function enableManualScroll() {
  // Switch message-wrap to scrollable
  messageWrap.classList.add('scrollable');

  // Sync native scroll position to where rAF left off
  // so there's no jump when taking over
  messageWrap.scrollTop = -targetY + window.innerHeight * 0.85
                          - messageWrap.clientHeight * 0.85;
  messageTrack.style.transform = 'translateY(0)';
  messageTrack.style.paddingTop =
    `${window.innerHeight * 0.85}px`;
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