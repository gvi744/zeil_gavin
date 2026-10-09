import MatchTags from './MatchTags.jsx';

// Blind card: identified only by an anonymous code, never by name.
export default function ApplicantCard({ applicant, jobTags, leaving }) {
  const { code, imageUrl, answers, matchedTags, reason, score } = applicant;
  const label = `Candidate ${code}`;
  return (
    <article className={`applicant-card ${leaving ? `leaving-${leaving}` : ''}`} aria-label={label}>
      <header className="card-head">
        <h2>{label}</h2>
        <span className="score" title="AI match score">{score}% match</span>
      </header>

      <img className="card-image" src={imageUrl} alt={`Project by ${label}`} />

      {answers.map((a) => (
        <section key={a.question} className="prompt">
          <p className="prompt-q">{a.question}</p>
          <p className="prompt-a">{a.answer}</p>
        </section>
      ))}

      <section className="why">
        <p className="why-label">Why you're seeing this</p>
        <p className="why-reason">{reason}</p>
        <MatchTags tags={matchedTags} allTags={jobTags} />
      </section>
    </article>
  );
}
