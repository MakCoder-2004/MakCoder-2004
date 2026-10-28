# Profile artwork

## Direction

A personal AI engineering studio, grounded in Makrious's public work: research retrieval, guarded SQL, local-first applications, and developer tooling. The memorable element is a custom source-to-answer diagram, not borrowed credentials, vanity counters, or a generic terminal.

- Palette: midnight `#111A30`, panel `#192640`, periwinkle `#A6B1FF`, ice `#F1F4FF`, muted blue `#B5C2DA`, peach `#FFBDAD`.
- Type: locally bundled **Space Grotesk** for display and **Manrope** for body. Both are SIL Open Font License; see `fonts/`.
- Layout: left-aligned name/headline; a bespoke evidence-to-answer composition on the right; ordinary Markdown for readable project descriptions and links.
- Motion: one short, finite pipeline sequence, exported from HTML/CSS screenshots; reduced-motion image sources and a static fallback. No external animation service, scheduled workflow, or tracking pixel.
- Review: rejected the skill search's scroll storytelling and brutalism recommendation because a GitHub README cannot support those interactions. Retained its typography/hierarchy guidance; the actual implementation is GitHub-safe Markdown and raster artwork.

```text
┌─────────────────────────────────────────────────────────────┐
│ Makrious Ayman                  sources                      │
│ AI that works                     ╲                         │
│ beyond the demo.                 retrieval ── cited answer    │
│ AI / ML & software engineering                               │
└─────────────────────────────────────────────────────────────┘
      contact links · concise introduction
      short animated source → retrieve → validate → deliver flow
      selected projects with descriptive links
      engineering principles · tools · practical resources
      training & certifications · invitation to connect
```

## Rebuild

Node.js 22+, Python 3 with Pillow, and Chrome (or Playwright Chromium) are required.

```bash
npm ci
# Only if Chrome is not installed:
# npx playwright install chromium
npm run artwork
npm run verify
```

`design/render.mjs` captures real HTML/CSS into `assets/hero.png`, `assets/hero-mobile.png`, and pipeline frames. `design/encode.py` makes the GIF from those screenshots. Fonts are bundled so artwork builds do not depend on Google Fonts being online. Set `CHROME_PATH` to use another Chromium executable.

`npm run verify` uses GitHub's Markdown API through the authenticated `gh` CLI, validates local assets and public project links, and captures desktop dark/light and mobile README previews under ignored `.preview/`. The preview approximates the surrounding GitHub page; it is not a screenshot of a published profile. No profile settings or remote branches are changed by these scripts.

## Research & references

- User-supplied Ashish Patel profile: clear role, featured work, grouped technology and contact links; no copied achievements or biography.
- [GitHub profile documentation](https://docs.github.com/en/account-and-profile/concepts/personal-profile): repository-backed profile README.
- [svg-readme](https://github.com/Wenoxxxx/svg-readme): custom, locally owned banner composition instead of remote widget overload.
- [RyMe](https://ryme.md/): editorial animated banner direction; search result only, full page could not be retrieved.
- [MDN reduced motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion): static alternatives to nonessential motion.
- Local `frontend-design` and `ui-ux-pro-max` skills: deliberate palette/type, contrast, mobile review, restrained animation, meaningful alt text.

Public project READMEs and the existing profile README supplied the factual content. The account biography is intentionally outside this change.

## Validation

- `npm run artwork`: passed; 2× desktop/mobile PNGs and a 40-frame, ~36 KB finite GIF generated from browser screenshots.
- `npm run verify`: passed; GitHub's Markdown API preserved the mobile/reduced-motion picture sources; all 10 linked project repositories are public; all images decoded; alt text is present; certification disclosure opens.
- Reviewed desktop light/dark (1280px), tablet dark (768px), and mobile light/dark (375px) screenshots. No horizontal page overflow. Replaced the initial three-column project table with native headings and prose after mobile review.
- `npm audit`: zero reported vulnerabilities. `git diff --check` and Node syntax checks passed.
- Screenshots are **local previews of GitHub-rendered Markdown**, not proof of a published live profile. Your account biography is unchanged, so its existing academic-status wording will remain until separately edited.
