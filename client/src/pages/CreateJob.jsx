import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import TagInput from '../components/TagInput.jsx';
import QuestionPicker from '../components/QuestionPicker.jsx';

export default function CreateJob() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState([]);
  const [reviews, setReviews] = useState(null);
  const [usedFallback, setUsedFallback] = useState(false);
  const [selected, setSelected] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');

  const hasBasics = title.trim() && description.trim();

  const generate = async () => {
    setError('');
    setGenerating(true);
    try {
      const res = await api.generateQuestions({ title, description, tags });
      setReviews(res.reviews);
      setUsedFallback(res.usedFallback);
      setSelected([]);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const publish = async (e) => {
    e.preventDefault();
    setError('');
    setPublishing(true);
    try {
      const job = await api.createJob({ title, description, tags, questions: selected });
      navigate(`/manager/feed/${job._id}`);
    } catch (err) {
      setError(err.message);
      setPublishing(false);
    }
  };

  return (
    <div className="page">
      <h1>Create a job</h1>
      <p className="muted">
        AI drafts five fun questions, a second AI reviews them for fairness, and you pick three.
      </p>

      <form className="form" onSubmit={publish}>
        <label className="field">
          <span>Job title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Junior Frontend Developer" required />
        </label>

        <label className="field">
          <span>Description</span>
          <textarea
            rows={7}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What the role involves and what you're looking for"
            required
          />
        </label>

        <div className="field">
          <label htmlFor="tags">Skill tags</label>
          <TagInput id="tags" tags={tags} onChange={setTags} />
          <small className="muted">Used to match and rank applicants.</small>
        </div>

        <div className="generate-row">
          <button type="button" className="btn btn-ghost" onClick={generate} disabled={!hasBasics || generating}>
            {generating ? 'Writing and reviewing…' : reviews ? 'Regenerate questions' : 'Generate questions'}
          </button>
          {!hasBasics && <small className="muted">Add a title and description first.</small>}
        </div>

        {generating && (
          <div className="generating" role="status">
            <span className="spinner" aria-hidden="true" />
            Writer is drafting questions, then the critic checks each one…
          </div>
        )}

        {reviews && !generating && (
          <>
            {usedFallback && (
              <p className="notice">The AI was unavailable, so these are default questions.</p>
            )}
            <QuestionPicker reviews={reviews} selected={selected} onChange={setSelected} />
          </>
        )}

        {error && <p className="error" role="alert">{error}</p>}

        <button type="submit" className="btn btn-primary btn-block" disabled={!hasBasics || selected.length !== 3 || publishing}>
          {publishing ? 'Publishing…' : 'Publish job'}
        </button>
      </form>
    </div>
  );
}
