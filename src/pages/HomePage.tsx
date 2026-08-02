import { Body, CardButton, Eyebrow, Screen, Title } from '../components/ui';

export function HomePage() {
  return (
    <Screen home>
      <Eyebrow>Ear Lab // Local Unit</Eyebrow>
      <Title>
        Train the ear.
        <br />
        Stay in the browser.
      </Title>
      <Body>
        Full vocabularies on every prompt — every interval, chord, scale, or degree is always
        available. No accounts. No tracking. Audio stays on your device.
      </Body>

      <p className="section">Vocabulary</p>
      <CardButton
        title="Intervals"
        subtitle="Unison through double octave, ascending or descending. All qualities every time."
        to="/intervals"
      />
      <CardButton
        title="Chords"
        subtitle="Triads, sus, sixths, sevenths, and ninths. Full quality list on every prompt."
        to="/chords"
      />
      <CardButton
        title="Scales"
        subtitle="Modes, minors, pentatonics, blues, symmetrical, chromatic. Every scale listed."
        to="/scales"
      />

      <p className="section">In a Key</p>
      <CardButton
        title="Chords in Key"
        subtitle="Diatonic triad functions in major, natural minor, or harmonic minor."
        to="/in-key/chords"
      />
      <CardButton
        title="Notes in Key"
        subtitle="All 12 chromatic degrees relative to the tonic — every degree always choosable."
        to="/in-key/notes"
      />

      <div className="footer-rule" />
      <CardButton
        title="Settings"
        subtitle="Synth timbre. Preferences stay in this browser."
        to="/settings"
      />
    </Screen>
  );
}
