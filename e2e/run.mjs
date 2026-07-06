/*
  e2e runner: build fixtures → boot vite → drive the smokes → tear down.
  Usage: npm run e2e   (E2E_PORT to override the port)
*/
import { spawn, execSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const E2E = dirname(fileURLToPath(import.meta.url));
const ROOT = join(E2E, '..');
const PORT = process.env.E2E_PORT ?? '5199';
const BASE = `http://localhost:${PORT}`;

const sh = (cmd, env = {}) =>
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: { ...process.env, ...env } });

// 1. fixtures
sh('npx vitest run e2e/fixtures.gen.test.ts', { E2E_FIXTURES: '1' });

// 2. dev server
const vite = spawn('npx', ['vite', '--port', PORT, '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
  detached: true,
});
const ready = async () => {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((res) => setTimeout(res, 500));
  }
  throw new Error(`vite never came up on ${BASE}`);
};

// playwright may be a global install
let playwrightHome = '';
try {
  playwrightHome = execSync('npm root -g', { encoding: 'utf8' }).trim();
} catch {
  /* fine — smokes will try the local dep */
}

let failed = false;
try {
  await ready();
  for (const smoke of ['fight-night.smoke.mjs', 'booking.smoke.mjs']) {
    console.log(`\n=== ${smoke} ===`);
    try {
      sh(`node e2e/${smoke}`, { E2E_PORT: PORT, PLAYWRIGHT_HOME: playwrightHome });
    } catch {
      failed = true;
    }
  }
} finally {
  try {
    process.kill(-vite.pid);
  } catch {
    vite.kill();
  }
}

if (failed) {
  console.error('\ne2e: FAILED');
  process.exit(1);
}
console.log('\ne2e: ALL SMOKES PASSED');
