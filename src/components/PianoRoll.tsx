import { midiToName } from '../theory/pitch';
import type { RollEvent } from '../theory/types';

type Props = {
  events: RollEvent[];
  label?: string;
};

export function PianoRoll({ events, label }: Props) {
  if (events.length === 0) {
    return <div className="roll-empty">Answer to reveal notation</div>;
  }

  const midis = events.map((e) => e.midi);
  const minMidi = Math.min(...midis) - 1;
  const maxMidi = Math.max(...midis) + 1;
  const pitchCount = Math.max(1, maxMidi - minMidi + 1);
  const totalTime = Math.max(...events.map((e) => e.start + e.duration), 0.8);

  return (
    <div className="roll">
      {label ? <p className="roll-label">{label}</p> : null}
      <div className="roll-grid">
        {Array.from({ length: pitchCount }, (_, i) => {
          const midi = maxMidi - i;
          return (
            <div
              key={midi}
              className="roll-lane"
              style={{ height: `${100 / pitchCount}%` }}
            />
          );
        })}
        {events.map((event, index) => {
          const top = ((maxMidi - event.midi) / pitchCount) * 100;
          const height = (1 / pitchCount) * 100;
          const left = (event.start / totalTime) * 100;
          const width = Math.max(4, (event.duration / totalTime) * 100);
          return (
            <div
              key={`${event.midi}-${index}`}
              className="roll-note"
              style={{
                top: `${top}%`,
                height: `${height}%`,
                left: `${left}%`,
                width: `${width}%`,
              }}
            />
          );
        })}
      </div>
      <div className="roll-legend">
        {[...new Set(midis)]
          .sort((a, b) => a - b)
          .map((midi) => (
            <span key={midi} className="roll-legend-item">
              {midiToName(midi)}
            </span>
          ))}
      </div>
    </div>
  );
}
