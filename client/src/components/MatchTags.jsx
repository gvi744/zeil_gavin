// Tag chips. With `allTags`, unmatched job tags are shown faded.
export default function MatchTags({ tags = [], allTags }) {
  const list = allTags || tags;
  if (!list.length) return <p className="muted small">No matching tags</p>;
  const matched = new Set(tags);
  return (
    <ul className="tags" aria-label="Tags">
      {list.map((t) => {
        const hit = !allTags || matched.has(t);
        return (
          <li key={t} className={`tag ${hit ? 'tag-hit' : 'tag-miss'}`}>
            {allTags && <span aria-hidden="true">{hit ? '✓ ' : ''}</span>}
            {t}
            {allTags && !hit && <span className="sr-only"> (not matched)</span>}
          </li>
        );
      })}
    </ul>
  );
}
