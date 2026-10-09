// All Gemini structured-output schemas live here.
const { Type } = require('@google/genai');

// Writer: drafts 5 Hinge-style questions for a job.
const writerSchema = {
  type: Type.OBJECT,
  properties: {
    questions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      minItems: '5',
      maxItems: '5',
    },
  },
  required: ['questions'],
};

// Critic: reviews each of the writer's 5 drafts.
const criticSchema = {
  type: Type.OBJECT,
  properties: {
    reviews: {
      type: Type.ARRAY,
      minItems: '5',
      maxItems: '5',
      items: {
        type: Type.OBJECT,
        properties: {
          text: { type: Type.STRING },
          flagged: { type: Type.BOOLEAN },
          reason: { type: Type.STRING },
        },
        required: ['text', 'flagged', 'reason'],
        propertyOrdering: ['text', 'flagged', 'reason'],
      },
    },
  },
  required: ['reviews'],
};

// Scorer: one call per application.
const scoreSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, minimum: 0, maximum: 100 },
    matchedTags: { type: Type.ARRAY, items: { type: Type.STRING } },
    reason: { type: Type.STRING },
  },
  required: ['score', 'matchedTags', 'reason'],
  propertyOrdering: ['score', 'matchedTags', 'reason'],
};

module.exports = { writerSchema, criticSchema, scoreSchema };
