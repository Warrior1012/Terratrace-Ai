const { test, expect } = require("@playwright/test");
const fs = require("node:fs/promises");
test("production page does not load test or debug harness", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#debug-panel")).toHaveCount(0);
  const scripts = await page.locator("script[src]").evaluateAll(nodes => nodes.map(n => n.getAttribute("src") || ""));
  expect(scripts.some(src => /tests\/tests\.js|debug\.js/.test(src))).toBe(false);
  await expect(page.getByRole("heading", { name: /Compare satellite observations/i })).toBeVisible();
  await expect(page.locator('input[name="data-mode"][value="real"]')).toBeChecked();
  const resourceUrls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.getAttribute("src") || n.getAttribute("href") || ""));
  expect(resourceUrls.every(url => !url.startsWith("https://") && !url.startsWith("http://"))).toBe(true);
});
for (const width of [360, 390]) {
  test("mobile layout fits viewport at " + width + "px", async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/");
    const dimensions = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport);
    const toggle = page.getByRole("button", { name: /open navigation/i });
    await toggle.click();
    await expect(page.locator("#site-nav")).toHaveClass(/is-open/);
    await page.getByRole("link", { name: "Analyze", exact: true }).click();
    await expect(page.locator("#site-nav")).not.toHaveClass(/is-open/);
    await expect(page.locator("#breadcrumb")).toHaveText("Analyze");
  });
}
test("sample mode is explicit and clearly labeled", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sample data").check();
  await expect(page.locator(".map-panel")).toBeHidden();
  await page.getByRole("button", { name: "Compare selected dates" }).click();
  await expect(page.getByText(/SAMPLE DATA.*Deterministic demonstration only/i)).toBeVisible();
  await expect(page.getByText(/No real place name, coordinates or satellite scene/i)).toBeVisible();
  await expect(page.getByText(/Yamuna|28°36|77°22/i)).toHaveCount(0);
});
test("failed real-data request shows an error without sample fallback", async ({ page }) => {
  await page.route("https://earth-search.aws.element84.com/**", route => route.abort("failed"));
  await page.goto("/");
  const map = page.locator("#map");
  await page.getByRole("button", { name: "Draw area on map" }).click();
  await page.evaluate(() => { window.TT.appMap.fire("click", { latlng: window.L.latLng(20, 77) }); window.TT.appMap.fire("click", { latlng: window.L.latLng(20.02, 77.02) }); });
  await page.getByRole("button", { name: "Compare selected dates" }).click();
  await expect(page.locator("#results-error")).toContainText(/Earth Search could not be reached/i, { timeout: 15000 });
  await expect(page.getByText(/SAMPLE DATA.*Deterministic demonstration only/i)).toHaveCount(0);
});
test("browser regression suite passes deterministic raster calculations", async ({ page }) => {
  await page.goto("/tests/test.html");
  await expect(page.locator("html")).toHaveAttribute("data-tests", "passed", { timeout: 15000 });
  const output = JSON.parse(await page.locator("#test-output").textContent());
  expect(output.failed).toBe(0);
  expect(output.passed).toBeGreaterThanOrEqual(22);
});

test("sample report and CSV exports download with clear labeling", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sample data").check();
  await page.getByRole("button", { name: "Compare selected dates" }).click();
  const reportPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const report = await reportPromise;
  expect(report.suggestedFilename()).toBe("terratrace-report.html");
  expect(await fs.readFile(await report.path(), "utf8")).toContain("Sample data only");
  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("terratrace-report.csv");
  expect(await fs.readFile(await csv.path(), "utf8")).toContain("Sample data only");
});

test("active navigation and breadcrumb follow scrolling", async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; const section = document.querySelector("#modules"); window.scrollTo(0, section.getBoundingClientRect().top + window.scrollY + 20); window.dispatchEvent(new Event("scroll")); });
  await expect(page.locator('#site-nav a[href="#modules"]')).toHaveClass(/active/, { timeout: 5000 });
  await expect(page.locator("#breadcrumb")).toHaveText("Modules");
});
test("legal page navigation remains visible at mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/terms.html");
  await expect(page.locator(".legal-header .site-nav")).toBeVisible();
  await expect(page.locator('.legal-header .site-nav a[href="privacy.html"]')).toBeVisible();
});

test("live Sentinel-2 scenes and COG windows produce a measured comparison", async ({ page }) => {
  test.setTimeout(120000);
  await page.goto("/");
  await page.getByLabel("Study area name").fill("Live data smoke test");
  await page.getByLabel("Earlier date").fill("2024-10-10");
  await page.getByLabel("Later date").fill("2025-10-10");
  await page.getByRole("button", { name: "Draw area on map" }).click();
  await page.evaluate(() => {
    window.TT.appMap.fire("click", { latlng: window.L.latLng(28.58, 77.32) });
    window.TT.appMap.fire("click", { latlng: window.L.latLng(28.60, 77.34) });
  });
  await page.getByRole("button", { name: "Compare selected dates" }).click();
  await expect.poll(async () => {
    const failed = await page.locator("#results-error").isVisible();
    const complete = await page.locator("#scene-details").isVisible();
    return failed || complete;
  }, { timeout: 110000 }).toBe(true);
  const liveError = await page.locator("#results-error").textContent();
  if (liveError) console.log("LIVE_DATA_ERROR: " + liveError);
  await expect(page.locator("#results-error")).toBeHidden();
  await expect(page.locator("#scene-details")).toBeVisible();
  await expect(page.locator("#scene-details")).toContainText("Cloud cover");
  await expect(page.locator("#class-results")).toContainText("NDVI");
  await expect(page.locator("#export-report")).toBeEnabled();
});
