import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import JobSelect from '../components/JobSelect.jsx';
import MatchTags from '../components/MatchTags.jsx';
import { useJobSelection } from '../hooks/useJobSelection.js';

export default function Shortlist() {
  const { jobs, jobId, job, selectJob, error: jobsError } = useJobSelection('/manager/shortlist');
  const [list, setList] = useState(null);
  const [open, setOpen] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!jobId) return;
    setList(null);
    setOpen(null);
    setError('');
    api.getShortlist(jobId).then(setList).catch((e) => setError(e.message));
  }, [jobId]);

  const shownError = error || jobsError;

  if (jobs && !jobs.length) {
    return (
      <div className="page empty">
        <h1>No jobs yet</h1>
        <Link className="btn btn-primary" to="/manager/new">Create job</Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="feed-top">
        <JobSelect jobs={jobs} jobId={jobId} onChange={selectJob} />
      </div>
      <h1>Shortlist</h1>
      <p className="muted small">Names are hidden until shortlisting to reduce bias.</p>

      {shownError && <p className="error" role="alert">{shownError}</p>}
      {!list && !shownError && <p className="muted">Loading…</p>}

      {list && !list.length && (
        <div className="empty">
          <h2>No one shortlisted yet.</h2>
          <Link className="btn btn-ghost" to={`/manager/feed/${jobId}`}>Go to FYP</Link>
        </div>
      )}

      {list && list.length > 0 && (
        <ol className="shortlist">
          {list.map((a, i) => {
            const isOpen = open === a._id;
            return (
              <li key={a._id} className={`sl-row ${isOpen ? 'open' : ''}`}>
                <div className="sl-head">
                  <button
                    type="button"
                    className="sl-toggle"
                    aria-expanded={isOpen}
                    aria-controls={`sl-${a._id}`}
                    onClick={() => setOpen(isOpen ? null : a._id)}
                  >
                    <span className="sl-num" aria-hidden="true">{i + 1}</span>
                    <span className="sl-main">
                      <span className="sl-name">
                        {a.name} <span className="sl-code">Candidate {a.code}</span>
                      </span>
                      <span className="sl-reason">{a.reason}</span>
                    </span>
                    <span className="score">{a.score}%</span>
                    <span className="sl-chevron" aria-hidden="true">{isOpen ? '▴' : '▾'}</span>
                  </button>
                </div>
                <div className="sl-meta">
                  <MatchTags tags={a.matchedTags} allTags={job && job.tags} />
                  <a className="sl-resume" href={a.resumeUrl} target="_blank" rel="noopener noreferrer">
                    View resume ↗
                  </a>
                </div>
                {isOpen && (
                  <div className="sl-detail" id={`sl-${a._id}`}>
                    <img className="card-image" src={a.imageUrl} alt={`Project by ${a.name}`} />
                    {a.answers.map((qa) => (
                      <section key={qa.question} className="prompt">
                        <p className="prompt-q">{qa.question}</p>
                        <p className="prompt-a">{qa.answer}</p>
                      </section>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
