import { expect, Locator, Page } from '@playwright/test';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import Error from 'es-errors';

import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core';

export class RewardGiftingOptionsPage extends BasePage {
  private giftingOptionsContainer: Locator;
  readonly rewardsOverview: Locator;
  private giftingOptionsHeader: Locator;
  private giftingOptionsDescriptionLine1: Locator;
  private giftingOptionsDescriptionLine2: Locator;
  private giftingOptionsInputLabel: Locator;
  readonly giftingOptionsInputBox: Locator;
  private giftingOptionsInputError: Locator;
  private giftingOptionsInputNote: Locator;
  private giftingOptionsSave: Locator;
  readonly exchangeRateSelectDropdown: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.REWARDS_GIFTING_OPTIONS_PAGE);
    this.rewardsOverview = page.locator('[href="/manage/recognition/rewards/overview"]');
    this.giftingOptionsContainer = page.locator('[class^="Rewards_content--"]');
    this.giftingOptionsHeader = this.giftingOptionsContainer.getByRole('heading', { name: 'Gifting options' });
    this.giftingOptionsDescriptionLine1 = this.giftingOptionsContainer.getByText('Define the reward options for');
    this.giftingOptionsDescriptionLine2 = this.giftingOptionsContainer.getByText('Gifting is optional and');
    this.giftingOptionsInputLabel = this.giftingOptionsContainer.locator('[for="points"]');
    this.giftingOptionsInputBox = this.giftingOptionsContainer.locator('input[name="points"]');
    this.giftingOptionsInputError = this.giftingOptionsContainer.locator('[class^="Field-module__error"] p');
    this.giftingOptionsInputNote = this.giftingOptionsContainer.locator('[class^="Field-module__note"] p');
    this.giftingOptionsSave = this.giftingOptionsContainer.getByRole('button', { name: 'Save' });
    this.exchangeRateSelectDropdown = this.giftingOptionsContainer.locator('select[id="usdPerPoint"]');
  }

  async validateTheGiftingOptionsUIElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsHeader);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsDescriptionLine1);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsDescriptionLine2);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputLabel);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputBox);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputNote);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsSave);
    await this.verifier.verifyTheElementIsDisabled(this.giftingOptionsSave);
  }

  async enterTheAmountAndValidateTheError(amount: string, errorMessage: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputBox);
    await this.fillInElement(this.giftingOptionsInputBox, String(amount), {
      stepInfo: 'Filling gifting options input',
      force: true,
    });
    await this.clickOnElement(this.giftingOptionsInputNote, { stepInfo: 'Clicking to trigger validation' });
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputError);
    await this.verifier.verifyElementHasText(this.giftingOptionsInputError, errorMessage);
  }

  async enterTheAmountAndValidateNoError(amount: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputBox);
    await this.fillInElement(this.giftingOptionsInputBox, String(amount), {
      stepInfo: 'Filling gifting options input',
      force: true,
    });
    await this.clickOnElement(this.giftingOptionsInputNote, { stepInfo: 'Clicking to trigger validation' });
    await this.verifier.verifyTheElementIsNotVisible(this.giftingOptionsInputError);
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsSave);
    await this.verifier.verifyTheElementIsEnabled(this.giftingOptionsSave);
  }

  async clickOnSaveButton(): Promise<void> {
    await this.verifier.verifyTheElementIsEnabled(this.giftingOptionsSave);
    await this.clickOnElement(this.giftingOptionsSave, { stepInfo: 'Clicking on Save button' });
  }

  async getTheExistingValueInGiftingOptions(): Promise<string> {
    await this.giftingOptionsInputBox.waitFor({ state: 'visible', timeout: 10000 });
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputBox);
    const value = await this.giftingOptionsInputBox.inputValue();
    return value || '';
  }

  async validateExchangeRateValueInAPI(selectedUsdPerPoint: string): Promise<void> {
    const expectedUsdPerPoint = parseFloat(selectedUsdPerPoint);
    const expectedPointPerUsd = 1 / expectedUsdPerPoint;

    // Set up response listener FIRST
    const responsePromise = this.page.waitForResponse(
      resp =>
        resp.url().includes('/recognition/admin/rewards') && resp.status() === 200 && resp.request().method() === 'GET'
    );

    // Trigger navigation AFTER response listener
    await this.page.goto('/manage/recognition/rewards/overview');
    await this.page.waitForResponse(
      response => response.url().includes('/recognition/admin/rewards') && response.status() === 200
    );

    const manageRewards = new ManageRewardsOverviewPage(this.page);
    await manageRewards.activityPanelTableViewRecognitionItems.last().waitFor({
      state: 'attached',
      timeout: 15000,
    });

    const response = await responsePromise;

    // Defensive logging & handling
    if (!response.ok()) {
      throw new Error(`Expected 200 OK but got status ${response.status()} from ${response.url()}`);
    }
    let responseBody: any;
    try {
      responseBody = await response.json();
    } catch (_e) {
      const bodyText = await response.text();
      throw new Error(`Failed to parse JSON. Raw body: ${bodyText}`);
    }
    const { pointPerUsd, usdPerPoint } = responseBody;
    console.log('✅ Dropdown value selected:', expectedUsdPerPoint);
    console.log('✅ API returned: usdPerPoint =', usdPerPoint, ', pointPerUsd =', pointPerUsd);
    expect(usdPerPoint).toBeCloseTo(expectedUsdPerPoint, 5);
    expect(pointPerUsd).toBeCloseTo(expectedPointPerUsd, 5);
  }

  async setTheHarnessValue(flag: string, value: boolean): Promise<void> {
    await this.page.route('**/api/1.0/client/env/**/target/**/evaluations?cluster=2', async route => {
      const response = await route.fetch();
      const body = await response.json();

      // Modify only the desired flag
      const updatedBody = body.map((item: any) => {
        if (item.flag === flag) {
          return {
            ...item,
            value: value, // just a plain string
            identifier: value, // also plain string
          };
        }
        return item;
      });
      console.log(updatedBody.find((f: any) => f.flag === flag));
      await route.fulfill({
        response,
        body: JSON.stringify(updatedBody),
        headers: {
          ...response.headers(),
          'content-type': 'application/json',
        },
      });
    });
    await this.page.reload();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.giftingOptionsInputBox);
    return Promise.resolve(undefined);
  }

  /**
   * Generate a random number between min and max (inclusive)
   */
  private getRandomNo(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
