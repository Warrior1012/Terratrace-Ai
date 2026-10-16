# TerraTrace

**From satellite changes to climate decisions.**

TerraTrace is a mobile-first, static web prototype for exploring climate-related signals from satellite-style observations. This prototype uses **synthetic demo data only**. It does not download or analyze real satellite imagery and must not be used for operational, environmental, financial, or safety decisions.

## Prototype modules

- **ClimateWatch** — illustrative vegetation and land-surface change signals.
- **AquaCycle** — illustrative surface-water and rainfall context.
- **SolarScope** — preliminary solar-siting screening concept, not an engineering assessment.
- **ClimateRisk** — illustrative exposure indicators and uncertainty.

## Important interpretation limits

- Surface water is not the same as groundwater availability or water quality.
- Land-surface temperature (LST) is not air temperature.
- Satellite imagery or a local change signal alone does not prove global warming or establish causation.
- SolarScope is screening-only and is not a substitute for a site survey, grid study, or professional engineering assessment.
- Any AI-generated hypothesis must remain clearly separate from observed/simulated measurements.

## Run locally

Open `index.html` in a modern browser, or serve this folder with any static HTTP server. No build step, backend, API key, or package installation is required. Leaflet and Chart.js are loaded from pinned CDN versions when internet access is available; graceful fallbacks should be used where possible.

## Stage 1 status

- Responsive mobile-first workspace shell and navigation added.
- Four module cards and sample analysis setup form added.
- Synthetic-data disclosure, keyboard focus styles, skip link, and reduced-motion handling added.
- `?debug=1` opens diagnostics; `?test=1` runs the starter test harness.
- Analysis button currently prepares a local demo workspace only; pipeline and results arrive in later stages.

## GitHub Pages

In the repository, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/ (root)`, then save. After GitHub finishes publishing, the site should be available at `https://warrior1012.github.io/Terratrace-Ai/` (GitHub Pages may take a few minutes). This link is a predicted URL until Pages is enabled and verified.

## Quality and roadmap

- [ ] Stage 0 — repository setup and project conventions
- [x] Stage 1 — responsive shell, design system, debug panel, test harness
- [ ] Stage 2 — deterministic synthetic data, indices, change detection
- [ ] Stage 3 — analysis layer and uncertainty handling
- [ ] Stage 4 — interactive analysis workflow
- [ ] Stage 5 — result maps and charts
- [ ] Stage 6 — module-specific views
- [ ] Stage 7 — downloadable report
- [ ] Stage 8 — About view, accessibility, security, and polish
- [ ] Stage 9 — independent QA and regression audit

Each stage should update this checklist, `CHANGELOG.md`, and tests. Do not mark a stage complete until its implementation and checks have been reviewed.

## Team

TerraTrace Team: Akriti Verma, Sonali Kumari, Tanishq Agarwal, Aditya Raj.

## License

MIT. See `LICENSE`.