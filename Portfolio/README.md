# KYLE — Personalized Portfolio Website

A dark purple / deep-blue portfolio built around sequence-driven motion and a clean systems-development identity. The visual direction takes inspiration from Podium, Lenis, Rive, Recent, Watermelon UI, and Motion Primitives without copying their layouts or proprietary code.

## What is already personalized

- Kyle profile photo in `assets/kyle-profile.png`
- Email: `kylebenedict25@gmail.com`
- Phone: `+63459808903`
- Location direction: Mindanao, Philippines
- Flagship systems:
  - `https://pgmo-ojt.vercel.app`
  - `https://pgmo-admin.vercel.app`
  - `https://jo-servicerecord.vercel.app`
- Custom animated Philippines location card with Mindanao marker
- Custom UI mockups for the three deployed systems
- Personal profile, process, capabilities, and contact sections

## Run it

Open `index.html` with VS Code Live Server (recommended) or any static web server.

No npm install is required. The site loads:
- GSAP + ScrollTrigger from CDN
- Lenis from CDN
- Google Fonts from CDN

The Philippines map also attempts to load open GeoJSON map data at runtime from the MIT-licensed `faeldon/philippines-json-maps` repository. A built-in stylized SVG fallback remains visible if that request is unavailable.

## Main files

- `index.html` — personalized portfolio content, map markup, system cards
- `styles.css` — dark theme, responsive layout, UI artwork, map styling
- `script.js` — loader, scroll sequences, map renderer, pointer effects
- `assets/kyle-profile.png` — supplied profile photo

## Animation architecture

1. Loader progress sequence
2. Header + hero typography reveal
3. Philippines map line-draw and Mindanao pulse
4. Lenis smooth scroll synchronized with ScrollTrigger
5. Section text-line entrances
6. Project-card reveal sequences
7. Capability + process cascades
8. Principle scene transition
9. Contact depth sequence
10. Cursor, magnetic links, project tilt, and map parallax

## Replacing project mockups with real screenshots

The current project visuals are purpose-built interface mockups so the portfolio works without requiring screenshots. To use real screenshots later:

1. Put the screenshots in `assets/`.
2. Replace the visual contents inside the matching `.project-card__visual` in `index.html` with an `<img>`.
3. Add `width: 100%; height: 100%; object-fit: cover;` to the screenshot class in `styles.css`.

## Main customization points

### Palette

Edit the variables at the top of `styles.css`:

```css
--bg: #070611;
--purple: #8a5cff;
--violet: #5f3ce4;
--blue: #3b82f6;
--cyan: #53d6ff;
```

### Mindanao map location

In `script.js`, find:

```js
const mindanaoPoint = [124.65, 8.48];
```

These are longitude/latitude coordinates used for the pulsing location marker. Change them if you want the marker centered on another city in Mindanao.

### Motion tuning

In `script.js`, the useful controls are:
- `stagger` — sequence timing between elements
- `duration` — animation length
- `start` — ScrollTrigger entry position
- `scrub` — scroll-following intensity

## Notes

- Responsive on desktop, tablet, and mobile.
- Supports `prefers-reduced-motion`.
- Includes a graceful fallback if animation CDNs fail.
- External project links open in a new tab with `noopener noreferrer`.


## Profile portrait

The redesigned Profile section uses `assets/kyle-professional.png`, the wide professional portrait created for the portfolio. The image is intentionally composed with negative space on the left so the profile introduction can sit cleanly beside the portrait.

## August 2026 viewport/profile update
- The hero is now tuned to fit a normal laptop/browser viewport instead of relying on an ultrawide layout.
- Kyle's supplied headshot is stored at `assets/kyle-headshot.png` and is used in both the hero identity block and the Profile section.
- The hero identity photo is intentionally larger for readability.
- The Profile scene uses a clean split layout so the portrait stays large, sharp, and easy to see without stretching the square source image.

## Final browser-fit pass
- Full-width browser composition with responsive inner gutters (no centered max-width frame).
- Selected Digital Systems hero uses `assets/kyle-headshot.png` (resume headshot).
- `00 — Profile` uses `assets/kyle-professional.png` (generated editorial portrait).
- Added a personal Principles section around clarity, understanding the problem, real-world usefulness, and adaptability.

## Flagship systems screenshot update

The three flagship cards now use Kyle's real screenshots instead of interface mockups:

- `assets/interntrack-student.png` → `https://pgmo-ojt.vercel.app`
- `assets/interntrack-admin.png` → `https://pgmo-admin.vercel.app`
- `assets/job-order-service-record.png` → `https://jo-servicerecord.vercel.app`

Both the screenshot and the URL call-to-action are clickable. The project visuals preserve the screenshots' wide aspect ratio so the interfaces stay readable.

## Hero reliability update

`KYLE / BUILDS.` and the Philippines map are visible by default in CSS. The entrance sequence is now progressive enhancement: once the loader finishes, a `hero-ready` class triggers the title, supporting text, map, and contact choreography. If GSAP or another CDN fails, the hero remains visible instead of getting stuck off-screen.


## Latest motion / project presentation update

- `KYLE / BUILDS.` starts concealed again and is revealed only after the intro loader.
- The three real deployed-system screenshots remain original image assets.
- Their 3D appearance is produced in the website with CSS perspective, depth layers, reflective highlights, shadow, and GSAP pointer tilt.
- No replacement or AI-generated system screenshots are used.

## Latest motion + project showcase pass

- InternTrack Admin now uses the newer supplied PGMO Admin login screenshot.
- Loader, header, KYLE / BUILDS, hero details, and map run in one continuous GSAP timeline to avoid a refresh-like handoff.
- Top navigation now reveals as part of the intro sequence.
- Flagship screenshots remain the real system screenshots, but are presented inside cinematic browser/display frames with depth, purple ambient lighting, subtle tint, and pointer-follow perspective.
