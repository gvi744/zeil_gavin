const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  { data: Buffer, contentType: String },
  { _id: false }
);

const applicantSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
  name: { type: String, required: true, trim: true },
  resume: fileSchema,
  image: fileSchema,
  answers: [{ question: String, answer: String, _id: false }],
  score: { type: Number, min: 0, max: 100, default: 0 },
  matchedTags: { type: [String], default: [] },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['new', 'shortlisted', 'skipped'], default: 'new' },
  createdAt: { type: Date, default: Date.now },
});

// Short anonymous label shown on the blind feed, e.g. "Candidate 3F9A".
applicantSchema.virtual('code').get(function code() {
  return this._id.toString().slice(-4).toUpperCase();
});

// Blind feed shape: no name, no resume (it contains the name), no buffers.
applicantSchema.methods.toFeedCard = function toFeedCard() {
  const id = this._id.toString();
  return {
    _id: id,
    code: this.code,
    answers: this.answers,
    score: this.score,
    matchedTags: this.matchedTags,
    reason: this.reason,
    imageUrl: `/api/files/${id}/image`,
  };
};

// Full shape, only for shortlisted applicants (and the applicant's own submit).
applicantSchema.methods.toCard = function toCard() {
  return {
    ...this.toFeedCard(),
    jobId: this.jobId.toString(),
    name: this.name,
    status: this.status,
    createdAt: this.createdAt,
    resumeUrl: `/api/files/${this._id}/resume`,
  };
};

module.exports = mongoose.model('Applicant', applicantSchema);
