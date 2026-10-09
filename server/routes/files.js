const express = require('express');
const mongoose = require('mongoose');
const Applicant = require('../models/Applicant');

const router = express.Router();

// GET /api/files/:applicantId/resume | /image
router.get('/:applicantId/:kind(resume|image)', async (req, res) => {
  const { applicantId, kind } = req.params;
  if (!mongoose.isValidObjectId(applicantId)) return res.status(404).end();

  const applicant = await Applicant.findById(applicantId).select(kind);
  const file = applicant && applicant[kind];
  if (!file || !file.data) return res.status(404).end();

  res.set('Content-Type', file.contentType || 'application/octet-stream');
  res.set('Cache-Control', 'private, max-age=3600');
  if (kind === 'resume') res.set('Content-Disposition', `inline; filename="resume-${applicantId}.pdf"`);
  res.send(file.data);
});

module.exports = router;
