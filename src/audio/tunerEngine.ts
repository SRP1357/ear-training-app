import { Platform } from 'react-native';
import { AudioManager, AudioRecorder } from 'react-native-audio-api';
import {
  detectPitchYin,
  pitchWithHysteresis,
  smoothFrequency,
  type PitchReading,
} from './pitch';

export type TunerFrame = {
  listening: boolean;
  pitch: PitchReading | null;
  rawHz: number | null;
  error: string | null;
};

type Listener = (frame: TunerFrame) => void;

const TARGET_SAMPLE_RATE = 44100;
const BUFFER_SECONDS = 0.08;
const WINDOW_SIZE = 4096;
const CLARITY_GATE = 0.7;

class TunerEngine {
  private listeners = new Set<Listener>();
  private listening = false;
  private starting = false;
  private a4 = 440;
  private sampleRate = TARGET_SAMPLE_RATE;
  private smoothedHz: number | null = null;
  private lockedMidi: number | null = null;
  private missCount = 0;
  private ring = new Float32Array(WINDOW_SIZE);
  private ringWrite = 0;
  private ringFilled = 0;
  private recorder: AudioRecorder | null = null;
  private webCtx: AudioContext | null = null;
  private webStream: MediaStream | null = null;
  private webProcessor: ScriptProcessorNode | null = null;
  private webSource: MediaStreamAudioSourceNode | null = null;
  private webMute: GainNode | null = null;
  private lastEmit = 0;

  setA4(a4: number) {
    this.a4 = a4;
    this.smoothedHz = null;
    this.lockedMidi = null;
    this.missCount = 0;
    if (this.listening) {
      this.emit(null);
    }
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    listener(this.snapshot(null, null));
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(rawHz: number | null, error: string | null = null, clarity = 1) {
    const now = Date.now();
    if (now - this.lastEmit < 32 && !error) return;
    this.lastEmit = now;

    let pitch: PitchReading | null = null;

    if (rawHz != null && rawHz > 0) {
      this.missCount = 0;
      this.smoothedHz = smoothFrequency(this.smoothedHz, rawHz);
      const held = pitchWithHysteresis(
        this.smoothedHz,
        this.a4,
        clarity,
        this.lockedMidi,
      );
      if (held) {
        this.lockedMidi = held.lockedMidi;
        pitch = held.reading;
      }
    } else if (this.listening) {
      this.missCount += 1;
      if (this.missCount < 4 && this.smoothedHz != null && this.lockedMidi != null) {
        const held = pitchWithHysteresis(
          this.smoothedHz,
          this.a4,
          0,
          this.lockedMidi,
        );
        pitch = held?.reading ?? null;
      } else if (this.missCount >= 4) {
        this.smoothedHz = null;
        this.lockedMidi = null;
      }
    } else {
      this.smoothedHz = null;
      this.lockedMidi = null;
    }

    const frame = this.snapshot(pitch, error, rawHz);
    for (const listener of this.listeners) listener(frame);
  }

  private snapshot(
    pitch: PitchReading | null,
    error: string | null,
    rawHz: number | null = null,
  ): TunerFrame {
    return {
      listening: this.listening,
      pitch,
      rawHz,
      error,
    };
  }

  private pushSamples(input: ArrayLike<number>, sampleRate: number) {
    if (sampleRate > 0) this.sampleRate = sampleRate;

    for (let i = 0; i < input.length; i += 1) {
      this.ring[this.ringWrite] = input[i];
      this.ringWrite = (this.ringWrite + 1) % WINDOW_SIZE;
      this.ringFilled = Math.min(this.ringFilled + 1, WINDOW_SIZE);
    }

    if (this.ringFilled < WINDOW_SIZE) return;

    const window = new Float32Array(WINDOW_SIZE);
    const start = this.ringWrite;
    for (let i = 0; i < WINDOW_SIZE; i += 1) {
      window[i] = this.ring[(start + i) % WINDOW_SIZE];
    }

    const { frequency, clarity } = detectPitchYin(window, this.sampleRate, {
      threshold: 0.1,
      probabilityThreshold: 0.1,
      minFreq: 55,
      maxFreq: 1800,
    });

    if (frequency > 0 && clarity >= CLARITY_GATE) {
      this.emit(frequency, null, clarity);
    } else {
      this.emit(null);
    }
  }

  async start() {
    if (this.listening || this.starting) return;
    this.starting = true;
    this.ringWrite = 0;
    this.ringFilled = 0;
    this.smoothedHz = null;
    this.lockedMidi = null;
    this.missCount = 0;
    this.sampleRate = TARGET_SAMPLE_RATE;

    try {
      if (Platform.OS === 'web') {
        await this.startWeb();
      } else {
        await this.startNative();
      }
    } catch (error) {
      await this.teardown();
      this.emit(null, error instanceof Error ? error.message : 'Tuner failed to start.');
    } finally {
      this.starting = false;
    }
  }

  private async startNative() {
    const permission = await AudioManager.requestRecordingPermissions();
    if (permission !== 'Granted') {
      this.emit(null, 'Microphone permission is required for the tuner.');
      return;
    }

    AudioManager.setAudioSessionOptions({
      iosCategory: 'playAndRecord',
      iosMode: 'measurement',
      iosOptions: ['defaultToSpeaker', 'allowBluetoothHFP'],
    });
    await AudioManager.setAudioSessionActivity(true);

    this.recorder = new AudioRecorder();
    this.recorder.onAudioReady(
      {
        sampleRate: TARGET_SAMPLE_RATE,
        bufferLength: Math.floor(TARGET_SAMPLE_RATE * BUFFER_SECONDS),
        channelCount: 1,
      },
      ({ buffer }) => {
        const channel = buffer.getChannelData(0);
        const rate = buffer.sampleRate || TARGET_SAMPLE_RATE;
        this.pushSamples(channel, rate);
      },
    );

    const result = await this.recorder.start();
    if (result.status === 'error') {
      await this.teardown();
      this.emit(null, result.message || 'Could not start microphone.');
      return;
    }

    this.listening = true;
    this.emit(null);
  }

  private async startWeb() {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      this.emit(null, 'Microphone is not available in this browser.');
      return;
    }

    try {
      this.webStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.webCtx = new AudioCtx({ sampleRate: TARGET_SAMPLE_RATE });
      this.sampleRate = this.webCtx.sampleRate;
      this.webSource = this.webCtx.createMediaStreamSource(this.webStream);
      this.webProcessor = this.webCtx.createScriptProcessor(2048, 1, 1);
      this.webMute = this.webCtx.createGain();
      this.webMute.gain.value = 0;

      this.webProcessor.onaudioprocess = (event) => {
        const input = event.inputBuffer.getChannelData(0);
        this.pushSamples(input, event.inputBuffer.sampleRate || this.sampleRate);
      };

      this.webSource.connect(this.webProcessor);
      this.webProcessor.connect(this.webMute);
      this.webMute.connect(this.webCtx.destination);

      if (this.webCtx.state === 'suspended') {
        await this.webCtx.resume();
      }

      this.listening = true;
      this.emit(null);
    } catch (error) {
      await this.teardown();
      this.emit(null, error instanceof Error ? error.message : 'Microphone access denied.');
    }
  }

  private async teardown() {
    this.listening = false;

    if (this.recorder) {
      try {
        await this.recorder.stop();
      } catch {
        // ignore
      }
      try {
        this.recorder.clearOnAudioReady();
      } catch {
        // ignore
      }
      this.recorder = null;
      try {
        await AudioManager.setAudioSessionActivity(false);
      } catch {
        // ignore
      }
    }

    if (this.webProcessor) {
      this.webProcessor.disconnect();
      this.webProcessor.onaudioprocess = null;
      this.webProcessor = null;
    }
    if (this.webSource) {
      this.webSource.disconnect();
      this.webSource = null;
    }
    if (this.webMute) {
      this.webMute.disconnect();
      this.webMute = null;
    }
    if (this.webStream) {
      for (const track of this.webStream.getTracks()) track.stop();
      this.webStream = null;
    }
    if (this.webCtx) {
      await this.webCtx.close().catch(() => undefined);
      this.webCtx = null;
    }
  }

  async stop() {
    this.smoothedHz = null;
    this.lockedMidi = null;
    this.missCount = 0;
    await this.teardown();
    this.emit(null);
  }
}

export const tunerEngine = new TunerEngine();
