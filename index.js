document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const homeScreen = document.getElementById('home');
  const setupScreen = document.getElementById('setup');
  const testScreen = document.getElementById('testArea');
  const resultsScreen = document.getElementById('thankYou');
  const startBtn = document.getElementById('startBtn');
  const beginTestBtn = document.getElementById('beginTest');
  const endBtn = document.getElementById('endBtn');
  const retryBtn = document.getElementById('retryBtn');
  const newTestBtn = document.getElementById('newTestBtn');
  const modeSelect = document.getElementById('modeSelect');
  const wordCountInput = document.getElementById('wordCount');
  const decrementBtn = document.getElementById('decrementCount');
  const incrementBtn = document.getElementById('incrementCount');
  const textSkeleton = document.getElementById('textSkeleton');
  const textInput = document.getElementById('textInput');
  const countdownDisplay = document.getElementById('countdown');
  const liveTimer = document.getElementById('liveTimer');
  const timeLeftDisplay = document.getElementById('timeLeft');
  const resultsDisplay = document.getElementById('result');
  const statsDisplay = document.querySelector('.stats-display');
  const wpmStat = document.getElementById('wpmStat');
  const accuracyStat = document.getElementById('accuracyStat');
  const errorsStat = document.getElementById('errorsStat');

  // Sample sentences
  const sentences = [
    "The quick brown fox jumps over the lazy dog.",
    "Programming is the art of telling another human what one wants the computer to do.",
    "To be or not to be, that is the question.",
    "The only way to learn a new programming language is by writing programs in it.",
    "In the middle of difficulty lies opportunity."
  ];

  // Variables
  let testText = '';
  let timer;
  let startTime;
  let currentIndex = 0;
  let errors = 0;
  let totalTyped = 0;
  let correctTyped = 0;
  let testActive = false;
  let countdownInterval;
  const testDuration = 60; // 1 minute for timer mode
  let remainingTime = testDuration;

  // Initialize progress circle
  const circle = document.querySelector('.progress-ring__circle');
  const radius = circle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference;

  // Event Listeners
  startBtn.addEventListener('click', showSetup);
  beginTestBtn.addEventListener('click', beginTest);
  endBtn.addEventListener('click', endTest);
  retryBtn.addEventListener('click', retryTest);
  newTestBtn.addEventListener('click', newTest);
  textInput.addEventListener('input', checkTyping);
  decrementBtn.addEventListener('click', () => adjustWordCount(-1));
  incrementBtn.addEventListener('click', () => adjustWordCount(1));
  modeSelect.addEventListener('change', toggleModeSettings);

  // Functions
  function showSetup() {
    homeScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    toggleModeSettings();
  }

  function toggleModeSettings() {
    if (modeSelect.value === 'sentence') {
      document.getElementById('sentenceCountLabel').classList.remove('hidden');
    } else {
      document.getElementById('sentenceCountLabel').classList.add('hidden');
    }
  }

  function adjustWordCount(change) {
    let current = parseInt(wordCountInput.value);
    let newVal = current + change;
    if (newVal >= parseInt(wordCountInput.min) && newVal <= parseInt(wordCountInput.max)) {
      wordCountInput.value = newVal;
    }
  }

  function beginTest() {
    setupScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    textInput.disabled = true;
    statsDisplay.classList.add('hidden');
    
    // Prepare test based on mode
    if (modeSelect.value === 'sentence') {
      const count = parseInt(wordCountInput.value);
      testText = getRandomSentences(count).join(' ');
    } else {
      testText = getRandomSentences(10).join(' '); // Enough text for 1 minute
    }
    
    displayTextSkeleton();
    startCountdown();
  }

  function getRandomSentences(count) {
    const shuffled = [...sentences].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  function displayTextSkeleton() {
    let html = '';
    for (let i = 0; i < testText.length; i++) {
      html += `<span class="grey" id="char-${i}">${testText[i]}</span>`;
    }
    textSkeleton.innerHTML = html;
  }

  function startCountdown() {
    let count = 3;
    countdownDisplay.textContent = count;
    setProgress((count / 3) * 100);
    
    countdownInterval = setInterval(() => {
      count--;
      countdownDisplay.textContent = count;
      setProgress((count / 3) * 100);
      
      if (count <= 0) {
        clearInterval(countdownInterval);
        startTest();
      }
    }, 1000);
  }

  function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    circle.style.strokeDashoffset = offset;
  }

  function startTest() {
    countdownDisplay.classList.add('hidden');
    textInput.disabled = false;
    textInput.focus();
    endBtn.classList.remove('hidden');
    startTime = new Date();
    testActive = true;
    currentIndex = 0;
    errors = 0;
    totalTyped = 0;
    correctTyped = 0;
    
    if (modeSelect.value === 'timer') {
      liveTimer.classList.remove('hidden');
      startTimer();
    } else {
      statsDisplay.classList.remove('hidden');
    }
  }

  function startTimer() {
    remainingTime = testDuration;
    timeLeftDisplay.textContent = remainingTime;
    setProgress(100);
    
    timer = setInterval(() => {
      remainingTime--;
      timeLeftDisplay.textContent = remainingTime;
      setProgress((remainingTime / testDuration) * 100);
      
      if (remainingTime <= 0) {
        endTest();
      }
    }, 1000);
  }

  function checkTyping() {
    if (!testActive) return;
    
    const inputText = textInput.value;
    const currentChar = inputText[inputText.length - 1];
    totalTyped++;
    
    const currentCharElement = document.getElementById(`char-${currentIndex}`);
    if (currentChar === testText[currentIndex]) {
      currentCharElement.classList.remove('grey', 'red');
      currentCharElement.classList.add('green');
      correctTyped++;
    } else {
      currentCharElement.classList.remove('grey', 'green');
      currentCharElement.classList.add('red');
      errors++;
    }
    
    currentIndex++;
    
    // Update real-time stats
    if (modeSelect.value === 'sentence') {
      updateStats();
    }
    
    // Check if test is complete
    if (currentIndex >= testText.length || inputText.length >= testText.length) {
      endTest();
    }
  }

  function updateStats() {
    const timeElapsed = (new Date() - startTime) / 60000; // in minutes
    const wpm = Math.round((correctTyped / 5) / timeElapsed);
    const accuracy = Math.round((correctTyped / totalTyped) * 100);
    
    wpmStat.textContent = wpm;
    accuracyStat.textContent = `${accuracy}%`;
    errorsStat.textContent = errors;
  }

  function endTest() {
    testActive = false;
    clearInterval(timer);
    clearInterval(countdownInterval);
    
    textInput.disabled = true;
    endBtn.classList.add('hidden');
    testScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    calculateResults();
  }

  function calculateResults() {
    const timeElapsed = (new Date() - startTime) / 60000; // in minutes
    const wpm = Math.round((correctTyped / 5) / timeElapsed);
    const accuracy = Math.round((correctTyped / totalTyped) * 100);
    
    let resultHTML = `
      <div class="result-metric">
        <span class="stat-value">${wpm}</span>
        <span class="stat-label">Words Per Minute</span>
      </div>
      <div class="result-metric">
        <span class="stat-value">${accuracy}%</span>
        <span class="stat-label">Accuracy</span>
      </div>
      <div class="result-metric">
        <span class="stat-value">${errors}</span>
        <span class="stat-label">Errors</span>
      </div>
      <p class="result-feedback">${getFeedback(wpm)}</p>
    `;
    
    resultsDisplay.innerHTML = resultHTML;
  }

  function getFeedback(wpm) {
    if (wpm >= 70) return "⚡ Lightning fast! You're a typing wizard! ⚡";
    if (wpm >= 50) return "🌟 Excellent speed! Keep up the great work! 🌟";
    if (wpm >= 30) return "💻 Good job! Practice makes perfect! 💻";
    return "🔌 Keep practicing! You'll improve with time! 🔌";
  }

  function retryTest() {
    resultsScreen.classList.add('hidden');
    testScreen.classList.remove('hidden');
    textInput.value = '';
    textInput.disabled = true;
    statsDisplay.classList.add('hidden');
    countdownDisplay.classList.remove('hidden');
    liveTimer.classList.add('hidden');
    
    displayTextSkeleton();
    startCountdown();
  }

  function newTest() {
    resultsScreen.classList.add('hidden');
    setupScreen.classList.remove('hidden');
    textInput.value = '';
  }

  // Create floating particles
  function createParticles() {
    const particles = 20;
    for (let i = 0; i < particles; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');
      particle.style.width = `${Math.random() * 5 + 2}px`;
      particle.style.height = particle.style.width;
      particle.style.left = `${Math.random() * 100}vw`;
      particle.style.top = `${Math.random() * 100}vh`;
      particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
      particle.style.animationDelay = `${Math.random() * 5}s`;
      document.body.appendChild(particle);
    }
  }

  // Initialize
  createParticles();
  toggleModeSettings();
});
