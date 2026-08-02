# Ear Lab

A free, local-only ear training app for musicians.

No accounts. No ads. No analytics. Nothing leaves the device.

## Modes

**Vocabulary**
- Intervals (unison through octave)
- Chords (triads + sevenths)
- Scales (modes, minors, pentatonics, blues)

**In a Key**
- Chords: chain through diatonic triad functions (major / natural minor)
- Notes: chain through scale degrees inside one octave

**Tuner**
- Chromatic tuner (voice/instrument) — microphone processed on-device only

## Stack

- Expo (React Native) + TypeScript
- `react-native-audio-api` synth engine (sine / triangle / saw / square)
- Local settings via AsyncStorage

## Run

### Easiest (no Android Studio / no Mac): Web

```bash
npm install
npx expo start --web
```

Open the local URL in Chrome. Synth audio works in the browser via Web Audio.

### Native phone build (optional later)

Audio uses native modules, so **Expo Go will not work**.

- Android with local tooling: `npx expo run:android` (needs Android Studio)
- iOS: `npx expo run:ios` (needs a Mac + Xcode)
- Or use **EAS Build** in the cloud, then install the APK on an Android phone — no Android Studio required on your PC
