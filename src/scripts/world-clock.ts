// World Clock - Major cities with timezones
export interface City {
  name: string;
  country: string;
  timezone: string;
  flag: string;
}

export const majorCities: City[] = [
  // Americas
  { name: 'New York', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
  { name: 'Los Angeles', country: 'USA', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'Chicago', country: 'USA', timezone: 'America/Chicago', flag: '🇺🇸' },
  { name: 'San Francisco', country: 'USA', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'Miami', country: 'USA', timezone: 'America/New_York', flag: '🇺🇸' },
  { name: 'Seattle', country: 'USA', timezone: 'America/Los_Angeles', flag: '🇺🇸' },
  { name: 'Denver', country: 'USA', timezone: 'America/Denver', flag: '🇺🇸' },
  { name: 'Toronto', country: 'Canada', timezone: 'America/Toronto', flag: '🇨🇦' },
  { name: 'Vancouver', country: 'Canada', timezone: 'America/Vancouver', flag: '🇨🇦' },
  { name: 'Mexico City', country: 'Mexico', timezone: 'America/Mexico_City', flag: '🇲🇽' },
  { name: 'São Paulo', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'Rio de Janeiro', country: 'Brazil', timezone: 'America/Sao_Paulo', flag: '🇧🇷' },
  { name: 'Buenos Aires', country: 'Argentina', timezone: 'America/Argentina/Buenos_Aires', flag: '🇦🇷' },
  { name: 'Lima', country: 'Peru', timezone: 'America/Lima', flag: '🇵🇪' },
  { name: 'Bogota', country: 'Colombia', timezone: 'America/Bogota', flag: '🇨🇴' },
  { name: 'Santiago', country: 'Chile', timezone: 'America/Santiago', flag: '🇨🇱' },

  // Europe
  { name: 'London', country: 'UK', timezone: 'Europe/London', flag: '🇬🇧' },
  { name: 'Paris', country: 'France', timezone: 'Europe/Paris', flag: '🇫🇷' },
  { name: 'Berlin', country: 'Germany', timezone: 'Europe/Berlin', flag: '🇩🇪' },
  { name: 'Rome', country: 'Italy', timezone: 'Europe/Rome', flag: '🇮🇹' },
  { name: 'Madrid', country: 'Spain', timezone: 'Europe/Madrid', flag: '🇪🇸' },
  { name: 'Amsterdam', country: 'Netherlands', timezone: 'Europe/Amsterdam', flag: '🇳🇱' },
  { name: 'Brussels', country: 'Belgium', timezone: 'Europe/Brussels', flag: '🇧🇪' },
  { name: 'Vienna', country: 'Austria', timezone: 'Europe/Vienna', flag: '🇦🇹' },
  { name: 'Zurich', country: 'Switzerland', timezone: 'Europe/Zurich', flag: '🇨🇭' },
  { name: 'Stockholm', country: 'Sweden', timezone: 'Europe/Stockholm', flag: '🇸🇪' },
  { name: 'Copenhagen', country: 'Denmark', timezone: 'Europe/Copenhagen', flag: '🇩🇰' },
  { name: 'Oslo', country: 'Norway', timezone: 'Europe/Oslo', flag: '🇳🇴' },
  { name: 'Helsinki', country: 'Finland', timezone: 'Europe/Helsinki', flag: '🇫🇮' },
  { name: 'Dublin', country: 'Ireland', timezone: 'Europe/Dublin', flag: '🇮🇪' },
  { name: 'Lisbon', country: 'Portugal', timezone: 'Europe/Lisbon', flag: '🇵🇹' },
  { name: 'Athens', country: 'Greece', timezone: 'Europe/Athens', flag: '🇬🇷' },
  { name: 'Warsaw', country: 'Poland', timezone: 'Europe/Warsaw', flag: '🇵🇱' },
  { name: 'Prague', country: 'Czech Republic', timezone: 'Europe/Prague', flag: '🇨🇿' },
  { name: 'Budapest', country: 'Hungary', timezone: 'Europe/Budapest', flag: '🇭🇺' },
  { name: 'Moscow', country: 'Russia', timezone: 'Europe/Moscow', flag: '🇷🇺' },
  { name: 'Istanbul', country: 'Turkey', timezone: 'Europe/Istanbul', flag: '🇹🇷' },

  // Asia
  { name: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Osaka', country: 'Japan', timezone: 'Asia/Tokyo', flag: '🇯🇵' },
  { name: 'Beijing', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: 'Shanghai', country: 'China', timezone: 'Asia/Shanghai', flag: '🇨🇳' },
  { name: 'Hong Kong', country: 'China', timezone: 'Asia/Hong_Kong', flag: '🇭🇰' },
  { name: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', flag: '🇸🇬' },
  { name: 'Seoul', country: 'South Korea', timezone: 'Asia/Seoul', flag: '🇰🇷' },
  { name: 'Taipei', country: 'Taiwan', timezone: 'Asia/Taipei', flag: '🇹🇼' },
  { name: 'Bangkok', country: 'Thailand', timezone: 'Asia/Bangkok', flag: '🇹🇭' },
  { name: 'Hanoi', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳' },
  { name: 'Ho Chi Minh City', country: 'Vietnam', timezone: 'Asia/Ho_Chi_Minh', flag: '🇻🇳' },
  { name: 'Jakarta', country: 'Indonesia', timezone: 'Asia/Jakarta', flag: '🇮🇩' },
  { name: 'Manila', country: 'Philippines', timezone: 'Asia/Manila', flag: '🇵🇭' },
  { name: 'Kuala Lumpur', country: 'Malaysia', timezone: 'Asia/Kuala_Lumpur', flag: '🇲🇾' },
  { name: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { name: 'New Delhi', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { name: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { name: 'Kolkata', country: 'India', timezone: 'Asia/Kolkata', flag: '🇮🇳' },
  { name: 'Dubai', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { name: 'Abu Dhabi', country: 'UAE', timezone: 'Asia/Dubai', flag: '🇦🇪' },
  { name: 'Riyadh', country: 'Saudi Arabia', timezone: 'Asia/Riyadh', flag: '🇸🇦' },
  { name: 'Doha', country: 'Qatar', timezone: 'Asia/Qatar', flag: '🇶🇦' },
  { name: 'Tel Aviv', country: 'Israel', timezone: 'Asia/Jerusalem', flag: '🇮🇱' },
  { name: 'Karachi', country: 'Pakistan', timezone: 'Asia/Karachi', flag: '🇵🇰' },
  { name: 'Dhaka', country: 'Bangladesh', timezone: 'Asia/Dhaka', flag: '🇧🇩' },

  // Oceania
  { name: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', flag: '🇦🇺' },
  { name: 'Melbourne', country: 'Australia', timezone: 'Australia/Melbourne', flag: '🇦🇺' },
  { name: 'Brisbane', country: 'Australia', timezone: 'Australia/Brisbane', flag: '🇦🇺' },
  { name: 'Perth', country: 'Australia', timezone: 'Australia/Perth', flag: '🇦🇺' },
  { name: 'Auckland', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },
  { name: 'Wellington', country: 'New Zealand', timezone: 'Pacific/Auckland', flag: '🇳🇿' },

  // Africa
  { name: 'Cairo', country: 'Egypt', timezone: 'Africa/Cairo', flag: '🇪🇬' },
  { name: 'Johannesburg', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
  { name: 'Cape Town', country: 'South Africa', timezone: 'Africa/Johannesburg', flag: '🇿🇦' },
  { name: 'Lagos', country: 'Nigeria', timezone: 'Africa/Lagos', flag: '🇳🇬' },
  { name: 'Nairobi', country: 'Kenya', timezone: 'Africa/Nairobi', flag: '🇰🇪' },
  { name: 'Casablanca', country: 'Morocco', timezone: 'Africa/Casablanca', flag: '🇲🇦' },
];

// Default selected cities
const DEFAULT_CITIES = ['New York', 'London', 'Tokyo', 'Sydney', 'Ho Chi Minh City'];
const STORAGE_KEY = 'world_clock_selected_cities';

interface WorldClockTranslations {
  noResults: string;
  hoursAhead: string;
  hoursBehind: string;
  sameTime: string;
  emptyState: string;
  locale: string;
}

let selectedCities: string[] = [];
let intervalId: number | null = null;
let translations: WorldClockTranslations;

function loadSelectedCities(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // Ignore localStorage errors
  }
  return [...DEFAULT_CITIES];
}

function saveSelectedCities(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCities));
  } catch {
    // Ignore localStorage errors
  }
}

function formatTime(date: Date, timezone: string): string {
  return date.toLocaleTimeString(translations.locale || 'en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function formatDate(date: Date, timezone: string): string {
  return date.toLocaleDateString(translations.locale || 'en-US', {
    timeZone: timezone,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTimeDifference(timezone: string): { hours: number; text: string; className: string } {
  const now = new Date();

  // Calculate offset using Intl.DateTimeFormat for accuracy
  const localFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timeZoneName: 'longOffset',
  });
  const targetFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'longOffset',
  });

  // Extract offset from formatted string (e.g., "GMT+09:00")
  const getOffsetMinutes = (formatted: string): number => {
    const match = formatted.match(/GMT([+-])(\d{2}):(\d{2})/);
    if (!match) {return 0;}
    const sign = match[1] === '+' ? 1 : -1;
    const hours = parseInt(match[2], 10);
    const minutes = parseInt(match[3], 10);
    return sign * (hours * 60 + minutes);
  };

  const localOffset = getOffsetMinutes(localFormatter.format(now));
  const targetOffset = getOffsetMinutes(targetFormatter.format(now));
  const diffMinutes = targetOffset - localOffset;
  const diffHours = Math.round(diffMinutes / 60);

  if (diffHours === 0) {
    return { hours: 0, text: translations.sameTime, className: '' };
  } else if (diffHours > 0) {
    return {
      hours: diffHours,
      text: translations.hoursAhead.replace('{0}', String(diffHours)),
      className: 'ahead',
    };
  } else {
    return {
      hours: diffHours,
      text: translations.hoursBehind.replace('{0}', String(Math.abs(diffHours))),
      className: 'behind',
    };
  }
}

function updateLocalTime(): void {
  const now = new Date();
  const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const timeDisplay = document.getElementById('local-time');
  const dateDisplay = document.getElementById('local-date');

  if (timeDisplay) {
    timeDisplay.textContent = formatTime(now, localTimezone);
  }
  if (dateDisplay) {
    dateDisplay.textContent = formatDate(now, localTimezone);
  }
}

function updateSelectedCities(): void {
  const now = new Date();
  const container = document.getElementById('selected-cities-container');
  if (!container) {return;}

  const cards = container.querySelectorAll('.city-card');
  cards.forEach((card) => {
    const cityName = card.getAttribute('data-city');
    const city = majorCities.find((c) => c.name === cityName);
    if (!city) {return;}

    const timeEl = card.querySelector('.city-time');
    const dateEl = card.querySelector('.city-date');
    const diffEl = card.querySelector('.time-difference');

    if (timeEl) {
      timeEl.textContent = formatTime(now, city.timezone);
    }
    if (dateEl) {
      dateEl.textContent = formatDate(now, city.timezone);
    }
    if (diffEl) {
      const diff = getTimeDifference(city.timezone);
      diffEl.textContent = diff.text;
      diffEl.className = `time-difference ${diff.className}`;
    }
  });
}

function renderSelectedCities(): void {
  const container = document.getElementById('selected-cities-container');
  if (!container) {return;}

  if (selectedCities.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>${translations.emptyState}</p>
      </div>
    `;
    return;
  }

  const now = new Date();
  const html = selectedCities
    .map((cityName) => {
      const city = majorCities.find((c) => c.name === cityName);
      if (!city) {return '';}

      const diff = getTimeDifference(city.timezone);
      return `
      <div class="city-card" data-city="${city.name}">
        <div class="city-info">
          <span class="city-name">${city.flag} ${city.name}</span>
          <span class="city-country">${city.country}</span>
          <span class="city-timezone">${city.timezone}</span>
        </div>
        <div class="city-time-info">
          <span class="city-time">${formatTime(now, city.timezone)}</span>
          <span class="city-date">${formatDate(now, city.timezone)}</span>
          <span class="time-difference ${diff.className}">${diff.text}</span>
        </div>
        <div class="city-card-actions">
          <button class="btn-remove" data-city="${city.name}" title="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = html;

  // Add event listeners for remove buttons
  container.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const cityName = (e.currentTarget as HTMLElement).getAttribute('data-city');
      if (cityName) {
        removeCity(cityName);
      }
    });
  });
}

function renderAvailableCities(filter = ''): void {
  const container = document.getElementById('available-cities-container');
  if (!container) {return;}

  const filterLower = filter.toLowerCase();
  const availableCities = majorCities.filter((city) => {
    const isSelected = selectedCities.includes(city.name);
    const matchesFilter =
      filter === '' ||
      city.name.toLowerCase().includes(filterLower) ||
      city.country.toLowerCase().includes(filterLower);
    return !isSelected && matchesFilter;
  });

  if (availableCities.length === 0) {
    container.innerHTML = `<div class="no-results">${translations.noResults}</div>`;
    return;
  }

  const html = availableCities
    .map(
      (city) => `
    <button class="city-chip" data-city="${city.name}">
      <span class="city-chip-flag">${city.flag}</span>
      <span class="city-chip-name">${city.name}</span>
    </button>
  `
    )
    .join('');

  container.innerHTML = html;

  // Add event listeners
  container.querySelectorAll('.city-chip').forEach((chip) => {
    chip.addEventListener('click', (e) => {
      const cityName = (e.currentTarget as HTMLElement).getAttribute('data-city');
      if (cityName) {
        addCity(cityName);
      }
    });
  });
}

function addCity(cityName: string): void {
  if (!selectedCities.includes(cityName)) {
    selectedCities.push(cityName);
    saveSelectedCities();
    renderSelectedCities();
    renderAvailableCities((document.getElementById('city-search') as HTMLInputElement)?.value || '');
  }
}

function removeCity(cityName: string): void {
  selectedCities = selectedCities.filter((c) => c !== cityName);
  saveSelectedCities();
  renderSelectedCities();
  renderAvailableCities((document.getElementById('city-search') as HTMLInputElement)?.value || '');
}

function startClock(): void {
  updateLocalTime();
  updateSelectedCities();

  // Update every second
  intervalId = window.setInterval(() => {
    updateLocalTime();
    updateSelectedCities();
  }, 1000);
}

function stopClock(): void {
  if (intervalId !== null) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

export function initWorldClock(t: WorldClockTranslations): void {
  translations = t;
  selectedCities = loadSelectedCities();

  // Initial render
  renderSelectedCities();
  renderAvailableCities();

  // Start the clock
  startClock();

  // Set up search input
  const searchInput = document.getElementById('city-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      renderAvailableCities(value);
    });
  }

  // Clean up on page unload
  window.addEventListener('beforeunload', stopClock);
}
