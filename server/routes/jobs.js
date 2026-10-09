const express = require('express');
const multer = require('multer');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Applicant = require('../models/Applicant');
const { scoreApplicant } = require('../ai/scoring');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024, files: 2 },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'resume' && file.mimetype !== 'application/pdf') {
      return cb(Object.assign(new Error('Resume must be a PDF'), { status: 400 }));
    }
    if (file.fieldname === 'image' && !file.mimetype.startsWith('image/')) {
      return cb(Object.assign(new Error('Project image must be an image'), { status: 400 }));
    }
    cb(null, true);
  },
}).fields([
  { name: 'resume', maxCount: 1 },
  { name: 'image', maxCount: 1 },
]);

const cleanTags = (tags) =>
  [...new Set((Array.isArray(tags) ? tags : []).map((t) => String(t).trim().toLowerCase()).filter(Boolean))];

async function findJob(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ error: 'Job not found' });
    return null;
  }
  const job = await Job.findById(req.params.id);
  if (!job) res.status(404).json({ error: 'Job not found' });
  return job;
}

// GET /api/jobs  (newest first)
router.get('/', async (req, res) => {
  const jobs = await Job.find().sort({ createdAt: -1 });
  res.json(jobs);
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
  const job = await findJob(req, res);
  if (job) res.json(job);
});

// POST /api/jobs {title, description, tags, questions}
router.post('/', async (req, res) => {
  const { title, description, tags, questions } = req.body || {};
  if (!title || !String(title).trim() || !description || !String(description).trim()) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const qs = (Array.isArray(questions) ? questions : []).map((q) => String(q).trim()).filter(Boolean);
  if (qs.length !== 3) return res.status(400).json({ error: 'Pick exactly 3 questions' });

  const job = await Job.create({
    title: String(title).trim(),
    description: String(description).trim(),
    tags: cleanTags(tags),
    questions: qs,
  });
  res.status(201).json(job);
});

// GET /api/jobs/:id/feed  -> "new" applicants, best match first.
// Blind: never includes the name or resume, so nothing leaks via the network tab.
router.get('/:id/feed', async (req, res) => {
  const job = await findJob(req, res);
  if (!job) return;
  const applicants = await Applicant.find({ jobId: job._id, status: 'new' })
    .select('-name -resume -image')
    .sort({ score: -1, createdAt: 1 });
  res.json(applicants.map((a) => a.toFeedCard()));
});

// GET /api/jobs/:id/shortlist  -> shortlisted applicants with names revealed
router.get('/:id/shortlist', async (req, res) => {
  const job = await findJob(req, res);
  if (!job) return;
  const applicants = await Applicant.find({ jobId: job._id, status: 'shortlisted' })
    .select('-resume.data -image.data')
    .sort({ score: -1, createdAt: 1 });
  res.json(applicants.map((a) => a.toCard()));
});

// POST /api/jobs/:id/apply  (multipart: name, resume, image, answers JSON)
router.post('/:id/apply', (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Files must be 2MB or smaller' : err.message;
      return res.status(err.status || 400).json({ error: msg });
    }
    next();
  });
}, async (req, res) => {
  const job = await findJob(req, res);
  if (!job) return;

  const name = String(req.body.name || '').trim();
  const resume = req.files && req.files.resume && req.files.resume[0];
  const image = req.files && req.files.image && req.files.image[0];
  if (!name) return res.status(400).json({ error: 'Name is required' });
  if (!resume) return res.status(400).json({ error: 'Resume PDF is required' });
  if (!image) return res.status(400).json({ error: 'Project image is required' });

  let rawAnswers;
  try {
    rawAnswers = JSON.parse(req.body.answers || '[]');
  } catch {
    return res.status(400).json({ error: 'Answers must be valid JSON' });
  }
  // Match answers to the job's own questions so they can't be swapped.
  const answers = job.questions.map((question, i) => {
    const a = Array.isArray(rawAnswers) ? rawAnswers[i] : null;
    const answer = typeof a === 'string' ? a : a && typeof a.answer === 'string' ? a.answer : '';
    return { question, answer: answer.trim().slice(0, 200) };
  });
  if (answers.some((a) => !a.answer)) return res.status(400).json({ error: 'Please answer all 3 questions' });

  const applicant = await Applicant.create({
    jobId: job._id,
    name,
    resume: { data: resume.buffer, contentType: resume.mimetype },
    image: { data: image.buffer, contentType: image.mimetype },
    answers,
  });

  // Single AI call per application. Never throws (falls back internally).
  const result = await scoreApplicant({ job, resume: applicant.resume, answers, name });
  applicant.score = result.score;
  applicant.matchedTags = result.matchedTags;
  applicant.reason = result.reason;
  await applicant.save();

  res.status(201).json(applicant.toCard());
});

module.exports = router;
