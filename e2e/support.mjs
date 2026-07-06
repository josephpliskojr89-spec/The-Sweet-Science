/* Shared plumbing for the browser smokes. */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const E2E_DIR = dirname(fileURLToPath(import.meta.url));
export const TMP = join(E2E_DIR, '.tmp');
export const BASE_URL = `http://localhost:${process.env.E2E_PORT ?? '5199'}`;
export const SAVE_KEY = 'sweet-science:save:v1';

export function fixture(name) {
  return readFileSync(join(TMP, name), 'utf8');
}

/** Playwright may be a local dep or a global install (PLAYWRIGHT_HOME from
    `npm root -g`, set by run.mjs). */
export async function loadChromium() {
  try {
    return (await import('playwright')).chromium;
  } catch {
    const home = process.env.PLAYWRIGHT_HOME;
    if (!home) throw new Error('playwright not found — install it or set PLAYWRIGHT_HOME');
    return (await import(join(home, 'playwright/index.mjs'))).chromium;
  }
}

/** Boot a page with a save injected before the app reads storage. */
export async function pageWithSave(browser, saveJson) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.error('PAGE ERROR:', e.message));
  await page.goto(BASE_URL);
  await page.evaluate(
    ([k, s]) => localStorage.setItem(k, s),
    [SAVE_KEY, saveJson],
  );
  await page.reload();
  await page.getByText(/continue/i).first().click();
  await page.waitForTimeout(400);
  return page;
}

export async function readSave(page) {
  return JSON.parse(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY));
}

export function ok(label, detail = '') {
  console.log(`OK: ${label}${detail ? ` — ${detail}` : ''}`);
}

export function must(cond, label) {
  if (!cond) throw new Error(`FAILED: ${label}`);
  ok(label);
}
