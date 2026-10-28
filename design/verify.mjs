import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import assert from 'node:assert/strict';
import { launchBrowser } from './browser.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const markdown = await readFile(path.join(root, 'README.md'), 'utf8');
function gh(args, input) {
  const result = spawnSync('gh', args, { input, encoding: 'utf8', timeout: 30_000, maxBuffer: 4_000_000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, result.stderr);
  return result.stdout;
}
assert(!/\bstudent\b|Alexandria University|CGPA/i.test(markdown), 'Academic status must not appear in profile copy');
assert(!/<script\b|<style\b|<[^>]+\sstyle\s*=/i.test(markdown), 'README must not rely on unsupported page CSS or JS');
for (const name of ['hero.png', 'hero-mobile.png', 'pipeline.png', 'pipeline-mobile.png', 'pipeline.gif']) {
  assert((await stat(path.join(root, 'assets', name))).size < 700_000, `${name} is too large`);
}
const repos = [...new Set([...markdown.matchAll(/https:\/\/github\.com\/MakCoder-2004\/([\w-]+)/g)].map(m => m[1]))];
for (const repo of repos) {
  const info = JSON.parse(gh(['api', `repos/MakCoder-2004/${repo}`]));
  assert.equal(info.private, false, `${repo} must be public`);
}
const rendered = gh(['api', 'markdown', '--input', '-'], JSON.stringify({
  text: markdown, mode: 'gfm', context: 'MakCoder-2004/MakCoder-2004',
}));
assert(rendered.includes('prefers-reduced-motion: reduce'), 'GitHub stripped reduced-motion source');
assert(rendered.includes('max-width: 600px'), 'GitHub stripped mobile source');
const css = await readFile(path.join(root, 'node_modules/github-markdown-css/github-markdown.css'), 'utf8');
await mkdir(path.join(root, '.preview'), { recursive: true });
await writeFile(path.join(root, '.preview/rendered.html'), rendered);
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><base href="../"><title>Makrious — README preview</title><style>${css}
body{margin:0;background:var(--bgColor-default);color:var(--fgColor-default)}
.preview-label{max-width:1020px;margin:24px auto 12px;font:12px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;color:var(--fgColor-muted);padding:0 28px}
.markdown-body{box-sizing:border-box;max-width:1020px;margin:0 auto 32px;padding:28px;border:1px solid var(--borderColor-default);border-radius:6px}
@media(max-width:600px){.markdown-body{border:0;padding:16px;margin:0}.preview-label{margin:12px 0 0;padding:0 16px}}
</style><body class="markdown-body" style="max-width:none;padding:0;border:0"><div class="preview-label">MakCoder-2004 / README.md · Local preview using GitHub-rendered Markdown</div><article class="markdown-body">${rendered}</article></body></html>`;
await writeFile(path.join(root, '.preview/index.html'), html);
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const rel = pathname === '/' ? '.preview/index.html' : pathname.replace(/^\//, '');
    const target = path.resolve(root, rel);
    if (!target.startsWith(`${path.resolve(root)}${path.sep}`)) { res.writeHead(403).end(); return; }
    const type = { '.png': 'image/png', '.gif': 'image/gif', '.html': 'text/html; charset=utf-8' }[path.extname(target)] || 'application/octet-stream';
    const content = await readFile(target);
    res.writeHead(200, { 'content-type': type });
    res.end(content);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await launchBrowser();
try {
  for (const sample of [
    { name: 'desktop-dark', width: 1280, colorScheme: 'dark', reducedMotion: 'no-preference' },
    { name: 'desktop-light', width: 1280, colorScheme: 'light', reducedMotion: 'reduce' },
    { name: 'tablet-dark', width: 768, colorScheme: 'dark', reducedMotion: 'reduce' },
    { name: 'mobile-dark', width: 375, colorScheme: 'dark', reducedMotion: 'reduce' },
    { name: 'mobile-light', width: 375, colorScheme: 'light', reducedMotion: 'reduce' },
  ]) {
    const page = await browser.newPage({ viewport: { width: sample.width, height: 1000 },
      deviceScaleFactor: 1, colorScheme: sample.colorScheme, reducedMotion: sample.reducedMotion });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base, { waitUntil: 'networkidle', timeout: 45_000 });
    await page.locator('article img').evaluateAll(images => Promise.all(images.map(img => img.decode())));
    assert.deepEqual(errors, [], `${sample.name}: browser errors`);
    const missingAlt = await page.locator('article img').evaluateAll(images => images.filter(img => !img.alt).length);
    assert.equal(missingAlt, 0, 'Every image needs meaningful alt text');
    const sources = await page.locator('article picture img').evaluateAll(images => images.map(img => new URL(img.currentSrc).pathname));
    assert.equal(sources[0], sample.width <= 600 ? '/assets/hero-mobile.png' : '/assets/hero.png');
    assert.equal(sources[1], sample.width <= 600 ? '/assets/pipeline-mobile.png' : sample.reducedMotion === 'reduce' ? '/assets/pipeline.png' : '/assets/pipeline.gif');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    assert.equal(overflow, false, `${sample.name}: horizontal page overflow`);
    await page.screenshot({ path: path.join(root, `.preview/${sample.name}.png`), fullPage: true });
    if (sample.name === 'desktop-dark') {
      await page.screenshot({ path: path.join(root, '.preview/overview.png'), fullPage: false });
      await page.locator('summary').click();
      assert.equal(await page.locator('details').getAttribute('open'), '');
      await page.getByText('Deep Learning Specialization', { exact: false }).waitFor({ state: 'visible' });
    }
    console.log(`${sample.name}: images loaded, correct responsive sources, alt text present, no page overflow`);
    await page.close();
  }
  console.log(`Verified ${repos.length} public project links and GitHub-sanitized Markdown. Previews in .preview/.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
