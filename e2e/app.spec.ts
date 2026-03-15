import { test, expect } from "@playwright/test";

// All E2E tests use the preview server at the base URL configured in playwright.config.ts

test.describe("Initial state", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders a single opponent row on load", async ({ page }) => {
    const rows = page.locator(".opponent-row");
    await expect(rows).toHaveCount(1);
  });

  test("renders the page heading", async ({ page }) => {
    await expect(page.locator("#app-title")).toBeVisible();
  });

  test("renders disabled calculate button when own TTR is empty", async ({ page }) => {
    await expect(page.locator("#btn-calculate")).toBeDisabled();
  });
});

test.describe("Own TTR input", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("fills own TTR input with saved value from localStorage", async ({ page }) => {
    await page.evaluate(() => localStorage.setItem("ownTtr", "1423"));
    await page.reload();
    await expect(page.locator("#own-ttr-input")).toHaveValue("1423");
  });

  test("enables calculate button when own TTR and opponent TTR are both valid", async ({ page }) => {
    await page.fill("#own-ttr-input", "1423");
    // Opponent row has ttr=1000 by default — calculate should now be enabled
    await expect(page.locator("#btn-calculate")).toBeEnabled();
  });
});

test.describe("Opponent list management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1500");
  });

  test("adds an opponent row", async ({ page }) => {
    await page.click("#btn-add-opponent");
    await expect(page.locator(".opponent-row")).toHaveCount(2);
  });

  test("labels rows sequentially — Opponent 1 and Opponent 2", async ({ page }) => {
    await page.click("#btn-add-opponent");
    const labels = page.locator(".opponent-label");
    await expect(labels.nth(0)).toContainText("1");
    await expect(labels.nth(1)).toContainText("2");
  });

  test("removes middle opponent and relabels remaining row", async ({ page }) => {
    // Add two more opponents → total 3
    await page.click("#btn-add-opponent");
    await page.click("#btn-add-opponent");
    // Delete first row
    await page.locator(".btn-delete-opponent").nth(0).click();
    const rows = page.locator(".opponent-row");
    await expect(rows).toHaveCount(2);
    const labels = page.locator(".opponent-label");
    await expect(labels.nth(0)).toContainText("1");
    await expect(labels.nth(1)).toContainText("2");
  });

  test("delete button is disabled when only one row remains", async ({ page }) => {
    await expect(page.locator(".btn-delete-opponent")).toBeDisabled();
  });

  test("add three opponents then delete the middle one — labels renumber", async ({ page }) => {
    await page.click("#btn-add-opponent");
    await page.click("#btn-add-opponent");
    // Delete row index 1 (middle)
    await page.locator(".btn-delete-opponent").nth(1).click();
    const labels = page.locator(".opponent-label");
    await expect(labels.nth(0)).toContainText("1");
    await expect(labels.nth(1)).toContainText("2");
  });
});

test.describe("Opponent TTR and Win/Loss editing", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1500");
  });

  test("entering a TTR in opponent row keeps calculate enabled", async ({ page }) => {
    await page.locator(".opponent-ttr-input").first().fill("1380");
    await expect(page.locator("#btn-calculate")).toBeEnabled();
  });

  test("clearing TTR input disables calculate button", async ({ page }) => {
    await page.locator(".opponent-ttr-input").first().fill("");
    await expect(page.locator("#btn-calculate")).toBeDisabled();
  });

  test("toggling Win/Loss select to Loss reflects in DOM", async ({ page }) => {
    const select = page.locator(".opponent-won-select").first();
    await select.selectOption("loss");
    await expect(select).toHaveValue("loss");
  });
});

test.describe("Calculation — Journey 1: full happy path", () => {
  test("enter own TTR 1423, add four opponents, calculate — shows results", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");

    // Add 3 more opponents (total 4)
    for (let i = 0; i < 3; i++) {
      await page.click("#btn-add-opponent");
    }

    const ttrInputs = page.locator(".opponent-ttr-input");
    await ttrInputs.nth(0).fill("1380");
    await ttrInputs.nth(1).fill("1450");
    await ttrInputs.nth(2).fill("1200");
    await ttrInputs.nth(3).fill("1600");

    // Toggle opponent 2 to Loss
    await page.locator(".opponent-won-select").nth(1).selectOption("loss");

    await page.click("#btn-calculate");

    await expect(page.locator("#results-summary")).toBeVisible();
    await expect(page.locator("#result-new-ttr")).not.toHaveText("—");
    await expect(page.locator("#result-delta")).not.toHaveText("—");
    await expect(page.locator("#result-expected-wins")).not.toHaveText("—");

    // Win expectations should appear on rows
    const winExpectations = page.locator(".win-expectation");
    for (let i = 0; i < 4; i++) {
      await expect(winExpectations.nth(i)).not.toBeEmpty();
    }
  });
});

test.describe("Stale indicator — Journey 3: what-if flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.locator(".opponent-ttr-input").first().fill("1380");
    await page.click("#btn-calculate");
  });

  test("stale notice appears after toggling Win to Loss", async ({ page }) => {
    await page.locator(".opponent-won-select").first().selectOption("loss");
    await expect(page.locator("#stale-notice")).toBeVisible();
    await expect(page.locator("#results-summary")).toHaveClass(/stale/);
  });

  test("stale notice disappears after recalculating", async ({ page }) => {
    await page.locator(".opponent-won-select").first().selectOption("loss");
    await page.click("#btn-calculate");
    await expect(page.locator("#stale-notice")).toBeHidden();
    await expect(page.locator("#results-summary")).not.toHaveClass(/stale/);
  });

  test("changing own TTR triggers stale indicator", async ({ page }) => {
    await page.fill("#own-ttr-input", "1500");
    await expect(page.locator("#results-summary")).toHaveClass(/stale/);
  });
});

test.describe("In-place recalculation", () => {
  test("recalculate with three opponents updates all values in-place", async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-add-opponent");
    await page.click("#btn-add-opponent");

    const ttrInputs = page.locator(".opponent-ttr-input");
    await ttrInputs.nth(0).fill("1380");
    await ttrInputs.nth(1).fill("1450");
    await ttrInputs.nth(2).fill("1200");

    await page.click("#btn-calculate");

    const originalDelta = await page.locator("#result-delta").textContent();

    // Change first opponent TTR
    await ttrInputs.nth(0).fill("2000");
    await page.click("#btn-calculate");

    const newDelta = await page.locator("#result-delta").textContent();
    // Delta should have changed after recalculation
    expect(newDelta).not.toBe(originalDelta);

    // All inputs still intact
    await expect(ttrInputs.nth(1)).toHaveValue("1450");
    await expect(ttrInputs.nth(2)).toHaveValue("1200");
  });
});

test.describe("Reset flow — Journey 4", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.fill("#own-ttr-input", "1423");
    await page.click("#btn-add-opponent");
    await page.locator(".opponent-ttr-input").first().fill("1380");
    await page.click("#btn-calculate");
  });

  test("cancel reset keeps data unchanged", async ({ page }) => {
    await page.click("#btn-reset");
    await expect(page.locator("#reset-dialog")).toBeVisible();
    await page.click("#btn-dialog-cancel");
    await expect(page.locator("#reset-dialog")).toBeHidden();
    await expect(page.locator(".opponent-row")).toHaveCount(2);
    await expect(page.locator("#own-ttr-input")).toHaveValue("1423");
  });

  test("confirm reset clears opponents to one row, preserves own TTR, clears results", async ({ page }) => {
    await page.click("#btn-reset");
    await page.click("#btn-dialog-confirm");
    await expect(page.locator(".opponent-row")).toHaveCount(1);
    await expect(page.locator("#own-ttr-input")).toHaveValue("1423");
    await expect(page.locator("#results-summary")).toBeHidden();
  });

  test("Escape closes dialog without resetting", async ({ page }) => {
    await page.click("#btn-reset");
    await page.keyboard.press("Escape");
    await expect(page.locator("#reset-dialog")).toBeHidden();
    await expect(page.locator(".opponent-row")).toHaveCount(2);
  });
});
