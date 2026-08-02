import { synth } from '../audio/synth';
import { Body, ChoiceButton, PageHeader, Panel, Screen } from '../components/ui';
import { useSettings } from '../storage/settings';
import { TIMBRES } from '../theory/catalog';
import type { Timbre } from '../theory/types';

export function SettingsPage() {
  const { timbre, setTimbre } = useSettings();

  const preview = async (next: Timbre) => {
    setTimbre(next);
    await synth.playNotes([60, 64, 67], 0.28, 0.05);
  };

  return (
    <Screen>
      <PageHeader title="Settings" />
      <Body>Preferences stay in this browser. Nothing is uploaded or synced.</Body>

      <Panel>
        <p className="label">Timbre</p>
        <p className="help">Applied to every drill.</p>
        <div className="grid">
          {TIMBRES.map((item) => (
            <ChoiceButton
              key={item.id}
              label={item.label}
              state={timbre === item.id ? 'correct' : 'idle'}
              onClick={() => {
                void preview(item.id);
              }}
            />
          ))}
        </div>
      </Panel>

      <Panel>
        <p className="label">Privacy</p>
        <p className="help">
          No accounts, ads, analytics, or network calls for training data. Your answers and settings
          remain in this browser.
        </p>
      </Panel>
    </Screen>
  );
}
