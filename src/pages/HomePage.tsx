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
        Full vocabularies on every prompt — every option in that mode is always available. No
        accounts. No tracking. Audio stays on your device.
      </Body>

      <p className="section">Vocabulary</p>
      <CardButton
        title="Intervals"
        subtitle="Unison through octave, ascending or descending. Tritone listed by all common names."
        to="/intervals"
      />
      <CardButton
        title="Chords"
        subtitle="Triads and sevenths in root position. Block chord first, arpeggio after answer."
        to="/chords"
      />
      <CardButton
        title="Scales"
        subtitle="Modes, minors, pentatonics, blues — each played ascending then descending."
        to="/scales"
      />

      <p className="section">In a Key</p>
      <CardButton
        title="Chords in Key"
        subtitle="Hear home/current chord, then name the mystery chord’s function in major or natural minor."
        to="/in-key/chords"
      />
      <CardButton
        title="Notes in Key"
        subtitle="Hear tonic/current note, then name the mystery diatonic degree."
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
