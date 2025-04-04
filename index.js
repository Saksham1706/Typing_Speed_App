let sentences = [];
let currentSentenceIndex = 0;
let mode = 'sentence';
let startTime;
let errorCount = 0;
let isTestRunning = false;
let timerDuration = 60;
let interval;
let sentenceLimit = 1;

function loadSentences() {
  return $.get('./sentences.txt').then(data => {
    sentences = data.split('\n').filter(line => line.trim() !== '');
  });
}

function renderMultipleSentences(startIndex, count) {
  const combined = sentences.slice(startIndex, startIndex + count).join(' ');
  let skeleton = '';
  for (let i = 0; i < combined.length; i++) {
    skeleton += `<span class="grey">${combined[i]}</span>`;
  }
  $('#textSkeleton').html(skeleton);
}

function updateSkeletonDisplay(typed, combinedTarget) {
  let display = '';
  errorCount = 0;
  for (let i = 0; i < combinedTarget.length; i++) {
    if (typed[i] == null) {
      display += `<span class="grey">${combinedTarget[i]}</span>`;
    } else if (typed[i] === combinedTarget[i]) {
      display += `<span class="green">${combinedTarget[i]}</span>`;
    } else {
      display += `<span class="red">${combinedTarget[i]}</span>`;
      errorCount++;
    }
  }
  $('#textSkeleton').html(display);
}

function finishTest(showThankYou = true) {
  isTestRunning = false;
  clearInterval(interval);
  $('#textInput').prop('disabled', true);
  $('#liveTimer').addClass('hidden');

  const rawTime = (new Date() - startTime) / 1000;
  const penalty = errorCount * 0.5;
  const totalTime = rawTime + penalty;
  const wordsTyped = $('#textInput').val().trim().split(/\s+/).length;
  const wpm = (wordsTyped / totalTime) * 60;

  $('#result').html(`
    Typing Speed: <strong>${Math.round(wpm)} WPM</strong><br>
    Errors: ${errorCount}<br>
    Penalty: ${penalty.toFixed(1)} seconds<br><br>
    <strong>Thanks for coming!</strong><br>
    <button id="goHomeBtn">Go to Home</button>
  `);

  $('#endBtn').addClass('hidden');

  if (showThankYou) {
    $('#testArea').addClass('hidden');
    $('#thankYou').removeClass('hidden');
  }
}

function startTimerMode() {
  currentSentenceIndex = 0;
  $('#textInput').val('').prop('disabled', false).focus();
  renderMultipleSentences(currentSentenceIndex, 2);
  isTestRunning = true;
  startTime = new Date();

  $('#liveTimer').removeClass('hidden');
  $('#timeLeft').text(timerDuration);

  interval = setInterval(() => {
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const remaining = Math.max(0, timerDuration - elapsed);
    $('#timeLeft').text(remaining);

    if (elapsed >= timerDuration) {
      finishTest();
    }
  }, 1000);
}

$(document).ready(() => {
  loadSentences().then(() => {
    $('#startBtn').click(() => {
      $('#setup').removeClass('hidden');
      $('#result').html('');
      $('#testArea').addClass('hidden');
      $('#thankYou').addClass('hidden');
      $('#textSkeleton').html('');
      $('#textInput').val('');
      $('#startBtn').hide();
      $('#endBtn').hide();
    });

    $('#beginTest').click(() => {
      mode = $('#modeSelect').val();
      sentenceLimit = parseInt($('#wordCount').val()) || 1;
      $('#testArea').removeClass('hidden');
      $('#setup').addClass('hidden');
      $('#countdown').text('3').show();
      currentSentenceIndex = 0;
      errorCount = 0;

      $('#startBtn').addClass('hidden');
      $('#endBtn').removeClass('hidden'); // show End button during test

      let countdown = 3;
      let countdownInterval = setInterval(() => {
        countdown--;
        $('#countdown').text(countdown);
        if (countdown === 0) {
          clearInterval(countdownInterval);
          $('#countdown').hide();

          if (mode === 'timer') {
            startTimerMode();
          } else {
            renderMultipleSentences(currentSentenceIndex, sentenceLimit);
            $('#textInput').val('').prop('disabled', false).focus();
            startTime = new Date();
            isTestRunning = true;
          }
        }
      }, 1000);
    });

    // End test manually and go to results
    $('#endBtn').click(() => {
      finishTest(true);
    });

    // Home button from thank-you screen
    $(document).on('click', '#goHomeBtn', function () {
      $('#startBtn').removeClass('hidden');
      $('#setup').removeClass('hidden');
      $('#testArea').addClass('hidden');
      $('#thankYou').addClass('hidden');
      $('#result').html('');
      $('#textSkeleton').html('');
      $('#textInput').val('');
      $('#endBtn').addClass('hidden');
    });

    // Typing event
    $('#textInput').on('input', function () {
      if (!isTestRunning) return;
      const typed = $(this).val();
      const combinedTarget = mode === 'timer'
        ? sentences.slice(currentSentenceIndex, currentSentenceIndex + 2).join(' ')
        : sentences.slice(currentSentenceIndex, currentSentenceIndex + sentenceLimit).join(' ');

      updateSkeletonDisplay(typed, combinedTarget);

      if (typed.length === combinedTarget.length) {
        if (mode === 'timer') {
          currentSentenceIndex += 2;
          if (currentSentenceIndex < sentences.length) {
            $('#textInput').val('');
            renderMultipleSentences(currentSentenceIndex, 2);
          } else {
            finishTest();
          }
        } else {
          finishTest();
        }
      }
    });

    // Show/hide sentence count input based on mode
    $('#modeSelect').on('change', function () {
      if ($(this).val() === 'sentence') {
        $('#sentenceCountLabel').show();
      } else {
        $('#sentenceCountLabel').hide();
      }
    });
  });
});
