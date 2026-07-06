/*
  Booking smoke — an offer on the office phone: BOOK IT, mark the corner
  WORK IT MYSELF, and the clock stops ON fight day (never past it).
*/
import { join } from 'node:path';
import { loadChromium, pageWithSave, readSave, fixture, must, ok, TMP } from './support.mjs';

const chromium = await loadChromium();
const browser = await chromium.launch();
try {
  const page = await pageWithSave(browser, fixture('open-offer.json'));

  await page.getByRole('button', { name: /Office —/i }).click();
  await page.waitForTimeout(400);
  const phone = page.getByRole('button', { name: /The phone/i });
  ok('phone label', await phone.getAttribute('aria-label'));
  await phone.click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(TMP, 'phone-offer.png') });

  await page.getByRole('button', { name: 'BOOK IT' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('radio', { name: /WORK IT MYSELF/i }).click();
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(TMP, 'phone-booked.png') });

  await page.keyboard.press('Escape'); // put the phone down
  await page.keyboard.press('Escape'); // leave the office
  await page.waitForTimeout(300);

  await page.getByRole('button', { name: 'Advance Week' }).click();
  await page.waitForTimeout(600);
  let save = await readSave(page);
  must(save.dayCount === 7, `plain first week (day=${save.dayCount})`);

  await page.getByRole('button', { name: 'Advance Week' }).click();
  await page.waitForTimeout(600);
  save = await readSave(page);
  must(save.dayCount === 12, `clock clamped to fight day (day=${save.dayCount})`);
  must(
    await page.getByRole('button', { name: /FIGHT NIGHT/i }).isVisible(),
    'FIGHT NIGHT takeover on fight day',
  );

  console.log('BOOKING SMOKE PASSED');
} finally {
  await browser.close();
}
