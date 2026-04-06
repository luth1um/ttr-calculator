import { expect, PageAssertionsToHaveScreenshotOptions, test, TestInfo } from "@playwright/test";

import { AppPage } from "./pages/AppPage";

test.describe("The visuals of the page", () => {
  test("should be as expected when initially opening the page", async ({ page }, testInfo) => {
    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(page).toHaveScreenshot(createSnapshotName("initial-page", testInfo), screenshotOptions(0.02));
  });

  test("should be as expected when when there is one opponent with a win and one opponent with a loss", async ({
    page,
  }, testInfo) => {
    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.clickWonToggleByIndex(0);
    await appPage.scrollToBottom();

    // then
    await expect(page).toHaveScreenshot(createSnapshotName("one-win-one-loss", testInfo), screenshotOptions(0.02));
  });

  test("should be as expected when a result is visible", async ({ page }, testInfo) => {
    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1400");
    await appPage.clickCalculate();
    await appPage.scrollToBottom();

    // then
    await expect(page).toHaveScreenshot(createSnapshotName("with-result", testInfo), screenshotOptions(0.02));
  });

  test("should be as expected when the reset dialog is visible", async ({ page }, testInfo) => {
    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1400");
    await appPage.clickCalculate();
    await appPage.clickReset();

    // then
    await expect(page).toHaveScreenshot(createSnapshotName("reset-dialog", testInfo), screenshotOptions(0.02));
  });

  test("should be as expected when the results are stale", async ({ page }, testInfo) => {
    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1400");
    await appPage.clickCalculate();
    await appPage.setOwnTtr("1402");
    await appPage.scrollToBottom();

    // then
    await expect(page).toHaveScreenshot(createSnapshotName("stale-results", testInfo), screenshotOptions(0.02));
  });
});

/**
 * Creates a standardized snapshot filename for visual regression testing.
 *
 * @param baseName - The base name for the snapshot (e.g., "initial-page")
 * @param testInfo - Playwright test information object containing project details
 * @returns A formatted filename
 *
 * @example
 * // Returns: "initial-page-chromium.png"
 * createSnapshotName("initial-page", testInfo);
 */
function createSnapshotName(baseName: string, testInfo: TestInfo) {
  const platformName = testInfo.project.name.split(" ").join("-");
  return [baseName, platformName].join("-") + ".png";
}

function screenshotOptions(maxDiffPixelRatio: number = 0.0): PageAssertionsToHaveScreenshotOptions {
  return { maxDiffPixelRatio: maxDiffPixelRatio };
}
