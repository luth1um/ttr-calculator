import { test, expect } from "@playwright/test";

import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The TTR Calculator", () => {
  test("shows page title when app is loaded", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    const title = await appPage.getTitle();

    // then
    expect(title).toBe("TTR Calculator");
  });

  test("creates sequential labels when multiple opponents are added", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.addOpponentButton.click();
    const label1 = await appPage.getOpponentLabelTextByIndex(0);
    const label2 = await appPage.getOpponentLabelTextByIndex(1);
    const label3 = await appPage.getOpponentLabelTextByIndex(2);

    // then
    expect(label1).toBe("Opponent 1");
    expect(label2).toBe("Opponent 2");
    expect(label3).toBe("Opponent 3");
  });

  test("shows Calculate button disabled when ownTtr is empty on first load", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    const isEnabled = await appPage.isCalculateButtonEnabled();

    // then
    expect(isEnabled).toBe(false);
  });

  test("enables Calculate button when ownTtr is set and all opponents have valid TTR", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    const isEnabled = await appPage.isCalculateButtonEnabled();

    // then
    expect(isEnabled).toBe(true);
  });

  test("disables Calculate button when ownTtr is cleared after being set", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOwnTtr("");
    const isEnabled = await appPage.isCalculateButtonEnabled();

    // then
    expect(isEnabled).toBe(false);
  });

  test("disables Calculate button when any opponent TTR is cleared", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOpponentTtrByIndex(0, "");
    const isEnabled = await appPage.isCalculateButtonEnabled();

    // then
    expect(isEnabled).toBe(false);
  });

  test("re-enables Calculate button after fixing a cleared opponent TTR", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOpponentTtrByIndex(0, "");
    await appPage.setOpponentTtrByIndex(0, "1200");
    const isEnabled = await appPage.isCalculateButtonEnabled();

    // then
    expect(isEnabled).toBe(true);
  });

  test("changes Win/Loss toggle text from Win to Loss when clicked once", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.clickWonToggleByIndex(0);
    const toggleText = await appPage.getOpponentWonToggleTextByIndex(0);

    // then
    expect(toggleText).toBe("Loss");
  });

  test("changes Win/Loss toggle text back to Win when clicked twice", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.clickWonToggleByIndex(0);
    await appPage.clickWonToggleByIndex(0);
    const toggleText = await appPage.getOpponentWonToggleTextByIndex(0);

    // then
    expect(toggleText).toBe("Win");
  });

  test("shows no win expectation when there is no calculation yet", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(appPage.getWinExpectationByIndex(0)).not.toBeVisible();
  });

  test("shows win expectation in opponent row when Calculate was clicked with valid inputs", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();

    // then
    await expect(appPage.getWinExpectationByIndex(0)).toBeVisible();
  });

  test("displays win expectation formatted as a percentage with one decimal place when calculation is performed", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    const winExpText = await appPage.getWinExpectationByIndex(0).innerText();

    // then
    expect(winExpText).toMatch(/\d+\.\d%/);
  });

  test("shows a win expectation for each row when multiple opponents are present", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOpponentTtrByIndex(1, "1600");
    await appPage.clickCalculate();

    // then
    await expect(appPage.getWinExpectationByIndex(0)).toBeVisible();
    await expect(appPage.getWinExpectationByIndex(1)).toBeVisible();
  });

  test("keeps TTR inputs and Win/Loss toggles editable when calculation was performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();

    // then
    await expect(appPage.getOpponentTtrInputByIndex(0)).toBeEnabled();
    await expect(appPage.getOpponentWonToggleByIndex(0)).toBeEnabled();
  });

  test("shows win expectation when player factors are active during calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.checkFactor(appPage.factorLessThan30Games);
    await appPage.clickCalculate();

    // then
    await expect(appPage.getWinExpectationByIndex(0)).toBeVisible();
  });

  test("has win expectations that stay with the correct opponent when a middle row is removed", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.addOpponentButton.click();
    await appPage.setOwnTtr("1500");
    await appPage.setOpponentTtrByIndex(0, "1300");
    await appPage.setOpponentTtrByIndex(1, "1500");
    await appPage.setOpponentTtrByIndex(2, "1700");
    await appPage.clickCalculate();

    const winExpA = await appPage.getWinExpectationByIndex(0).innerText();
    const winExpC = await appPage.getWinExpectationByIndex(2).innerText();

    // when
    await appPage.getRemoveButtonByIndex(1).click();

    // then
    await expect(appPage.getOpponentRows()).toHaveCount(2);
    expect(await appPage.getWinExpectationByIndex(0).innerText()).toBe(winExpA);
    expect(await appPage.getWinExpectationByIndex(1).innerText()).toBe(winExpC);
  });
});
