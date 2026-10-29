import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { launchBrowser } from './browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const markdown = await readFile(path.join(root, 'README.md'), 'utf8');
assert(!/\bstudent\b|Alexandria University|CGPA/i.test(markdown), 'No academic-status wording');
assert(!/https:\/\/github\.com\/MakCoder-2004\/[\w-]+|tab=repositories|Selected work|Featured projects/i.test(markdown), 'No project showcases or repository links');
assert(markdown.includes('AI Engineer'), 'Identity must be AI Engineer');
assert(!/<script\b|<style\b|<[^>]+\sstyle\s*=/i.test(markdown), 'No unsupported README CSS or JavaScript');
const result = spawnSync('gh', ['api', 'markdown', '--input', '-'], {
  input: JSON.stringify({ text: markdown, mode: 'gfm', context: 'MakCoder-2004/MakCoder-2004' }),
  encoding: 'utf8', timeout: 30_000, maxBuffer: 4_000_000,
});
if (result.error) throw result.error;
assert.equal(result.status, 0, result.stderr);
const rendered = result.stdout;
assert.equal((rendered.match(/prefers-reduced-motion: reduce/g) || []).length, 5, 'Preserve all five reduced-motion sources');
const css = await readFile(path.join(root, 'node_modules/github-markdown-css/github-markdown.css'), 'utf8');
await mkdir(path.join(root, '.preview'), { recursive: true });
await writeFile(path.join(root, '.preview/rendered.html'), rendered);
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Makrious — personal README preview</title><style>${css}
body{margin:0;background:var(--bgColor-default);color:var(--fgColor-default)}
.preview-label{max-width:1020px;margin:24px auto 12px;font:12px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--fgColor-muted);padding:0 28px}
.markdown-body{box-sizing:border-box;max-width:1020px;margin:0 auto 32px;padding:28px;border:1px solid var(--borderColor-default);border-radius:6px}
@media(max-width:600px){.markdown-body{border:0;padding:16px;margin:0}.preview-label{margin:12px 0 0;padding:0 16px}}
</style><body class="markdown-body" style="max-width:none;padding:0;border:0"><div class="preview-label">MakCoder-2004 / README.md · Local preview using GitHub-rendered Markdown</div><article class="markdown-body">${rendered}</article></body></html>`;
await writeFile(path.join(root, '.preview/index.html'), html);
const server = createServer((req, res) => {
  if (req.url === '/') res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }).end(html);
  else res.writeHead(404).end();
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await launchBrowser();
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 1100 }, colorScheme: 'dark', reducedMotion: 'no-preference' });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`http://127.0.0.1:${server.address().port}`, { waitUntil: 'networkidle', timeout: 60_000 });
  for (const sample of [
    { name: 'desktop-dark', width: 1280, colorScheme: 'dark', reducedMotion: 'no-preference' },
    { name: 'desktop-light', width: 1280, colorScheme: 'light', reducedMotion: 'reduce' },
    { name: 'tablet-dark', width: 768, colorScheme: 'dark', reducedMotion: 'reduce' },
    { name: 'mobile-dark', width: 375, colorScheme: 'dark', reducedMotion: 'reduce' },
    { name: 'mobile-light', width: 375, colorScheme: 'light', reducedMotion: 'no-preference' },
  ]) {
    await page.setViewportSize({ width: sample.width, height: 1100 });
    await page.emulateMedia({ colorScheme: sample.colorScheme, reducedMotion: sample.reducedMotion });
    await page.waitForFunction(() => [...document.querySelectorAll('article picture')].every(picture => {
      const selected = [...picture.querySelectorAll('source')].find(source => matchMedia(source.media).matches);
      const image = picture.querySelector('img');
      const expected = selected ? new URL(selected.srcset, location.href).href : image.src;
      return image.currentSrc === expected;
    }));
    const images = await page.locator('article img').evaluateAll(async images => {
      await Promise.all(images.map(img => img.decode().catch(() => { throw new Error(`Broken image: ${img.alt} (${img.currentSrc})`); })));
      return images.map(img => ({ alt: img.alt, width: img.naturalWidth }));
    });
    assert(images.length >= 20, 'Profile should include the intended visual widgets');
    assert(images.every(img => img.alt && img.width > 0), 'Images need meaningful alt text and must load');
    assert.deepEqual(errors, [], 'No browser errors');
    const sources = await page.locator('article picture').evaluateAll(pictures => pictures.map(picture => {
      const selected = [...picture.querySelectorAll('source')].find(source => matchMedia(source.media).matches) || picture.querySelector('img');
      return selected.dataset.canonicalSrc || selected.srcset || selected.src;
    }));
    const reduced = sample.reducedMotion === 'reduce';
    assert.equal(sources.length, 5);
    assert(sources[0].includes('text=Makrious%20Ayman') && sources[0].includes('desc=AI%20Engineer'), 'Header source must preserve full URL, including gradient commas');
    // GitHub proxies external src/srcset through camo; inspect canonical URLs.
    if (reduced) {
      assert(!sources[0].includes('animation='), 'Static header for reduced motion');
      assert(sources[1].includes('img.shields.io'), 'Static tagline for reduced motion');
      assert(sources[2].includes('skillicons.dev') && sources[3].includes('skillicons.dev'), 'Static technology icons for reduced motion');
      assert(sources[4].includes('disable_animations=true'), 'Disable streak animation');
    } else {
      assert(!sources[1].includes('img.shields.io'), 'Animated typing selected');
      assert(!sources[2].includes('skillicons.dev') && !sources[3].includes('skillicons.dev'), 'Animated technology icons selected');
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `${sample.name}: no page overflow`);
    // Give SVG entrance animations time to reveal names/statistics before review captures.
    await page.waitForTimeout(3200);
    await page.screenshot({ path: path.join(root, `.preview/${sample.name}.png`), fullPage: true });
    if (sample.name === 'desktop-dark') await page.screenshot({ path: path.join(root, '.preview/overview.png') });
    console.log(`${sample.name}: ${images.length} widgets loaded, alt text present, motion preference respected, no page overflow`);
  }
  console.log('Personal profile requirements and GitHub-sanitized Markdown passed. Previews in .preview/.');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
