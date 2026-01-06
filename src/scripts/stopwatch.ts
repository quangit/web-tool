// Stopwatch state
let startTime: number = 0;
let elapsedTime: number = 0;
let isRunning: boolean = false;
let intervalId: number | null = null;
let laps: Array<{ lapTime: number; totalTime: number }> = [];

// DOM Elements
let timeDisplay: HTMLElement;
let msDisplay: HTMLElement;
let startBtn: HTMLButtonElement;
let stopBtn: HTMLButtonElement;
let resetBtn: HTMLButtonElement;
let lapBtn: HTMLButtonElement;
let lapsList: HTMLElement;

interface StopwatchTranslations {
  lap: string;
  noLaps: string;
  lapTime: string;
  totalTime: string;
}

let translations: StopwatchTranslations;

function formatTime(ms: number): { main: string; milliseconds: string } {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 10);

  let main: string;
  if (hours > 0) {
    main = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    main = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return {
    main,
    milliseconds: milliseconds.toString().padStart(2, '0'),
  };
}

function updateDisplay(): void {
  const time = formatTime(elapsedTime);
  if (timeDisplay) {
    timeDisplay.textContent = time.main;
  }
  if (msDisplay) {
    msDisplay.textContent = `.${time.milliseconds}`;
  }
}

function updateButtons(): void {
  if (isRunning) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'inline-flex';
    lapBtn.disabled = false;
  } else {
    startBtn.style.display = 'inline-flex';
    stopBtn.style.display = 'none';
    lapBtn.disabled = elapsedTime === 0;
  }
  resetBtn.disabled = elapsedTime === 0 && laps.length === 0;
}

function start(): void {
  if (isRunning) {return;}

  isRunning = true;
  startTime = Date.now() - elapsedTime;

  intervalId = window.setInterval(() => {
    elapsedTime = Date.now() - startTime;
    updateDisplay();
  }, 10);

  updateButtons();
}

function stop(): void {
  if (!isRunning) {return;}

  isRunning = false;
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  updateButtons();
}

function reset(): void {
  stop();
  elapsedTime = 0;
  laps = [];
  updateDisplay();
  renderLaps();
  updateButtons();
  saveLaps();
}

function lap(): void {
  if (!isRunning) {return;}

  const lastLapTotal = laps.length > 0 ? laps[0].totalTime : 0;
  const lapTime = elapsedTime - lastLapTotal;

  laps.unshift({
    lapTime,
    totalTime: elapsedTime,
  });

  renderLaps();
  saveLaps();
}

function renderLaps(): void {
  if (!lapsList) {return;}

  if (laps.length === 0) {
    lapsList.innerHTML = `<div class="no-laps">${translations.noLaps}</div>`;
    return;
  }

  const html = laps
    .map((lapData, index) => {
      const lapNumber = laps.length - index;
      const lapTimeFormatted = formatTime(lapData.lapTime);
      const totalTimeFormatted = formatTime(lapData.totalTime);

      return `
        <div class="lap-item">
          <span class="lap-number">${translations.lap} ${lapNumber}</span>
          <span class="lap-time">${lapTimeFormatted.main}.${lapTimeFormatted.milliseconds}</span>
          <span class="lap-total">${totalTimeFormatted.main}.${totalTimeFormatted.milliseconds}</span>
        </div>
      `;
    })
    .join('');

  lapsList.innerHTML = html;
}

function clearLaps(): void {
  laps = [];
  renderLaps();
  saveLaps();
  updateButtons();
}

function saveLaps(): void {
  try {
    localStorage.setItem('stopwatch-laps', JSON.stringify(laps));
    localStorage.setItem('stopwatch-elapsed', String(elapsedTime));
  } catch {
    // Ignore storage errors
  }
}

function loadLaps(): void {
  try {
    const savedLaps = localStorage.getItem('stopwatch-laps');
    const savedElapsed = localStorage.getItem('stopwatch-elapsed');

    if (savedLaps) {
      laps = JSON.parse(savedLaps);
    }
    if (savedElapsed) {
      elapsedTime = parseInt(savedElapsed, 10) || 0;
    }
  } catch {
    laps = [];
    elapsedTime = 0;
  }
}

export function initStopwatch(t: StopwatchTranslations): void {
  translations = t;

  // Get DOM elements
  timeDisplay = document.getElementById('stopwatch-time') as HTMLElement;
  msDisplay = document.getElementById('stopwatch-ms') as HTMLElement;
  startBtn = document.getElementById('btn-start') as HTMLButtonElement;
  stopBtn = document.getElementById('btn-stop') as HTMLButtonElement;
  resetBtn = document.getElementById('btn-reset') as HTMLButtonElement;
  lapBtn = document.getElementById('btn-lap') as HTMLButtonElement;
  lapsList = document.getElementById('laps-list') as HTMLElement;

  // Load saved state
  loadLaps();
  updateDisplay();
  renderLaps();
  updateButtons();

  // Event listeners
  startBtn?.addEventListener('click', start);
  stopBtn?.addEventListener('click', stop);
  resetBtn?.addEventListener('click', reset);
  lapBtn?.addEventListener('click', lap);

  document.getElementById('btn-clear-laps')?.addEventListener('click', clearLaps);

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (isRunning) {
        stop();
      } else {
        start();
      }
    } else if (e.code === 'KeyL' && isRunning) {
      e.preventDefault();
      lap();
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      reset();
    }
  });

  // Save state before leaving
  window.addEventListener('beforeunload', () => {
    if (!isRunning) {
      saveLaps();
    }
  });
}
