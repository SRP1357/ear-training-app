type Props = {
  /** e.g. "Home chord" or "Current chord" / "Home note" or "Current note" */
  knownRole: string;
  /** Revealed label for the known sound, e.g. "I" or "♭3" */
  knownLabel: string;
  /** e.g. "Mystery chord" */
  mysteryRole: string;
  /** Shown after answer; "?" while prompting */
  mysteryLabel: string;
  revealed: boolean;
  onPlayKnown: () => void;
  onPlayMystery: () => void;
  disabled?: boolean;
};

export function ChainCompare({
  knownRole,
  knownLabel,
  mysteryRole,
  mysteryLabel,
  revealed,
  onPlayKnown,
  onPlayMystery,
  disabled,
}: Props) {
  return (
    <div className="chain">
      <button
        type="button"
        className="chain-card chain-card--known"
        onClick={onPlayKnown}
        disabled={disabled}
      >
        <span className="chain-role">{knownRole}</span>
        <span className="chain-value">{knownLabel}</span>
        <span className="chain-hint">Play</span>
      </button>

      <div className="chain-arrow" aria-hidden>
        →
      </div>

      <button
        type="button"
        className={`chain-card chain-card--mystery${revealed ? ' chain-card--revealed' : ''}`}
        onClick={onPlayMystery}
        disabled={disabled}
      >
        <span className="chain-role">{mysteryRole}</span>
        <span className="chain-value">{revealed ? mysteryLabel : '?'}</span>
        <span className="chain-hint">Play</span>
      </button>
    </div>
  );
}
