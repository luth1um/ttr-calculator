import AxeBuilder from "@axe-core/playwright";
import { test, expect } from "@playwright/test";

import { KEYBOARD_KEYS } from "../src/constants";
import { skipDesktopSafari, skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

const MIN_TOUCH_TARGET = 44;

test("The remove-opponent button meets 44x44px touch target minimum", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.addOpponentButton.click();

  // when
  const removeButton = appPage.getRemoveButtonByIndex(0);
  const box = await removeButton.boundingBox();

  // then
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
});

test("The Win/Loss toggle buttons meet 44px height touch target minimum", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();

  // when
  const wonToggle = appPage.getOpponentWonToggleByIndex(0);
  const box = await wonToggle.boundingBox();

  // then
  expect(box).not.toBeNull();
  expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
});

test("The player factor checkbox controls meet 44x44px touch target minimum", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();

  // when
  const checkboxes = page.locator('fieldset input[type="checkbox"]');
  const checkboxCount = await checkboxes.count();

  // then
  for (let i = 0; i < checkboxCount; i++) {
    const box = await checkboxes.nth(i).boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
});

test("The primary action buttons (Add Opponent, Calculate, Reset) meet 44px height touch target minimum", async ({
  page,
}) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();

  // when / then
  for (const button of [appPage.addOpponentButton, appPage.calculateButton, appPage.resetButton]) {
    const box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
  }
});

test("The own TTR and opponent TTR inputs meet 44px height touch target minimum", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();

  // when
  const ownTtrBox = await appPage.ownTtrInput.boundingBox();

  // then
  expect(ownTtrBox).not.toBeNull();
  expect(ownTtrBox!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);

  const opponentTtrBox = await appPage.getOpponentTtrInputByIndex(0).boundingBox();
  expect(opponentTtrBox).not.toBeNull();
  expect(opponentTtrBox!.height).toBeGreaterThanOrEqual(MIN_TOUCH_TARGET);
});

test("The Win/Loss toggle is operable via keyboard (Enter key toggles win/loss state)", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  const wonToggle = appPage.getOpponentWonToggleByIndex(0);
  const initialText = await wonToggle.innerText();

  // when
  await wonToggle.focus();
  await page.keyboard.press(KEYBOARD_KEYS.ENTER);

  // then
  const afterText = await wonToggle.innerText();
  expect(afterText).not.toBe(initialText);
});

test("The Add Opponent button is operable via keyboard (Enter adds a new opponent row)", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await expect(appPage.getOpponentRows()).toHaveCount(1);
  const initialCount = await appPage.getOpponentRowCount();

  // when
  await appPage.addOpponentButton.focus();
  await page.keyboard.press(KEYBOARD_KEYS.ENTER);

  // then
  expect(await appPage.getOpponentRowCount()).toBe(initialCount + 1);
});

test("The Remove Opponent button is operable via keyboard (Enter removes the opponent row)", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.addOpponentButton.click();
  expect(await appPage.getOpponentRowCount()).toBe(2);

  // when
  const removeButton = appPage.getRemoveButtonByIndex(0);
  await removeButton.focus();
  await page.keyboard.press(KEYBOARD_KEYS.ENTER);

  // then
  expect(await appPage.getOpponentRowCount()).toBe(1);
});

test("The Calculate button is operable via keyboard (Enter triggers calculation)", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.setOwnTtr("1500");
  await appPage.setOpponentTtrByIndex(0, "1400");

  // when
  await appPage.calculateButton.focus();
  await page.keyboard.press(KEYBOARD_KEYS.ENTER);

  // then
  await expect(appPage.summaryBlock).toBeVisible();
});

test("The tab order follows logical DOM sequence through all interactive elements", async ({ page }, testInfo) => {
  skipMobileBrowsers(testInfo); // tab order does not make sense for smartphones
  skipDesktopSafari(testInfo); // Safari only focuses on inputs when a11y is specifically activated

  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.setOwnTtr("1500");
  await appPage.setOpponentTtrByIndex(0, "1400");

  // when / then
  await appPage.ownTtrInput.focus();
  await expect(page.locator(":focus")).toHaveAttribute("id", "own-ttr");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "factor-younger-than-21");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "factor-younger-than-16");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "factor-less-than-30-games");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "factor-returnee-less-than-15");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", /^opponent-ttr-/);

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", /^opponent-won-/);

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "add-opponent");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "calculate-button");

  await page.keyboard.press(KEYBOARD_KEYS.TAB);
  await expect(page.locator(":focus")).toHaveAttribute("id", "reset-button");
});

test("The reset dialog traps focus and no background interactive elements are reachable via Tab when dialog is open", async ({
  page,
}) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.resetButton.click();
  await expect(appPage.resetDialog).toBeVisible();

  // when
  const focusedIds: string[] = [];
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press(KEYBOARD_KEYS.TAB);
    const id = await page.evaluate(() => document.activeElement?.id ?? "");
    focusedIds.push(id);
  }

  // then
  const backgroundInteractiveIds = [
    "own-ttr",
    "factor-younger-than-21",
    "factor-younger-than-16",
    "factor-less-than-30-games",
    "factor-returnee-less-than-15",
    "add-opponent",
    "calculate-button",
    "reset-button",
  ];
  for (const id of focusedIds) {
    expect(backgroundInteractiveIds).not.toContain(id);
  }
});

test("The reset dialog closes via Escape key without state changes (keyboard-triggered dialog)", async ({ page }) => {
  // given
  const appPage = new AppPage(page);
  await appPage.goto();
  await appPage.setOpponentTtrByIndex(0, "1400");
  await appPage.addOpponentButton.click();

  await appPage.resetButton.focus();
  await page.keyboard.press(KEYBOARD_KEYS.ENTER);
  await expect(appPage.resetDialog).toBeVisible();

  // when
  await page.keyboard.press(KEYBOARD_KEYS.ESCAPE);

  // then
  await expect(appPage.resetDialog).not.toBeVisible();
  expect(await appPage.getOpponentRowCount()).toBe(2);
  expect(await appPage.getOpponentTtrValueByIndex(0)).toBe("1400");
});

test("The app exposes an associated visible own TTR label when own TTR input is rendered", async ({ page }) => {
  // given
  const appPage = new AppPage(page);

  // when
  await appPage.goto();

  // then
  await expect(appPage.ownTtrInputByLabel).toBeVisible();
  await expect(appPage.ownTtrLabel).toBeVisible();
  await expect(appPage.ownTtrLabel).toHaveAttribute("for", "own-ttr");
  await expect(appPage.ownTtrInput).toHaveAttribute("id", "own-ttr");
});

test("The app exposes an associated visible labels for all player factor checkboxes", async ({ page }) => {
  // given
  const appPage = new AppPage(page);

  // when
  await appPage.goto();

  // then
  const checkboxIds = [
    "factor-younger-than-21",
    "factor-younger-than-16",
    "factor-less-than-30-games",
    "factor-returnee-less-than-15",
  ];
  for (const id of checkboxIds) {
    const checkbox = page.locator(`#${id}`);
    const label = page.locator(`label[for="${id}"]`);
    await expect(checkbox).toBeVisible();
    await expect(label).toBeVisible();
    await expect(checkbox).toHaveAttribute("id", id);
    await expect(label).toHaveAttribute("for", id);
  }
});

test("The app exposes associated visible labels for opponent TTR inputs", async ({ page }) => {
  // given
  const appPage = new AppPage(page);

  // when
  await appPage.goto();
  await appPage.addOpponentButton.click();

  // then
  const opponentRows = appPage.getOpponentRows();
  const rowCount = await opponentRows.count();
  for (let i = 0; i < rowCount; i++) {
    const input = appPage.getOpponentTtrInputByIndex(i);
    const inputId = await input.getAttribute("id");
    expect(inputId).not.toBeNull();
    const label = opponentRows.nth(i).locator(`label[for="${inputId}"]`);
    await expect(label).toBeVisible();
    await expect(label).toHaveAttribute("for", inputId!);
  }
});

test.describe("The axe-core test", () => {
  test("for the initial page load state has zero accessibility violations", async ({ page }) => {
    // given
    const appPage = new AppPage(page);
    await appPage.goto();

    // when
    const results = await new AxeBuilder({ page }).analyze();

    // then
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => n.html),
      })),
    ).toEqual([]);
  });

  test("for the post-calculation state has zero accessibility violations", async ({ page }) => {
    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    const results = await new AxeBuilder({ page }).analyze();

    // then
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => n.html),
      })),
    ).toEqual([]);
  });

  test("for the stale state (results dimmed after input change) has zero accessibility violations", async ({
    page,
  }) => {
    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.setOwnTtr("1600");
    await expect(appPage.staleIndicator).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();

    // then
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => n.html),
      })),
    ).toEqual([]);
  });

  test("for the reset confirmation dialog open state has zero accessibility violations", async ({ page }) => {
    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.clickReset();
    await expect(appPage.resetDialog).toBeVisible();

    // when
    const results = await new AxeBuilder({ page }).analyze();

    // then
    expect(
      results.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => n.html),
      })),
    ).toEqual([]);
  });

  test("for the multiple opponent rows state has zero accessibility violations", async ({ page }) => {
    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOpponentTtrByIndex(1, "1600");
    await expect(appPage.getOpponentRows()).toHaveCount(2);

    // when
    const results = await new AxeBuilder({ page }).analyze();

    // then
    const violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      nodes: v.nodes.map((n) => n.html),
    }));
    expect(violations).toEqual([]);
  });
});
