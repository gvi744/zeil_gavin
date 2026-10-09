const path = require('path');
const fs = require('fs');
const express = require('express');
const { PORT } = require('./config');
const { connectDb } = require('./db');

// Express 4 doesn't forward rejected promises from async handlers; wrap them.
const wrapAsync = (router) => {
  router.stack.forEach((layer) => {
    if (!layer.route) return;
    layer.route.stack.forEach((h) => {
      const fn = h.handle;
      if (fn.length <= 3) h.handle = (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
    });
  });
  return router;
};

const app = express();
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/jobs', wrapAsync(require('./routes/jobs')));
app.use('/api/applicants', wrapAsync(require('./routes/applicants')));
app.use('/api/files', wrapAsync(require('./routes/files')));
app.use('/api/questions', wrapAsync(require('./routes/questions')));
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }));

// Production: serve the built client with an SPA catch-all.
const distDir = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[server]', err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Something went wrong' });
});

connectDb()
  .then(() => app.listen(PORT, () => console.log(`[server] listening on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('[server] failed to start:', err.message);
    process.exit(1);
  });
