// All requests use relative /api paths (Vite proxies them in dev).
async function request(path, options = {}) {
  const opts = { ...options };
  if (opts.json !== undefined) {
    opts.body = JSON.stringify(opts.json);
    opts.headers = { 'Content-Type': 'application/json', ...opts.headers };
    delete opts.json;
  }
  const res = await fetch(`/api${path}`, opts);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }
  if (!res.ok) throw new Error((data && data.error) || `Request failed (${res.status})`);
  return data;
}

export const api = {
  listJobs: () => request('/jobs'),
  getJob: (id) => request(`/jobs/${id}`),
  createJob: (job) => request('/jobs', { method: 'POST', json: job }),
  getFeed: (jobId) => request(`/jobs/${jobId}/feed`),
  getShortlist: (jobId) => request(`/jobs/${jobId}/shortlist`),
  apply: (jobId, formData) => request(`/jobs/${jobId}/apply`, { method: 'POST', body: formData }),
  setStatus: (applicantId, status) =>
    request(`/applicants/${applicantId}/status`, { method: 'POST', json: { status } }),
  generateQuestions: (job) => request('/questions/generate', { method: 'POST', json: job }),
};
