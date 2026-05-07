const express = require('express');
const path = require('path');
const handler = require('./api/generate.js');

const app = express();
app.use(express.json({ limit: '2mb' }));

// Basic request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// JSON parse error handler
app.use((err, req, res, next) => {
  if (err && err.type === 'entity.parse.failed') {
    console.error('JSON parse error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload' });
  }
  next(err);
});

// Mount the existing serverless handler for POST /api/generate
app.post('/api/generate', (req, res) => {
  try {
    return handler(req, res);
  } catch (err) {
    console.error('Handler threw:', err && err.stack ? err.stack : err);
    return res.status(500).json({ error: err && err.message ? err.message : String(err) });
  }
});

// Health check endpoint for deployments
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

// Serve static frontend from the build output (Vite default: dist)
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

const port = process.env.PORT || 10000;
app.listen(port, () => {
  console.log(`QuestAI server listening on port ${port}`);
});
