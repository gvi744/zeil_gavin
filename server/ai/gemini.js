const { GoogleGenAI } = require('@google/genai');
const { GEMINI_API_KEY } = require('../config');

const MODEL = 'gemini-flash-latest';
const MAX_ATTEMPTS = 3;
const BASE_DELAY_MS = 800;
const REQUEST_TIMEOUT_MS = 45_000;

let client = null;
function getClient() {
  if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set in server/.env');
  if (!client) client = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  return client;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function isRetryable(err) {
  const status = err && (err.status || err.code);
  return status === 429 || (status >= 500 && status < 600);
}

// One structured-output call with retry + exponential backoff on 429 / 5xx.
async function callJson({ contents, schema, systemInstruction, label }) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const res = await getClient().models.generateContent({
        model: MODEL,
        contents,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          responseSchema: schema,
          httpOptions: { timeout: REQUEST_TIMEOUT_MS },
        },
      });
      return JSON.parse(res.text);
    } catch (err) {
      lastErr = err;
      if (!isRetryable(err) || attempt === MAX_ATTEMPTS) break;
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1) + Math.random() * 250;
      console.warn(`[ai:${label}] attempt ${attempt} failed (${err.status}), retrying in ${Math.round(delay)}ms`);
      await sleep(delay);
    }
  }
  throw lastErr;
}

// callJson + shape validation. Retries once on invalid output, then returns
// the fallback. Never throws.
async function generateValidated({ contents, schema, systemInstruction, validate, fallback, label }) {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const data = await callJson({ contents, schema, systemInstruction, label });
      const valid = validate(data);
      if (valid) return { data: valid, usedFallback: false };
      console.warn(`[ai:${label}] invalid response shape (attempt ${attempt}):`, JSON.stringify(data));
    } catch (err) {
      console.warn(`[ai:${label}] call failed (attempt ${attempt}): ${err.message}`);
      // Network/API errors already went through backoff; don't double up.
      if (attempt === 1 && !(err instanceof SyntaxError)) break;
    }
  }
  console.warn(`[ai:${label}] using fallback`);
  return { data: fallback, usedFallback: true };
}

module.exports = { generateValidated, MODEL };
