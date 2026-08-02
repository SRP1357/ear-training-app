# Ear Lab

A free, local-only ear training site for musicians.

No accounts. No ads. No analytics. Audio stays in your browser.

**Live:** https://SRP1357.github.io/ear-training-app/

## Modes

**Vocabulary**
- Intervals (unison through octave)
- Chords (triads + sevenths)
- Scales (modes, minors, pentatonics, blues)

**In a Key**
- Chords: chain through diatonic triad functions (major / natural minor)
- Notes: chain through scale degrees inside one octave

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
