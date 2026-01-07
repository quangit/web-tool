// Weather - Major cities with coordinates
export interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  flag: string;
  timezone: string;
}

export interface WeatherData {
  temperature: number;
  windspeed: number;
  winddirection: number;
  weathercode: number;
  is_day: number;
  time: string;
  humidity: number;
  apparent_temperature: number;
  precipitation: number;
}

// Major world cities with their coordinates
export const majorCities: City[] = [
  // Americas
  {
    name: 'New York',
    country: 'USA',
    lat: 40.7128,
    lon: -74.006,
    flag: '🇺🇸',
    timezone: 'America/New_York',
  },
  {
    name: 'Los Angeles',
    country: 'USA',
    lat: 34.0522,
    lon: -118.2437,
    flag: '🇺🇸',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'Chicago',
    country: 'USA',
    lat: 41.8781,
    lon: -87.6298,
    flag: '🇺🇸',
    timezone: 'America/Chicago',
  },
  {
    name: 'San Francisco',
    country: 'USA',
    lat: 37.7749,
    lon: -122.4194,
    flag: '🇺🇸',
    timezone: 'America/Los_Angeles',
  },
  {
    name: 'Miami',
    country: 'USA',
    lat: 25.7617,
    lon: -80.1918,
    flag: '🇺🇸',
    timezone: 'America/New_York',
  },
  {
    name: 'Toronto',
    country: 'Canada',
    lat: 43.6532,
    lon: -79.3832,
    flag: '🇨🇦',
    timezone: 'America/Toronto',
  },
  {
    name: 'Vancouver',
    country: 'Canada',
    lat: 49.2827,
    lon: -123.1207,
    flag: '🇨🇦',
    timezone: 'America/Vancouver',
  },
  {
    name: 'Mexico City',
    country: 'Mexico',
    lat: 19.4326,
    lon: -99.1332,
    flag: '🇲🇽',
    timezone: 'America/Mexico_City',
  },
  {
    name: 'São Paulo',
    country: 'Brazil',
    lat: -23.5505,
    lon: -46.6333,
    flag: '🇧🇷',
    timezone: 'America/Sao_Paulo',
  },
  {
    name: 'Buenos Aires',
    country: 'Argentina',
    lat: -34.6037,
    lon: -58.3816,
    flag: '🇦🇷',
    timezone: 'America/Argentina/Buenos_Aires',
  },

  // Europe
  {
    name: 'London',
    country: 'UK',
    lat: 51.5074,
    lon: -0.1278,
    flag: '🇬🇧',
    timezone: 'Europe/London',
  },
  {
    name: 'Paris',
    country: 'France',
    lat: 48.8566,
    lon: 2.3522,
    flag: '🇫🇷',
    timezone: 'Europe/Paris',
  },
  {
    name: 'Berlin',
    country: 'Germany',
    lat: 52.52,
    lon: 13.405,
    flag: '🇩🇪',
    timezone: 'Europe/Berlin',
  },
  {
    name: 'Rome',
    country: 'Italy',
    lat: 41.9028,
    lon: 12.4964,
    flag: '🇮🇹',
    timezone: 'Europe/Rome',
  },
  {
    name: 'Madrid',
    country: 'Spain',
    lat: 40.4168,
    lon: -3.7038,
    flag: '🇪🇸',
    timezone: 'Europe/Madrid',
  },
  {
    name: 'Amsterdam',
    country: 'Netherlands',
    lat: 52.3676,
    lon: 4.9041,
    flag: '🇳🇱',
    timezone: 'Europe/Amsterdam',
  },
  {
    name: 'Vienna',
    country: 'Austria',
    lat: 48.2082,
    lon: 16.3738,
    flag: '🇦🇹',
    timezone: 'Europe/Vienna',
  },
  {
    name: 'Stockholm',
    country: 'Sweden',
    lat: 59.3293,
    lon: 18.0686,
    flag: '🇸🇪',
    timezone: 'Europe/Stockholm',
  },
  {
    name: 'Moscow',
    country: 'Russia',
    lat: 55.7558,
    lon: 37.6173,
    flag: '🇷🇺',
    timezone: 'Europe/Moscow',
  },
  {
    name: 'Istanbul',
    country: 'Turkey',
    lat: 41.0082,
    lon: 28.9784,
    flag: '🇹🇷',
    timezone: 'Europe/Istanbul',
  },

  // Asia
  {
    name: 'Tokyo',
    country: 'Japan',
    lat: 35.6762,
    lon: 139.6503,
    flag: '🇯🇵',
    timezone: 'Asia/Tokyo',
  },
  {
    name: 'Beijing',
    country: 'China',
    lat: 39.9042,
    lon: 116.4074,
    flag: '🇨🇳',
    timezone: 'Asia/Shanghai',
  },
  {
    name: 'Shanghai',
    country: 'China',
    lat: 31.2304,
    lon: 121.4737,
    flag: '🇨🇳',
    timezone: 'Asia/Shanghai',
  },
  {
    name: 'Hong Kong',
    country: 'China',
    lat: 22.3193,
    lon: 114.1694,
    flag: '🇭🇰',
    timezone: 'Asia/Hong_Kong',
  },
  {
    name: 'Singapore',
    country: 'Singapore',
    lat: 1.3521,
    lon: 103.8198,
    flag: '🇸🇬',
    timezone: 'Asia/Singapore',
  },
  {
    name: 'Seoul',
    country: 'South Korea',
    lat: 37.5665,
    lon: 126.978,
    flag: '🇰🇷',
    timezone: 'Asia/Seoul',
  },
  {
    name: 'Bangkok',
    country: 'Thailand',
    lat: 13.7563,
    lon: 100.5018,
    flag: '🇹🇭',
    timezone: 'Asia/Bangkok',
  },
  {
    name: 'Ho Chi Minh City',
    country: 'Vietnam',
    lat: 10.8231,
    lon: 106.6297,
    flag: '🇻🇳',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  {
    name: 'Hanoi',
    country: 'Vietnam',
    lat: 21.0285,
    lon: 105.8542,
    flag: '🇻🇳',
    timezone: 'Asia/Ho_Chi_Minh',
  },
  {
    name: 'Jakarta',
    country: 'Indonesia',
    lat: -6.2088,
    lon: 106.8456,
    flag: '🇮🇩',
    timezone: 'Asia/Jakarta',
  },
  {
    name: 'Manila',
    country: 'Philippines',
    lat: 14.5995,
    lon: 120.9842,
    flag: '🇵🇭',
    timezone: 'Asia/Manila',
  },
  {
    name: 'Mumbai',
    country: 'India',
    lat: 19.076,
    lon: 72.8777,
    flag: '🇮🇳',
    timezone: 'Asia/Kolkata',
  },
  {
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.209,
    flag: '🇮🇳',
    timezone: 'Asia/Kolkata',
  },
  { name: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708, flag: '🇦🇪', timezone: 'Asia/Dubai' },
  {
    name: 'Riyadh',
    country: 'Saudi Arabia',
    lat: 24.7136,
    lon: 46.6753,
    flag: '🇸🇦',
    timezone: 'Asia/Riyadh',
  },
  {
    name: 'Tel Aviv',
    country: 'Israel',
    lat: 32.0853,
    lon: 34.7818,
    flag: '🇮🇱',
    timezone: 'Asia/Jerusalem',
  },

  // Oceania
  {
    name: 'Sydney',
    country: 'Australia',
    lat: -33.8688,
    lon: 151.2093,
    flag: '🇦🇺',
    timezone: 'Australia/Sydney',
  },
  {
    name: 'Melbourne',
    country: 'Australia',
    lat: -37.8136,
    lon: 144.9631,
    flag: '🇦🇺',
    timezone: 'Australia/Melbourne',
  },
  {
    name: 'Auckland',
    country: 'New Zealand',
    lat: -36.8485,
    lon: 174.7633,
    flag: '🇳🇿',
    timezone: 'Pacific/Auckland',
  },

  // Africa
  {
    name: 'Cairo',
    country: 'Egypt',
    lat: 30.0444,
    lon: 31.2357,
    flag: '🇪🇬',
    timezone: 'Africa/Cairo',
  },
  {
    name: 'Johannesburg',
    country: 'South Africa',
    lat: -26.2041,
    lon: 28.0473,
    flag: '🇿🇦',
    timezone: 'Africa/Johannesburg',
  },
  {
    name: 'Cape Town',
    country: 'South Africa',
    lat: -33.9249,
    lon: 18.4241,
    flag: '🇿🇦',
    timezone: 'Africa/Johannesburg',
  },
  {
    name: 'Lagos',
    country: 'Nigeria',
    lat: 6.5244,
    lon: 3.3792,
    flag: '🇳🇬',
    timezone: 'Africa/Lagos',
  },
  {
    name: 'Nairobi',
    country: 'Kenya',
    lat: -1.2921,
    lon: 36.8219,
    flag: '🇰🇪',
    timezone: 'Africa/Nairobi',
  },
  {
    name: 'Casablanca',
    country: 'Morocco',
    lat: 33.5731,
    lon: -7.5898,
    flag: '🇲🇦',
    timezone: 'Africa/Casablanca',
  },
];

// Weather code to description and icon mapping
export const weatherCodes: Record<
  number,
  { description: string; icon: string; iconNight?: string }
> = {
  0: { description: 'Clear sky', icon: '☀️', iconNight: '🌙' },
  1: { description: 'Mainly clear', icon: '🌤️', iconNight: '🌙' },
  2: { description: 'Partly cloudy', icon: '⛅', iconNight: '☁️' },
  3: { description: 'Overcast', icon: '☁️' },
  45: { description: 'Fog', icon: '🌫️' },
  48: { description: 'Depositing rime fog', icon: '🌫️' },
  51: { description: 'Light drizzle', icon: '🌧️' },
  53: { description: 'Moderate drizzle', icon: '🌧️' },
  55: { description: 'Dense drizzle', icon: '🌧️' },
  56: { description: 'Light freezing drizzle', icon: '🌧️' },
  57: { description: 'Dense freezing drizzle', icon: '🌧️' },
  61: { description: 'Slight rain', icon: '🌧️' },
  63: { description: 'Moderate rain', icon: '🌧️' },
  65: { description: 'Heavy rain', icon: '🌧️' },
  66: { description: 'Light freezing rain', icon: '🌧️' },
  67: { description: 'Heavy freezing rain', icon: '🌧️' },
  71: { description: 'Slight snow fall', icon: '🌨️' },
  73: { description: 'Moderate snow fall', icon: '🌨️' },
  75: { description: 'Heavy snow fall', icon: '🌨️' },
  77: { description: 'Snow grains', icon: '🌨️' },
  80: { description: 'Slight rain showers', icon: '🌦️' },
  81: { description: 'Moderate rain showers', icon: '🌦️' },
  82: { description: 'Violent rain showers', icon: '⛈️' },
  85: { description: 'Slight snow showers', icon: '🌨️' },
  86: { description: 'Heavy snow showers', icon: '🌨️' },
  95: { description: 'Thunderstorm', icon: '⛈️' },
  96: { description: 'Thunderstorm with slight hail', icon: '⛈️' },
  99: { description: 'Thunderstorm with heavy hail', icon: '⛈️' },
};

// Constants
const STORAGE_KEY = 'weather_selected_cities';
const DEFAULT_CITIES = ['New York', 'London', 'Tokyo', 'Sydney', 'Ho Chi Minh City'];
const MAX_CITY_DISTANCE_DEGREES = 5; // Threshold in degrees for user location matching
const DEGREES_PER_DIRECTION = 45; // Each wind direction covers 45 degrees
const DIRECTION_COUNT = 8; // Number of cardinal/intercardinal directions
const REFRESH_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface WeatherTranslations {
  loading: string;
  error: string;
  noResults: string;
  yourLocation: string;
  locationError: string;
  temperature: string;
  windSpeed: string;
  humidity: string;
  feelsLike: string;
  precipitation: string;
  selectCities: string;
  selectedCities: string;
  availableCities: string;
  lastUpdated: string;
  refresh: string;
  locale: string;
}

let selectedCities: string[] = [];
let translations: WeatherTranslations;
let userLocationCity: City | null = null;

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

async function fetchWeatherForCity(city: City): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day&timezone=${encodeURIComponent(city.timezone)}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }
    const data = await response.json();
    const current = data.current;
    return {
      temperature: current.temperature_2m,
      windspeed: current.wind_speed_10m,
      winddirection: current.wind_direction_10m,
      weathercode: current.weather_code,
      is_day: current.is_day,
      time: current.time,
      humidity: current.relative_humidity_2m,
      apparent_temperature: current.apparent_temperature,
      precipitation: current.precipitation,
    } as WeatherData;
  } catch {
    // Error fetching weather data
    return null;
  }
}

function getWeatherIcon(code: number, isDay: number): string {
  const weather = weatherCodes[code];
  if (!weather) {
    return '🌡️';
  }
  return isDay === 0 && weather.iconNight ? weather.iconNight : weather.icon;
}

function getWeatherDescription(code: number): string {
  const weather = weatherCodes[code];
  return weather ? weather.description : 'Unknown';
}

function getWeatherBackground(code: number, isDay: number): string {
  // Clear sky
  if (code === 0) {
    return isDay === 1
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' // Day: Blue-purple
      : 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)'; // Night: Dark blue
  }
  // Mainly clear
  if (code === 1) {
    return isDay === 1
      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' // Day: Light blue
      : 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'; // Night: Blue
  }
  // Partly cloudy
  if (code === 2) {
    return isDay === 1
      ? 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)' // Day: Cloudy blue
      : 'linear-gradient(135deg, #373b44 0%, #4286f4 100%)'; // Night: Dark cloudy
  }
  // Overcast
  if (code === 3) {
    return 'linear-gradient(135deg, #bdc3c7 0%, #2c3e50 100%)'; // Gray
  }
  // Fog
  if (code === 45 || code === 48) {
    return 'linear-gradient(135deg, #757f9a 0%, #d7dde8 100%)'; // Foggy gray
  }
  // Drizzle
  if (code >= 51 && code <= 57) {
    return 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)'; // Light rain blue
  }
  // Rain
  if (code >= 61 && code <= 67) {
    return 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'; // Rain blue-dark
  }
  // Snow
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
    return 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)'; // Snowy white-blue
  }
  // Rain showers
  if (code >= 80 && code <= 82) {
    return 'linear-gradient(135deg, #5f72bd 0%, #9b23ea 100%)'; // Purple rain
  }
  // Thunderstorm
  if (code >= 95 && code <= 99) {
    return 'linear-gradient(135deg, #360033 0%, #0b8793 100%)'; // Dark storm
  }
  // Default
  return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function getWindDirection(degrees: number): string {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / DEGREES_PER_DIRECTION) % DIRECTION_COUNT;
  return directions[index];
}

function formatTemperature(temp: number): string {
  return `${Math.round(temp)}°C`;
}

function formatTime(timezone: string): string {
  try {
    return new Date().toLocaleTimeString(translations.locale || 'en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return new Date().toLocaleTimeString();
  }
}

async function getUserLocation(): Promise<City | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Try to get location name from reverse geocoding using Nominatim (OpenStreetMap)
        let locationName = translations.yourLocation;
        try {
          const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;
          const geoResponse = await fetch(geoUrl, {
            headers: {
              'Accept-Language': translations.locale || 'en',
            },
          });
          const geoData = await geoResponse.json();
          if (geoData && geoData.address) {
            const addr = geoData.address;
            const placeName =
              addr.city ||
              addr.town ||
              addr.village ||
              addr.municipality ||
              addr.county ||
              addr.state ||
              '';
            if (placeName) {
              locationName = `${translations.yourLocation} (${placeName})`;
            }
          }
        } catch {
          // Fallback to "Your Location" if geocoding fails
          // Reverse geocoding failed
        }

        // Find the closest city from our list using simple Euclidean distance
        // (adequate for nearby city matching)
        let closestCity: City | null = null;
        let minDistance = Infinity;

        for (const city of majorCities) {
          const distance = Math.sqrt(
            Math.pow(city.lat - latitude, 2) + Math.pow(city.lon - longitude, 2)
          );
          if (distance < minDistance) {
            minDistance = distance;
            closestCity = city;
          }
        }

        // If user is far from any major city, create a custom location
        if (minDistance > MAX_CITY_DISTANCE_DEGREES) {
          userLocationCity = {
            name: locationName,
            country: '',
            lat: latitude,
            lon: longitude,
            flag: '📍',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          resolve(userLocationCity);
        } else {
          // Use the closest city but update the name to show it's user location
          if (closestCity) {
            closestCity = {
              ...closestCity,
              name: `${translations.yourLocation} (${closestCity.name})`,
            };
          }
          resolve(closestCity);
        }
      },
      () => {
        // Geolocation failed, just resolve null
        resolve(null);
      },
      { timeout: 5000 }
    );
  });
}

function renderWeatherCard(
  city: City,
  weather: WeatherData | null,
  isUserLocation = false
): string {
  const loading = !weather;
  const icon = weather ? getWeatherIcon(weather.weathercode, weather.is_day) : '⏳';
  const temp = weather ? formatTemperature(weather.temperature) : '--°C';
  const description = weather ? getWeatherDescription(weather.weathercode) : translations.loading;
  const windSpeed = weather ? `${Math.round(weather.windspeed)} km/h` : '--';
  const windDir = weather ? getWindDirection(weather.winddirection) : '--';
  const currentTime = formatTime(city.timezone);
  const humidity = weather ? `${Math.round(weather.humidity)}%` : '--%';
  const feelsLike = weather ? formatTemperature(weather.apparent_temperature) : '--°C';
  const precipitation = weather ? `${weather.precipitation} mm` : '-- mm';
  const backgroundGradient = weather
    ? getWeatherBackground(weather.weathercode, weather.is_day)
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

  return `
    <div class="weather-card ${loading ? 'loading' : ''} ${isUserLocation ? 'user-location' : ''}" data-city="${city.name}" ${isUserLocation ? 'data-user-location="true"' : ''} style="background: ${backgroundGradient}; border: none;">
      <div class="weather-card-header">
        <div class="city-info">
          <span class="city-name">${city.flag} ${city.name}</span>
          ${city.country ? `<span class="city-country">${city.country}</span>` : ''}
          <span class="city-time">${currentTime}</span>
        </div>
        ${
          !isUserLocation
            ? `
          <button class="btn-remove" data-city="${city.name}" title="Remove">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `
            : ''
        }
      </div>
      <div class="weather-main">
        <span class="weather-icon">${icon}</span>
        <span class="weather-temp">${temp}</span>
      </div>
      <div class="weather-description">${description}</div>
      <div class="weather-details">
        <div class="weather-detail">
          <span class="detail-label">🌡️ ${translations.feelsLike}</span>
          <span class="detail-value">${feelsLike}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label">💧 ${translations.humidity}</span>
          <span class="detail-value">${humidity}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label">💨 ${translations.windSpeed}</span>
          <span class="detail-value">${windSpeed} ${windDir}</span>
        </div>
        <div class="weather-detail">
          <span class="detail-label">🌧️ ${translations.precipitation}</span>
          <span class="detail-value">${precipitation}</span>
        </div>
      </div>
    </div>
  `;
}

async function loadWeatherForCities(): Promise<void> {
  const container = document.getElementById('weather-cards-container');
  if (!container) {
    return;
  }

  // First, render loading state
  let html = '';

  // Render user location first if available
  if (userLocationCity) {
    html += renderWeatherCard(userLocationCity, null, true);
  }

  // Render selected cities
  for (const cityName of selectedCities) {
    const city = majorCities.find((c) => c.name === cityName);
    if (city) {
      html += renderWeatherCard(city, null);
    }
  }

  container.innerHTML = html;
  addRemoveListeners();

  // Then fetch weather data
  const fetchPromises: Promise<void>[] = [];

  // Fetch user location weather
  if (userLocationCity) {
    fetchPromises.push(
      fetchWeatherForCity(userLocationCity).then((weather) => {
        const card = container.querySelector('.weather-card[data-user-location="true"]');
        if (card && weather) {
          card.outerHTML = renderWeatherCard(userLocationCity!, weather, true);
        }
      })
    );
  }

  // Fetch selected cities weather
  for (const cityName of selectedCities) {
    const city = majorCities.find((c) => c.name === cityName);
    if (city) {
      fetchPromises.push(
        fetchWeatherForCity(city).then((weather) => {
          const card = container.querySelector(`.weather-card[data-city="${city.name}"]`);
          if (card && weather) {
            card.outerHTML = renderWeatherCard(city, weather);
            addRemoveListeners();
          }
        })
      );
    }
  }

  await Promise.all(fetchPromises);
}

function addRemoveListeners(): void {
  const container = document.getElementById('weather-cards-container');
  if (!container) {
    return;
  }

  container.querySelectorAll('.btn-remove').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const cityName = (e.currentTarget as HTMLElement).getAttribute('data-city');
      if (cityName) {
        removeCity(cityName);
      }
    });
  });
}

function renderAvailableCities(filter = ''): void {
  const container = document.getElementById('available-cities-container');
  if (!container) {
    return;
  }

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

async function addCityCard(city: City): Promise<void> {
  const container = document.getElementById('weather-cards-container');
  if (!container) {
    return;
  }

  // Create a temporary container to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = renderWeatherCard(city, null);
  const newCard = tempDiv.firstElementChild as HTMLElement;

  // Append the new card
  container.appendChild(newCard);
  addRemoveListeners();

  // Fetch weather data for the new card
  const weather = await fetchWeatherForCity(city);
  if (weather && newCard) {
    newCard.outerHTML = renderWeatherCard(city, weather);
    addRemoveListeners();
  }
}

async function addCity(cityName: string): Promise<void> {
  if (!selectedCities.includes(cityName)) {
    selectedCities.push(cityName);
    saveSelectedCities();

    const city = majorCities.find((c) => c.name === cityName);
    if (city) {
      await addCityCard(city);
    }

    renderAvailableCities(
      (document.getElementById('city-search') as HTMLInputElement)?.value || ''
    );
  }
}

function removeCity(cityName: string): void {
  const container = document.getElementById('weather-cards-container');
  if (!container) {
    return;
  }

  // Find and remove the specific card
  const cardToRemove = container.querySelector(
    `.weather-card[data-city="${cityName}"]:not([data-user-location])`
  );
  if (cardToRemove) {
    // Add fade out animation
    cardToRemove.classList.add('removing');
    setTimeout(() => {
      cardToRemove.remove();
    }, 200);
  }

  selectedCities = selectedCities.filter((c) => c !== cityName);
  saveSelectedCities();
  renderAvailableCities((document.getElementById('city-search') as HTMLInputElement)?.value || '');
}

async function refreshWeather(): Promise<void> {
  await loadWeatherForCities();
}

export async function initWeather(t: WeatherTranslations): Promise<void> {
  translations = t;
  selectedCities = loadSelectedCities();

  // Try to get user location
  const locationPromise = getUserLocation();

  // Set up search input
  const searchInput = document.getElementById('city-search') as HTMLInputElement;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value;
      renderAvailableCities(value);
    });
  }

  // Set up refresh button
  const refreshBtn = document.getElementById('refresh-weather');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', refreshWeather);
  }

  // Wait for location (with timeout)
  const userLocation = await locationPromise;
  if (userLocation && userLocation.name.startsWith(translations.yourLocation)) {
    userLocationCity = userLocation;
  }

  // Initial render
  renderAvailableCities();
  await loadWeatherForCities();

  // Auto-refresh weather data
  setInterval(refreshWeather, REFRESH_INTERVAL_MS);
}
