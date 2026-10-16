# TerraTrace

**From satellite changes to climate decisions.**

TerraTrace is a static, browser-side prototype for comparing Sentinel-2 Level-2A imagery across two dates for a user-selected rectangular area. Real-data mode is the default. A separate Sample data toggle runs a deterministic demonstration and is never used as a fallback when real-data requests fail.

## What is real and what is simulated

### Real-data mode

- Queries the Element 84 Earth Search STAC API at `https://earth-search.aws.element84.com/v1` for Sentinel-2 Level-2A scenes.
- Searches within 15 days of each requested date and chooses the scene with the lowest `eo:cloud_cover` for that date. The actual acquisition date, scene ID and cloud percentage are shown.
- Reads the red (B04), near-infrared (B08), green (B03) and SWIR (B11) cloud-optimized GeoTIFF assets in the browser with GeoTIFF.js.
- Computes NDVI, NDWI, MNDWI and NDBI per pixel and reports mean differences, increase/stable/decrease classes, valid pixel counts, estimated area and share of valid pixels.
- Uses a Leaflet map with OpenStreetMap attribution for drawing a rectangular area and showing a resampled NDVI change overlay.
- Caps the analysis at 100 square kilometres and resamples the selected raster window to a 128 by 128 output grid. A warning appears above 25 square kilometres.
- Uses a suitable COG overview when one intersects the requested area and has enough pixels for the output grid. Bands with different native resolutions are sampled onto a common grid.

Real-data requests depend on public APIs, COG range requests, browser CORS support, scene availability, and network connectivity. A failure produces an error; the app does not silently replace a failed real-data analysis with sample numbers.

### Sample data mode

- Uses deterministic generated values from the local sample generator.
- Shows the label **Sample data** and uses the generic label **Sample site**.
- Does not represent a real location, coordinates, satellite observation, or measured environmental result.
- Is available only when the user explicitly selects Sample data.

### Interpretation labels

There is no AI model or serverless AI proxy in this repository. The interpretation panel is named **Rule-based interpretation** and contains explanatory prompts based on the measured index values. These prompts are not model output and do not establish causes.

## Scientific and operational limitations

- NDVI, NDWI, MNDWI and NDBI are spectral indices. They are not direct measurements of ecosystem health, groundwater, drinking-water quality, air temperature, or climate causation.
- The browser workflow does not use a full Sentinel-2 scene classification mask. Filtering invalid and non-reflectance values is not equivalent to cloud and cloud-shadow masking.
- Seasonal effects, atmospheric conditions, view geometry, mixed pixels, resampling, missing data and differences in acquisition dates can affect the result.
- Area values are estimates based on the projected bounding rectangle and the resampled grid. They are not parcel boundaries or a survey.
- Validate results with independent data and qualified experts before operational, environmental, financial, safety, legal or engineering decisions.
- Solar suitability and climate-risk language is screening context only, not a validated forecast.

## Run and build locally

Requires Node.js 22 or newer and npm. The build step self-hosts the pinned Leaflet and GeoTIFF.js libraries so the production page does not load JavaScript or CSS from a CDN.

```sh
npm install
npm run build:site
python3 -m http.server 4173 --directory dist
```

Open the local server at `http://127.0.0.1:4173/`. The source `index.html` references the self-hosted files generated in `dist/vendor/`, so preview the built site rather than opening the source HTML directly.

## Tests and audits

```sh
npx playwright install chromium
npm run test:e2e
```

The separate test page is `/tests/test.html`. It includes deterministic raster-calculation tests using a fixed in-memory raster fixture. The production page does not load the test harness or a debug panel.

Run Lighthouse after building and serving the site:

```sh
npx lighthouse http://127.0.0.1:4173/ --chrome-flags="--headless --no-sandbox" --only-categories=accessibility,performance --output=json --output-path=./lighthouse-report.json
```

The GitHub Actions quality workflow runs Chromium tests and produces a Lighthouse JSON artifact. Do not treat the workflow as passed until a run has completed successfully and the results have been reviewed. The workflow has not been verified from this editing environment.

## GitHub repository setup

Suggested repository description:

> Compare two Sentinel-2 dates for a selected area with measured spectral-index changes, a map and downloadable reports.

Suggested topics: `earth-observation`, `sentinel-2`, `remote-sensing`, `geospatial`, `climate`, `leaflet`, `static-site`.

To add these in GitHub, open the repository page, select the settings gear beside About, enter the description, add the topics, and save. After the Pages deployment succeeds, set the website URL to the verified published URL. The expected project URL pattern is based on the repository name, but it is not confirmed live yet.

## GitHub Pages deployment

A Pages workflow is included at `.github/workflows/pages.yml`. In GitHub, open **Settings > Pages** and set the build and deployment source to **GitHub Actions**. The workflow builds `dist/` with the pinned local libraries and deploys that folder on pushes to `main`. Confirm the Actions run succeeds and open the URL shown by the deployment before sharing it as live.

The website URL, repository About description/topics and Pages setting cannot be confirmed from this repository code alone.

## Brand assets and launch inputs

- The repository currently does not contain `assets/logo.png`. Add the real TerraTrace globe, satellite and leaf logo at that exact path.
- After adding it, run `npm run assets:brand` to generate `favicon.ico`, a 32 pixel PNG, a 180 pixel Apple touch icon and a 1200 by 630 social image from the supplied logo.
- Until the logo is supplied and the generator is run, the page uses an inline SVG fallback mark. The generated Apple touch and social image files are not present yet.
- Replace the clearly marked TODO contact email in `terms.html` and `privacy.html` before launch.
- Add a custom domain only if you own and intend to configure one.

## Third-party requests

The built page self-hosts Leaflet 1.9.4 and GeoTIFF.js 2.1.3. When used, it also requests public scene metadata from Element 84 Earth Search, Sentinel-2 COG byte ranges from the asset hosts, and OpenStreetMap map tiles. The app does not implement accounts, analytics, or its own tracking cookies. Read `terms.html` and `privacy.html`.

## Design and map library

The interface uses the maroon and blush palette, serif display headings, visible keyboard focus, responsive layouts and reduced-motion support. The geographic map is built with **Leaflet**, not MapLibre GL JS. Update the pitch deck to say Leaflet unless the implementation is deliberately migrated to MapLibre.

## Pricing concept

The About section shows proposed, unvalidated pricing: Pay per analysis at Rs 999 to 4,999 per report, Professional at Rs 9,999 to 29,999 per month, and Enterprise custom. These are concepts, not available paid offers.

## License

MIT. See `LICENSE`.
