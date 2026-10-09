import { useState } from 'react';

export default function TagInput({ tags, onChange, id, placeholder = 'Type a skill and press Enter' }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim().toLowerCase().replace(/,$/, '');
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft('');
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      add();
    } else if (e.key === 'Backspace' && !draft && tags.length) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="tag-input">
      {tags.map((t) => (
        <span key={t} className="tag tag-hit">
          {t}
          <button type="button" className="tag-x" aria-label={`Remove ${t}`} onClick={() => onChange(tags.filter((x) => x !== t))}>
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={add}
        placeholder={tags.length ? '' : placeholder}
      />
    </div>
  );
}
