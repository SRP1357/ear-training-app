/**
 * Offline verification that YIN locks onto known sine tones.
 * Run: node scripts/verify-yin.mjs
 */

function largestPowerOfTwoAtMost(n) {
  let size = 1;
  while (size * 2 <= n) size *= 2;
  return size;
}

function detectPitchYin(samples, sampleRate, options = {}) {
  const threshold = options.threshold ?? 0.1;
  const probabilityThreshold = options.probabilityThreshold ?? 0.1;
  const minFreq = options.minFreq ?? 55;
  const maxFreq = options.maxFreq ?? 1800;

  const bufferSize = largestPowerOfTwoAtMost(samples.length);
  const yinBufferLength = bufferSize / 2;

  let energy = 0;
  for (let i = 0; i < bufferSize; i += 1) energy += samples[i] * samples[i];
  const rms = Math.sqrt(energy / bufferSize);
  if (rms < 0.008) return { frequency: -1, clarity: 0 };

  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(yinBufferLength - 1, Math.floor(sampleRate / minFreq));
  const yinBuffer = new Float32Array(yinBufferLength);

  for (let t = 1; t < yinBufferLength; t += 1) {
    let sum = 0;
    for (let i = 0; i < yinBufferLength; i += 1) {
      const delta = samples[i] - samples[i + t];
      sum += delta * delta;
    }
    yinBuffer[t] = sum;
  }

  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t += 1) {
    runningSum += yinBuffer[t];
    yinBuffer[t] = runningSum > 0 ? (yinBuffer[t] * t) / runningSum : 1;
  }

  let tau = -1;
  let probability = 0;
  for (let t = Math.max(2, tauMin); t < yinBufferLength && t <= tauMax; t += 1) {
    if (yinBuffer[t] < threshold) {
      while (t + 1 < yinBufferLength && t + 1 <= tauMax && yinBuffer[t + 1] < yinBuffer[t]) t += 1;
      tau = t;
      probability = 1 - yinBuffer[t];
      break;
    }
  }
  if (tau < 0 || probability < probabilityThreshold) return { frequency: -1, clarity: 0 };

  const halfTau = Math.floor(tau / 2);
  if (halfTau >= tauMin) {
    let t = halfTau;
    while (t + 1 <= tauMax && yinBuffer[t + 1] < yinBuffer[t]) t += 1;
    while (t - 1 >= tauMin && yinBuffer[t - 1] < yinBuffer[t]) t -= 1;
    if (yinBuffer[t] < threshold * 1.2 && yinBuffer[t] <= yinBuffer[tau] * 1.4) {
      tau = t;
      probability = 1 - yinBuffer[t];
    }
  }

  let betterTau = tau;
  const x0 = tau < 1 ? tau : tau - 1;
  const x2 = tau + 1 < yinBufferLength ? tau + 1 : tau;
  if (x0 !== tau && x2 !== tau) {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-12) betterTau = tau + (s2 - s0) / denom;
  }

  return { frequency: sampleRate / betterTau, clarity: probability };
}

function sine(freq, sampleRate, n) {
  const out = new Float32Array(n);
  for (let i = 0; i < n; i += 1) {
    out[i] = 0.5 * Math.sin((2 * Math.PI * freq * i) / sampleRate);
  }
  return out;
}

const sr = 44100;
const cases = [82.41, 110, 146.83, 196, 246.94, 329.63, 440, 523.25, 880];
let failed = 0;

for (const hz of cases) {
  const { frequency, clarity } = detectPitchYin(sine(hz, sr, 4096), sr);
  const cents = 1200 * Math.log2(frequency / hz);
  const ok = Number.isFinite(frequency) && Math.abs(cents) < 5 && clarity > 0.7;
  console.log(
    `${ok ? 'OK ' : 'FAIL'} target=${hz.toFixed(2)}Hz  got=${frequency.toFixed(2)}Hz  err=${cents.toFixed(2)}¢  clarity=${clarity.toFixed(3)}`,
  );
  if (!ok) failed += 1;
}

if (failed > 0) {
  console.error(`\n${failed} case(s) failed`);
  process.exit(1);
}
console.log('\nAll YIN sine checks passed (< 5 cents).');
