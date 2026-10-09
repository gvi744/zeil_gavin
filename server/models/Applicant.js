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

// Shape sent to the client: no buffers, file URLs instead.
applicantSchema.methods.toCard = function toCard() {
  const id = this._id.toString();
  return {
    _id: id,
    jobId: this.jobId.toString(),
    name: this.name,
    answers: this.answers,
    score: this.score,
    matchedTags: this.matchedTags,
    reason: this.reason,
    status: this.status,
    createdAt: this.createdAt,
    resumeUrl: `/api/files/${id}/resume`,
    imageUrl: `/api/files/${id}/image`,
  };
};

module.exports = mongoose.model('Applicant', applicantSchema);
