# Microduck Field Guide

A source-checked, single-page guide to **Microduck**, the $399 biped from Pollen Robotics / Hugging Face:
why it is in the news (GTC Berlin, 21 Oct 2026), what it actually is, exactly how open it is, a five-level
learning path, four build routes, and an India budget calculator with every assumption exposed.

Evidence cutoff: **24 Oct 2026**. Prices are indicative; verify before ordering.

## Stack

Plain HTML, CSS and vanilla JavaScript. No build step, no framework, no backend.

- `index.html` – all content and the section structure
- `styles.css` – editorial paper/ink theme, light and dark, one accent
- `app.js` – theme toggle, section tracking, budget calculator (`ROUTES`), resource catalogue (`RES`)
- `favicon.svg`

## Run locally

Any static server works:

```
npx serve .
# or
python -m http.server 8000
```

## Deploy

GitHub Pages via `.github/workflows/pages.yml` (uploads the whole folder, no build). Enable Pages with
source **GitHub Actions** in the repository settings, then push to `main`.

## Updating

- Prices and the exchange-rate default live in `app.js` (`ROUTES`, and the `#rate` input default in `index.html`).
- New resources go into the `RES` array in `app.js` with a group key from `GROUPS`.
- Keep the honesty labels: `fact` (maker or primary source), `inferred` (community evidence), `estimate`, `uncertain`.

## Not affiliated

Independent guide. Not affiliated with, endorsed by or sponsored by Pollen Robotics, Hugging Face or NVIDIA.
Microduck is a product of Pollen Robotics. Linked projects belong to their authors under their own licences.

Code: MIT. Text © Sudish Kumar.
