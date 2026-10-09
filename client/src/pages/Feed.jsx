import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import ApplicantCard from '../components/ApplicantCard.jsx';

const SLIDE_MS = 320;

export default function Feed() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [queue, setQueue] = useState(null);
  const [total, setTotal] = useState(0);
  const [leaving, setLeaving] = useState(null); // 'left' | 'right' | null
  const [error, setError] = useState('');
  const busy = useRef(false);

  // Load jobs; /manager/feed defaults to the newest one.
  useEffect(() => {
    api.listJobs().then(setJobs).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!jobId && jobs && jobs.length) navigate(`/manager/feed/${jobs[0]._id}`, { replace: true });
  }, [jobId, jobs, navigate]);

  // Load this job's feed (pre-scored, no AI calls here).
  useEffect(() => {
    if (!jobId) return;
    setQueue(null);
    setError('');
    api
      .getFeed(jobId)
      .then((list) => {
        setQueue(list);
        setTotal(list.length);
      })
      .catch((e) => setError(e.message));
  }, [jobId]);

  const current = queue && queue[0];
  const job = jobs && jobs.find((j) => j._id === jobId);

  const decide = useCallback(
    (status) => {
      if (!current || busy.current) return;
      busy.current = true;
      setLeaving(status === 'shortlisted' ? 'right' : 'left');
      api.setStatus(current._id, status).catch((e) => setError(`Couldn't save: ${e.message}`));
      setTimeout(() => {
        setQueue((q) => q.slice(1));
        setLeaving(null);
        busy.current = false;
        window.scrollTo({ top: 0 });
      }, SLIDE_MS);
    },
    [current]
  );

  // Left arrow skips, right arrow shortlists.
  useEffect(() => {
    const onKey = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') decide('skipped');
      if (e.key === 'ArrowRight') decide('shortlisted');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [decide]);

  if (jobs && !jobs.length) {
    return (
      <div className="page feed-page">
        <div className="empty">
          <h1>No jobs yet</h1>
          <p className="muted">Create a job to start receiving applicants.</p>
          <Link className="btn btn-primary" to="/manager/new">Create job</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page feed-page">
      <div className="feed-top">
        <label className="sr-only" htmlFor="job-select">Job</label>
        <select
          id="job-select"
          value={jobId || ''}
          onChange={(e) => navigate(`/manager/feed/${e.target.value}`)}
          disabled={!jobs}
        >
          {!jobs && <option>Loading jobs…</option>}
          {jobs && jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
        </select>
        {queue && queue.length > 0 && (
          <span className="muted small">{total - queue.length + 1} of {total}</span>
        )}
      </div>

      {error && <p className="error" role="alert">{error}</p>}

      {!queue && !error && <div className="card-skeleton" aria-label="Loading applicants" />}

      {queue && !current && (
        <div className="empty">
          <div className="empty-emoji" aria-hidden="true">🎉</div>
          <h1>You're all caught up</h1>
          <p className="muted">New applicants for {job ? job.title : 'this job'} will show up here.</p>
        </div>
      )}

      {current && (
        <>
          <ApplicantCard key={current._id} applicant={current} jobTags={job && job.tags} leaving={leaving} />
          <div className="actions" role="group" aria-label="Decide">
            <button type="button" className="btn btn-skip" onClick={() => decide('skipped')} disabled={!!leaving}>
              <span aria-hidden="true">✕</span> Skip
            </button>
            <a className="btn btn-ghost" href={current.resumeUrl} target="_blank" rel="noopener noreferrer">
              See resume
            </a>
            <button type="button" className="btn btn-primary" onClick={() => decide('shortlisted')} disabled={!!leaving}>
              <span aria-hidden="true">♥</span> Shortlist
            </button>
          </div>
          <p className="hint muted small">Tip: ← skip · → shortlist</p>
        </>
      )}
    </div>
  );
}
