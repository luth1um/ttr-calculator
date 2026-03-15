import { test, expect } from "@playwright/test";

import { KEYBOARD_KEYS } from "../src/constants";
import { skipDesktopSafari, skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The reset confirmation dialog", () => {
  test("opens the dialog when the Reset button is clicked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();

    // when
    await appPage.clickReset();

    // then
    await expect(appPage.resetDialog).toBeVisible();
  });

  test("displays the confirmation message in the dialog when opened", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();

    // when
    await appPage.clickReset();

    // then
    await expect(appPage.resetDialogMessage).toBeVisible();
    await expect(appPage.resetDialogMessage).toContainText("Your own TTR will be kept");
  });

  test("closes the dialog without changing opponents when Cancel is clicked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.addOpponentButton.click();
    await appPage.setOpponentTtrByIndex(1, "1500");
    const countBefore = await appPage.getOpponentRowCount();

    // when
    await appPage.clickReset();
    await appPage.clickCancelReset();

    // then
    await expect(appPage.resetDialog).not.toBeVisible();
    expect(await appPage.getOpponentRowCount()).toBe(countBefore);
    expect(await appPage.getOpponentTtrValueByIndex(0)).toBe("1400");
  });

  test("closes the dialog when Escape is pressed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.clickReset();
    await expect(appPage.resetDialog).toBeVisible();

    // when
    await page.keyboard.press(KEYBOARD_KEYS.ESCAPE);

    // then
    await expect(appPage.resetDialog).not.toBeVisible();
  });

  test("does not change the opponent list when Escape closes the dialog", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.addOpponentButton.click();

    // when
    await appPage.clickReset();
    await page.keyboard.press(KEYBOARD_KEYS.ESCAPE);

    // then
    expect(await appPage.getOpponentRowCount()).toBe(2);
    expect(await appPage.getOpponentTtrValueByIndex(0)).toBe("1400");
  });

  test("resets opponents to one default row when Confirm is clicked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.addOpponentButton.click();
    await appPage.setOpponentTtrByIndex(1, "1500");
    expect(await appPage.getOpponentRowCount()).toBe(2);

    // when
    await appPage.clickReset();
    await appPage.clickConfirmReset();

    // then
    expect(await appPage.getOpponentRowCount()).toBe(1);
    await expect(appPage.getOpponentRows().nth(0).locator(".opponent-label")).toContainText("Opponent 1");
    expect(await appPage.getOpponentTtrValueByIndex(0)).toBe("1000");
    const wonToggleText = await appPage.getOpponentWonToggleTextByIndex(0);
    expect(wonToggleText).toMatch(/win|won/i);
  });

  test("preserves own TTR value when Confirm is clicked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");

    // when
    await appPage.clickReset();
    await appPage.clickConfirmReset();

    // then
    expect(await appPage.getOwnTtrValue()).toBe("1423");
  });

  test("hides the summary block when Confirm is clicked after a calculation", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await expect(appPage.summaryBlock).toBeVisible();

    // when
    await appPage.clickReset();
    await appPage.clickConfirmReset();

    // then
    await expect(appPage.summaryBlock).not.toBeVisible();
  });

  test("removes the stale indicator when Confirm is clicked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.setOpponentTtrByIndex(0, "1400");
    await appPage.clickCalculate();
    await appPage.setOwnTtr("1500");
    await expect(appPage.staleIndicator).toBeVisible();

    // when
    await appPage.clickReset();
    await appPage.clickConfirmReset();

    // then
    await expect(appPage.staleIndicator).not.toBeVisible();
  });

  test("preserves player factor checkboxes when the reset is performed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.checkFactor(appPage.factorYoungerThan21);
    await appPage.checkFactor(appPage.factorLessThan30Games);

    // when
    await appPage.clickReset();
    await appPage.clickConfirmReset();

    // then
    expect(await appPage.isFactorChecked(appPage.factorYoungerThan21)).toBe(true);
    expect(await appPage.isFactorChecked(appPage.factorLessThan30Games)).toBe(true);
    expect(await appPage.isFactorChecked(appPage.factorYoungerThan16)).toBe(false);
    expect(await appPage.isFactorChecked(appPage.factorReturnee)).toBe(false);
  });

  test("has keyboard-focusable buttons confirm and cancel when the dialog is opened", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo); // keyboard focus does not make sense for smartphones
    skipDesktopSafari(testInfo); // Safari only focuses on inputs when a11y is specifically activated

    // when
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.clickReset();
    await expect(appPage.resetDialog).toBeVisible();

    // then
    await expect(appPage.cancelResetButton).toBeFocused();
    await page.keyboard.press(KEYBOARD_KEYS.TAB);
    await expect(appPage.confirmResetButton).toBeFocused();
  });
});
