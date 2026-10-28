import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { launchBrowser } from './browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, 'assets'), { recursive: true });
await mkdir(path.join(root, '.frames'), { recursive: true });
const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(root, 'design/artwork.html')).href);
  await page.evaluate(() => document.fonts.ready);
  assert(await page.evaluate(() => document.fonts.check('600 66px Space') && document.fonts.check('500 16px Manrope')));
  await page.locator('.hero').screenshot({ path: path.join(root, 'assets/hero.png') });
  await page.locator('.pipeline').screenshot({ path: path.join(root, 'assets/pipeline.png') });
  await page.goto(`${pathToFileURL(path.join(root, 'design/artwork.html')).href}?mobile`);
  await page.evaluate(() => document.fonts.ready);
  await page.locator('.hero').screenshot({ path: path.join(root, 'assets/hero-mobile.png') });
  await page.locator('.pipeline').screenshot({ path: path.join(root, 'assets/pipeline-mobile.png') });
  await page.goto(pathToFileURL(path.join(root, 'design/artwork.html')).href);
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const issues = await page.locator('.stage').evaluateAll(stages => stages.flatMap(stage =>
    [...stage.querySelectorAll('b,small')].filter(el => el.getBoundingClientRect().bottom > stage.getBoundingClientRect().bottom - 8)
      .map(el => `Pipeline text overflows: ${el.textContent}`)));
  assert.deepEqual(issues, []);
  await page.setViewportSize({ width: 1200, height: 900 });
  // 40 screenshots at 80ms each: one complete, finite 3.2s animation.
  for (let i = 0; i < 40; i++) {
    await page.evaluate(p => window.setFrame(p), i / 39);
    await page.locator('.pipeline').screenshot({ path: path.join(root, `.frames/${String(i).padStart(3, '0')}.png`), scale: 'css' });
  }
  console.log('Captured desktop/mobile heroes, static flow, and 40 HTML/CSS animation frames.');
} finally {
  await browser.close();
}
