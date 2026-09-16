import { expect, type Locator, type Page } from "@playwright/test";

import { PREVIEW_BASE_URL } from "../../playwright.config";
import { FALLBACK_LANGUAGE, LANGUAGE_FILE_PATHS } from "../../src/i18n";

/** Chromium sometimes routes the first offline navigation to the network instead of to the service worker. */
const OFFLINE_NAVIGATION_RETRY = { intervals: [250, 500, 1_000, 2_000, 2_000], timeout: 30_000 };

export class AppPage {
  readonly page: Page;
  readonly appRoot: Locator;
  readonly ownTtrInput: Locator;
  readonly ownTtrLabel: Locator;
  readonly ownTtrInputByLabel: Locator;
  readonly factorYoungerThan21: Locator;
  readonly factorYoungerThan16: Locator;
  readonly factorLessThan30Games: Locator;
  readonly factorReturnee: Locator;
  readonly addOpponentButton: Locator;
  readonly calculateButton: Locator;
  readonly summaryBlock: Locator;
  readonly staleIndicator: Locator;
  readonly resetButton: Locator;
  readonly resetDialog: Locator;
  readonly confirmResetButton: Locator;
  readonly cancelResetButton: Locator;
  readonly resetDialogMessage: Locator;
  readonly playerFactorsLegend: Locator;

  constructor(page: Page) {
    this.page = page;
    this.appRoot = page.locator("#app");
    this.ownTtrInput = page.locator("#own-ttr");
    this.ownTtrLabel = page.locator('label[for="own-ttr"]');
    this.ownTtrInputByLabel = page.getByLabel("Player TTR");
    this.factorYoungerThan21 = page.locator("#factor-younger-than-21");
    this.factorYoungerThan16 = page.locator("#factor-younger-than-16");
    this.factorLessThan30Games = page.locator("#factor-less-than-30-games");
    this.factorReturnee = page.locator("#factor-returnee-less-than-15");
    this.addOpponentButton = page.locator("#add-opponent");
    this.calculateButton = page.locator("#calculate-button");
    this.summaryBlock = page.locator("#summary-block");
    this.staleIndicator = page.locator("#stale-indicator");
    this.resetButton = page.locator("#reset-button");
    this.resetDialog = page.locator("#reset-dialog");
    this.confirmResetButton = page.locator("#confirm-reset");
    this.cancelResetButton = page.locator("#cancel-reset");
    this.resetDialogMessage = page.locator("#reset-dialog-message");
    this.playerFactorsLegend = page.locator(".player-factors > .group-legend");
  }

  async goto(path: string = ""): Promise<void> {
    await this.gotoWithLanguage(FALLBACK_LANGUAGE, path);
  }

  async reload(): Promise<void> {
    await this.reloadWithLanguage(FALLBACK_LANGUAGE);
  }

  async gotoWithLanguage(language: string, path: string = ""): Promise<void> {
    await this.setLanguage(language);
    await this.page.goto(PREVIEW_BASE_URL + path);
  }

  async reloadWithLanguage(language: string): Promise<void> {
    await this.setLanguage(language);
    await this.page.reload();
  }

  /**
   * Must be called BEFORE goto() / reload() so the init script is registered prior to the page loading.
   * @param language any BCP 47 language code, e.g. "en", "de", "en-GB"
   */
  async setLanguage(language: string): Promise<void> {
    await this.page.addInitScript((lang: string) => {
      localStorage.setItem("i18nextLng", lang);
      Object.defineProperty(navigator, "language", { value: lang, configurable: true });
      Object.defineProperty(navigator, "languages", { value: [lang], configurable: true });
    }, language);
  }

  async setOwnTtr(value: string): Promise<void> {
    await this.ownTtrInput.fill(value);
  }

  async getOwnTtrValue(): Promise<string> {
    return this.ownTtrInput.inputValue();
  }

  async typeOwnTtrSequentially(value: string): Promise<void> {
    await this.ownTtrInput.click();
    await this.ownTtrInput.selectText();
    await this.ownTtrInput.pressSequentially(value);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async checkFactor(locator: Locator): Promise<void> {
    await locator.check();
  }

  async isFactorChecked(locator: Locator): Promise<boolean> {
    return locator.isChecked();
  }

  getOpponentRows(): Locator {
    return this.page.locator(".opponent-row");
  }

  async getOpponentRowCount(): Promise<number> {
    return this.getOpponentRows().count();
  }

  getOpponentLabelByIndex(index: number): Locator {
    return this.getOpponentRows().nth(index).locator(".opponent-label");
  }

  async getOpponentLabelTextByIndex(index: number): Promise<string> {
    return this.getOpponentLabelByIndex(index).innerText();
  }

  getOpponentTtrInputByIndex(index: number): Locator {
    return this.getOpponentRows().nth(index).locator("input[id^='opponent-ttr-']");
  }

  async getOpponentTtrValueByIndex(index: number): Promise<string> {
    return this.getOpponentTtrInputByIndex(index).inputValue();
  }

  getOpponentWonToggleByIndex(index: number): Locator {
    return this.getOpponentRows().nth(index).locator("button[id^='opponent-won-']");
  }

  async getOpponentWonToggleTextByIndex(index: number): Promise<string> {
    return this.getOpponentWonToggleByIndex(index).innerText();
  }

  getRemoveButtonByIndex(index: number): Locator {
    return this.getOpponentRows().nth(index).locator(".remove-opponent");
  }

  async setOpponentTtrByIndex(index: number, value: string): Promise<void> {
    await this.getOpponentTtrInputByIndex(index).fill(value);
  }

  async clickWonToggleByIndex(index: number): Promise<void> {
    await this.getOpponentWonToggleByIndex(index).click();
  }

  async isCalculateButtonEnabled(): Promise<boolean> {
    return this.calculateButton.isEnabled();
  }

  async clickCalculate(): Promise<void> {
    await this.calculateButton.click();
  }

  getWinExpectationByIndex(index: number): Locator {
    return this.getOpponentRows().nth(index).locator(".win-expectation");
  }

  getSummaryNewTtr(): Locator {
    return this.summaryBlock.locator("div").nth(0);
  }

  getSummaryDelta(): Locator {
    return this.summaryBlock.locator("div").nth(1);
  }

  getSummaryExpectedWins(): Locator {
    return this.summaryBlock.locator("div").nth(2);
  }

  async clickReset(): Promise<void> {
    await this.resetButton.click();
  }

  async clickConfirmReset(): Promise<void> {
    await this.confirmResetButton.click();
  }

  async clickCancelReset(): Promise<void> {
    await this.cancelResetButton.click();
  }

  async scrollToSummaryBlock(): Promise<void> {
    await this.summaryBlock.scrollIntoViewIfNeeded();
  }

  async scrollToWonToggleByIndex(index: number): Promise<void> {
    await this.getOpponentWonToggleByIndex(index).scrollIntoViewIfNeeded();
  }

  async waitForServiceWorkerActivation(): Promise<void> {
    await this.page.waitForFunction(async () => {
      const registration = await navigator.serviceWorker.getRegistration();
      return (
        registration?.active?.state === "activated" &&
        navigator.serviceWorker.controller !== undefined &&
        navigator.serviceWorker.controller !== null
      );
    });
  }

  async gotoAndWaitUntilOfflineReady(path: string = ""): Promise<void> {
    await this.goto(path);
    await this.waitForServiceWorkerActivation();
    await this.waitForAppShellPrecache();
    await this.wakeUpServiceWorker();
  }

  async reloadWhileOffline(): Promise<void> {
    await expect(async () => {
      await this.page.reload();
    }).toPass(OFFLINE_NAVIGATION_RETRY);
  }

  async gotoWhileOffline(path: string = ""): Promise<void> {
    await expect(async () => {
      await this.page.goto(PREVIEW_BASE_URL + path);
    }).toPass(OFFLINE_NAVIGATION_RETRY);
  }

  async fetchStatusWhileOffline(path: string): Promise<number> {
    let status = 0;
    await expect(async () => {
      status = await this.fetchStatus(path);
    }).toPass(OFFLINE_NAVIGATION_RETRY);
    return status;
  }

  private async waitForAppShellPrecache(): Promise<void> {
    await expect
      .poll(() => this.getPrecachedPaths())
      .toEqual(expect.arrayContaining(["index.html", ...LANGUAGE_FILE_PATHS]));
  }

  /**
   * Chromium stops idle service workers, and restarting one while the browser is offline can fail, which makes
   * the navigation fall back to the network. A request through the worker keeps it running.
   */
  private async wakeUpServiceWorker(): Promise<void> {
    await this.page.evaluate(async (url: string) => {
      const registration = await navigator.serviceWorker.ready;
      registration.active?.postMessage({ type: "PING" });
      await fetch(url, { cache: "no-store" });
    }, PREVIEW_BASE_URL);
  }

  async isControlledByServiceWorker(): Promise<boolean> {
    return this.page.evaluate(() => navigator.serviceWorker.controller !== null);
  }

  async getPrecachedPaths(): Promise<string[]> {
    return this.page.evaluate(async (baseUrl: string) => {
      const cacheNames = await caches.keys();
      const precacheName = cacheNames.find((name) => name.includes("precache"));
      if (precacheName === undefined) {
        return [];
      }
      const requests = await (await caches.open(precacheName)).keys();
      return requests.map((request) => request.url.replace(baseUrl, "").replace(/\?__WB_REVISION__=.*$/, ""));
    }, PREVIEW_BASE_URL);
  }

  async fetchStatus(path: string): Promise<number> {
    return this.page.evaluate(async (url: string) => {
      const response = await fetch(url);
      return response.status;
    }, PREVIEW_BASE_URL + path);
  }

  async fetchManifest(): Promise<Record<string, unknown>> {
    return this.page.evaluate(async () => {
      const href = document.querySelector("link[rel='manifest']")?.getAttribute("href") ?? "";
      return (await fetch(href)).json() as Promise<Record<string, unknown>>;
    });
  }

  async setOffline(offline: boolean): Promise<void> {
    await this.page.context().setOffline(offline);
  }
}
