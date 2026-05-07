const express = require('express');
const path = require('path');
const handler = require('./api/generate.js');

const app = express();
app.use(express.json({ limit: '2mb' }));

// Mount the existing serverless handler for POST /api/generate
app.post('/api/generate', (req, res) => {
  return handler(req, res);
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
