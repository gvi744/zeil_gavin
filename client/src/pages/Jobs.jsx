import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import MatchTags from '../components/MatchTags.jsx';

const snippet = (text, n = 170) => (text.length > n ? `${text.slice(0, n).trimEnd()}…` : text);

export default function Jobs() {
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listJobs().then(setJobs).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="page page-wide">
      <header className="page-head hero">
        <h1>
          Show your work, <span className="accent">not your template</span>
        </h1>
        <p>No cover letters. Share one project and answer three quick questions.</p>
      </header>

      {error && <p className="error" role="alert">{error}</p>}
      {!jobs && !error && <p className="muted">Loading…</p>}
      {jobs && !jobs.length && <p className="muted">No open roles right now. Check back soon.</p>}

      <ul className="job-list">
        {jobs &&
          jobs.map((j) => (
            <li key={j._id}>
              <Link to={`/jobs/${j._id}`} className="job-card">
                <span className="job-badge">⚡ 3 questions · 1 project</span>
                <h2>{j.title}</h2>
                <p className="muted">{snippet(j.description)}</p>
                <MatchTags tags={j.tags} />
                <span className="job-cta">View and apply →</span>
              </Link>
            </li>
          ))}
      </ul>
    </div>
  );
}
