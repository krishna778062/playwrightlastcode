import { expect, Locator, Page } from '@playwright/test';
import { RewardsAllowance } from '@rewards-components/manage-rewards/rewards-allowance';
import { RewardsAudienceAllowance } from '@rewards-components/manage-rewards/rewards-audience-allowance';
import { RewardsIndividualAllowance } from '@rewards-components/manage-rewards/rewards-individual-allowance';
import { RewardsManagerAllowance } from '@rewards-components/manage-rewards/rewards-manager-allowance';
import { RewardsUserAllowance } from '@rewards-components/manage-rewards/rewards-user-allowance';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/ui/pages/basePage';

export class RewardsAllowancePage extends BasePage {
  // Components
  readonly rewardsAllowance: RewardsAllowance;

  // Page elements
  readonly header: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;
  readonly monthlyAllowanceIllustration: Locator;
  readonly monthlyAllowanceIllustrationDescriptionText: Locator;
  readonly monthlyAllowanceIllustrationAudienceRow: Locator;
  readonly monthlyAllowanceIllustrationAudienceColumn: Locator;
  readonly monthlyAllowanceIllustrationIndividualRow: Locator;
  readonly monthlyAllowanceIllustrationIndividualColumn: Locator;
  readonly allowanceDeleteButton: Locator;

  // Access to allowance components through the main component
  readonly rewardsUserAllowance: RewardsUserAllowance;
  readonly rewardsManagerAllowance: RewardsManagerAllowance;
  readonly rewardsAudienceAllowance: RewardsAudienceAllowance;
  readonly rewardsIndividualAllowance: RewardsIndividualAllowance;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_REWARDS_ALLOWANCE_PAGE);

    // Initialize components
    this.rewardsAllowance = new RewardsAllowance(page);

    // Assign component references
    this.rewardsUserAllowance = new RewardsUserAllowance(page);
    this.rewardsManagerAllowance = new RewardsManagerAllowance(page);
    this.rewardsAudienceAllowance = new RewardsAudienceAllowance(page);
    this.rewardsIndividualAllowance = new RewardsIndividualAllowance(page);

    // Page elements - using exact locators from rewards-allowance.ts
    this.header = page.locator('h1, h2, h3').first();
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.cancelButton = page.getByRole('link', { name: 'Cancel' });
    this.monthlyAllowanceIllustration = page.locator('h3 + div table');
    this.monthlyAllowanceIllustrationDescriptionText = page.getByText(
      '*Monthly totals are for guidance only, based on latest edits and current active users.'
    );
    this.monthlyAllowanceIllustrationIndividualRow = this.monthlyAllowanceIllustration.locator(
      'tr[data-testid="Individual allowances"]'
    );
    this.monthlyAllowanceIllustrationIndividualColumn = this.monthlyAllowanceIllustrationIndividualRow.locator('td');
    this.monthlyAllowanceIllustrationAudienceRow = this.monthlyAllowanceIllustration.locator(
      'tr[data-testid="Audience allowances"]'
    );
    this.monthlyAllowanceIllustrationAudienceColumn = this.monthlyAllowanceIllustrationAudienceRow.locator('td');
    this.allowanceDeleteButton = page.locator('button[aria-label*="Remove"]');
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.header, {
      assertionMessage: 'Verify the Rewards Allowance page is loaded',
    });
  }

  async visitAllowancePage(): Promise<void> {
    await this.loadPage();
    await this.verifyThePageIsLoaded();
  }

  async validateAllowanceAddAndEditPageHeader(
    headingText: string,
    descriptionLine1: string,
    descriptionLine2: string
  ): Promise<void> {
    const allowanceHeader = this.page.locator('[class*="PageContainer-module__headerInner"]');
    const allowanceBackToAllowancePage = allowanceHeader.locator('button span:has-text("Allowances")');
    const allowancePageHeading = allowanceHeader.locator('h1[class*="Typography-module"]');
    const allowancePageDescriptionLine1 = allowanceHeader.locator('[class*="TypographyBody-module"] p:nth-child(1)');
    const allowancePageDescriptionLine2 = allowanceHeader.locator('[class*="TypographyBody-module"] p:nth-child(2)');

    await this.verifier.verifyTheElementIsVisible(allowanceHeader);
    await this.verifier.verifyTheElementIsVisible(allowanceBackToAllowancePage);
    await this.verifier.verifyElementHasText(allowancePageHeading, headingText);
    await this.verifier.verifyElementHasText(allowancePageDescriptionLine1, descriptionLine1);
    await this.verifier.verifyElementHasText(allowancePageDescriptionLine2, descriptionLine2);
  }

  async saveAmount(): Promise<void> {
    await this.clickOnElement(this.saveButton, {
      stepInfo: 'Clicking save button',
    });
  }

  async removeTheExistingAllowance(allowanceType: 'user' | 'audience' | 'individual' | 'manager'): Promise<void> {
    const dialogBoxTitle = allowanceType === 'user' ? 'Remove users allowance' : `Remove ${allowanceType} allowances`;
    const dialogBoxDescriptionLine1 =
      allowanceType === 'user'
        ? 'Are you sure you want to remove the users allowance?'
        : `Are you sure you want to remove ${allowanceType} allowances?`;
    const dialogBoxDescriptionLine2 = `This change will take effect from the following month. Affected users will continue to have access to their allowance for the remainder of the current month.`;

    const deleteUserAllowanceDialogBox = this.page.getByRole('dialog');
    const dialogBoxTitleElement = deleteUserAllowanceDialogBox.getByRole('heading', { level: 2 });
    const dialogBoxConfirmationTextLine1 = deleteUserAllowanceDialogBox.locator('p[class*="module__heading3"]');
    const dialogBoxConfirmationTextLine2 = deleteUserAllowanceDialogBox.locator('p[class*="module__paragraph"]');
    const dialogRemoveButton = deleteUserAllowanceDialogBox.getByRole('button', { name: 'Remove' });

    switch (allowanceType) {
      case 'user':
        await this.clickOnElement(this.rewardsUserAllowance.removeUserAllowance, {
          stepInfo: 'Removing user allowance',
        });
        break;
      case 'audience':
        await this.clickOnElement(this.rewardsAudienceAllowance.removeAudienceAllowance, {
          stepInfo: 'Removing audience allowance',
        });
        break;
      case 'individual':
        await this.clickOnElement(this.rewardsIndividualAllowance.removeIndividualAllowance, {
          stepInfo: 'Removing individual allowance',
        });
        break;
      case 'manager':
        await this.clickOnElement(this.rewardsManagerAllowance.removeManagerAllowance, {
          stepInfo: 'Removing manager allowance',
        });
        break;
    }

    await this.verifier.verifyTheElementIsVisible(deleteUserAllowanceDialogBox);
    await this.verifier.verifyElementHasText(dialogBoxTitleElement, dialogBoxTitle);
    await this.verifier.verifyElementHasText(dialogBoxConfirmationTextLine1, dialogBoxDescriptionLine1);
    await this.verifier.verifyElementHasText(dialogBoxConfirmationTextLine2, dialogBoxDescriptionLine2);
    await this.verifier.verifyTheElementIsVisible(dialogRemoveButton);
    await this.clickOnElement(dialogRemoveButton, { force: true });
  }

  async validateToastMessage(message: string): Promise<void> {
    const successToastContainer = this.page.locator('div[class*="Toast-module__success"]');
    const successToastBoxMessage = successToastContainer.locator('p');
    const successToastBoxIcon = successToastContainer.locator('i[data-testid="i-checkLarge"]');
    const successToastBoxClose = successToastContainer.locator('button[aria-label="Dismiss"]');

    await successToastContainer.waitFor({ state: 'attached', timeout: 30000 });
    await this.verifier.verifyTheElementIsVisible(successToastContainer);
    await this.verifier.verifyTheElementIsVisible(successToastBoxIcon);
    await this.verifier.verifyElementHasText(successToastBoxMessage, message);
    await this.clickOnElement(successToastBoxClose, {
      stepInfo: 'Closing toast message',
    });
    await successToastContainer.waitFor({ state: 'detached', timeout: 30000 });
  }

  async checkTheSingleDeletion(page: Page): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardsIndividualAllowance.individualAllowanceHeading);
    let deleteBtnCount: number = await this.allowanceDeleteButton.count();

    if (deleteBtnCount == 1) {
      await this.allowanceDeleteButton.waitFor({ state: 'attached' });
      await this.allowanceDeleteButton.hover({ force: true });
      await page.locator('div[role="tooltip"]').first().waitFor({ state: 'attached' });
      const tooltipText = await page.locator('div[role="tooltip"]').first().textContent();
      expect(tooltipText).toEqual('A minimum of one allowance is required while peer gifting is enabled');
    } else {
      for (let i = deleteBtnCount; i > 1; i--) {
        await this.clickOnElement(this.allowanceDeleteButton.nth(i - 1), {
          stepInfo: 'Clicking delete button',
        });

        const deleteUserAllowanceDialogBox = page.getByRole('dialog');
        const dialogBoxConfirmationTextLine1 = deleteUserAllowanceDialogBox.locator('p[class*="module__heading3"]');
        const dialogBoxConfirmationTextLine2 = deleteUserAllowanceDialogBox.locator('p[class*="module__paragraph"]');
        const dialogRemoveButton = deleteUserAllowanceDialogBox.getByRole('button', { name: 'Remove' });

        await this.verifier.verifyTheElementIsVisible(deleteUserAllowanceDialogBox);
        await this.verifier.verifyTheElementIsVisible(dialogBoxConfirmationTextLine1);
        await this.verifier.verifyTheElementIsVisible(dialogBoxConfirmationTextLine2);
        await this.verifier.verifyTheElementIsVisible(dialogRemoveButton);
        await this.clickOnElement(dialogRemoveButton, { force: true });
        await this.validateToastMessage('Saved changes successfully');

        deleteBtnCount = await this.allowanceDeleteButton.count();
        if (deleteBtnCount === 1) break;
      }

      await this.allowanceDeleteButton.last().waitFor({ state: 'attached' });
      await this.allowanceDeleteButton.last().hover({ force: true });
      const tooltipText = await page.locator('div[role="tooltip"]').first().textContent();
      expect(tooltipText).toEqual('A minimum of one allowance is required while peer gifting is enabled');
    }
  }
}
