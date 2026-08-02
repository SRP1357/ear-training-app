/**
 * YIN fundamental-frequency estimator
 * de Cheveigné & Kawahara (2002), aligned with the aubio / pitchfinder reference.
 */

const NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'] as const;

export type PitchReading = {
  frequency: number;
  midi: number;
  note: string;
  octave: number;
  cents: number;
  clarity: number;
};

export type YinResult = {
  frequency: number;
  clarity: number;
};

function noteParts(midi: number) {
  const pc = ((midi % 12) + 12) % 12;
  return {
    note: NOTE_NAMES[pc],
    octave: Math.floor(midi / 12) - 1,
  };
}

/** Convert frequency to note metadata against a chosen A4 reference. */
export function frequencyToPitch(
  frequency: number,
  a4 = 440,
  clarity = 1,
): PitchReading | null {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;

  const midiFloat = 69 + 12 * Math.log2(frequency / a4);
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;
  const { note, octave } = noteParts(midi);

  return {
    frequency,
    midi,
    note,
    octave,
    cents,
    clarity,
  };
}

function largestPowerOfTwoAtMost(n: number): number {
  let size = 1;
  while (size * 2 <= n) size *= 2;
  return size;
}

/**
 * YIN pitch detection with:
 * - difference function
 * - cumulative mean normalized difference
 * - absolute threshold
 * - parabolic interpolation (aubio-corrected formula)
 * - octave-error check (common musical-tuner practice)
 */
export function detectPitchYin(
  samples: Float32Array,
  sampleRate: number,
  options?: {
    threshold?: number;
    probabilityThreshold?: number;
    minFreq?: number;
    maxFreq?: number;
  },
): YinResult {
  const threshold = options?.threshold ?? 0.1;
  const probabilityThreshold = options?.probabilityThreshold ?? 0.1;
  const minFreq = options?.minFreq ?? 55;
  const maxFreq = options?.maxFreq ?? 1800;

  if (!Number.isFinite(sampleRate) || sampleRate <= 0 || samples.length < 64) {
    return { frequency: -1, clarity: 0 };
  }

  // Use the largest power-of-two window contained in the buffer (aubio-style).
  const bufferSize = largestPowerOfTwoAtMost(samples.length);
  const yinBufferLength = bufferSize / 2;
  if (yinBufferLength < 32) return { frequency: -1, clarity: 0 };

  // RMS gate — ignore near-silence / noise floor
  let energy = 0;
  for (let i = 0; i < bufferSize; i += 1) {
    energy += samples[i] * samples[i];
  }
  const rms = Math.sqrt(energy / bufferSize);
  if (rms < 0.008) return { frequency: -1, clarity: 0 };

  const tauMin = Math.max(2, Math.floor(sampleRate / maxFreq));
  const tauMax = Math.min(yinBufferLength - 1, Math.floor(sampleRate / minFreq));
  if (tauMax <= tauMin) return { frequency: -1, clarity: 0 };

  const yinBuffer = new Float32Array(yinBufferLength);

  // Step 2 — difference function d(τ)
  for (let t = 1; t < yinBufferLength; t += 1) {
    let sum = 0;
    for (let i = 0; i < yinBufferLength; i += 1) {
      const delta = samples[i] - samples[i + t];
      sum += delta * delta;
    }
    yinBuffer[t] = sum;
  }

  // Step 3 — cumulative mean normalized difference d'(τ)
  yinBuffer[0] = 1;
  yinBuffer[1] = 1;
  let runningSum = 0;
  for (let t = 1; t < yinBufferLength; t += 1) {
    runningSum += yinBuffer[t];
    yinBuffer[t] = runningSum > 0 ? (yinBuffer[t] * t) / runningSum : 1;
  }

  // Step 4 — absolute threshold + local minimum
  let tau = -1;
  let probability = 0;
  for (let t = Math.max(2, tauMin); t < yinBufferLength && t <= tauMax; t += 1) {
    if (yinBuffer[t] < threshold) {
      while (t + 1 < yinBufferLength && t + 1 <= tauMax && yinBuffer[t + 1] < yinBuffer[t]) {
        t += 1;
      }
      tau = t;
      probability = 1 - yinBuffer[t];
      break;
    }
  }

  if (tau < 0 || probability < probabilityThreshold) {
    return { frequency: -1, clarity: 0 };
  }

  // Octave-error correction: YIN sometimes locks onto 2τ (one octave low).
  // If τ/2 is also a strong valley, prefer the higher octave.
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

  // Step 5 — parabolic interpolation (aubio-corrected)
  let betterTau = tau;
  const x0 = tau < 1 ? tau : tau - 1;
  const x2 = tau + 1 < yinBufferLength ? tau + 1 : tau;

  if (x0 === tau) {
    betterTau = yinBuffer[tau] <= yinBuffer[x2] ? tau : x2;
  } else if (x2 === tau) {
    betterTau = yinBuffer[tau] <= yinBuffer[x0] ? tau : x0;
  } else {
    const s0 = yinBuffer[x0];
    const s1 = yinBuffer[tau];
    const s2 = yinBuffer[x2];
    const denom = 2 * (2 * s1 - s2 - s0);
    if (Math.abs(denom) > 1e-12) {
      // Correct formula from aubio/pitchfinder:
      // betterTau = tau + (s2 - s0) / (2 * (2*s1 - s2 - s0))
      betterTau = tau + (s2 - s0) / denom;
    }
  }

  if (!(betterTau > 0)) return { frequency: -1, clarity: 0 };

  const frequency = sampleRate / betterTau;
  if (frequency < minFreq || frequency > maxFreq) {
    return { frequency: -1, clarity: 0 };
  }

  return {
    frequency,
    clarity: Math.max(0, Math.min(1, probability)),
  };
}

/** EMA smoothing that snaps on large interval jumps instead of smearing them. */
export function smoothFrequency(
  previous: number | null,
  next: number,
  alpha = 0.22,
): number {
  if (previous == null || previous <= 0) return next;
  const ratio = next / previous;
  // ~1 semitone ≈ 1.059; hard-switch above ~1.5 semitones
  if (ratio > 1.09 || ratio < 1 / 1.09) return next;
  return previous * (1 - alpha) + next * alpha;
}

/**
 * Note hysteresis: keep the locked MIDI note until pitch drifts clearly
 * past the boundary (+/- 50¢), reducing flicker between neighbors.
 */
export function pitchWithHysteresis(
  frequency: number,
  a4: number,
  clarity: number,
  lockedMidi: number | null,
  switchCents = 58,
): { reading: PitchReading; lockedMidi: number } | null {
  if (!Number.isFinite(frequency) || frequency <= 0) return null;

  const midiFloat = 69 + 12 * Math.log2(frequency / a4);
  let midi = lockedMidi;

  if (midi == null) {
    midi = Math.round(midiFloat);
  } else {
    const centsFromLocked = (midiFloat - midi) * 100;
    if (Math.abs(centsFromLocked) >= switchCents) {
      midi = Math.round(midiFloat);
    }
  }

  const cents = (midiFloat - midi) * 100;
  const { note, octave } = noteParts(midi);

  return {
    lockedMidi: midi,
    reading: {
      frequency,
      midi,
      note,
      octave,
      cents,
      clarity,
    },
  };
}
