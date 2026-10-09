// Utility-bar switch between the two sides of the product.
export default function ModeToggle({ mode, onChange }) {
  return (
    <div className="mode-toggle" role="group" aria-label="View mode">
      {['Applicant', 'Manager'].map((m) => (
        <button
          key={m}
          type="button"
          className={mode === m ? 'active' : ''}
          aria-pressed={mode === m}
          onClick={() => onChange(m)}
        >
          {m}
        </button>
      ))}
    </div>
  );
}
