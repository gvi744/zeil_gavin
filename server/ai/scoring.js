// AI feature 2: score one application against its job (one call per apply).
const { generateValidated } = require('./gemini');
const { scoreSchema } = require('./schemas');

const FALLBACK = { score: 0, matchedTags: [], reason: "Couldn't score this application" };

const SYSTEM = `You help a hiring manager triage applicants. Score how well this applicant fits the job from 0 to 100,
using their resume (attached PDF) and their answers to three short questions.
- 80-100: strong, direct evidence for most of the job's skills.
- 50-79: some relevant evidence, notable gaps.
- 0-49: little relevant evidence.
"matchedTags" must only contain tags from the job's tag list that the applicant clearly shows evidence for.
"reason" is ONE sentence, specific to this applicant (mention a concrete project, skill or answer), no generic praise.
The hiring manager reviews applicants blind. The reason must NOT mention the applicant's name, gender, age, nationality, or anything else identifying,
and must use NO pronouns at all for the applicant (no he, she, they, him, her, them, his, hers, their, theirs).
Refer to them only as "this candidate" / "this candidate's", or start with what they did (e.g. "Built an accessible...").`;

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Safety net: swap any leaked name (full name, then each part) for "this candidate".
function scrubName(reason, name) {
  const parts = String(name || '')
    .split(/\s+/)
    .filter((p) => p.length > 1);
  const patterns = [name, ...parts].filter(Boolean).map((n) => escapeRegex(n.trim()));
  let out = reason;
  for (const p of patterns) {
    out = out.replace(new RegExp(`\\b${p}(?:'s|’s)?\\b`, 'gi'), (m) =>
      /'s$|’s$/i.test(m) ? "this candidate's" : 'this candidate'
    );
  }
  // Collapse "this candidate this candidate" from first+last name matches.
  out = out.replace(/this candidate(?:'s)?\s+(this candidate(?:'s)?)/gi, '$1');
  return out.charAt(0).toUpperCase() + out.slice(1);
}

function makeValidator(jobTags) {
  const allowed = new Map(jobTags.map((t) => [t.toLowerCase(), t]));
  return (data) => {
    if (!data || typeof data !== 'object') return null;
    const score = Number(data.score);
    if (!Number.isFinite(score) || !Array.isArray(data.matchedTags)) return null;
    if (typeof data.reason !== 'string' || !data.reason.trim()) return null;
    // Keep only tags that really exist on the job (canonical casing, no dupes).
    const matchedTags = [
      ...new Set(
        data.matchedTags
          .filter((t) => typeof t === 'string')
          .map((t) => allowed.get(t.trim().toLowerCase()))
          .filter(Boolean)
      ),
    ];
    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      matchedTags,
      reason: data.reason.trim(),
    };
  };
}

async function scoreApplicant({ job, resume, answers, name }) {
  const qa = answers.map((a, i) => `Q${i + 1}: ${a.question}\nA${i + 1}: ${a.answer}`).join('\n\n');
  const text = `Job title: ${job.title}
Job description:
${job.description}
Job tags: ${job.tags.join(', ')}

Applicant's answers:
${qa}

The applicant's resume is attached as a PDF.`;

  const parts = [{ text }];
  if (resume && resume.data) {
    parts.unshift({
      inlineData: { mimeType: resume.contentType || 'application/pdf', data: resume.data.toString('base64') },
    });
  }

  const { data } = await generateValidated({
    label: 'scorer',
    systemInstruction: SYSTEM,
    contents: [{ role: 'user', parts }],
    schema: scoreSchema,
    validate: makeValidator(job.tags),
    fallback: FALLBACK,
  });
  const result = { ...data, reason: scrubName(data.reason, name) };
  console.log('[ai:scorer] output ->', JSON.stringify(result));
  return result;
}

module.exports = { scoreApplicant, scrubName };
