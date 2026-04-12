import { test, expect } from "@playwright/test";

import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The TTR Calculator", () => {
  test("shows labeled empty own TTR input when app is opened for the first time", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    const ownTtrValue = await appPage.getOwnTtrValue();

    // then
    await expect(appPage.ownTtrLabel).toBeVisible();
    await expect(appPage.ownTtrLabel).toHaveText("Player TTR");
    await expect(appPage.ownTtrInput).toBeVisible();
    expect(ownTtrValue).toBe("");
  });

  test("retains focus for multi-digit own TTR entry when the entry is typed character by character", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.typeOwnTtrSequentially("1423");
    const ownTtrValue = await appPage.getOwnTtrValue();

    // then
    expect(ownTtrValue).toBe("1423");
  });

  test("clears persisted own TTR when input is cleared before reload", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await expect(appPage.ownTtrInput).toHaveValue("1423");

    await appPage.setOwnTtr("");
    await appPage.reload();
    const ownTtrValue = await appPage.getOwnTtrValue();

    // then
    expect(ownTtrValue).toBe("");
  });

  test("shows all four player factor checkboxes unchecked on first visit", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(appPage.factorYoungerThan21).toBeVisible();
    await expect(appPage.factorYoungerThan16).toBeVisible();
    await expect(appPage.factorLessThan30Games).toBeVisible();
    await expect(appPage.factorReturnee).toBeVisible();
    await expect(appPage.factorYoungerThan21).not.toBeChecked();
    await expect(appPage.factorYoungerThan16).not.toBeChecked();
    await expect(appPage.factorLessThan30Games).not.toBeChecked();
    await expect(appPage.factorReturnee).not.toBeChecked();
  });

  test("auto-checks younger than 21 when younger than 16 is checked", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.checkFactor(appPage.factorYoungerThan16);

    // then
    await expect(appPage.factorYoungerThan16).toBeChecked();
    await expect(appPage.factorYoungerThan21).toBeChecked();
  });

  test("persists player factor checkbox states across page reload", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.checkFactor(appPage.factorLessThan30Games);
    await appPage.checkFactor(appPage.factorReturnee);
    await appPage.reload();

    // then
    await expect(appPage.factorLessThan30Games).toBeChecked();
    await expect(appPage.factorReturnee).toBeChecked();
    await expect(appPage.factorYoungerThan21).not.toBeChecked();
    await expect(appPage.factorYoungerThan16).not.toBeChecked();
  });

  test("defaults all checkboxes to unchecked when localStorage is corrupted", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await page.evaluate(() => {
      localStorage.setItem("playerFactors", "not-valid-json{{{");
    });
    await appPage.reload();

    // then
    await expect(appPage.factorYoungerThan21).not.toBeChecked();
    await expect(appPage.factorYoungerThan16).not.toBeChecked();
    await expect(appPage.factorLessThan30Games).not.toBeChecked();
    await expect(appPage.factorReturnee).not.toBeChecked();
  });

  test("restores own TTR after reload when own TTR was entered before reload", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOwnTtr("1423");
    await appPage.reload();
    const ownTtrValue = await appPage.getOwnTtrValue();

    // then
    expect(ownTtrValue).toBe("1423");
  });

  test("retains working own TTR input when opponent rows are added", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.setOwnTtr("1500");

    // when
    await appPage.addOpponentButton.click();
    const ownTtrValue = await appPage.getOwnTtrValue();

    // then
    expect(ownTtrValue).toBe("1500");
  });

  test("retains working player factor checkboxes when opponent rows are added", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.checkFactor(appPage.factorLessThan30Games);

    // then
    await expect(appPage.factorLessThan30Games).toBeChecked();
  });
});
