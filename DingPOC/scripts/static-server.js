#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.STATIC_PORT || 5500;

const app = express();

// Allow local development cross-origin
app.use(cors());

// Prevent caching of HTML
app.use((req, res, next) => {
  if (req.path.endsWith('.html') || req.path === '/' || req.path === '') {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  next();
});

app.use(express.static(ROOT, { extensions: ['html'] }));

app.get('/', (_req, res) => {
  res.sendFile(path.join(ROOT, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`📄 Static server running at http://localhost:${PORT}`);
});

