import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

// Loads jobs once and keeps /<basePath>/:jobId in sync; no jobId -> newest job.
export function useJobSelection(basePath) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listJobs().then(setJobs).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!jobId && jobs && jobs.length) navigate(`${basePath}/${jobs[0]._id}`, { replace: true });
  }, [basePath, jobId, jobs, navigate]);

  const job = jobs && jobs.find((j) => j._id === jobId);
  const selectJob = (id) => navigate(`${basePath}/${id}`);
  return { jobs, jobId, job, selectJob, error };
}
