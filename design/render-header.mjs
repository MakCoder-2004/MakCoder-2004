import { mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import { launchBrowser } from './browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
await mkdir(path.join(root, 'assets'), { recursive: true });
await mkdir(path.join(root, '.frames/header'), { recursive: true });
const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 960, height: 280 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(path.join(root, 'design/header.html')).href);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('.node').count(), 16);
  assert.equal(await page.locator('.signal').count(), 16);
  const headingFits = await page.locator('h1').evaluate(el => {
    const range = document.createRange(); range.selectNodeContents(el);
    const rect = range.getBoundingClientRect();
    return rect.left >= 195 && rect.right <= 765;
  });
  assert(headingFits, 'Name must stay clear of the neural network');
  await page.evaluate(() => window.setFrame(1200));
  await page.locator('.header').screenshot({ path: path.join(root, 'assets/neural-header.png') });
  for (let i=0; i<32; i++) {
    await page.evaluate(ms => window.setFrame(ms), i*100);
    await page.locator('.header').screenshot({ path: path.join(root, `.frames/header/${String(i).padStart(3,'0')}.png`), scale: 'css' });
  }
  console.log('Captured static 2x neural header and 32 HTML/CSS animation frames.');
} finally { await browser.close(); }
