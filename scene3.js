// ============================================
//  SCENE 3 — The Quiz
//  Quiz engine · answer handling · final input
// ============================================

// ── Questions ─────────────────────────────────
const questions = [
  {
    text: "What does you love to drink after meals?",
    choices: ["Juice 🧃", "Tea or Nescafe ☕", "Water 💧"],
    correctIndex: 1
  },
  {
    text: "How does you like your tea? 🍵",
    choices: ["Light with no sugar", "Very light with a lot of sugar", "Heavy with one spoon of sugar"],
    correctIndex: 2
  },
  {
    text: "What happens when you gets very hungry?",
    choices: ["Becomes very active 💪", "dizzy, and in a bad mood 😤", "Starts laughing 😂"],
    correctIndex: 1
  },
  {
    text: "What does you prefer more?",
    choices: ["Sleeping more 😴", "Waking up early 🌅", "Both equally"],
    correctIndex: 0
  },
  {
    text: "What is your profession?",
    choices: ["Engineer 💻", "Pharmacist 💊", "Teacher 📚"],
    correctIndex: 1
  },
  {
    text: "What is Mohamed's favorite color?",
    choices: ["Red & Green 🔴🟢", "Blue & Brown 🔵🟤", "Blue & Black 🔵⚫"],
    correctIndex: 2
  },
  {
    text: "How does Mohamed feel about tea and hot drinks?",
    choices: ["Loves them a lot", "Not a big fan of them", "Drinks them all the time"],
    correctIndex: 1
  },
  {
    text: "If Mohamed drinks tea, how does he like it?",
    choices: ["Light with plenty of sugar", "Heavy with little sugar", "No sugar at all"],
    correctIndex: 0
  },
  {
    text: "What is Mohamed's job stack? 💼",
    choices: ["Frontend developer 🎨", "Backend developer ☕", "Mobile developer 📱"],
    correctIndex: 1
  },
  {
    text: "Compared to you, Mohamed prefers…",
    choices: ["Sleeping more 😴", "Staying awake more 😎", "Same as me"],
    correctIndex: 1
  },
  {
    text: "You both agree on one thing… 😄",
    choices: ["You both hate seafood 🚫🐟", "You both love seafood 🐟", "One loves it and one hates it"],
    correctIndex: 0
  },
  {
    text: "Who prefers sleeping more? 😴",
    choices: ["You 😄", "Mohamed", "Both the same"],
    correctIndex: 0
  },
  {
    text: "If it's Eid… what should you do first?",
    choices: ["Eat sweets 🍪", "Enjoy the day 🎉", "Both of course 😄"],
    correctIndex: 2
  },
  {
    text: "ركزززى جامد فى السؤال ده... هاا <br> Who is more annoying? 😏",
    choices: ["You", "Mohamed", ""],
    correctIndex: 2
  },
  {
    text: "يعنى جاوبتى غلط واعترفتى.. ليكى فرصة تانية <br> Answer honestly 😌",
    choices: ["Mohamed is always right", "Sometimes Mohamed is right", "I will not admit anything"],
    correctIndex: 0
  }
];

const TOTAL_MCQ = questions.length;

// ── State ─────────────────────────────────────
let currentQuestionIndex = 0;
let score                = 0;
let isAnswered           = false;
let finalUserText        = '';

// ── DOM refs ──────────────────────────────────
const scene           = document.getElementById('scene');
const fianceeImg      = document.getElementById('fiancee');
const sheepBubble     = document.getElementById('bubble-sheep');
const sheepLabel      = document.getElementById('sheep-label');

const progressFill    = document.getElementById('progress-fill');
const progressLabel   = document.getElementById('progress-label');
const questionText    = document.getElementById('question-text');
const choicesWrap     = document.getElementById('choices-wrap');
//const feedback        = document.getElementById('feedback');

const finalWrap       = document.getElementById('final-wrap');
const finalInput      = document.getElementById('final-input');
const submitBtn       = document.getElementById('submit-btn');

const postSubmit      = document.getElementById('post-submit');
const postMsg1        = document.getElementById('post-msg-1');
const postMsg2        = document.getElementById('post-msg-2');
const copyBtn         = document.getElementById('copy-btn');
const copiedLabel     = document.getElementById('copied-label');

// ── Image map ─────────────────────────────────
const FIANCEE = {
  thinking: 'assets/fiancee_thinking.png',
  smile:    'assets/fiancee_smile_right.png',
  cry:      'assets/fiancee_cry.png',
};

// ============================================
//  HELPERS
// ============================================

/**
 * Swap fiancée image instantly (no flicker).
 */
function setFiancee(state) {
  fianceeImg.src = FIANCEE[state] || FIANCEE.thinking;
}

/**
 * Update the sheep's speech bubble label and position it above sheep.
 */
function setSheepLabel(text) {
  sheepLabel.textContent = text;
  sheepLabel.className = '';

  // Position bubble above sheep character
  const sheepWrap    = document.getElementById('sheep-wrap');
  const charBottom   = parseInt(getComputedStyle(document.documentElement)
                         .getPropertyValue('--char-bottom')) || 100;
  const charHeight   = sheepWrap.offsetHeight;
  const gap          = -45;

  sheepBubble.style.bottom = (charBottom + charHeight + gap) + 'px';
  sheepBubble.classList.remove('hidden');
  sheepBubble.classList.remove('visible');
  // Force reflow for re-animation
  void sheepBubble.offsetWidth;
  sheepBubble.classList.add('visible');
}

/**
 * Animate the quiz panel content out, run callback, then animate in.
 * Used between questions for a smooth transition.
 */
function transitionPanel(callback) {
  const panel = document.getElementById('quiz-panel');
  panel.style.opacity    = '0';
  panel.style.transform  = 'translateX(-50%) translateY(10px)';
  panel.style.transition = 'opacity 0.25s ease, transform 0.25s ease';

  setTimeout(() => {
    callback();
    panel.style.opacity   = '1';
    panel.style.transform = 'translateX(-50%) translateY(0)';
  }, 260);
}

// ============================================
//  RENDER QUESTION
// ============================================

function renderQuestion(index) {
  isAnswered = false;

  const q = questions[index];
  const questionNumber = index + 1;

  // Progress
  const pct = (index / TOTAL_MCQ) * 100;
  progressFill.style.width = pct + '%';
  progressLabel.textContent = `Question ${questionNumber} / ${TOTAL_MCQ}`;

  // Sheep label
  setSheepLabel(`Question ${questionNumber} 📝`);

  // Question text
  questionText.innerHTML = q.text;

  // Reset feedback
//  feedback.textContent = '';
//  feedback.className = 'hidden';

  // Reset fiancée
  setFiancee('thinking');

  // Build choice buttons
  choicesWrap.innerHTML = '';
//  q.choices.forEach((choice, i) => {
//    const btn = document.createElement('button');
//    btn.className     = 'choice-btn';
//    btn.textContent   = choice;
//    btn.dataset.index = i;
//    btn.addEventListener('click', () => handleAnswer(i, btn, q.correctIndex));
//    choicesWrap.appendChild(btn);
//  });
    q.choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className     = 'choice-btn';
        btn.textContent   = choice || "(hidden)"; // Optional: fallback text
        btn.dataset.index = i;

        // If choice is empty, hide the button
        if (choice === "") {
            btn.style.display = 'none';
        }

        btn.addEventListener('click', () => handleAnswer(i, btn, q.correctIndex));
        choicesWrap.appendChild(btn);
    });

  // Make sure quiz elements visible, final hidden
  questionText.classList.remove('hidden');
  choicesWrap.classList.remove('hidden');
  finalWrap.classList.add('hidden');
  postSubmit.classList.add('hidden');
  progressFill.parentElement.parentElement.classList.remove('hidden');
}

// ============================================
//  HANDLE ANSWER
// ============================================

function handleAnswer(selectedIndex, selectedBtn, correctIndex) {
  if (isAnswered) return;
  isAnswered = true;

  // Disable all buttons
  const allBtns = choicesWrap.querySelectorAll('.choice-btn');
  allBtns.forEach(b => b.disabled = true);

  const isCorrect = selectedIndex === correctIndex;

  if (isCorrect) {
    selectedBtn.classList.add('correct');
    score++;
    setFiancee('smile');
//    feedback.textContent = '✅ Correct!';
//    feedback.className   = 'correct-msg';
  } else {
    selectedBtn.classList.add('wrong');
    // Also highlight the correct one in green
    allBtns[correctIndex].classList.add('correct');
    setFiancee('cry');
//    feedback.textContent = '❌ Wrong!';
//    feedback.className   = 'wrong-msg';
  }

//  feedback.classList.remove('hidden');

  // Auto-advance after 1.5s
  setTimeout(() => {
    const next = currentQuestionIndex + 1;

    if (next < TOTAL_MCQ) {
      currentQuestionIndex = next;
      transitionPanel(() => renderQuestion(currentQuestionIndex));
    } else {
      // All 13 done — show final question
      transitionPanel(() => showFinalInput());
    }
  }, 1500);
}

// ============================================
//  FINAL QUESTION (Q14)
// ============================================

function showFinalInput() {
  // Update progress to 100%
  progressFill.style.width    = '100%';
  progressLabel.textContent   = 'Final Question ❤️';

  // Update sheep label
  setSheepLabel('Last one…');

  // Reset fiancée to thinking
  setFiancee('thinking');

  // Hide MCQ elements
  questionText.classList.add('hidden');
  choicesWrap.classList.add('hidden');
//  feedback.classList.add('hidden');

  // Show final input
  finalWrap.classList.remove('hidden');
  postSubmit.classList.add('hidden');

  // Focus textarea
  setTimeout(() => finalInput.focus(), 300);
}

// ── Submit handler ─────────────────────────────
submitBtn.addEventListener('click', () => {
  const text = finalInput.value.trim();
  if (!text) {
    finalInput.style.borderColor = '#E53935';
    setTimeout(() => finalInput.style.borderColor = '', 600);
    return;
  }

  finalUserText = text;

  // Switch fiancée to smiling
  setFiancee('smile');

  // Hide final input wrap
  finalWrap.classList.add('hidden');

  // Show post-submit area
  postSubmit.classList.remove('hidden');
  postMsg1.textContent = 'Hmm… interesting';
  postMsg1.classList.remove('hidden');
  postMsg2.classList.add('hidden');
  copyBtn.classList.add('hidden');
  copiedLabel.classList.add('hidden');

  // After 1s reveal the second message + copy button
  setTimeout(() => {
    postMsg2.textContent = 'Want to send this to someone special? ❤️';
    postMsg2.classList.remove('hidden');

    setTimeout(() => {
      copyBtn.classList.remove('hidden');
    }, 500);
  }, 1000);
});

// ── Copy handler ───────────────────────────────
copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(finalUserText).then(() => {
    copiedLabel.classList.remove('hidden');
    copyBtn.classList.add('hidden');

    // After copy — sheep reveals score, then scene ends
    setTimeout(() => showScoreAndEnd(), 800);
  }).catch(() => {
    // Fallback if clipboard blocked
    copiedLabel.textContent = '✅ Copied!';
    copiedLabel.classList.remove('hidden');
    setTimeout(() => showScoreAndEnd(), 800);
  });
});

// ============================================
//  SCORE REVEAL + SCENE END
// ============================================

function showScoreAndEnd() {
  // Sheep reveals score in bubble
  sheepLabel.className = 'score-reveal';
  setSheepLabel(`You answered ${score} out of ${TOTAL_MCQ} correct… not bad 😏`);

  // Fade out after 3 seconds
  setTimeout(() => endScene(), 4500);
}

function endScene() {
  scene.classList.add('fade-out');
  scene.addEventListener('animationend', () => {
    console.log('Scene 3 complete');
    window.location.href = 'scene3_5.html';
  }, { once: true });
}

// ============================================
//  INIT
// ============================================

window.addEventListener('load', () => {
  // Wait for fade-in, then start quiz
  setTimeout(() => {
    transitionPanel(() => renderQuestion(0));
  }, 1200);
});
