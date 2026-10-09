// AI feature 1: a writer drafts questions, a separate critic reviews them.
const { generateValidated } = require('./gemini');
const { writerSchema, criticSchema } = require('./schemas');

const DEFAULT_QUESTIONS = [
  "What's a project you're quietly proud of, and why?",
  'Tell us about a bug that took you way too long to find.',
  "What's something you taught yourself recently?",
  'Describe your ideal first week in this role.',
  "What's a tool or habit that makes you better at your work?",
];

const fallbackReviews = () =>
  DEFAULT_QUESTIONS.map((text) => ({ text, flagged: false, reason: 'Default question' }));

const isNonEmptyString = (s) => typeof s === 'string' && s.trim().length > 0;

function validateWriter(data) {
  const qs = data && data.questions;
  if (!Array.isArray(qs) || qs.length !== 5 || !qs.every(isNonEmptyString)) return null;
  return { questions: qs.map((q) => q.trim()) };
}

function validateCritic(data) {
  const rs = data && data.reviews;
  if (!Array.isArray(rs) || rs.length !== 5) return null;
  const ok = rs.every(
    (r) => r && isNonEmptyString(r.text) && typeof r.flagged === 'boolean' && typeof r.reason === 'string'
  );
  if (!ok) return null;
  return {
    reviews: rs.map((r) => ({ text: r.text.trim(), flagged: r.flagged, reason: r.reason.trim() })),
  };
}

function jobBlock({ title, description, tags }) {
  return `Job title: ${title}\nJob description:\n${description}\nSkill tags: ${(tags || []).join(', ') || '(none)'}`;
}

const WRITER_SYSTEM = `You write short, playful, Hinge-style prompts that a job applicant answers in under 200 characters.
Each question should reveal how the candidate thinks, works, or solves problems in ways relevant to the specific job.
Keep each under 90 characters. Avoid cliches like "Where do you see yourself in 5 years?" and avoid anything personal or sensitive.`;

const CRITIC_SYSTEM = `You are a strict hiring-fairness reviewer. You review draft applicant questions written by someone else.
For each question, flag it (flagged: true) if it is:
- generic (could be asked for any job, reveals little),
- irrelevant to this job, or
- risky: could lead a candidate to disclose age, family or relationship status, pregnancy, health or disability, religion, nationality, ethnicity, sexuality, political views, or other protected characteristics.
Otherwise flagged: false.
"reason" is one short sentence: if flagged, say why; if not, say what the question reveals about the candidate.
Return the questions in the same order, with "text" copied exactly.`;

async function generateQuestions(job) {
  // 1. Writer
  const writer = await generateValidated({
    label: 'writer',
    systemInstruction: WRITER_SYSTEM,
    contents: `${jobBlock(job)}\n\nWrite exactly 5 questions.`,
    schema: writerSchema,
    validate: validateWriter,
    fallback: null,
  });
  console.log('\n[ai:writer] output ->', JSON.stringify(writer.data, null, 2));
  if (writer.usedFallback) return { reviews: fallbackReviews(), usedFallback: true };

  // 2. Critic
  const critic = await reviewQuestions(job, writer.data.questions);
  if (critic.usedFallback) return { reviews: fallbackReviews(), usedFallback: true };

  return { reviews: critic.data.reviews, usedFallback: false };
}

// Separate prompt: sees the job + the writer's drafts, flags bad ones.
async function reviewQuestions(job, questions) {
  const drafts = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
  const critic = await generateValidated({
    label: 'critic',
    systemInstruction: CRITIC_SYSTEM,
    contents: `${jobBlock(job)}\n\nDraft questions to review:\n${drafts}`,
    schema: criticSchema,
    validate: validateCritic,
    fallback: null,
  });
  console.log('[ai:critic] output ->', JSON.stringify(critic.data, null, 2), '\n');
  return critic;
}

module.exports = { generateQuestions, reviewQuestions };
