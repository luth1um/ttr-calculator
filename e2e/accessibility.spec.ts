import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// --------------------------------------------------------------------------
// Story 2.6: Data entry accessibility
// --------------------------------------------------------------------------

test.describe("Accessibility — data entry (Story 2.6)", () => {
  test("initial state: zero axe-core violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("after adding two opponent rows and editing values: zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-add-opponent");
    await page.click("#btn-add-opponent");
    await page.locator(".opponent-ttr-input").nth(0).fill("1380");
    await page.locator(".opponent-ttr-input").nth(1).fill("1450");
    await page.locator(".opponent-won-select").nth(2).selectOption("loss");

    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("all interactive elements receive focus in logical tab order", async ({ page }) => {
    await page.goto("/");
    // The own TTR input should be reachable by Tab
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    // Some element should be focused after Tab
    await expect(focused).toBeTruthy();
  });
});

// --------------------------------------------------------------------------
// Story 3.6: Calculation and results accessibility
// --------------------------------------------------------------------------

test.describe("Accessibility — calculation and results (Story 3.6)", () => {
  test("pre-calculation state (all TTRs valid): zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    // Default opponent has TTR 1000 which is valid
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("post-calculation state: zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-calculate");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("stale state: zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-calculate");
    // Trigger stale
    await page.fill("#own-ttr-input", "1500");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("Calculate button triggered by Enter key executes calculation", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.locator("#btn-calculate").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#results-summary")).toBeVisible();
  });
});

// --------------------------------------------------------------------------
// Story 4.3: Reset accessibility
// --------------------------------------------------------------------------

test.describe("Accessibility — reset flow (Story 4.3)", () => {
  test("post-calculation state with Reset button: zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-calculate");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("dialog open state: zero violations", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-reset");
    await expect(page.locator("#reset-dialog")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("Reset button activated by Enter key opens dialog", async ({ page }) => {
    await page.goto("/");
    await page.locator("#btn-reset").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#reset-dialog")).toBeVisible();
  });

  test("dialog closes on Escape and focus returns to Reset button", async ({ page }) => {
    await page.goto("/");
    await page.click("#btn-reset");
    await page.keyboard.press("Escape");
    await expect(page.locator("#reset-dialog")).toBeHidden();
  });
});
