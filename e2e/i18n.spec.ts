import { test, expect } from "@playwright/test";

import { LANGUAGE_DUTCH, LANGUAGE_ENGLISH, LANGUAGE_FRENCH, LANGUAGE_GERMAN, SUPPORTED_LANGUAGES } from "../src/i18n";
import { skipAllExceptDesktopChrome, skipMobileBrowsers } from "./helpers/miscHelpers";
import { AppPage } from "./pages/AppPage";

interface LanguageTestCase {
  language: string;
  expectedTitle: string;
  expectedOwnTtrLabel: string;
  expectedCalculateButton: string;
}

const LANGUAGE_TEST_CASES: LanguageTestCase[] = [
  {
    language: LANGUAGE_DUTCH,
    expectedTitle: "TTR Rekenmachine",
    expectedOwnTtrLabel: "Speler TTR",
    expectedCalculateButton: "Berekenen",
  },
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

test.describe("The array for language test cases", () => {
  // oxlint-disable-next-line no-unused-vars
  test("has the same length as SUPPORTED_LANGUAGES", ({ page }, testInfo) => {
    skipAllExceptDesktopChrome(testInfo);

    expect(LANGUAGE_TEST_CASES).toHaveLength(SUPPORTED_LANGUAGES.length);
  });

  // oxlint-disable-next-line no-unused-vars
  test("contains the same language codes as SUPPORTED_LANGUAGES", ({ page }, testInfo) => {
    skipAllExceptDesktopChrome(testInfo);

    LANGUAGE_TEST_CASES.map((tc) => tc.language).forEach((code) => {
      expect(SUPPORTED_LANGUAGES).toContain(code);
    });
  });
});

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
