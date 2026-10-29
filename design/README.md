# Personal profile design

## Direction

A personal **AI Engineer** introduction inspired by the user's supplied README: expressive cyan/violet waves, an animated typing introduction, animated Python/Docker icons, colorful technology rows, GitHub statistics and social badges. No project showcases, repository lists, degree/status wording, fabricated credentials, or static studio/portfolio banner.

- Palette: cyan `#38BDF8`, violet `#A78BFA`, indigo `#6366F1`, dark card `#1A1B27`, white header text.
- Hierarchy: name and AI Engineer role → typing animation/social links → personal introduction/interests → toolkit → GitHub pulse → existing certifications/training → invitation to connect.
- Motion: SVG typing and animated technology icons, following the supplied reference. Picture sources replace animated elements for reduced-motion preferences where supported.
- Content: AI Engineer identity, established interests and tools, competitive-programming background, existing contact details and certifications. No employer, seniority, publication count, follower count, or experience years are invented.
- GitHub compatibility: native Markdown/HTML and image widgets only; no inline page scripts, styles, or JavaScript dependencies in the README.

The previous custom banner, pipeline animation, fonts, project lists, and generation scripts have been removed. Node dependencies are development-only preview checks.

## Preview checks

```bash
npm ci
# If Chrome is unavailable: npx playwright install chromium
npm run verify
```

The checker uses GitHub's Markdown API via authenticated `gh`, loads every widget in Chromium, checks image decoding and alt text, confirms reduced-motion image selection, rejects portfolio links/academic-status wording, and captures desktop/tablet/mobile light and dark screenshots under ignored `.preview/`. Set `CHROME_PATH` for an alternative Chromium executable.

Screenshots are local previews of GitHub-rendered Markdown, not proof of the live profile changing. Changes remain on the review PR until the owner authorizes merging. The separate account biography is outside this change.

## Widget sources and limits

- [Capsule Render](https://github.com/kyechan99/capsule-render): wave header/footer.
- [Readme Typing SVG](https://github.com/DenverCoder1/readme-typing-svg): typing animation.
- [Tech Stack Generator](https://techstack-generator.vercel.app/): animated Python and Docker icons.
- [Skill Icons](https://skillicons.dev/) and [Go Skill Icons](https://github.com/LelouchFR/skill-icons): technology rows.
- [Shields.io](https://shields.io/): social/technology badges.
- [GitHub Profile Summary Cards](https://github.com/vn7n24fzkq/github-profile-summary-cards) and [GitHub Readme Streak Stats](https://github.com/DenverCoder1/github-readme-streak-stats): dynamic statistics, not hard-coded achievements.

These are external services; their availability, cache freshness and animation behavior through GitHub's image proxy are not guaranteed. The commonly used public GitHub Readme Stats endpoint returned 503 and Activity Graph returned 402 during research, so neither is embedded. No scheduled workflows, tracking counters, or third-party GitHub tokens are added.
