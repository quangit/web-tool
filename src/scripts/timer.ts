// Timer state
let remainingTime: number = 0;
let initialTime: number = 0;
let isRunning: boolean = false;
let isPaused: boolean = false;
let intervalId: number | null = null;
let audioContext: AudioContext | null = null;

// DOM Elements
let timeDisplay: HTMLElement;
let startBtn: HTMLButtonElement;
let pauseBtn: HTMLButtonElement;
let resetBtn: HTMLButtonElement;
let hoursInput: HTMLInputElement;
let minutesInput: HTMLInputElement;
let secondsInput: HTMLInputElement;
let timerInputSection: HTMLElement;

interface TimerTranslations {
  timeUp: string;
  start: string;
  pause: string;
  resume: string;
}

let translations: TimerTranslations;

function formatTime(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateDisplay(): void {
  if (timeDisplay) {
    timeDisplay.textContent = formatTime(remainingTime);

    if (remainingTime <= 0 && initialTime > 0) {
      timeDisplay.classList.add('time-up');
    } else {
      timeDisplay.classList.remove('time-up');
    }
  }
}

function updateButtons(): void {
  if (isRunning) {
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    pauseBtn.textContent = isPaused ? translations.resume : translations.pause;
    pauseBtn.className = isPaused ? 'btn-time btn-start' : 'btn-time btn-pause';
    timerInputSection.style.display = 'none';
  } else {
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    timerInputSection.style.display = 'flex';
  }

  const inputTime = getInputTime();
  startBtn.disabled = inputTime <= 0 && !isRunning;
  resetBtn.disabled = remainingTime === 0 && initialTime === 0;
}

function getInputTime(): number {
  const hours = parseInt(hoursInput?.value || '0', 10) || 0;
  const minutes = parseInt(minutesInput?.value || '0', 10) || 0;
  const seconds = parseInt(secondsInput?.value || '0', 10) || 0;

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

function setInputTime(ms: number): void {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hoursInput) {hoursInput.value = hours.toString();}
  if (minutesInput) {minutesInput.value = minutes.toString();}
  if (secondsInput) {secondsInput.value = seconds.toString();}
}

function start(): void {
  if (isRunning && !isPaused) {return;}

  if (!isRunning) {
    // Starting fresh
    initialTime = getInputTime();
    if (initialTime <= 0) {return;}
    remainingTime = initialTime;
  }

  isRunning = true;
  isPaused = false;

  const startTime = Date.now();
  const targetTime = startTime + remainingTime;

  intervalId = window.setInterval(() => {
    remainingTime = targetTime - Date.now();

    if (remainingTime <= 0) {
      remainingTime = 0;
      stop();
      onTimerComplete();
    }

    updateDisplay();
  }, 100);

  updateButtons();
  saveState();
}

function pause(): void {
  if (!isRunning) {return;}

  if (isPaused) {
    // Resume
    start();
  } else {
    // Pause
    isPaused = true;
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    updateButtons();
    saveState();
  }
}

function stop(): void {
  isRunning = false;
  isPaused = false;

  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }

  updateButtons();
  saveState();
}

function reset(): void {
  stop();
  remainingTime = 0;
  initialTime = 0;
  setInputTime(0);
  updateDisplay();
  updateButtons();
  clearState();
}

function onTimerComplete(): void {
  playAlarmSound();
  showNotification();
}

function playAlarmSound(): void {
  try {
    // Initialize audio context if not already done
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    // Create a simple beep sound
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);

    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);

    // Play multiple beeps
    for (let i = 1; i < 4; i++) {
      setTimeout(() => {
        const osc = audioContext!.createOscillator();
        const gain = audioContext!.createGain();

        osc.connect(gain);
        gain.connect(audioContext!.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioContext!.currentTime);

        gain.gain.setValueAtTime(0.5, audioContext!.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioContext!.currentTime + 0.5);

        osc.start(audioContext!.currentTime);
        osc.stop(audioContext!.currentTime + 0.5);
      }, i * 600);
    }
  } catch {
    // Audio not supported
  }
}

function showNotification(): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(translations.timeUp, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  } else if ('Notification' in window && Notification.permission !== 'denied') {
    Notification.requestPermission();
  }
}

function setPreset(seconds: number): void {
  setInputTime(seconds * 1000);
  updateButtons();
}

function saveState(): void {
  try {
    localStorage.setItem(
      'timer-state',
      JSON.stringify({
        remainingTime,
        initialTime,
        isRunning,
        isPaused,
        savedAt: Date.now(),
      })
    );
  } catch {
    // Ignore storage errors
  }
}

function loadState(): void {
  try {
    const saved = localStorage.getItem('timer-state');
    if (saved) {
      const state = JSON.parse(saved);
      if (state.isRunning && !state.isPaused) {
        // Timer was running - calculate remaining time
        const elapsed = Date.now() - state.savedAt;
        remainingTime = Math.max(0, state.remainingTime - elapsed);
        initialTime = state.initialTime;

        if (remainingTime > 0) {
          isRunning = true;
          start();
        } else {
          remainingTime = 0;
          onTimerComplete();
        }
      } else if (state.isPaused) {
        remainingTime = state.remainingTime;
        initialTime = state.initialTime;
        isRunning = true;
        isPaused = true;
      }
    }
  } catch {
    // Ignore
  }
}

function clearState(): void {
  try {
    localStorage.removeItem('timer-state');
  } catch {
    // Ignore
  }
}

function validateInput(input: HTMLInputElement, max: number): void {
  let value = parseInt(input.value, 10) || 0;
  if (value < 0) {value = 0;}
  if (value > max) {value = max;}
  input.value = value.toString();
}

export function initTimer(t: TimerTranslations): void {
  translations = t;

  // Get DOM elements
  timeDisplay = document.getElementById('timer-time') as HTMLElement;
  startBtn = document.getElementById('btn-start') as HTMLButtonElement;
  pauseBtn = document.getElementById('btn-pause') as HTMLButtonElement;
  resetBtn = document.getElementById('btn-reset') as HTMLButtonElement;
  hoursInput = document.getElementById('input-hours') as HTMLInputElement;
  minutesInput = document.getElementById('input-minutes') as HTMLInputElement;
  secondsInput = document.getElementById('input-seconds') as HTMLInputElement;
  timerInputSection = document.getElementById('timer-input-section') as HTMLElement;

  // Load saved state
  loadState();
  updateDisplay();
  updateButtons();

  // Event listeners
  startBtn?.addEventListener('click', start);
  pauseBtn?.addEventListener('click', pause);
  resetBtn?.addEventListener('click', reset);

  // Input validation
  hoursInput?.addEventListener('change', () => validateInput(hoursInput, 99));
  minutesInput?.addEventListener('change', () => validateInput(minutesInput, 59));
  secondsInput?.addEventListener('change', () => validateInput(secondsInput, 59));

  // Update buttons when inputs change
  [hoursInput, minutesInput, secondsInput].forEach((input) => {
    input?.addEventListener('input', updateButtons);
  });

  // Preset buttons
  document.querySelectorAll('[data-preset]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const seconds = parseInt((btn as HTMLElement).dataset.preset || '0', 10);
      setPreset(seconds);
    });
  });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    if (e.code === 'Space') {
      e.preventDefault();
      if (isRunning) {
        pause();
      } else {
        start();
      }
    } else if (e.code === 'KeyR') {
      e.preventDefault();
      reset();
    }
  });

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    // Will request when timer completes if not yet granted
  }

  // Save state before leaving
  window.addEventListener('beforeunload', saveState);
}
