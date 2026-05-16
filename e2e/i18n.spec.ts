import { test, expect } from "@playwright/test";

import { LANGUAGE_ENGLISH, LANGUAGE_FRENCH, LANGUAGE_GERMAN } from "../src/i18n";
import { skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

const LANGUAGE_TEST_CASES = [
  {
    language: LANGUAGE_ENGLISH,
    expectedTitle: "TTR Calculator",
    expectedOwnTtrLabel: "Player TTR",
    expectedCalculateButton: "Calculate",
  },
  {
    language: LANGUAGE_GERMAN,
    expectedTitle: "TTR-Rechner",
    expectedOwnTtrLabel: "TTR Spieler:in",
    expectedCalculateButton: "Berechnen",
  },
];

test.describe("i18n", () => {
  for (const { language, expectedTitle, expectedOwnTtrLabel, expectedCalculateButton } of LANGUAGE_TEST_CASES) {
    test(`loads ${language} UI strings when browser language is ${language}`, async ({ page }, testInfo) => {
      skipMobileBrowsers(testInfo);

      // given
      const appPage = new AppPage(page);

      // when
      await appPage.gotoWithLanguage(language);

      // then
      await expect(page).toHaveTitle(expectedTitle);
      await expect(page.locator("html")).toHaveAttribute("lang", language);
      await expect(appPage.ownTtrLabel).toHaveText(expectedOwnTtrLabel);
      await expect(appPage.calculateButton).toHaveText(expectedCalculateButton);
    });
  }

  test("falls back to English UI strings when browser language is unsupported (French)", async ({ page }, testInfo) => {
    skipMobileBrowsers(testInfo);

    // given
    const appPage = new AppPage(page);
    const unsupportedLanguage = LANGUAGE_FRENCH;
    const englishStrings = LANGUAGE_TEST_CASES.find((tc) => tc.language === LANGUAGE_ENGLISH)!;

    // when
    await appPage.gotoWithLanguage(unsupportedLanguage);

    // then
    await expect(page).toHaveTitle(englishStrings.expectedTitle);
    await expect(page.locator("html")).toHaveAttribute("lang", englishStrings.language);
    await expect(appPage.ownTtrLabel).toHaveText(englishStrings.expectedOwnTtrLabel);
    await expect(appPage.calculateButton).toHaveText(englishStrings.expectedCalculateButton);
  });
});
