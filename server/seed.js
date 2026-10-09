// Clears the db and seeds one job + 9 pre-scored applicants. No AI calls.
const mongoose = require('mongoose');
const { connectDb } = require('./db');
const Job = require('./models/Job');
const Applicant = require('./models/Applicant');
const { placeholderPng, placeholderPdf } = require('./seedFiles');

const JOB = {
  title: 'Junior Frontend Developer',
  description: `We're a small product team building tools that help recruiters spend less time reading identical resumes and more time talking to people.

You'll join two senior engineers and a designer, shipping features in our React + TypeScript web app every week. You'll own small features end to end: turning Figma designs into accessible, responsive components, writing tests, and reviewing each other's pull requests.

What we're looking for:
- Solid fundamentals in HTML, CSS and modern JavaScript
- Some experience with React (personal or uni projects count)
- TypeScript, or a willingness to pick it up fast
- You care about accessibility: keyboard navigation, semantic markup, colour contrast
- Comfortable with Git and working in pull requests

Nice to have: experience with Vite, testing libraries, or design systems.

Hybrid in Auckland CBD, 3 days in office. Mentoring and a learning budget included.`,
  tags: ['react', 'typescript', 'css', 'accessibility', 'git'],
  questions: [
    "The bug I'm weirdly proud of fixing",
    "I'll know it's a good team when...",
    'The last thing I built that nobody asked for',
  ],
};

const APPLICANTS = [
  // Strong
  {
    name: 'Aroha Ngata',
    score: 92,
    matchedTags: ['react', 'typescript', 'css', 'accessibility', 'git'],
    reason:
      'Built and shipped an accessible React + TypeScript bus timetable PWA with a 100 Lighthouse accessibility score and screen-reader testing.',
    colors: [[16, 185, 129], [59, 130, 246]],
    answers: [
      'A focus trap that only broke in Safari with VoiceOver running. Two evenings and one very patient friend testing on her phone, totally worth it.',
      "When people review PRs to help, not to win, and someone asks 'can a keyboard user do this?' before I have to.",
      'A dark mode for my bus timetable app. Nobody requested it, but I check buses at 6am and my eyes did.',
    ],
    resume: [
      'BSc Computer Science, University of Auckland (2025)',
      'Project: Tahi Transit - React + TypeScript PWA for Auckland bus times',
      '  - Lighthouse accessibility 100, tested with NVDA and VoiceOver',
      '  - CSS Grid layout, dark mode, offline caching with service workers',
      'Intern, Frontend Developer - Kiwi Health Tech (Summer 2024)',
      '  - Built form components in React + TS, fixed 40+ axe a11y issues',
      'Skills: React, TypeScript, CSS/Sass, Git, Vite, Jest, Testing Library',
    ],
  },
  {
    name: 'Daniel Park',
    score: 85,
    matchedTags: ['react', 'typescript', 'css', 'git'],
    reason:
      'Rewrote a student club website in React and TypeScript with a custom CSS design system, though accessibility work is not mentioned.',
    colors: [[99, 102, 241], [236, 72, 153]],
    answers: [
      "A card flip animation that stuttered only on my tutor's ancient Android. Swapped top/left for transforms, then wrote a three-paragraph PR about it.",
      "When a one-line PR still gets a thoughtful review, and nobody's scared to say 'I don't get this'.",
      'A component library for my badminton club site. The whole site had four buttons. It now has twelve button variants.',
    ],
    resume: [
      'BE Software Engineering (Part IV), University of Auckland',
      'Project: UoA Badminton Club site - React + TypeScript + Vite',
      '  - Built a small design system: buttons, cards, modals in CSS modules',
      '  - Set up GitHub Actions for lint + build on every PR',
      'Part-time tutor, SOFTENG 206 (Java, Git workflows)',
      'Skills: React, TypeScript, CSS Modules, Git, GitHub Actions, Node',
    ],
  },
  // Mid
  {
    name: 'Priya Sharma',
    score: 68,
    matchedTags: ['react', 'css', 'git'],
    reason:
      'Has two solid React side projects with careful responsive CSS, but no TypeScript and no evidence of accessibility work.',
    colors: [[245, 158, 11], [239, 68, 68]],
    answers: [
      'My recipe app showed every ingredient twice. It was a missing key in a list, found at 11pm on a Sunday.',
      "When someone shares what they're stuck on before it turns into a 'quick question' at 5pm.",
      'A "jump to recipe" button for my own cooking blog, because I got sick of scrolling past my own stories.',
    ],
    resume: [
      'Diploma in Web Development, Yoobee College (2024)',
      'Project: Pantry Pal - React recipe finder using a public API',
      'Project: Portfolio site - hand-written responsive CSS, no framework',
      'Retail assistant, Countdown (2021-2024)',
      'Skills: JavaScript, React, CSS, HTML, Git, Figma (basic)',
    ],
  },
  {
    name: 'Tom Whitfield',
    score: 61,
    matchedTags: ['react', 'git'],
    reason:
      'Bootcamp graduate with a Next.js group project and good team Git habits, but limited CSS depth and no TypeScript yet.',
    colors: [[14, 165, 233], [34, 197, 94]],
    answers: [
      "Less a bug, more a crime: I force-pushed over a teammate's work in bootcamp, then rescued it with git reflog. Never again.",
      'When standups are short and people actually say what is blocking them.',
      'A Discord bot that reminded my bootcamp group to drink water. Mostly it got used to spam each other.',
    ],
    resume: [
      'Full Stack Web Development Bootcamp, Dev Academy Aotearoa (2025)',
      'Group project: StudyBuddy - Next.js app for finding study partners',
      '  - Worked in a team of 4 with feature branches and PR reviews',
      'Previously: Hospitality supervisor, 3 years',
      'Skills: JavaScript, React, Next.js, Tailwind, Express, Git',
    ],
  },
  {
    name: 'Mei Lin',
    score: 57,
    matchedTags: ['css', 'accessibility'],
    reason:
      'UX designer moving into development with strong accessibility knowledge and CSS skills, but only beginner-level React.',
    colors: [[168, 85, 247], [251, 191, 36]],
    answers: [
      'My contrast checker said everything passed. I was comparing the wrong two colours the whole time. Very humbling Tuesday.',
      "When designers and devs sit in the same review and nobody says 'that's not my job'.",
      'A browser extension that shows the tab order on any page. I built it to win an argument with a developer about focus.',
    ],
    resume: [
      'UX/UI Designer, Spark Agency (2022-2025)',
      '  - Ran WCAG 2.1 AA audits for 6 client sites',
      'Self-taught: HTML, CSS, beginner React (Scrimba course)',
      'Project: Contrast Checker - small vanilla JS tool',
      'Skills: Figma, WCAG, CSS, HTML, user research, React (learning)',
    ],
  },
  {
    name: 'Lucas Oliveira',
    score: 52,
    matchedTags: ['typescript', 'git'],
    reason:
      'Comfortable with TypeScript and Git from Node backend work, but has built very little UI and no React projects.',
    colors: [[71, 85, 105], [14, 165, 233]],
    answers: [
      'A timezone bug that double-billed only customers in the Chatham Islands. One week and a whiteboard full of UTC offsets.',
      'When tests count as part of the feature, not a chore for later.',
      "A CLI that writes our team's standup notes from git commits. I'm the only one who uses it.",
    ],
    resume: [
      'BSc Information Technology, AUT (2024)',
      'Junior Backend Developer, Freightly (2024-present)',
      '  - Node + TypeScript REST APIs, PostgreSQL, Jest',
      'Project: Discord bot for uni course announcements (TypeScript)',
      'Skills: TypeScript, Node, Express, PostgreSQL, Docker, Git',
    ],
  },
  // Weak (data / design focused)
  {
    name: 'Sophie Turner',
    score: 31,
    matchedTags: ['git'],
    reason:
      'Data analyst with strong Python and Tableau dashboards, but no frontend frameworks or CSS experience relevant to this role.',
    colors: [[234, 88, 12], [250, 204, 21]],
    answers: [
      'A sales dashboard showed revenue doubling overnight. A CSV had been imported twice, and I caught it ten minutes before the exec meeting.',
      "When people ask 'what does the data actually say?' before deciding.",
      "A Tableau dashboard tracking my flat's power bill by appliance. My flatmates were less excited than I was.",
    ],
    resume: [
      'BCom Business Analytics, Victoria University of Wellington (2023)',
      'Data Analyst, Pacific Retail Group (2023-present)',
      '  - Built weekly sales dashboards in Tableau and Power BI',
      '  - Python (pandas) pipelines for cleaning POS data',
      'Skills: SQL, Python, pandas, Tableau, Power BI, Excel, Git (basic)',
    ],
  },
  {
    name: 'Emma Wilson',
    score: 27,
    matchedTags: ['css'],
    reason:
      'Graphic designer with a strong visual portfolio and some Webflow CSS, but no JavaScript, React or Git experience.',
    colors: [[244, 63, 94], [253, 186, 116]],
    answers: [
      'Not really code, but a Webflow menu that vanished on iPads. I fixed it by deleting things until it came back.',
      "When feedback comes with a reason, not just 'make it pop'.",
      "A poster series of my street's cafes drawn as album covers. Three of the owners hung theirs up.",
    ],
    resume: [
      'Bachelor of Design (Visual Communication), Massey University (2022)',
      'Freelance Graphic Designer (2022-present)',
      '  - Brand identities, posters, and 3 Webflow sites for local cafes',
      'Skills: Illustrator, Photoshop, InDesign, Figma, Webflow',
    ],
  },
  {
    name: 'Rahul Mehta',
    score: 19,
    matchedTags: [],
    reason:
      'Machine learning student focused on PyTorch research projects, with no frontend, CSS or React work shown.',
    colors: [[30, 41, 59], [100, 116, 139]],
    answers: [
      'My model hit 99% accuracy, which was the bug. Test images had leaked into the training set.',
      'When people share failed experiments as openly as the ones that worked.',
      "A model that predicts whether my flatmate will do the dishes. It's 80% accurate and he's not thrilled.",
    ],
    resume: [
      'MSc Data Science (in progress), University of Canterbury',
      'Research: Transformer models for NZ Sign Language recognition',
      '  - PyTorch, Weights & Biases, HPC cluster training',
      'Skills: Python, PyTorch, NumPy, scikit-learn, LaTeX',
    ],
  },
];

async function seed() {
  await connectDb();
  await Promise.all([Job.deleteMany({}), Applicant.deleteMany({})]);
  console.log('[seed] cleared jobs and applicants');

  const job = await Job.create(JOB);
  console.log(`[seed] created job "${job.title}" (${job._id})`);

  // Stagger createdAt so ordering is stable.
  const now = Date.now();
  const docs = APPLICANTS.map((a, i) => ({
    jobId: job._id,
    name: a.name,
    resume: { data: placeholderPdf(a.name, a.resume), contentType: 'application/pdf' },
    image: { data: placeholderPng(a.colors[0], a.colors[1]), contentType: 'image/png' },
    answers: JOB.questions.map((question, qi) => ({ question, answer: a.answers[qi] })),
    score: a.score,
    matchedTags: a.matchedTags,
    reason: a.reason,
    status: 'new',
    createdAt: new Date(now - (APPLICANTS.length - i) * 60_000),
  }));
  await Applicant.insertMany(docs);
  console.log(`[seed] created ${docs.length} applicants`);
}

if (require.main === module) {
  seed()
    .catch((err) => {
      console.error('[seed] failed:', err.message);
      process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
}

module.exports = { JOB, APPLICANTS };
