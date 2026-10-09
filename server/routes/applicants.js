const express = require('express');
const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');

const router = express.Router();
const STATUSES = ['new', 'shortlisted', 'skipped'];

// POST /api/applicants/:id/status {status}
router.post('/:id/status', async (req, res) => {
  const { status } = req.body || {};
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}` });
  }
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Applicant not found' });

  const applicant = await Applicant.findByIdAndUpdate(req.params.id, { status }, { new: true }).select(
    '-resume.data -image.data'
  );
  if (!applicant) return res.status(404).json({ error: 'Applicant not found' });
  res.json(applicant.toCard());
});

module.exports = router;
