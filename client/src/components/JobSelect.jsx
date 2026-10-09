export default function JobSelect({ jobs, jobId, onChange }) {
  return (
    <>
      <label className="sr-only" htmlFor="job-select">Job</label>
      <select id="job-select" value={jobId || ''} onChange={(e) => onChange(e.target.value)} disabled={!jobs}>
        {!jobs && <option>Loading jobs…</option>}
        {jobs && jobs.map((j) => <option key={j._id} value={j._id}>{j.title}</option>)}
      </select>
    </>
  );
}
