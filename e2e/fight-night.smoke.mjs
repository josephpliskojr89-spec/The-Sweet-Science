/*
  Fight-night smoke — a self-cornered bout due today: the takeover button
  replaces the advance controls, the fight plays live round by round with
  corner decisions, and settling fans every consequence into the save.
*/
import { join } from 'node:path';
import { loadChromium, pageWithSave, readSave, fixture, must, ok, TMP } from './support.mjs';

const chromium = await loadChromium();
const browser = await chromium.launch();
try {
  const page = await pageWithSave(browser, fixture('fight-tonight.json'));

  const fightBtn = page.getByRole('button', { name: /FIGHT NIGHT/i });
  must(await fightBtn.isVisible(), 'FIGHT NIGHT takeover present');
  must(
    !(await page.getByRole('button', { name: 'Advance Day' }).isVisible().catch(() => false)),
    'advance buttons replaced',
  );

  await fightBtn.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(TMP, 'fight-tape.png') });
  await page.getByRole('button', { name: /FIRST BELL/i }).click();
  await page.waitForTimeout(200);

  let guard = 0;
  while (guard++ < 12) {
    if (await page.getByRole('button', { name: /SETTLE UP/i }).isVisible().catch(() => false)) break;
    const press = page.getByRole('radio', { name: /PRESS HIM/i });
    if (await press.isVisible().catch(() => false)) await press.click();
    const cut = page.getByRole('radio', { name: /WORK THE CUT/i });
    if (await cut.isVisible().catch(() => false)) await cut.click();
    const send = page.getByRole('button', { name: /SEND HIM OUT/i });
    if (!(await send.isVisible().catch(() => false))) break;
    await send.click();
    await page.waitForTimeout(100);
  }
  await page.screenshot({ path: join(TMP, 'fight-end.png') });
  const verdict = await page.locator('.fnight__verdict').textContent();
  ok('fight ended', verdict?.trim());

  await page.getByRole('button', { name: /SETTLE UP/i }).click();
  await page.waitForTimeout(400);

  const after = await readSave(page);
  const man = after.roster[0];
  must(after.bookedFights.length === 0, 'bout off the book');
  must(man.bouts.length === 1, 'bout on the record');
  must(after.money === 850, `purse paid (money=${after.money})`);
  must(after.recentFights.length === 1, 'fight report kept');
  must(man.restUntil > after.dayCount, 'rest window set');
  must(
    await page.getByRole('button', { name: 'Advance Day' }).isVisible(),
    'clock released after settling',
  );

  console.log('FIGHT-NIGHT SMOKE PASSED');
} finally {
  await browser.close();
}
