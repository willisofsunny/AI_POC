#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const BACKEND_DIR = path.join(ROOT, 'backend');
const LOG_DIR = path.join(ROOT, 'logs');
const BACKEND_LOG = path.join(LOG_DIR, 'backend.spawn.log');
const BACKEND_PID = path.join(LOG_DIR, 'backend.spawn.pid');
const BACKEND_HEALTH = 'http://localhost:8000/health';
const FRONTEND_FILE = path.join(ROOT, 'index.html');

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

async function waitForHealth(timeoutMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await httpGet(BACKEND_HEALTH);
      if (res.statusCode === 200 && /"status"\s*:\s*"ok"/.test(res.body)) {
        return true;
      }
    } catch (_) {}
    await new Promise((r) => setTimeout(r, 800));
  }
  return false;
}

async function ensureBackendRunning() {
  // Check existing
  const healthy = await waitForHealth(1000);
  if (healthy) {
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

  const ok = await waitForHealth(20000);
  if (!ok) {
    console.error('❌ Backend failed to become healthy within timeout.');
    console.error(`   Check logs: ${BACKEND_LOG}`);
    process.exitCode = 1;
  } else {
    console.log('✅ Backend is healthy: http://localhost:8000/health');
  }
}

function openFileInBrowser(filePath) {
  console.log('🌐 Opening static frontend:', filePath);
  const platform = process.platform;
  const openCmd = platform === 'darwin' ? 'open' : platform === 'win32' ? 'start' : 'xdg-open';
  const args = [filePath];

  try {
    const child = spawn(openCmd, args, {
      detached: true,
      stdio: 'ignore',
      shell: platform === 'win32',
    });
    child.unref();
  } catch (e) {
    console.log('⚠️ Failed to auto-open browser. Please open manually:');
    console.log(filePath);
  }
}

(async function main() {
  try {
    await ensureBackendRunning();
    if (!fs.existsSync(FRONTEND_FILE)) {
      console.error('❌ Frontend file not found:', FRONTEND_FILE);
      process.exit(1);
    }
    openFileInBrowser(FRONTEND_FILE);
  } catch (e) {
    console.error('💥 Start script error:', e.message);
    process.exit(1);
  }
})();

