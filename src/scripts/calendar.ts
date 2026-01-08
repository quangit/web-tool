/**
 * Calendar with Lunar (Vietnamese/Chinese) Calendar Support
 *
 * This module implements:
 * - Solar (Gregorian) calendar display
 * - Lunar calendar conversion using the Vietnamese/Chinese algorithm
 * - Heavenly Stems (Can) and Earthly Branches (Chi) calculations
 * - Zodiac animals for years
 */

// Lunar calendar calculation constants
const PI = Math.PI;

// Get Julian day number from a date (day/month/year)
function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd = dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

// Convert Julian day number to date (dd, mm, yyyy)
function jdToDate(jd: number): [number, number, number] {
  let a, b, c;
  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((b * 146097) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  const d = Math.floor((4 * c + 3) / 1461);
  const e = c - Math.floor((1461 * d) / 4);
  const m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = b * 100 + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

// Calculate new moon in Julian days
function newMoon(k: number): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 = Jd1 + 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);
  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;
  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) +
    0.0021 * Math.sin(2 * dr * M) -
    0.4068 * Math.sin(Mpr * dr) +
    0.0161 * Math.sin(dr * 2 * Mpr);
  C1 =
    C1 -
    0.0004 * Math.sin(dr * 3 * Mpr) +
    0.0104 * Math.sin(dr * 2 * F) -
    0.0051 * Math.sin(dr * (M + Mpr));
  C1 = C1 - 0.0074 * Math.sin(dr * (M - Mpr)) + 0.0004 * Math.sin(dr * (2 * F + M));
  C1 = C1 - 0.0004 * Math.sin(dr * (2 * F - M)) - 0.0006 * Math.sin(dr * (2 * F + Mpr));
  C1 = C1 + 0.001 * Math.sin(dr * (2 * F - Mpr)) + 0.0005 * Math.sin(dr * (2 * Mpr + M));
  let deltat: number;
  if (T < -11) {
    deltat = 0.001 + 0.000839 * T + 0.0002261 * T2 - 0.00000845 * T3 - 0.000000081 * T * T3;
  } else {
    deltat = -0.000278 + 0.000265 * T + 0.000262 * T2;
  }
  return Jd1 + C1 - deltat;
}

// Calculate sun longitude in degrees
function sunLongitude(jdn: number): number {
  const T = (jdn - 2451545.0) / 36525;
  const T2 = T * T;
  const dr = PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL = DL + (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) + 0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L - 360 * Math.floor(L / 360);
  return L;
}

// Get sun longitude at a given Julian day
function getSunLongitude(dayNumber: number, timeZone: number): number {
  return Math.floor(sunLongitude(dayNumber - 0.5 - timeZone / 24) / 30);
}

// Get new moon day
function getNewMoonDay(k: number, timeZone: number): number {
  return Math.floor(newMoon(k) + 0.5 + timeZone / 24);
}

// Get lunar month 11 start day
function getLunarMonth11(yy: number, timeZone: number): number {
  const off = jdFromDate(31, 12, yy) - 2415021;
  const k = Math.floor(off / 29.530588853);
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

// Get leap month offset
function getLeapMonthOffset(a11: number, timeZone: number): number {
  const k = Math.floor((a11 - 2415021.076998695) / 29.530588853 + 0.5);
  let last: number;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

// Lunar date interface
export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  jd: number;
}

// Convert solar date to lunar date
export function solarToLunar(dd: number, mm: number, yy: number, timeZone: number = 7): LunarDate {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.076998695) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }
  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear: number;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }
  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;
  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }
  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }
  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap: lunarLeap,
    jd: dayNumber,
  };
}

// Convert lunar date to solar date
export function lunarToSolar(
  lunarDay: number,
  lunarMonth: number,
  lunarYear: number,
  lunarLeap: boolean,
  timeZone: number = 7
): [number, number, number] {
  let a11: number, b11: number;
  if (lunarMonth < 11) {
    a11 = getLunarMonth11(lunarYear - 1, timeZone);
    b11 = getLunarMonth11(lunarYear, timeZone);
  } else {
    a11 = getLunarMonth11(lunarYear, timeZone);
    b11 = getLunarMonth11(lunarYear + 1, timeZone);
  }
  const k = Math.floor(0.5 + (a11 - 2415021.076998695) / 29.530588853);
  let off = lunarMonth - 11;
  if (off < 0) {
    off += 12;
  }
  if (b11 - a11 > 365) {
    const leapOff = getLeapMonthOffset(a11, timeZone);
    let leapMonth = leapOff - 2;
    if (leapMonth < 0) {
      leapMonth += 12;
    }
    if (lunarLeap && lunarMonth !== leapMonth) {
      return [0, 0, 0];
    } else if (lunarLeap || off >= leapOff) {
      off += 1;
    }
  }
  const monthStart = getNewMoonDay(k + off, timeZone);
  return jdToDate(monthStart + lunarDay - 1);
}

// Get Heavenly Stem (Can) index (0-9)
export function getCanIndex(year: number): number {
  return (year + 6) % 10;
}

// Get Earthly Branch (Chi) index (0-11)
export function getChiIndex(year: number): number {
  return (year + 8) % 12;
}

// Get Can Chi for a year
export function getYearCanChi(year: number): { can: number; chi: number } {
  return {
    can: getCanIndex(year),
    chi: getChiIndex(year),
  };
}

// Get Can Chi for a day (based on Julian day)
export function getDayCanChi(jd: number): { can: number; chi: number } {
  return {
    can: (jd + 9) % 10,
    chi: (jd + 1) % 12,
  };
}

// Zodiac animals (mapped to Chi/Branch index)
export const ZODIAC_ANIMALS = [
  '🐀', // Rat - Tý
  '🐂', // Ox - Sửu
  '🐅', // Tiger - Dần
  '🐇', // Rabbit - Mão
  '🐉', // Dragon - Thìn
  '🐍', // Snake - Tỵ
  '🐎', // Horse - Ngọ
  '🐐', // Goat - Mùi
  '🐒', // Monkey - Thân
  '🐓', // Rooster - Dậu
  '🐕', // Dog - Tuất
  '🐖', // Pig - Hợi
];

// Calendar state and translations interface
export interface CalendarTranslations {
  today: string;
  solarDate: string;
  lunarDate: string;
  lunarMonth: string;
  lunarYear: string;
  zodiacYear: string;
  zodiacDay: string;
  showLunar: string;
  goToToday: string;
  previousMonth: string;
  nextMonth: string;
  previousYear: string;
  nextYear: string;
  selectMonth: string;
  selectYear: string;
  selectedDate: string;
  helpText: string;
  weekdays: string[];
  months: string[];
  leapMonth: string;
  stems: string[];
  branches: string[];
  locale: string;
}

interface CalendarState {
  currentYear: number;
  currentMonth: number; // 0-11
  selectedDate: Date;
  showLunar: boolean;
}

let state: CalendarState;
let translations: CalendarTranslations;
const STORAGE_KEY = 'calendar_settings';

// Initialize calendar
export function initCalendar(t: CalendarTranslations): void {
  translations = t;

  const now = new Date();
  const savedSettings = loadSettings();

  state = {
    currentYear: now.getFullYear(),
    currentMonth: now.getMonth(),
    selectedDate: now,
    showLunar: savedSettings.showLunar ?? true,
  };

  renderCalendar();
  renderSelectedDate();
  setupEventListeners();
}

function loadSettings(): { showLunar?: boolean } {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore errors
  }
  return {};
}

function saveSettings(): void {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        showLunar: state.showLunar,
      })
    );
  } catch {
    // Ignore errors
  }
}

function renderCalendar(): void {
  renderHeader();
  renderDays();
}

function renderHeader(): void {
  const monthSelect = document.getElementById('month-select') as HTMLSelectElement;
  const yearSelect = document.getElementById('year-select') as HTMLSelectElement;

  if (monthSelect) {
    monthSelect.value = state.currentMonth.toString();
  }

  if (yearSelect) {
    // Populate year select if empty
    if (yearSelect.options.length === 0) {
      const currentYear = new Date().getFullYear();
      for (let y = currentYear - 100; y <= currentYear + 100; y++) {
        const option = document.createElement('option');
        option.value = y.toString();
        option.textContent = y.toString();
        yearSelect.appendChild(option);
      }
    }
    yearSelect.value = state.currentYear.toString();
  }
}

function renderDays(): void {
  const container = document.getElementById('calendar-days');
  if (!container) {
    return;
  }

  const firstDay = new Date(state.currentYear, state.currentMonth, 1);
  const lastDay = new Date(state.currentYear, state.currentMonth + 1, 0);
  const startDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Previous month days
  const prevMonthLastDay = new Date(state.currentYear, state.currentMonth, 0).getDate();

  let html = '';

  // Previous month trailing days
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const date = new Date(state.currentYear, state.currentMonth - 1, day);
    html += renderDayCell(date, true);
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(state.currentYear, state.currentMonth, day);
    html += renderDayCell(date, false);
  }

  // Next month leading days
  const totalCells = startDayOfWeek + daysInMonth;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  for (let day = 1; day <= remainingCells; day++) {
    const date = new Date(state.currentYear, state.currentMonth + 1, day);
    html += renderDayCell(date, true);
  }

  container.innerHTML = html;

  // Add click listeners
  container.querySelectorAll('.calendar-day').forEach((dayEl) => {
    dayEl.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const dateStr = target.getAttribute('data-date');
      if (dateStr) {
        state.selectedDate = new Date(dateStr);
        renderDays();
        renderSelectedDate();
      }
    });
  });
}

function renderDayCell(date: Date, isOtherMonth: boolean): string {
  const today = new Date();
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isSelected =
    date.getDate() === state.selectedDate.getDate() &&
    date.getMonth() === state.selectedDate.getMonth() &&
    date.getFullYear() === state.selectedDate.getFullYear();

  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

  const classes = ['calendar-day'];
  if (isOtherMonth) {
    classes.push('other-month');
  }
  if (isToday) {
    classes.push('today');
  }
  if (isSelected) {
    classes.push('selected');
  }
  if (isWeekend) {
    classes.push('weekend');
  }

  let lunarHtml = '';
  if (state.showLunar) {
    const lunar = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
    const isFirstOfMonth = lunar.day === 1;
    const lunarText = isFirstOfMonth
      ? `${lunar.month}/${lunar.leap ? translations.leapMonth : ''}`
      : lunar.day.toString();
    lunarHtml = `<div class="calendar-day-lunar${isFirstOfMonth ? ' lunar-first' : ''}">${lunarText}</div>`;
  }

  return `
    <div class="${classes.join(' ')}" data-date="${date.toISOString()}">
      <div class="calendar-day-number">${date.getDate()}</div>
      ${lunarHtml}
    </div>
  `;
}

function renderSelectedDate(): void {
  const container = document.getElementById('selected-date-details');
  if (!container) {
    return;
  }

  const date = state.selectedDate;
  const lunar = solarToLunar(date.getDate(), date.getMonth() + 1, date.getFullYear());
  const yearCanChi = getYearCanChi(lunar.year);
  const dayCanChi = getDayCanChi(lunar.jd);

  const weekday = date.toLocaleDateString(translations.locale || 'en-US', { weekday: 'long' });
  const solarFormatted = date.toLocaleDateString(translations.locale || 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lunarFormatted = `${lunar.day}/${lunar.month}${lunar.leap ? ` (${translations.leapMonth})` : ''}`;
  const yearCanChiText = `${translations.stems[yearCanChi.can]} ${translations.branches[yearCanChi.chi]}`;
  const dayCanChiText = `${translations.stems[dayCanChi.can]} ${translations.branches[dayCanChi.chi]}`;
  const zodiacAnimal = ZODIAC_ANIMALS[yearCanChi.chi];

  container.innerHTML = `
    <div class="selected-date-header">
      <div class="selected-date-solar">${solarFormatted}</div>
      <div class="selected-date-weekday">${weekday}</div>
    </div>
    <div class="selected-date-details">
      <div class="date-detail-item">
        <div class="date-detail-label">${translations.lunarDate}</div>
        <div class="date-detail-value highlight">${lunarFormatted}</div>
      </div>
      <div class="date-detail-item">
        <div class="date-detail-label">${translations.lunarYear}</div>
        <div class="date-detail-value">${lunar.year}</div>
      </div>
      <div class="date-detail-item">
        <div class="date-detail-label">${translations.zodiacYear}</div>
        <div class="date-detail-value">
          <div class="zodiac-info">
            <span class="zodiac-emoji">${zodiacAnimal}</span>
            <span class="zodiac-text">${yearCanChiText}</span>
          </div>
        </div>
      </div>
      <div class="date-detail-item">
        <div class="date-detail-label">${translations.zodiacDay}</div>
        <div class="date-detail-value">${dayCanChiText}</div>
      </div>
    </div>
  `;
}

function setupEventListeners(): void {
  // Month select
  const monthSelect = document.getElementById('month-select') as HTMLSelectElement;
  if (monthSelect) {
    monthSelect.addEventListener('change', (e) => {
      state.currentMonth = parseInt((e.target as HTMLSelectElement).value, 10);
      renderCalendar();
    });
  }

  // Year select
  const yearSelect = document.getElementById('year-select') as HTMLSelectElement;
  if (yearSelect) {
    yearSelect.addEventListener('change', (e) => {
      state.currentYear = parseInt((e.target as HTMLSelectElement).value, 10);
      renderCalendar();
    });
  }

  // Previous month
  const prevMonthBtn = document.getElementById('prev-month');
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
      state.currentMonth--;
      if (state.currentMonth < 0) {
        state.currentMonth = 11;
        state.currentYear--;
      }
      renderCalendar();
    });
  }

  // Next month
  const nextMonthBtn = document.getElementById('next-month');
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
      state.currentMonth++;
      if (state.currentMonth > 11) {
        state.currentMonth = 0;
        state.currentYear++;
      }
      renderCalendar();
    });
  }

  // Previous year
  const prevYearBtn = document.getElementById('prev-year');
  if (prevYearBtn) {
    prevYearBtn.addEventListener('click', () => {
      state.currentYear--;
      renderCalendar();
    });
  }

  // Next year
  const nextYearBtn = document.getElementById('next-year');
  if (nextYearBtn) {
    nextYearBtn.addEventListener('click', () => {
      state.currentYear++;
      renderCalendar();
    });
  }

  // Go to today
  const todayBtn = document.getElementById('btn-today');
  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      const now = new Date();
      state.currentYear = now.getFullYear();
      state.currentMonth = now.getMonth();
      state.selectedDate = now;
      renderCalendar();
      renderSelectedDate();
    });
  }

  // Toggle lunar
  const lunarToggle = document.getElementById('lunar-toggle');
  if (lunarToggle) {
    // Set initial state
    if (state.showLunar) {
      lunarToggle.classList.add('active');
    }

    lunarToggle.addEventListener('click', () => {
      state.showLunar = !state.showLunar;
      lunarToggle.classList.toggle('active', state.showLunar);
      saveSettings();
      renderDays();
    });
  }
}
