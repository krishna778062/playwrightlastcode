import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsAudienceAllowance extends BasePage {
  //Audience allowance
  readonly audienceAllowance: Locator;
  readonly audienceAllowanceIcon: Locator;
  readonly audienceAllowanceGreenTick: Locator;
  readonly audienceAllowanceHeading: Locator;
  readonly audienceAllowanceDescription: Locator;
  readonly addAudienceAllowance: Locator;
  readonly removeAudienceAllowance: Locator;
  readonly editAudienceAllowance: Locator;
  // Page container
  readonly audienceAllowanceContainer: Locator;
  readonly addAudienceButton: Locator;
  readonly addedAudienceRowInContainer: Locator;
  readonly recentlyAddedIndicator: Locator;
  readonly recentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedPointUserCount: Locator;

  //allowance header container
  readonly audienceHeaderContainer: Locator;
  readonly audienceAllowanceDescriptionLine1: Locator;
  readonly audienceAllowanceDescriptionLine2: Locator;
  readonly audienceAllowanceHeadingInContainer: Locator;

  // Audience Allowance Text Box
  readonly audienceAllowancePageNeutralBox: Locator;
  readonly audienceAllowanceBoxMessageLine1: Locator;
  readonly audienceAllowanceBoxMessageLine2: Locator;
  readonly audienceAllowanceBoxMessageLine3: Locator;
  readonly audienceAllowancePNote: Locator;
  private removeAddedAudience: Locator;
  private alreadyAddedAudience: Locator;
  private alreadyAddedAudienceInputBox: Locator;
  private errorTitle: Locator;
  private errorSubtitle: Locator;
  private errorReloadButton: Locator;

  constructor(page: Page) {
    super(page);
    // Locators for the User Allowance elements in Manage Rewards page
    //Audience Allowance
    this.audienceAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(2);
    this.audienceAllowanceIcon = this.audienceAllowance.locator('i[data-testid="i-addProfileImageMulti"]');
    this.audienceAllowanceGreenTick = this.audienceAllowance.locator('div[class*="PanelActionItem_check"]');
    this.audienceAllowanceHeading = this.audienceAllowance.getByRole('heading', { name: 'Audience allowances' });
    this.audienceAllowanceDescription = this.audienceAllowance.getByText(
      'Add monthly allowances for users in selected audiences'
    );
    // Action buttons
    this.addAudienceAllowance = this.audienceAllowance.getByRole('link', { name: 'Add audience allowances' });
    this.removeAudienceAllowance = this.audienceAllowance.getByRole('button', { name: 'Remove audience allowances' });
    this.editAudienceAllowance = this.audienceAllowance.getByRole('link', { name: 'Edit audience allowances' });

    // Page container
    this.audienceHeaderContainer = page.locator('header[class*="PageContainer-module__header"]');
    this.audienceAllowanceHeadingInContainer = this.audienceHeaderContainer.getByRole('heading', { level: 1 });
    this.audienceAllowanceDescriptionLine1 = this.audienceHeaderContainer.locator('p').nth(0);
    this.audienceAllowanceDescriptionLine2 = this.audienceHeaderContainer.locator('p').nth(1);
    this.audienceAllowanceContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    this.addAudienceButton = this.audienceAllowanceContainer.getByRole('button', { name: 'Add audience' });
    this.addedAudienceRowInContainer = this.audienceAllowanceContainer.locator(
      'tr:has(div[class*="AudienceAllowances"]) input'
    );
    this.recentlyAddedIndicator = this.audienceAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="AudienceAllowances_indicator"])'
    );
    this.recentlyAddedPointAmountInputBox = this.audienceAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="AudienceAllowances_indicator"]) input'
    );
    this.recentlyAddedPointUserCount = this.audienceAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr[data-testid*="dataGridRow"] td:nth-child(2) p'
    );
    this.alreadyAddedAudience = this.audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first();
    this.alreadyAddedAudienceInputBox = this.audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first()
      .locator('td input');
    this.removeAddedAudience = this.audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .last()
      .locator('td button[aria-label*="Remove"]');

    this.audienceAllowancePageNeutralBox = page
      .locator('[class*="AudienceAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    this.audienceAllowanceBoxMessageLine1 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(1)');
    this.audienceAllowanceBoxMessageLine2 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(2)');
    this.audienceAllowanceBoxMessageLine3 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(3)');
    this.audienceAllowancePNote = this.page.locator('[class*="AudienceAllowances"] div div div div p').last();

    this.errorTitle = page.getByText('Something went wrong', { exact: true });
    this.errorSubtitle = page.getByText('Reload the page to try again', { exact: true });
    this.errorReloadButton = page.getByRole('button', { name: 'Reload' });
  }

  async visitAudienceAllowancePage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances');
    await this.page.waitForLoadState('networkidle');
  }

  async verifyErrorMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.errorTitle);
    await this.verifier.verifyTheElementIsVisible(this.errorSubtitle);
    await this.verifier.verifyTheElementIsVisible(this.errorReloadButton);
  }

  async getTheCurrentAmountForLatestAddedAudience(): Promise<number> {
    const value = await this.recentlyAddedPointAmountInputBox.inputValue();
    return parseInt(value) || 0;
  }

  async getTheCurrentUserCountForLatestAddedAudience(): Promise<number> {
    const text = await this.recentlyAddedPointUserCount.textContent();
    const match = text?.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  }

  async visitToAllowanceWithInterruption(): Promise<void> {
    // Simulate network interruption
    await this.page.route('**/recognition/admin/rewards/**', route => route.abort());
    await this.visitAudienceAllowancePage();
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.audienceAllowanceDescriptionLine2);
    return Promise.resolve(undefined);
  }

  async addOneAudienceInTheAllowance(amount: number): Promise<void> {
    const audienceAllowanceContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    await audienceAllowanceContainer.waitFor({ state: 'attached' });

    const alreadyAddedAudience = audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first();
    const alreadyAddedAudienceInputBox = audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first()
      .locator('td input');
    const removeAddedAudience = audienceAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .last()
      .locator('td button[aria-label*="Remove"]');

    let anyUserAdded: boolean;
    try {
      await alreadyAddedAudience.waitFor({ state: 'visible', timeout: 10000 });
      anyUserAdded = true;
    } catch {
      console.log('❌ Element not visible within 10s');
      anyUserAdded = false;
    }

    if (!anyUserAdded) {
      await this.clickOnElement(this.addAudienceButton, {
        stepInfo: 'Clicking add audience button',
      });
      // Dialog handling would go here
    } else {
      const currentValue = await alreadyAddedAudienceInputBox.inputValue();
      if (Number(currentValue) !== amount) {
        await this.fillInElement(this.recentlyAddedPointAmountInputBox, String(amount), {
          stepInfo: 'Filling amount in recently added input',
        });
      } else {
        await this.clickOnElement(this.addAudienceButton, {
          stepInfo: 'Clicking add audience button',
        });
        // Dialog handling would go here
        await this.clickOnElement(removeAddedAudience, {
          stepInfo: 'Removing added audience',
        });
      }
    }
  }

  async clickOnReloadButtonWithoutAnyInterruption(): Promise<void> {
    await this.page.unroute('**/recognition/admin/rewards/allowances/monthly/audience');
    await this.clickOnElement(this.errorReloadButton, {
      stepInfo: 'Clicking reload button',
    });
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifier.verifyTheElementIsVisible(this.audienceAllowanceContainer);
  }

  // Audience Allowance methods
  async validateTheAudienceAllowanceElements(): Promise<void> {
    const allowancePageHeading = 'Audience allowances';
    const allowancePageDescription = 'Add monthly allowances for users in selected audiences.';
    const allowancePageDescription2 =
      'Allowances refresh on the 1st of every month. Unused points expire and are not charged for.';
    const containerDescriptionLine1 =
      'Audience allowances apply individually to each audience member, replacing any users allowance these members may have.';
    const containerDescriptionLine2 =
      'Users eligible for both an audience and manager allowance will receive whichever single allowance has the greatest value.';
    const containerDescriptionLine3 = 'Changes to allowances will take effect from the following month.';
    const audienceAllowancePNote =
      'Users in multiple audiences will receive a single monthly allowance of the greatest value.';

    const audienceHeaderContainer = this.page.locator('header[class*="PageContainer-module__header"]');
    const audienceAllowanceHeadingInContainer = audienceHeaderContainer.getByRole('heading', { level: 1 });
    const audienceAllowanceDescriptionLine1 = audienceHeaderContainer.locator('p').nth(0);
    const audienceAllowanceDescriptionLine2 = audienceHeaderContainer.locator('p').nth(1);

    const audienceAllowanceBoxMessageLine1 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(1)');
    const audienceAllowanceBoxMessageLine2 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(2)');
    const audienceAllowanceBoxMessageLine3 = this.audienceAllowancePageNeutralBox.locator('p:nth-child(3)');
    const addedAudienceRowInContainer = this.page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('tr:has(div[class*="AudienceAllowances"]) input');
    const audienceAllowancePNoteElement = this.page.locator('[class*="AudienceAllowances"] div div div div p').last();

    await this.audienceAllowancePageNeutralBox.waitFor({ state: 'visible' });
    await this.verifier.verifyTheElementIsVisible(audienceAllowanceHeadingInContainer);
    await this.verifier.verifyElementHasText(audienceAllowanceHeadingInContainer, allowancePageHeading);
    await this.verifier.verifyElementHasText(audienceAllowanceDescriptionLine1, allowancePageDescription);
    await this.verifier.verifyElementHasText(audienceAllowanceDescriptionLine2, allowancePageDescription2);
    await this.verifier.verifyTheElementIsVisible(this.audienceAllowancePageNeutralBox);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine1, containerDescriptionLine1);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine2, containerDescriptionLine2);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine3, containerDescriptionLine3);

    if (await this.verifier.isTheElementVisible(addedAudienceRowInContainer)) {
      await this.verifier.verifyElementHasText(audienceAllowancePNoteElement, audienceAllowancePNote);
    }
  }
}
