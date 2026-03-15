import { test, expect } from "@playwright/test";

import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

test.describe("The TTR Calculator", () => {
  test("shows one opponent row labeled Opponent 1 with TTR 1000 and Win on first load", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    const rowCount = await appPage.getOpponentRowCount();
    const labelText = await appPage.getOpponentLabelTextByIndex(0);
    const ttrValue = await appPage.getOpponentTtrValueByIndex(0);
    const wonText = await appPage.getOpponentWonToggleTextByIndex(0);

    // then
    expect(rowCount).toBe(1);
    expect(labelText).toBe("Opponent 1");
    expect(ttrValue).toBe("1000");
    expect(wonText).toBe("Win");
  });

  test("shows no remove button when only one opponent row exists", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();

    // then
    await expect(appPage.getRemoveButtonByIndex(0)).not.toBeVisible();
  });

  test("adds a second row labeled Opponent 2 with defaults when Add Opponent is clicked", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    const rowCount = await appPage.getOpponentRowCount();
    const label2 = await appPage.getOpponentLabelTextByIndex(1);
    const ttr2 = await appPage.getOpponentTtrValueByIndex(1);
    const won2 = await appPage.getOpponentWonToggleTextByIndex(1);

    // then
    expect(rowCount).toBe(2);
    expect(label2).toBe("Opponent 2");
    expect(ttr2).toBe("1000");
    expect(won2).toBe("Win");
  });

  test("renumbers remaining rows when a middle opponent is removed", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.addOpponentButton.click();

    // when
    await appPage.getRemoveButtonByIndex(1).click();
    const rowCount = await appPage.getOpponentRowCount();
    const label1 = await appPage.getOpponentLabelTextByIndex(0);
    const label2 = await appPage.getOpponentLabelTextByIndex(1);

    // then
    expect(rowCount).toBe(2);
    expect(label1).toBe("Opponent 1");
    expect(label2).toBe("Opponent 2");
  });

  test("hides remove button when reducing to one opponent row", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.addOpponentButton.click();
    await appPage.getRemoveButtonByIndex(1).click();
    const rowCount = await appPage.getOpponentRowCount();

    // then
    expect(rowCount).toBe(1);
    await expect(appPage.getRemoveButtonByIndex(0)).not.toBeVisible();
  });

  test("updates opponent TTR input field when a value is typed into it", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    await appPage.setOpponentTtrByIndex(0, "1600");
    const ttrValue = await appPage.getOpponentTtrValueByIndex(0);

    // then
    expect(ttrValue).toBe("1600");
  });

  test("retains focus for multi-digit opponent TTR entry when typed character by character", async ({
    page,
  }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);

    // when
    await appPage.goto();
    const ttrInput = appPage.getOpponentTtrInputByIndex(0);
    await ttrInput.fill("");
    await ttrInput.click();
    await ttrInput.pressSequentially("1823");
    const ttrValue = await appPage.getOpponentTtrValueByIndex(0);

    // then
    expect(ttrValue).toBe("1823");
  });
});
