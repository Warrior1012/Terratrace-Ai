const { test, expect } = require("@playwright/test");
test("fixed raster calculation suite passes in Chromium", async ({ page }) => {
  await page.goto("/tests/test.html");
  await expect(page.locator("html")).toHaveAttribute("data-tests", "passed", { timeout: 15000 });
  const result = JSON.parse(await page.locator("#test-output").textContent());
  expect(result.failed).toBe(0);
  expect(result.passed).toBeGreaterThanOrEqual(16);
});
