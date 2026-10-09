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
    "What's a website you use every week that quietly annoys you, and how would you fix it?",
    'Tell us about the last CSS rabbit hole you fell into. Did you climb out?',
    'If your git history could talk, what would it say about you?',
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
      "My uni's course enrolment page. The timetable is a giant table with no headers for screen readers. I'd rebuild it as a grid with proper th scope and keyboard nav between slots.",
      'Spent a weekend making a sticky table header work inside a horizontally scrolling container. Turns out position: sticky and overflow don\'t get along. Won with a wrapper div and a lot of coffee.',
      '"Small commits, clear messages, and one embarrassing \'fix typo in fix for typo\' from 2am." I rebase before every PR now.',
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
      "Our flatmate bill-splitting app. It makes you scroll through every past bill to add a new one. I'd pin 'Add bill' to the top and group history by month.",
      "Tried to make a card flip animation feel 'springy' with only CSS. Ended up learning cubic-bezier by hand. Climbed out, but my keyframes are art now.",
      "That I'm the guy who opens a PR for a one-line change with a three-paragraph description. My team liked it, honestly.",
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
      'Recipe sites. 3000 words about someone\'s grandmother before the ingredients. I\'d add a sticky "jump to recipe" button and collapse the story by default.',
      'Making a masonry layout without JavaScript. I tried columns, then grid with dense packing, then gave up and used columns again. Partial climb.',
      '"Commits a lot on Sundays." My side projects only happen on weekends, so the graph looks like a barcode.',
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
      "Online banking that logs me out after 2 minutes while I'm reading a statement. A visible countdown with an 'I'm still here' button would fix it.",
      "I don't really fall into CSS rabbit holes, I reach for Tailwind and move on. Probably something I should get better at.",
      'That I learned branching the hard way after force-pushing over a teammate\'s work in week 3 of bootcamp. Never again.',
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
      'Airline check-in forms that only show errors after you submit, then clear half your fields. Inline validation and keeping inputs would save so much pain.',
      "Getting focus rings to look good without removing them. :focus-visible was the answer. Designers who say 'remove the blue outline' are my nemesis now.",
      'Mostly that I commit Figma exports into the repo. Still learning what belongs in git and what doesn\'t.',
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
      "Most API docs sites. The search never finds the endpoint I need. I'd index request/response examples, not just headings.",
      "Centring a div. Genuinely. I'm a backend person, I just used flexbox until it worked.",
      '"Writes tests before features, writes READMEs nobody reads." I\'m proud of both.',
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
      "Power BI's filter pane. Too many nested menus. I'd want saved filter presets you can toggle with one click.",
      "I haven't done much CSS. The closest was styling a Streamlit dashboard and I mostly used the defaults.",
      'That I version my Jupyter notebooks as final_v2_REAL_final.ipynb, but I\'m slowly learning proper branches.',
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
      'Instagram\'s new grid crop. It cuts off half my posters. Let creators choose the crop per post.',
      'Trying to match a print gradient exactly in Webflow. Screens and paper just don\'t agree. I accepted defeat gracefully.',
      "It would ask what git is. I save everything to Dropbox with dates in the filename.",
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
      "Kaggle's notebook editor. It freezes when outputs get big. I'd paginate cell outputs.",
      "No CSS rabbit holes. I did go down a CUDA version rabbit hole for three days though, if that counts.",
      '"Trains models at 3am, commits at 3:05am with message: works now."',
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
