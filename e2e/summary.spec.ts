import { test, expect } from "@playwright/test";

import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The summary block", () => {
  test("is not visible when first calculation has not been performed yet", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(appPage.summaryBlock).not.toBeVisible();
  });

  test("is visible when a calculation with valid inputs is performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();

    // then
    await expect(appPage.summaryBlock).toBeVisible();
  });

  test("displays new TTR value when a calculation with valid inputs is performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    const newTtrText = await appPage.getSummaryNewTtr().innerText();

    // then
    expect(newTtrText).toMatch(/New TTR: \d+/);
  });

  test("displays delta with explicit plus sign when a calculation with positive rating change is performed", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1000");
    await appPage.setOpponentTtrByIndex(0, "1000");
    await appPage.clickCalculate();
    const deltaText = await appPage.getSummaryDelta().innerText();

    // then
    expect(deltaText).toMatch(/Delta: \+/);
  });

  test("displays expected wins value when a calculation with valid inputs is performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    const expectedWinsText = await appPage.getSummaryExpectedWins().innerText();

    // then
    expect(expectedWinsText).toMatch(/Expected Wins: \d+\.\d{2}/);
  });

  test("updates when recalculating with changed inputs", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1000");
    await appPage.setOpponentTtrByIndex(0, "1000");
    await appPage.clickCalculate();
    const firstNewTtrText = await appPage.getSummaryNewTtr().innerText();

    // when
    await appPage.setOpponentTtrByIndex(0, "800");
    await appPage.clickCalculate();
    const secondNewTtrText = await appPage.getSummaryNewTtr().innerText();

    // then
    await expect(appPage.summaryBlock).toBeVisible();
    expect(secondNewTtrText).not.toBe(firstNewTtrText);
  });
});
