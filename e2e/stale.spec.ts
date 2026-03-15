import { test, expect } from "@playwright/test";

import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The stale indicator", () => {
  test("is not visible when first calculation has not been performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(appPage.staleIndicator).not.toBeVisible();
  });

  test("is not shown when inputs change before first calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();

    // when
    await appPage.setOwnTtr("1500");

    // then
    await expect(appPage.staleIndicator).not.toBeVisible();
  });

  test("appears when editing own TTR following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.setOwnTtr("1500");

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("appears when editing an opponent's TTR following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.setOpponentTtrByIndex(0, "1500");

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("appears when toggling Win/Loss following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.clickWonToggleByIndex(0);

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("appears when adding an opponent following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.addOpponentButton.click();

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("appears when removing an opponent following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.addOpponentButton.click();
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.setOpponentTtrByIndex(1, "1450");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.getRemoveButtonByIndex(1).click();

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("appears when changing a player factor following a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.checkFactor(appPage.factorLessThan30Games);

    // then
    await expect(appPage.staleIndicator).toBeVisible();
  });

  test("summary block has stale class when stale indicator is shown", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.setOwnTtr("1500");

    // then
    await expect(appPage.staleIndicator).toBeVisible();
    await expect(appPage.summaryBlock).toHaveClass(/stale/);
  });

  test("win expectation has stale class when stale indicator is shown", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.getWinExpectationByIndex(0)).toBeVisible();

    // when
    await appPage.setOwnTtr("1500");

    // then
    await expect(appPage.staleIndicator).toBeVisible();
    await expect(appPage.getWinExpectationByIndex(0)).toHaveClass(/stale/);
  });

  test("Calculate button is enabled when stale and inputs are still valid", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.setOwnTtr("1500");
    await expect(appPage.staleIndicator).toBeVisible();

    // then
    expect(await appPage.isCalculateButtonEnabled()).toBe(true);
  });

  test("is removed when recalculating after inputs change", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    const initialNewTtrText = await appPage.getSummaryNewTtr().innerText();
    await appPage.setOwnTtr("1500");
    await expect(appPage.staleIndicator).toBeVisible();

    // when
    await appPage.clickCalculate();

    // then
    await expect(appPage.staleIndicator).not.toBeVisible();
    await expect(appPage.summaryBlock).toBeVisible();
    await expect(appPage.summaryBlock).not.toHaveClass(/stale/);
    const updatedNewTtrText = await appPage.getSummaryNewTtr().innerText();
    expect(updatedNewTtrText).not.toBe(initialNewTtrText);
  });

  test("per-row win expectations update in place after recalculation when stale", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    const initialWinExpText = await appPage.getWinExpectationByIndex(0).innerText();

    // when
    await appPage.setOwnTtr("800");
    await appPage.clickCalculate();

    // then
    await expect(appPage.staleIndicator).not.toBeVisible();
    const updatedWinExpText = await appPage.getWinExpectationByIndex(0).innerText();
    expect(updatedWinExpText).not.toBe(initialWinExpText);
  });
});
