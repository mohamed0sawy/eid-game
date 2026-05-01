// ============================================
//  SCENE 3.7 — Her World
//  Horizontal section slider · polaroid photos
// ============================================

// ── Section data ──────────────────────────────
// Replace captions with your own words.
// Add/remove photo paths to match your assets.
const SECTIONS = [
  {
    id:      1,
    title:   "Her ❤️",
    photos:  [
      'assets/her_1.jpg',
      'assets/her_2.jpg',
      'assets/her_3.jpg',
      'assets/her_4.jpg',
      'assets/her_5.jpg',
    ],
    caption: "The smile that makes everything better ❤️",
    gridId:  'grid-1',
    dotsId:  'dots-1',
    btnId:   'btn-1',
    backId:  'back-1',
  },
  {
    id:      2,
    title:   "Her Kitchen 🍰",
    photos:  [
      'assets/dessert_1.png',
      'assets/dessert_2.jpg',
      'assets/dessert_3.jpg',
    ],
    caption: "She cooks with love — you can taste it 😍",
    gridId:  'grid-2',
    dotsId:  'dots-2',
    btnId:   'btn-2',
    backId:  'back-2',
  },
  {
    id:      3,
    title:   "Her Art 🎨",
    photos:  [
      'assets/art_1.jpg',
      'assets/art_2.jpg',
      'assets/art_3.jpg',
    ],
    caption: "She creates beauty everywhere she goes 🎨",
    gridId:  'grid-3',
    dotsId:  'dots-3',
    btnId:   'btn-3',
    backId:  'back-3',
    isLast:  true,
  },
];

const TOTAL_SECTIONS = SECTIONS.length;

// ── Fixed rotation angles per photo slot ──────
// 15 values covers all photos across all sections
// Subtle ±8° as planned
const ROTATIONS = [-5, 3, -7, 6, -3, 7, -6, 4, -4, 8, -2, 5, -8, 3, -6];

// ── State ─────────────────────────────────────
let currentSection = 0; // 0-indexed

// ── DOM refs ──────────────────────────────────
const scene     = document.getElementById('scene');
const worldWrap = document.getElementById('world-wrap');

// ============================================
//  BUILD POLAROIDS
//  Injects polaroid divs into each grid
// ============================================

function buildAllGrids() {
  let globalPhotoIndex = 0; // tracks rotation across all sections

  SECTIONS.forEach(section => {
    const grid = document.getElementById(section.gridId);
    if (!grid) return;

    section.photos.forEach((src, i) => {
      const rotation = ROTATIONS[globalPhotoIndex % ROTATIONS.length];
      globalPhotoIndex++;

      const polaroid = document.createElement('div');
      polaroid.className = 'polaroid';

      // Set CSS custom property for rotation
      // used in @keyframes polaroidDrop
      polaroid.style.setProperty('--rotate', `rotate(${rotation}deg)`);

      // Stagger delay so photos drop in one by one
      polaroid.style.animationDelay  = `${0.15 * i + 0.3}s`;
      // Final resting transform (after animation ends)
      polaroid.style.transform       = `rotate(${rotation}deg)`;

      const img = document.createElement('img');
      img.src   = src;
      img.alt   = section.title;
      // Graceful fallback — show warm placeholder if image missing
      img.onerror = function () {
        this.style.display     = 'none';
        polaroid.style.background = '#F0E8D5';
        polaroid.style.minHeight  = '80px';
      };

      polaroid.appendChild(img);
      grid.appendChild(polaroid);
    });
  });
}

// ============================================
//  BUILD PROGRESS DOTS
//  Same dots rendered in each card footer
// ============================================

function buildAllDots() {
  SECTIONS.forEach(section => {
    const container = document.getElementById(section.dotsId);
    if (!container) return;

    SECTIONS.forEach((_, i) => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.dataset.section = i;
      if (i === 0) dot.classList.add('active'); // first section active initially
      container.appendChild(dot);
    });
  });
}

// ── Update all dot sets to reflect current section
function updateDots(sectionIndex) {
  document.querySelectorAll('.dot').forEach(dot => {
    const belongs = parseInt(dot.dataset.section);
    dot.classList.toggle('active', belongs === sectionIndex);
  });
}

// ============================================
//  SLIDE TO SECTION
// ============================================

function slideToSection(index) {
  // Move the world strip
  worldWrap.style.transform = `translateX(-${index * 100}vw)`;
  updateDots(index);
}

// ============================================
//  NEXT BUTTON HANDLERS
// ============================================

function handleNext(sectionIndex) {
  const section = SECTIONS[sectionIndex];

  if (section.isLast) {
    endScene();
    return;
  }

  currentSection++;
  slideToSection(currentSection);
}

function handleBack(sectionIndex) {
  if (sectionIndex === 0) return; // safety — shouldn't happen
  currentSection--;
  slideToSection(currentSection);
}

function bindButtons() {
  SECTIONS.forEach((section, i) => {
    const btn = document.getElementById(section.btnId);
    if (!btn) return;
    btn.addEventListener('click', () => handleNext(i));
    const backBtn = document.getElementById(section.backId);
    if (backBtn) {
      if (i === 0) backBtn.classList.add('invisible'); // hide on first section
      backBtn.addEventListener('click', () => handleBack(i));
    }
  });
}

// ============================================
//  SCENE END
// ============================================

function endScene() {
  scene.classList.add('fade-out');
  scene.addEventListener('animationend', () => {
    console.log('Scene 3.7 complete');
    window.location.href = 'scene4.html';
  }, { once: true });
}

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  buildAllGrids();
  buildAllDots();
  bindButtons();

  // Small delay to let fade-in complete before cards pop
  setTimeout(() => {
    slideToSection(0);
  }, 100);
});

// ============================================
//  VOICE NOTE PLAYER — Section 2 only
// ============================================

(function initVoicePlayer() {
  const audio       = document.getElementById('voice-audio');
  const playBtn     = document.getElementById('voice-play-btn');
  const icon        = document.getElementById('voice-icon');
  const fill        = document.getElementById('voice-progress-fill');
  const progressWrap= document.getElementById('voice-progress-wrap');

  if (!audio || !playBtn) return;

  let isPlaying = false;
  let rafId     = null;

  // ── Get background music element (from music.js) ──
  function getBgMusic() {
    return document.getElementById('bg-music');
  }

  // ── Update progress bar via requestAnimationFrame ──
  function updateProgress() {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width = pct + '%';
    if (isPlaying) rafId = requestAnimationFrame(updateProgress);
  }

  // ── Play ──────────────────────────────────────────
  function play() {
    const bg = getBgMusic();
    if (bg && !bg.paused) bg.pause();

    audio.play();
    isPlaying = true;
    icon.textContent = '⏸';
    playBtn.classList.add('playing');
    rafId = requestAnimationFrame(updateProgress);
  }

  // ── Pause ─────────────────────────────────────────
  function pause() {
    audio.pause();
    isPlaying = false;
    icon.textContent = '▶';
    playBtn.classList.remove('playing');
    cancelAnimationFrame(rafId);

    const bg = getBgMusic();
    if (bg) bg.play().catch(() => {});
  }

  // ── Toggle ────────────────────────────────────────
  playBtn.addEventListener('click', () => {
    if (isPlaying) {
      pause();
    } else {
      // Restart from beginning if already ended
      if (audio.ended) {
        audio.currentTime = 0;
        fill.style.width  = '0%';
      }
      play();
    }
  });

  // ── Audio ended → resume background music ─────────
  audio.addEventListener('ended', () => {
    isPlaying = false;
    icon.textContent = '▶';
    playBtn.classList.remove('playing');
    fill.style.width = '0%';
    cancelAnimationFrame(rafId);

    const bg = getBgMusic();
    if (bg) bg.play().catch(() => {});
  });

  // ── Tap on progress bar to seek ───────────────────
  progressWrap.addEventListener('click', (e) => {
    if (!audio.duration) return;
    const rect = progressWrap.getBoundingClientRect();
    const pct  = (e.clientX - rect.left) / rect.width;
    audio.currentTime = pct * audio.duration;
    fill.style.width  = (pct * 100) + '%';
  });

  // ── Pause voice if user leaves Section 2 ──────────
  // Listens for the world-wrap transition and pauses if needed
  document.getElementById('world-wrap').addEventListener('transitionend', () => {
    if (isPlaying) pause();
  });

})();
