// Alarm interfaces
interface Alarm {
  id: string;
  time: string; // HH:MM format
  label: string;
  enabled: boolean;
  repeatDays: number[]; // 0-6, Sunday = 0
  snoozedUntil?: number;
}

interface AlarmTranslations {
  addAlarm: string;
  editAlarm: string;
  label: string;
  labelPlaceholder: string;
  repeat: string;
  save: string;
  cancel: string;
  noAlarms: string;
  alarmRinging: string;
  snooze: string;
  dismiss: string;
  days: string[];
}

// State
let alarms: Alarm[] = [];
let ringingAlarm: Alarm | null = null;
let checkIntervalId: number | null = null;
let audioContext: AudioContext | null = null;
let translations: AlarmTranslations;

// DOM Elements
let alarmsList: HTMLElement;
let modalOverlay: HTMLElement | null;
let ringingOverlay: HTMLElement | null;
let currentTimeDisplay: HTMLElement;

const STORAGE_KEY = 'alarms-data';
const SNOOZE_MINUTES = 5;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function loadAlarms(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      alarms = JSON.parse(saved);
    }
  } catch {
    alarms = [];
  }
}

function saveAlarms(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  } catch {
    // Ignore storage errors
  }
}

function formatTime12h(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
}

function getCurrentTime(): string {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

function getCurrentDay(): number {
  return new Date().getDay();
}

function renderAlarms(): void {
  if (!alarmsList) {
    return;
  }

  if (alarms.length === 0) {
    alarmsList.innerHTML = `<div class="no-alarms">${translations.noAlarms}</div>`;
    return;
  }

  const html = alarms
    .map((alarm) => {
      const daysHtml = translations.days
        .map(
          (day, index) =>
            `<span class="alarm-day ${alarm.repeatDays.includes(index) ? '' : 'inactive'}">${day}</span>`
        )
        .join('');

      return `
        <div class="alarm-item" data-id="${alarm.id}">
          <div class="alarm-info">
            <div class="alarm-time-display">${formatTime12h(alarm.time)}</div>
            <div class="alarm-label">${escapeHtml(alarm.label) || 'Alarm'}</div>
            ${alarm.repeatDays.length > 0 ? `<div class="alarm-repeat-days">${daysHtml}</div>` : ''}
          </div>
          <div class="alarm-actions">
            <div class="alarm-toggle ${alarm.enabled ? 'enabled' : ''}" data-id="${alarm.id}"></div>
            <button class="btn-alarm-action edit" data-id="${alarm.id}" title="Edit">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
              </svg>
            </button>
            <button class="btn-alarm-action delete" data-id="${alarm.id}" title="Delete">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
      `;
    })
    .join('');

  alarmsList.innerHTML = html;

  // Add event listeners
  alarmsList.querySelectorAll('.alarm-toggle').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const id = (toggle as HTMLElement).dataset.id;
      if (id) {
        toggleAlarm(id);
      }
    });
  });

  alarmsList.querySelectorAll('.btn-alarm-action.edit').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        openEditModal(id);
      }
    });
  });

  alarmsList.querySelectorAll('.btn-alarm-action.delete').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.id;
      if (id) {
        deleteAlarm(id);
      }
    });
  });
}

function toggleAlarm(id: string): void {
  const alarm = alarms.find((a) => a.id === id);
  if (alarm) {
    alarm.enabled = !alarm.enabled;
    alarm.snoozedUntil = undefined;
    saveAlarms();
    renderAlarms();
  }
}

function deleteAlarm(id: string): void {
  alarms = alarms.filter((a) => a.id !== id);
  saveAlarms();
  renderAlarms();
}

function openAddModal(): void {
  const now = new Date();
  const defaultTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  showModal({
    id: '',
    time: defaultTime,
    label: '',
    enabled: true,
    repeatDays: [],
  });
}

function openEditModal(id: string): void {
  const alarm = alarms.find((a) => a.id === id);
  if (alarm) {
    showModal(alarm);
  }
}

function showModal(alarm: Alarm): void {
  const isEdit = alarm.id !== '';

  const daysHtml = translations.days
    .map(
      (day, index) =>
        `<button type="button" class="repeat-day-btn ${alarm.repeatDays.includes(index) ? 'selected' : ''}" data-day="${index}">${day}</button>`
    )
    .join('');

  const modalHtml = `
    <div class="alarm-modal-overlay" id="alarm-modal-overlay">
      <div class="alarm-modal">
        <div class="alarm-modal-header">${isEdit ? translations.editAlarm : translations.addAlarm}</div>
        
        <div class="alarm-modal-field">
          <label>Time</label>
          <input type="time" id="modal-time" value="${alarm.time}">
        </div>
        
        <div class="alarm-modal-field">
          <label>${translations.label}</label>
          <input type="text" id="modal-label" value="${escapeHtml(alarm.label)}" placeholder="${translations.labelPlaceholder}">
        </div>
        
        <div class="alarm-modal-field">
          <label>${translations.repeat}</label>
          <div class="repeat-days" id="repeat-days">
            ${daysHtml}
          </div>
        </div>
        
        <div class="alarm-modal-actions">
          <button class="btn-modal-cancel" id="btn-modal-cancel">${translations.cancel}</button>
          <button class="btn-modal-save" id="btn-modal-save">${translations.save}</button>
        </div>
      </div>
    </div>
  `;

  // Remove existing modal if any
  modalOverlay?.remove();

  // Add modal to DOM
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  modalOverlay = document.getElementById('alarm-modal-overlay');

  // Selected days state
  let selectedDays = [...alarm.repeatDays];

  // Day button clicks
  document.querySelectorAll('.repeat-day-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const day = parseInt((btn as HTMLElement).dataset.day || '0', 10);
      if (selectedDays.includes(day)) {
        selectedDays = selectedDays.filter((d) => d !== day);
        btn.classList.remove('selected');
      } else {
        selectedDays.push(day);
        btn.classList.add('selected');
      }
    });
  });

  // Cancel button
  document.getElementById('btn-modal-cancel')?.addEventListener('click', closeModal);

  // Save button
  document.getElementById('btn-modal-save')?.addEventListener('click', () => {
    const time = (document.getElementById('modal-time') as HTMLInputElement).value;
    const label = (document.getElementById('modal-label') as HTMLInputElement).value;

    if (!time) {
      return;
    }

    if (isEdit) {
      const existingAlarm = alarms.find((a) => a.id === alarm.id);
      if (existingAlarm) {
        existingAlarm.time = time;
        existingAlarm.label = label;
        existingAlarm.repeatDays = selectedDays.sort((a, b) => a - b);
        existingAlarm.snoozedUntil = undefined;
      }
    } else {
      const newAlarm: Alarm = {
        id: generateId(),
        time,
        label,
        enabled: true,
        repeatDays: selectedDays.sort((a, b) => a - b),
      };
      alarms.push(newAlarm);
    }

    saveAlarms();
    renderAlarms();
    closeModal();
  });

  // Close on overlay click
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });
}

function closeModal(): void {
  modalOverlay?.remove();
  modalOverlay = null;
}

function checkAlarms(): void {
  if (ringingAlarm) {
    return;
  } // Already ringing

  const currentTime = getCurrentTime();
  const currentDay = getCurrentDay();
  const now = Date.now();

  for (const alarm of alarms) {
    if (!alarm.enabled) {
      continue;
    }

    // Check if snoozed
    if (alarm.snoozedUntil && alarm.snoozedUntil > now) {
      continue;
    }

    // Check if time matches
    if (alarm.time !== currentTime) {
      continue;
    }

    // Check if day matches (empty repeatDays = any day)
    if (alarm.repeatDays.length > 0 && !alarm.repeatDays.includes(currentDay)) {
      continue;
    }

    // Trigger alarm
    triggerAlarm(alarm);
    break;
  }
}

function triggerAlarm(alarm: Alarm): void {
  ringingAlarm = alarm;
  showRingingOverlay(alarm);
  playAlarmSound();
  showNotification(alarm);
}

function showRingingOverlay(alarm: Alarm): void {
  const overlayHtml = `
    <div class="alarm-ringing-overlay" id="alarm-ringing-overlay">
      <div class="alarm-ringing-card">
        <div class="alarm-ringing-icon">⏰</div>
        <div class="alarm-ringing-time">${formatTime12h(alarm.time)}</div>
        <div class="alarm-ringing-label">${escapeHtml(alarm.label) || translations.alarmRinging}</div>
        <div class="alarm-ringing-actions">
          <button class="btn-snooze" id="btn-snooze">${translations.snooze}</button>
          <button class="btn-dismiss" id="btn-dismiss">${translations.dismiss}</button>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', overlayHtml);
  ringingOverlay = document.getElementById('alarm-ringing-overlay');

  document.getElementById('btn-snooze')?.addEventListener('click', snoozeAlarm);
  document.getElementById('btn-dismiss')?.addEventListener('click', dismissAlarm);
}

function snoozeAlarm(): void {
  if (ringingAlarm) {
    ringingAlarm.snoozedUntil = Date.now() + SNOOZE_MINUTES * 60 * 1000;
    saveAlarms();
  }

  stopAlarmSound();
  ringingOverlay?.remove();
  ringingOverlay = null;
  ringingAlarm = null;
}

function dismissAlarm(): void {
  if (ringingAlarm) {
    // If no repeat days, disable the alarm
    if (ringingAlarm.repeatDays.length === 0) {
      ringingAlarm.enabled = false;
      saveAlarms();
      renderAlarms();
    }
  }

  stopAlarmSound();
  ringingOverlay?.remove();
  ringingOverlay = null;
  ringingAlarm = null;
}

let alarmOscillator: OscillatorNode | null = null;
let alarmGain: GainNode | null = null;

function playAlarmSound(): void {
  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || (window as typeof AudioContext).webkitAudioContext
      )();
    }

    // Create oscillator for continuous alarm sound
    alarmOscillator = audioContext.createOscillator();
    alarmGain = audioContext.createGain();

    alarmOscillator.connect(alarmGain);
    alarmGain.connect(audioContext.destination);

    alarmOscillator.type = 'sine';
    alarmOscillator.frequency.setValueAtTime(800, audioContext.currentTime);

    // Create pulsing effect
    alarmGain.gain.setValueAtTime(0, audioContext.currentTime);

    const pulseAlarm = () => {
      if (!audioContext || !alarmGain) {
        return;
      }

      const now = audioContext.currentTime;
      alarmGain.gain.cancelScheduledValues(now);
      alarmGain.gain.setValueAtTime(0, now);

      // Create repeating pulses
      for (let i = 0; i < 10; i++) {
        alarmGain.gain.setValueAtTime(0.5, now + i * 1);
        alarmGain.gain.exponentialRampToValueAtTime(0.01, now + i * 1 + 0.3);
        alarmGain.gain.setValueAtTime(0, now + i * 1 + 0.5);
      }
    };

    alarmOscillator.start(audioContext.currentTime);
    pulseAlarm();

    // Repeat the pulse pattern
    const pulseInterval = setInterval(() => {
      if (ringingAlarm) {
        pulseAlarm();
      } else {
        clearInterval(pulseInterval);
      }
    }, 10000);
  } catch {
    // Audio not supported
  }
}

function stopAlarmSound(): void {
  try {
    if (alarmOscillator) {
      alarmOscillator.stop();
      alarmOscillator.disconnect();
      alarmOscillator = null;
    }
    if (alarmGain) {
      alarmGain.disconnect();
      alarmGain = null;
    }
  } catch {
    // Ignore
  }
}

function showNotification(alarm: Alarm): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(translations.alarmRinging, {
      body: alarm.label || formatTime12h(alarm.time),
      icon: '/favicon.ico',
      requireInteraction: true,
    });
  }
}

function updateCurrentTime(): void {
  if (currentTimeDisplay) {
    const now = new Date();
    currentTimeDisplay.textContent = now.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export function initAlarm(t: AlarmTranslations): void {
  translations = t;

  // Get DOM elements
  alarmsList = document.getElementById('alarms-list') as HTMLElement;
  currentTimeDisplay = document.getElementById('current-time') as HTMLElement;

  // Load alarms
  loadAlarms();
  renderAlarms();

  // Update current time every second
  updateCurrentTime();
  setInterval(updateCurrentTime, 1000);

  // Check alarms every second
  checkIntervalId = window.setInterval(checkAlarms, 1000);

  // Add alarm button
  document.getElementById('btn-add-alarm')?.addEventListener('click', openAddModal);

  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    if (checkIntervalId !== null) {
      clearInterval(checkIntervalId);
    }
    stopAlarmSound();
  });
}
