// Network Speed Test - measures download and upload speeds
export interface SpeedTestTranslations {
  download: string;
  upload: string;
  latency: string;
  mbps: string;
  ms: string;
  startTest: string;
  testing: string;
  testComplete: string;
  error: string;
  downloadSpeed: string;
  uploadSpeed: string;
  ping: string;
  testAgain: string;
  ipAddress: string;
  unknown: string;
}

export interface SpeedTestResult {
  downloadSpeed: number; // Mbps
  uploadSpeed: number; // Mbps
  latency: number; // ms
  ipAddress: string;
}

let translations: SpeedTestTranslations;
let isRunning = false;

// Get elements
function getElements() {
  return {
    startBtn: document.getElementById('start-test') as HTMLButtonElement,
    downloadValue: document.getElementById('download-value'),
    uploadValue: document.getElementById('upload-value'),
    latencyValue: document.getElementById('latency-value'),
    ipValue: document.getElementById('ip-value'),
    statusText: document.getElementById('status-text'),
    progressRing: document.getElementById('progress-ring'),
    speedGauge: document.getElementById('speed-gauge'),
    currentSpeedValue: document.getElementById('current-speed-value'),
    currentSpeedLabel: document.getElementById('current-speed-label'),
  };
}

// Helper to format speed
function formatSpeed(speed: number): string {
  if (speed < 0.01) return '0.00';
  if (speed < 10) return speed.toFixed(2);
  if (speed < 100) return speed.toFixed(1);
  return Math.round(speed).toString();
}

// Update progress ring
function updateProgressRing(progress: number): void {
  const { progressRing } = getElements();
  if (!progressRing) return;

  const circumference = 2 * Math.PI * 90; // radius = 90
  const offset = circumference * (1 - progress / 100);
  (progressRing as HTMLElement).style.strokeDashoffset = String(offset);
}

// Update status text
function updateStatus(text: string): void {
  const { statusText } = getElements();
  if (statusText) {
    statusText.textContent = text;
  }
}

// Update current speed display
function updateCurrentSpeed(speed: number, label: string): void {
  const { currentSpeedValue, currentSpeedLabel } = getElements();
  if (currentSpeedValue) {
    currentSpeedValue.textContent = formatSpeed(speed);
  }
  if (currentSpeedLabel) {
    currentSpeedLabel.textContent = label;
  }
}

// Measure latency using fetch timing
async function measureLatency(): Promise<number> {
  const iterations = 5;
  const latencies: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    try {
      // Use a small image from a fast CDN for latency measurement
      await fetch('https://www.cloudflare.com/cdn-cgi/trace', {
        method: 'HEAD',
        cache: 'no-store',
        mode: 'cors',
      });
      const end = performance.now();
      latencies.push(end - start);
    } catch {
      // If fetch fails, try another endpoint
      try {
        const start2 = performance.now();
        await fetch('https://api.ipify.org?format=json', {
          method: 'HEAD',
          cache: 'no-store',
        });
        const end2 = performance.now();
        latencies.push(end2 - start2);
      } catch {
        // Ignore failures
      }
    }
  }

  if (latencies.length === 0) return 0;

  // Return median latency
  latencies.sort((a, b) => a - b);
  return latencies[Math.floor(latencies.length / 2)];
}

// Get user's IP address
async function getIpAddress(): Promise<string> {
  try {
    // Try Cloudflare trace first
    const response = await fetch('https://www.cloudflare.com/cdn-cgi/trace');
    const text = await response.text();
    const ipMatch = text.match(/ip=([^\s]+)/);
    if (ipMatch) {
      return ipMatch[1];
    }
  } catch {
    // Ignore
  }

  try {
    // Fallback to ipify
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return translations.unknown;
  }
}

// Measure download speed
async function measureDownloadSpeed(
  onProgress: (speed: number) => void
): Promise<number> {
  // Use Cloudflare speed test endpoints (100MB chunks)
  const testUrls = [
    'https://speed.cloudflare.com/__down?bytes=10000000', // 10MB
    'https://speed.cloudflare.com/__down?bytes=25000000', // 25MB
    'https://speed.cloudflare.com/__down?bytes=50000000', // 50MB
  ];

  const measurements: number[] = [];
  let totalBytes = 0;
  let totalTime = 0;

  for (const url of testUrls) {
    try {
      const startTime = performance.now();
      const response = await fetch(url, { cache: 'no-store' });

      if (!response.ok || !response.body) continue;

      const reader = response.body.getReader();
      let receivedBytes = 0;
      let chunkStartTime = startTime;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        receivedBytes += value.length;
        const currentTime = performance.now();
        const elapsedMs = currentTime - chunkStartTime;

        // Update progress every 500ms worth of data
        if (elapsedMs > 100) {
          const speedBps = (receivedBytes * 8) / ((currentTime - startTime) / 1000);
          const speedMbps = speedBps / 1000000;
          onProgress(speedMbps);
        }
      }

      const endTime = performance.now();
      const durationMs = endTime - startTime;

      if (durationMs > 100) {
        totalBytes += receivedBytes;
        totalTime += durationMs;

        const speedBps = (receivedBytes * 8) / (durationMs / 1000);
        const speedMbps = speedBps / 1000000;
        measurements.push(speedMbps);
        onProgress(speedMbps);
      }
    } catch {
      // Continue with next URL
    }
  }

  if (measurements.length === 0) {
    // Fallback: try to download a larger file from a different source
    try {
      const fallbackUrl = 'https://proof.ovh.net/files/1Mb.dat';
      const startTime = performance.now();
      const response = await fetch(fallbackUrl, { cache: 'no-store' });
      const blob = await response.blob();
      const endTime = performance.now();

      const durationSeconds = (endTime - startTime) / 1000;
      const speedBps = (blob.size * 8) / durationSeconds;
      return speedBps / 1000000;
    } catch {
      return 0;
    }
  }

  // Return average of all measurements
  return measurements.reduce((a, b) => a + b, 0) / measurements.length;
}

// Measure upload speed
async function measureUploadSpeed(
  onProgress: (speed: number) => void
): Promise<number> {
  const measurements: number[] = [];

  // Create test data of varying sizes
  const testSizes = [
    1 * 1024 * 1024, // 1MB
    2 * 1024 * 1024, // 2MB
    5 * 1024 * 1024, // 5MB
  ];

  for (const size of testSizes) {
    try {
      // Generate random data
      const data = new Uint8Array(size);
      crypto.getRandomValues(data);
      const blob = new Blob([data]);

      const startTime = performance.now();

      // Use Cloudflare upload endpoint
      const response = await fetch('https://speed.cloudflare.com/__up', {
        method: 'POST',
        body: blob,
        cache: 'no-store',
      });

      if (!response.ok) continue;

      const endTime = performance.now();
      const durationMs = endTime - startTime;

      if (durationMs > 100) {
        const speedBps = (size * 8) / (durationMs / 1000);
        const speedMbps = speedBps / 1000000;
        measurements.push(speedMbps);
        onProgress(speedMbps);
      }
    } catch {
      // Continue with next size
    }
  }

  if (measurements.length === 0) return 0;

  // Return average
  return measurements.reduce((a, b) => a + b, 0) / measurements.length;
}

// Run the full speed test
async function runSpeedTest(): Promise<SpeedTestResult> {
  const elements = getElements();
  const result: SpeedTestResult = {
    downloadSpeed: 0,
    uploadSpeed: 0,
    latency: 0,
    ipAddress: '',
  };

  // Phase 1: Get IP and measure latency (0-20%)
  updateStatus(`${translations.testing}... ${translations.ping}`);
  updateProgressRing(5);

  const [ipAddress, latency] = await Promise.all([getIpAddress(), measureLatency()]);

  result.ipAddress = ipAddress;
  result.latency = latency;

  if (elements.ipValue) elements.ipValue.textContent = ipAddress;
  if (elements.latencyValue)
    elements.latencyValue.textContent = `${Math.round(latency)} ${translations.ms}`;

  updateProgressRing(20);

  // Phase 2: Download test (20-60%)
  updateStatus(`${translations.testing}... ${translations.download}`);
  updateCurrentSpeed(0, translations.download);

  result.downloadSpeed = await measureDownloadSpeed((speed) => {
    updateCurrentSpeed(speed, translations.download);
    // Map download progress to 20-60%
    updateProgressRing(20 + Math.min(speed / 10, 1) * 40);
  });

  if (elements.downloadValue) {
    elements.downloadValue.textContent = `${formatSpeed(result.downloadSpeed)} ${translations.mbps}`;
  }
  updateProgressRing(60);

  // Phase 3: Upload test (60-100%)
  updateStatus(`${translations.testing}... ${translations.upload}`);
  updateCurrentSpeed(0, translations.upload);

  result.uploadSpeed = await measureUploadSpeed((speed) => {
    updateCurrentSpeed(speed, translations.upload);
    // Map upload progress to 60-100%
    updateProgressRing(60 + Math.min(speed / 10, 1) * 40);
  });

  if (elements.uploadValue) {
    elements.uploadValue.textContent = `${formatSpeed(result.uploadSpeed)} ${translations.mbps}`;
  }
  updateProgressRing(100);

  return result;
}

// Initialize the speed test
export async function initSpeedTest(t: SpeedTestTranslations): Promise<void> {
  translations = t;
  const elements = getElements();

  if (!elements.startBtn) return;

  // Set initial state
  updateProgressRing(0);

  elements.startBtn.addEventListener('click', async () => {
    if (isRunning) return;

    isRunning = true;
    elements.startBtn.disabled = true;
    elements.startBtn.textContent = translations.testing;

    // Reset values
    if (elements.downloadValue) elements.downloadValue.textContent = '-- ' + translations.mbps;
    if (elements.uploadValue) elements.uploadValue.textContent = '-- ' + translations.mbps;
    if (elements.latencyValue) elements.latencyValue.textContent = '-- ' + translations.ms;
    if (elements.ipValue) elements.ipValue.textContent = '--';
    updateProgressRing(0);
    updateCurrentSpeed(0, '');

    try {
      await runSpeedTest();
      updateStatus(translations.testComplete);
      updateCurrentSpeed(0, '');
    } catch (error) {
      updateStatus(translations.error);
      console.error('Speed test error:', error);
    } finally {
      isRunning = false;
      elements.startBtn.disabled = false;
      elements.startBtn.textContent = translations.testAgain;
    }
  });
}
