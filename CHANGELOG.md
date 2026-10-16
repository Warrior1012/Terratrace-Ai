# Changelog

All notable changes to TerraTrace are documented here.

## Unreleased

- Replaced the sample-only default workflow with a real-data-first Sentinel-2 Level-2A comparison path using Element 84 Earth Search STAC and cloud-optimized GeoTIFF assets.
- Added least-cloudy scene selection near each requested date, scene provenance, NDVI, NDWI, MNDWI and NDBI differences, per-class area estimates, and a Leaflet map with an NDVI overlay.
- Kept deterministic generated values behind an explicit Sample data toggle. Real-data failures now display an error instead of substituting sample values.
- Relabeled template prompts as Rule-based interpretation. No AI model is included.
- Reworked the visual identity to maroon and blush, added inline SVG icons, responsive menu navigation, a current-section breadcrumb, terms and privacy pages, and a separate test page.
- Added a local vendor build for pinned Leaflet and GeoTIFF.js, Playwright browser tests, deterministic fixed-raster tests, Lighthouse automation, and a GitHub Pages workflow.
- Added a brand-asset generator that requires the actual `assets/logo.png`. Generated PNG/ICO assets are not complete until the logo is supplied and the generator is run.
- Browser and Lighthouse results remain pending until the GitHub Actions workflow runs and its artifacts are inspected.

## Earlier prototype

The earlier prototype contained seeded synthetic values, template interpretations, and a non-geographic grid. Those components remain only for the explicit Sample data mode where required. Legacy chart, map, debug, report and module scripts that were no longer used by the new page have been removed.
