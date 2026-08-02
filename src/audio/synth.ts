import { midiToFreq } from '../theory/pitch';
import type { RollEvent, Timbre } from '../theory/types';

type VoicePlan = {
  midi: number;
  time: number;
  duration: number;
};

type ActiveVoice = {
  osc: OscillatorNode;
  gain: GainNode;
};

function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

class SynthEngine {
  private ctx: AudioContext | null = null;
  private timbre: Timbre = 'sine';
  private master = 0.2;
  private active: ActiveVoice[] = [];
  private playGen = 0;

  async ensure(): Promise<AudioContext> {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    return this.ctx;
  }

  /** Call from a user gesture before auto-playing drills. */
  async unlock() {
    await this.ensure();
  }

  setTimbre(timbre: Timbre) {
    this.timbre = timbre;
  }

  getTimbre() {
    return this.timbre;
  }

  stopAll() {
    this.playGen += 1;
    const ctx = this.ctx;
    const now = ctx?.currentTime ?? 0;
    for (const voice of this.active) {
      try {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(Math.max(voice.gain.gain.value, 0.0001), now);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
        voice.osc.stop(now + 0.04);
      } catch {
        // already stopped
      }
    }
    this.active = [];
  }

  private scheduleTone(
    ctx: AudioContext,
    midi: number,
    start: number,
    duration: number,
    peak: number,
  ) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = this.timbre;
    osc.frequency.value = midiToFreq(midi);

    const attack = 0.012;
    const release = Math.min(0.08, duration * 0.3);
    const end = start + duration;

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + attack);
    gain.gain.setValueAtTime(peak, Math.max(start + attack, end - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, end);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.03);

    this.active.push({ osc, gain });
  }

  private async playVoices(voices: VoicePlan[]) {
    if (voices.length === 0) return;

    this.stopAll();
    const gen = this.playGen;
    const ctx = await this.ensure();
    if (gen !== this.playGen) return;

    const now = ctx.currentTime + 0.04;
    const isBlock = voices.every((v) => v.time === voices[0].time);
    const peak = isBlock
      ? this.master / Math.sqrt(Math.max(1, voices.length))
      : this.master;

    let lastEnd = 0;
    for (const voice of voices) {
      this.scheduleTone(ctx, voice.midi, now + voice.time, voice.duration, peak);
      lastEnd = Math.max(lastEnd, voice.time + voice.duration);
    }

    await sleep(lastEnd * 1000 + 60);
  }

  async playNotes(midis: number[], noteDuration = 0.55, gap = 0.08) {
    const voices: VoicePlan[] = midis.map((midi, index) => ({
      midi,
      time: index * (noteDuration + gap),
      duration: noteDuration,
    }));
    await this.playVoices(voices);
  }

  async playChord(midis: number[], duration = 1.1) {
    const voices: VoicePlan[] = midis.map((midi) => ({
      midi,
      time: 0,
      duration,
    }));
    await this.playVoices(voices);
  }

  async playArpeggio(midis: number[], noteDuration = 0.35, gap = 0.05) {
    await this.playNotes(midis, noteDuration, gap);
  }

  async playMelody(midis: number[], noteDuration = 0.32, gap = 0.04) {
    await this.playNotes(midis, noteDuration, gap);
  }
}

export const synth = new SynthEngine();

export function melodyToRoll(midis: number[], noteDuration = 0.32, gap = 0.04): RollEvent[] {
  return midis.map((midi, index) => ({
    midi,
    start: index * (noteDuration + gap),
    duration: noteDuration,
  }));
}

export function chordToRoll(midis: number[], duration = 1.1): RollEvent[] {
  return midis.map((midi) => ({
    midi,
    start: 0,
    duration,
  }));
}
