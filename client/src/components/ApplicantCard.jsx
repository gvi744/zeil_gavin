import MatchTags from './MatchTags.jsx';

export default function ApplicantCard({ applicant, jobTags, leaving }) {
  const { name, imageUrl, answers, matchedTags, reason, score } = applicant;
  return (
    <article className={`applicant-card ${leaving ? `leaving-${leaving}` : ''}`} aria-label={`Applicant ${name}`}>
      <header className="card-head">
        <h2>{name}</h2>
        <span className="score" title="AI match score">{score}% match</span>
      </header>

      <img className="card-image" src={imageUrl} alt={`Project by ${name}`} />

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
