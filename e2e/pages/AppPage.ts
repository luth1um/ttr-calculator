import type { Page, Locator } from "@playwright/test";

import { TEST_BASE_URL } from "../../playwright.config";

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

  constructor(page: Page) {
    this.page = page;
    this.appRoot = page.locator("#app");
    this.ownTtrInput = page.locator("#own-ttr");
    this.ownTtrLabel = page.locator('label[for="own-ttr"]');
    this.ownTtrInputByLabel = page.getByLabel("Your TTR");
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
  }

  async goto(): Promise<void> {
    await this.page.goto(TEST_BASE_URL);
  }

  async reload(): Promise<void> {
    await this.page.reload();
  }

  async setOwnTtr(value: string): Promise<void> {
    await this.ownTtrInput.fill(value);
  }

  async getOwnTtrValue(): Promise<string> {
    return this.ownTtrInput.inputValue();
  }

  async typeOwnTtrSequentially(value: string): Promise<void> {
    await this.ownTtrInput.click();
    await this.ownTtrInput.pressSequentially(value);
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async checkFactor(locator: Locator): Promise<void> {
    await locator.check();
  }

  async uncheckFactor(locator: Locator): Promise<void> {
    await locator.uncheck();
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
}
