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
        Intervals, chords, scales, and in-key hearing. No accounts. No tracking. Audio stays on
        your device.
      </Body>

      <p className="section">Vocabulary</p>
      <CardButton
        title="Intervals"
        subtitle="Unison through octave. Pure audio, then piano-roll confirm."
        to="/intervals"
      />
      <CardButton
        title="Chords"
        subtitle="Triads and sevenths. Block chord first, arpeggio after answer."
        to="/chords"
      />
      <CardButton
        title="Scales"
        subtitle="Modes, minors, pentatonics, blues. Ascend once from the root."
        to="/scales"
      />

      <p className="section">In a Key</p>
      <CardButton
        title="Chords in Key"
        subtitle="Chain through diatonic triad functions in major or natural minor."
        to="/in-key/chords"
      />
      <CardButton
        title="Notes in Key"
        subtitle="Chain through scale degrees inside one octave."
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
