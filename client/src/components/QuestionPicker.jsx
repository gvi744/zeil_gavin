// Selectable cards for the critic's reviewed questions. Pick exactly `max`.
export default function QuestionPicker({ reviews, selected, onChange, max = 3 }) {
  const toggle = (text) => {
    if (selected.includes(text)) onChange(selected.filter((q) => q !== text));
    else if (selected.length < max) onChange([...selected, text]);
  };

  return (
    <div className="question-picker">
      <p className="picker-count">
        <strong>{selected.length}</strong> of {max} picked
        {selected.length === max && <span className="muted"> · unpick one to swap</span>}
      </p>
      <ul>
        {reviews.map((r) => {
          const isOn = selected.includes(r.text);
          const disabled = !isOn && selected.length >= max;
          return (
            <li key={r.text}>
              <button
                type="button"
                className={`q-card ${isOn ? 'on' : ''} ${r.flagged ? 'flagged' : ''}`}
                aria-pressed={isOn}
                disabled={disabled}
                onClick={() => toggle(r.text)}
              >
                <span className="q-check" aria-hidden="true">{isOn ? '✓' : ''}</span>
                <span className="q-body">
                  <span className="q-text">{r.text}</span>
                  {r.flagged ? (
                    <span className="q-flag">
                      <span className="badge-warn">⚠ Flagged</span> {r.reason}
                    </span>
                  ) : (
                    <span className="q-reason">{r.reason}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
