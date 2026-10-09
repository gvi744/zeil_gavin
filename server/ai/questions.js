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

const WRITER_SYSTEM = `You write Hinge-style prompts for a job application. They should be short (under 12 words), playful, and answerable in one or two sentences.

They reveal how someone thinks, works with people, handles mistakes, or what they care about. NOT what they know.
Never ask about specific technologies, tools, or skills. Never ask anything that sounds like an interview question.
Use the job only for light flavour (e.g. a frontend role might get a question about something they built or fixed for fun, not about React).

Mix formats: "The most ___ thing I've...", "I'll know it's a good team when...", "A project I'd happily do for free...", "My most useful bad habit is...".

Good examples:
- "The bug I'm weirdly proud of fixing"
- "I'll know it's a good team when..."
- "Something I taught myself just to win an argument"
- "My most useful bad habit at work"
- "The last thing I built that nobody asked for"

Bad examples (too technical or too serious):
- "Describe your experience with TypeScript"
- "How do you handle state management?"
- "What is your greatest weakness?"

Return 5 questions, each a different format.`;

const CRITIC_SYSTEM = `You are a strict reviewer of Hinge-style job application prompts written by someone else.
For each question, flag it (flagged: true) if it is:
- too technical (asks about tools, skills or knowledge),
- reads like a standard interview question,
- not fun or playful,
- generic (could be asked for any job, reveals little),
- irrelevant to this job, or
- risky: could lead a candidate to disclose age, family or relationship status, pregnancy, health or disability, religion, nationality, ethnicity, sexuality, political views, or other protected characteristics.
Otherwise flagged: false.
"reason" is one short line. If flagged, start with the problem, e.g. "Too technical: tests React knowledge". If not, say what the question reveals, e.g. "Shows how they handle mistakes".
Return the questions in the same order, with "text" copied exactly.`;

async function generateQuestions(job) {
  // 1. Writer
  const writer = await generateValidated({
    label: 'writer',
    systemInstruction: WRITER_SYSTEM,
    temperature: 1.0,
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
    temperature: 0.2,
    contents: `${jobBlock(job)}\n\nDraft questions to review:\n${drafts}`,
    schema: criticSchema,
    validate: validateCritic,
    fallback: null,
  });
  console.log('[ai:critic] output ->', JSON.stringify(critic.data, null, 2), '\n');
  return critic;
}

module.exports = { generateQuestions, reviewQuestions };
