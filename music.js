// music.js — persistent background music across all scenes
(function () {
  const AUDIO_SRC = 'assets/eid-relax-music.mp3'; // ← rename to your file

  // If audio element already exists (same tab), do nothing
  if (document.getElementById('bg-music')) return;

  const audio = document.createElement('audio');
  audio.id     = 'bg-music';
  audio.src    = AUDIO_SRC;
  audio.loop   = true;
  audio.volume = 0.6; // adjust 0.0 – 1.0
  document.body.appendChild(audio);

  // Browsers block autoplay until user interacts.
  // We try to play immediately, and if blocked,
  // we wait for the first tap/click anywhere.
  function tryPlay() {
    audio.play().catch(() => {
      document.addEventListener('click', () => audio.play(), { once: true });
      document.addEventListener('touchstart', () => audio.play(), { once: true });
    });
  }

  tryPlay();
})();