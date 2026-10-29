# Personal AI Engineer profile

## Visual direction

A personal introduction, not a project portfolio: **Makrious Ayman / AI Engineer**, animated typing, colorful tools, and GitHub statistics. No repository showcases, student wording, training/certification section, or invented credentials.

The new header replaces the wave banner with a **neural-signal composition**: cyan neurons on the left, violet neurons on the right, and a clear name/role in the center. It has no project illustration, marketing headline, or wave-shaped footer.

- Palette: GitHub charcoal `#0D1117`, signal cyan `#38BDF8`, violet `#A78BFA`, role blue `#7DD3FC`, white `#F0F6FC`.
- Type: Bahnschrift display and Segoe UI role, with sans-serif fallbacks; system fonts are captured into images, not distributed.
- Layout: centered name and role; neural connections flank the text without crossing it. Native Markdown keeps the biography and tools readable on mobile.
- Motion: original HTML/CSS signal animation captured as a 32-frame, 3.2-second GIF (~184 KB). A 2× PNG is selected for reduced motion. Existing typing/Python/Docker widgets retain their reduced-motion alternatives.
- Toolkit: Python/C++/TypeScript/JavaScript; PyTorch/TensorFlow/scikit-learn/OpenCV/Hugging Face; prominent LangChain and LangGraph badges; existing data and application tools.

## Rebuild and verify

Requirements: Node.js, Python with Pillow, and Chrome or Playwright Chromium. No new application framework.

```bash
npm ci
npm run artwork
npm run verify
```

`design/header.html` contains the original HTML/CSS graphic. `render-header.mjs` captures real browser frames and a high-resolution static screenshot; `header-gif.py` encodes the GIF. Source frames live under ignored `.frames/header/`. Set `CHROME_PATH` to use another Chromium browser.

The verifier uses GitHub's Markdown API through authenticated `gh`, loads the image widgets, checks alt text and reduced-motion selection, rejects removed sections/project links, confirms the requested framework names, and captures desktop/tablet/mobile light/dark previews under ignored `.preview/`. These are local previews; the separate GitHub account biography is outside this change. The owner controls merging the review PR.

## External widgets

- [Readme Typing SVG](https://github.com/DenverCoder1/readme-typing-svg): typing introduction.
- [Tech Stack Generator](https://techstack-generator.vercel.app/): animated Python/Docker icons.
- [Skill Icons](https://skillicons.dev/) and [Go Skill Icons](https://github.com/LelouchFR/skill-icons): technology rows.
- [Shields.io](https://shields.io/): social and framework badges.
- [GitHub Profile Summary Cards](https://github.com/vn7n24fzkq/github-profile-summary-cards) and [GitHub Readme Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats): dynamic statistics; streak entrance animation is disabled so numbers remain readable.

External availability/cache freshness is not guaranteed. The public Readme Stats and Activity Graph endpoints were unavailable during research and are not embedded. No scheduled workflows, tracking counters, or third-party GitHub tokens are added.
