import { Link } from 'react-router-dom';

const MODES = [
  {
    title: 'Intervals',
    subtitle: 'Unison through octave, ascending or descending.',
    to: '/intervals',
    tag: 'Core',
  },
  {
    title: 'Chords',
    subtitle: 'Triads and sevenths in root position.',
    to: '/chords',
    tag: 'Core',
  },
  {
    title: 'Scales',
    subtitle: 'Modes, minors, pentatonics, and blues.',
    to: '/scales',
    tag: 'Core',
  },
  {
    title: 'Chords in key',
    subtitle: 'Identify diatonic chord functions in major or natural minor.',
    to: '/in-key/chords',
    tag: 'In key',
  },
  {
    title: 'Notes in key',
    subtitle: 'Identify diatonic scale degrees in major or natural minor.',
    to: '/in-key/notes',
    tag: 'In key',
  },
] as const;

export function HomePage() {
  return (
    <div className="home">
      <div className="home-atmosphere" aria-hidden="true">
        <div className="home-atmosphere__wash" />
        <div className="home-atmosphere__grid" />
        <div className="home-atmosphere__arcs" />
      </div>

      <div className="home-shell">
        <header className="home-hero">
          <p className="home-kicker">Runs in your browser · no accounts</p>
          <h1 className="home-brand">Ear Training</h1>
          <p className="home-lead">
            Listen, then identify what you hear. Every answer choice stays available. Audio stays on
            your device.
          </p>
          <div className="home-cta-row">
            <Link to="/intervals" className="home-cta">
              Start with intervals
            </Link>
            <Link to="/settings" className="home-cta-ghost">
              Settings
            </Link>
          </div>

          <div className="home-wave" aria-hidden="true">
            {Array.from({ length: 28 }, (_, i) => (
              <span
                key={i}
                className="home-wave__bar"
                style={{
                  ['--i' as string]: i,
                  ['--h' as string]: `${18 + ((i * 37) % 62)}%`,
                }}
              />
            ))}
          </div>
        </header>

        <section className="home-modes" aria-labelledby="home-modes-title">
          <div className="home-modes-head">
            <h2 id="home-modes-title" className="home-modes-title">
              Practice modes
            </h2>
            <p className="home-modes-note">
              Choose a mode. All answer choices remain available on every prompt.
            </p>
          </div>

          <div className="home-grid">
            {MODES.map((mode, index) => (
              <Link
                key={mode.to}
                to={mode.to}
                className={`home-tile home-tile--${index === 0 ? 'feature' : 'standard'}`}
                style={{ ['--delay' as string]: `${120 + index * 70}ms` }}
              >
                <span className="home-tile__tag">{mode.tag}</span>
                <span className="home-tile__title">{mode.title}</span>
                <span className="home-tile__sub">{mode.subtitle}</span>
                <span className="home-tile__go" aria-hidden="true">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
