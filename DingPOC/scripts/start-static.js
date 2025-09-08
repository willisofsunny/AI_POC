#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const LOG_DIR = path.join(ROOT, 'logs');
const BACKEND_DIR = path.join(ROOT, 'backend');
const STATIC_SCRIPT = path.join(ROOT, 'scripts', 'static-server.js');

const BACKEND_LOG = path.join(LOG_DIR, 'backend.spawn.log');
const BACKEND_PID = path.join(LOG_DIR, 'backend.spawn.pid');
const STATIC_LOG = path.join(LOG_DIR, 'static.spawn.log');
const STATIC_PID = path.join(LOG_DIR, 'static.spawn.pid');

const BACKEND_HEALTH = 'http://localhost:8000/health';
const STATIC_ROOT = 'http://localhost:5500/';

function ensureLogsDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      const { statusCode } = res;
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => resolve({ statusCode, body: raw }));
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy(new Error('timeout'));
    });
  });
}

async function waitFor(url, predicate, timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpGet(url);
      if (predicate(res)) return true;
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function ensureBackendRunning() {
  const ok = await waitFor(BACKEND_HEALTH, (r) => r.statusCode === 200 && /"status"\s*:\s*"ok"/.test(r.body), 1000);
  if (ok) {
    console.log('✅ Backend already running at http://localhost:8000');
    return;
  }

  ensureLogsDir();
  console.log('🚀 Starting backend...');
  const out = fs.openSync(BACKEND_LOG, 'a');
  const err = fs.openSync(BACKEND_LOG, 'a');

  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['start'], {
    cwd: BACKEND_DIR,
    detached: true,
    stdio: ['ignore', out, err],
    env: { ...process.env, NODE_ENV: 'development', BACKEND_PORT: '8000' },
  });

  fs.writeFileSync(BACKEND_PID, String(child.pid));
  child.unref();

  const healthy = await waitFor(BACKEND_HEALTH, (r) => r.statusCode === 200 && /"status"\s*:\s*"ok"/.test(r.body), 20000);
  if (!healthy) {
    console.error('❌ Backend failed to become healthy in time. Check logs:', BACKEND_LOG);
    process.exitCode = 1;
  } else {
    console.log('✅ Backend is healthy: http://localhost:8000/health');
  }
}

async function startStaticServer() {
  ensureLogsDir();
  console.log('📄 Starting static server (port 5500)...');
  const out = fs.openSync(STATIC_LOG, 'a');
  const err = fs.openSync(STATIC_LOG, 'a');

  const child = spawn(process.execPath, [STATIC_SCRIPT], {
    cwd: ROOT,
    detached: true,
    stdio: ['ignore', out, err],
    env: { ...process.env, STATIC_PORT: '5500' },
  });
  fs.writeFileSync(STATIC_PID, String(child.pid));
  child.unref();

  const ok = await waitFor(STATIC_ROOT, (r) => r.statusCode === 200, 10000);
  if (!ok) {
    console.error('❌ Static server did not respond in time. Check logs:', STATIC_LOG);
    process.exitCode = 1;
  } else {
    console.log('✅ Static server is ready at', STATIC_ROOT);
  }
}

function openInBrowser(url) {
  console.log('🌐 Opening:', url);
  const platform = process.platform;
  const openCmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  const args = [url];

  try {
    const child = spawn(openCmd, args, {
      detached: true,
      stdio: 'ignore',
      shell: platform === 'win32',
    });
    child.unref();
  } catch (_) {
    console.log('⚠️ Failed to auto-open browser. Please open manually:', url);
  }
}

(async function main() {
  try {
    await ensureBackendRunning();
    await startStaticServer();
    openInBrowser(STATIC_ROOT + 'index.html');
  } catch (e) {
    console.error('💥 Start static error:', e.message);
    process.exit(1);
  }
})();

