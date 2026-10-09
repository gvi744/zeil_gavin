# CandidatesFY

Hiring managers swipe through Hinge-style applicant cards (a project image and three short, fun answers) instead of reading a stack of identical resumes, with AI writing the questions and ranking the applicants.

## Features

- **Anonymous For You Page (FYP) for managers.** One applicant card at a time, best match first, shown only as "Candidate 3F9A": project image, three Q&As, matched skill tags and a one-line "Why you're seeing this". There's no name and no resume, and the feed API doesn't send either, so they can't leak through the network tab. Skip or Shortlist with the buttons or the ← / → keys.
- **Shortlist page.** Names and resumes are revealed only after shortlisting. Each row shows the name, candidate code, score, tags, reason and a resume link, and expands to show the project image and answers.
- **AI reasons never identify anyone.** The scoring prompt bans names, pronouns, gender, age and other identifying details. As a safety net, the server also replaces the applicant's name with "this candidate" if it slips through anyway.
- **AI question writer and critic.** When creating a job, one AI drafts five Hinge-style questions and a second AI reviews each one, flagging any that are too technical, read like a standard interview question, aren't playful, are generic or irrelevant, or are risky (could touch age, family, health, religion, nationality and so on). The manager picks exactly three.
- **AI applicant scoring.** Each application is scored once, when it's submitted: Gemini reads the resume PDF and the three answers and returns a 0–100 score, the job tags it found evidence for, and a one-sentence reason. Viewing the feed costs no AI calls.
- **Applicant portal.** Browse jobs, upload a resume (PDF) and a project image, and answer the three questions (200 characters each).
- **Manager / Applicant toggle.** Switch views from the top right. There's no login; it's a prototype.

## Run it locally

You need Node 18+, a MongoDB Atlas cluster and a Gemini API key.

1. Create `server/.env` (see `server/.env.example`):
   ```
   GEMINI_API_KEY=your-key
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/candidatesfy
   ```
   Put the database name in the URI (`/candidatesfy` above). Without one, Mongo uses a database called `test`.
2. Install and seed (one job, nine pre-scored applicants, no AI calls):
   ```
   cd server && npm install && npm run seed
   cd ../client && npm install
   ```
3. Run the server and the client in two terminals:
   ```
   cd server && npm run dev      # API on http://localhost:5000
   cd client && npm run dev      # app on http://localhost:5173 (proxies /api to :5000)
   ```

To try the production build locally, run `npm run build` and then `npm start` from the repo root, and open http://localhost:5000.

## How it's built

MERN monorepo: `client/` is React + Vite + React Router with plain CSS, and `server/` is Express + Mongoose. In production, Express serves `client/dist` and everything runs on one port. The client only ever calls relative `/api` paths, and API keys never leave the server.

**Two AI roles for questions** (`server/ai/questions.js`). The writer and the critic are separate Gemini calls with separate system prompts. The critic gets the job plus the writer's five drafts and returns `{text, flagged, reason}` for each. Both outputs are logged to the server console, so you can watch the hand-off.

**Scoring** (`server/ai/scoring.js`). One call per application, with the resume sent as inline PDF data alongside the Q&As and the job details. The returned tags are filtered so only tags that exist on the job are kept, and the applicant's name is removed from the reason if it appears (full name, first or last name, or possessive, in any capitalisation).

**Reliability** (`server/ai/gemini.js`, `server/ai/schemas.js`):
- Every call uses Gemini structured output (`responseMimeType: application/json` plus a `responseSchema`), and all the schemas live in one file.
- Calls retry with exponential backoff on 429 and 5xx errors (up to 3 attempts), and time out after 45 seconds.
- Every response is checked against the expected shape. Invalid output is retried once, then a fallback is used: five default questions, or a score of 0 with "Couldn't score this application". A bad AI response never fails a request.

**Look and feel.** The visual style follows zeil.com: a white canvas with a soft lavender and lime glow, purple pill buttons, lavender panels, a utility bar above a centred wordmark, and a purple footer with a giant wordmark. I didn't copy any Zeil logos or images; the wordmark is plain type. Images are preloaded so a card never appears before its picture: the feed waits for the first card's image, loads the next three in the background, and the shortlist preloads every image so expanding a row is instant.

Uploads are stored in Mongo as Buffers (multer memory storage, 2MB limit each) and served from `/api/files/:applicantId/resume|image`.

## Deploy on Render

1. Create a **Web Service** from this repo.
2. Build command: `npm run build`. Start command: `npm start`.
3. Environment variables: `GEMINI_API_KEY` and `MONGO_URI`. Render sets `PORT` itself.
4. In Atlas → Network Access, allow `0.0.0.0/0`, because Render's outbound IPs aren't fixed on the free tier.
5. Seed once from your machine (`cd server && npm run seed`) using the same `MONGO_URI`.

Free-tier instances sleep when idle, so the first request after a while can take around 30 seconds.

## What I didn't write

- **Libraries:** React, React Router, Vite, Express, Mongoose, Multer, dotenv and Google's `@google/genai` SDK.
- **Font:** Geist by Vercel, loaded from Google Fonts (SIL Open Font License).
- **AI coding assistant:** much of the code was written with Claude Code (Anthropic's AI coding assistant), working from my spec and build plan. I made the product and design decisions, reviewed the code and tested the flows.

## Author

Gavin
