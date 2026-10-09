import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import MatchTags from '../components/MatchTags.jsx';

const MAX_BYTES = 2 * 1024 * 1024;
const MAX_ANSWER = 200;

export default function JobDetail() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loadError, setLoadError] = useState('');

  const [name, setName] = useState('');
  const [resume, setResume] = useState(null);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [answers, setAnswers] = useState(['', '', '']);
  const [fileError, setFileError] = useState({});
  const [state, setState] = useState('idle'); // idle | submitting | done
  const [error, setError] = useState('');

  useEffect(() => {
    api.getJob(id).then(setJob).catch((e) => setLoadError(e.message));
  }, [id]);

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const pickFile = (kind, file) => {
    let msg = '';
    if (file && kind === 'resume' && file.type !== 'application/pdf') msg = 'Resume must be a PDF.';
    if (file && kind === 'image' && !file.type.startsWith('image/')) msg = 'Please choose an image file.';
    if (file && !msg && file.size > MAX_BYTES) msg = 'File must be 2MB or smaller.';
    setFileError((f) => ({ ...f, [kind]: msg }));
    const ok = file && !msg ? file : null;
    if (kind === 'resume') setResume(ok);
    else {
      setImage(ok);
      setPreview(ok ? URL.createObjectURL(ok) : '');
    }
  };

  const canSubmit = name.trim() && resume && image && answers.every((a) => a.trim()) && state === 'idle';

  const submit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setError('');
    setState('submitting');
    const fd = new FormData();
    fd.append('name', name.trim());
    fd.append('resume', resume);
    fd.append('image', image);
    fd.append('answers', JSON.stringify(answers.map((a) => a.trim())));
    try {
      await api.apply(id, fd);
      setState('done');
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(err.message);
      setState('idle');
    }
  };

  if (loadError) {
    return (
      <div className="page">
        <p className="error">{loadError}</p>
        <Link to="/jobs">← All jobs</Link>
      </div>
    );
  }
  if (!job) return <div className="page"><p className="muted">Loading…</p></div>;

  if (state === 'done') {
    return (
      <div className="page">
        <div className="empty">
          <div className="empty-emoji" aria-hidden="true">📬</div>
          <h1>Application sent!</h1>
          <p className="muted">
            Thanks, {name.trim().split(' ')[0]}. The hiring team for <strong>{job.title}</strong> will see your card soon.
          </p>
          <Link className="btn btn-ghost" to="/jobs">Browse more roles</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <Link to="/jobs" className="back">← All jobs</Link>
      <h1>{job.title}</h1>
      <MatchTags tags={job.tags} />
      <div className="description">{job.description}</div>

      <form className="form apply-form" onSubmit={submit}>
        <h2>Apply</h2>
        <fieldset disabled={state === 'submitting'}>
          <label className="field">
            <span>Your name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
          </label>

          <label className="field">
            <span>Resume (PDF, max 2MB)</span>
            <input type="file" accept="application/pdf" onChange={(e) => pickFile('resume', e.target.files[0])} required />
            {fileError.resume && <small className="error">{fileError.resume}</small>}
          </label>

          <label className="field">
            <span>Project image (max 2MB)</span>
            <small className="muted">A screenshot of something you built that's relevant to this role.</small>
            <input type="file" accept="image/*" onChange={(e) => pickFile('image', e.target.files[0])} required />
            {fileError.image && <small className="error">{fileError.image}</small>}
          </label>
          {preview && <img className="preview" src={preview} alt="Project preview" />}

          {job.questions.map((q, i) => (
            <label key={q} className="field prompt-field">
              <span className="prompt-q">{q}</span>
              <textarea
                rows={3}
                maxLength={MAX_ANSWER}
                value={answers[i]}
                onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                required
              />
              <small className={`counter ${answers[i].length >= MAX_ANSWER ? 'at-limit' : ''}`}>
                {answers[i].length}/{MAX_ANSWER}
              </small>
            </label>
          ))}
        </fieldset>

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={!canSubmit}>
          {state === 'submitting' ? (
            <><span className="spinner spinner-light" aria-hidden="true" /> Submitting and scoring…</>
          ) : (
            'Submit application'
          )}
        </button>
      </form>
    </div>
  );
}
