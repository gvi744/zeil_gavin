const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  tags: { type: [String], default: [] },
  questions: {
    type: [String],
    validate: {
      validator: (v) => Array.isArray(v) && v.length === 3,
      message: 'A job needs exactly 3 questions',
    },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Job', jobSchema);
