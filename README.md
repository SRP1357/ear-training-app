# Ear Training

Free ear training for musicians: practice **intervals**, **chords**, **scales**, and **in-key** hearing in your browser.

No accounts. No ads. No analytics. Audio stays on your device.

### Try it

**https://srp1357.github.io/ear-training-app/**

## Modes

Every prompt shows the **full** answer vocabulary for that mode — nothing is filtered out.

**Vocabulary**
- Intervals (unison through octave; ascending or descending)
- Chords (root-position triads + sevenths)
- Scales (modes, minors, pentatonics, blues — each played up then down)

**In a Key**
- Chords: diatonic triad functions in major or natural minor
- Notes: diatonic scale degrees in major or natural minor

## Stack

- Vite + React + TypeScript
- Web Audio API synth (sine / triangle / saw / square)
- Settings in `localStorage`

## Develop

```bash
npm install
npm run dev
npm run check:theory   # offline catalog / diatonic integrity checks
npm run build && npm run preview
```

## Deploy

Pushes to `main` build and publish to GitHub Pages via `.github/workflows/deploy.yml`.

One-time setup in the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
