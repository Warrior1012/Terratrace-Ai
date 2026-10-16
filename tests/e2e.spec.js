const { test, expect } = require("@playwright/test");
test("production page does not load test or debug harness", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#debug-panel")).toHaveCount(0);
  const scripts = await page.locator("script[src]").evaluateAll(nodes => nodes.map(n => n.getAttribute("src") || ""));
  expect(scripts.some(src => /tests\/tests\.js|debug\.js/.test(src))).toBe(false);
  await expect(page.getByRole("heading", { name: /Compare satellite observations/i })).toBeVisible();
  await expect(page.locator('input[name="data-mode"][value="real"]')).toBeChecked();
  const resourceUrls = await page.locator('script[src], link[rel="stylesheet"]').evaluateAll(nodes => nodes.map(n => n.getAttribute("src") || n.getAttribute("href") || ""));
  expect(resourceUrls.every(url => !/^https?:\\/\\//i.test(url))).toBe(true);
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
  });
}
test("sample mode is explicit and clearly labeled", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sample data").check();
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
  expect(output.passed).toBeGreaterThanOrEqual(16);
});

test("sample report and CSV exports download with clear labeling", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Sample data").check();
  await page.getByRole("button", { name: "Compare selected dates" }).click();
  const reportPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export report" }).click();
  const report = await reportPromise;
  expect(report.suggestedFilename()).toBe("terratrace-report.html");
  const csvPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export CSV" }).click();
  const csv = await csvPromise;
  expect(csv.suggestedFilename()).toBe("terratrace-report.csv");
});
