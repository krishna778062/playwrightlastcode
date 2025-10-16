import { expect, Locator, Page } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';

import { BasePage } from '@core/ui/pages/basePage';

export class RewardsIndividualAllowance extends BasePage {
  //Individual allowance
  readonly individualAllowance: Locator;
  readonly individualAllowanceIcon: Locator;
  readonly individualAllowanceGreenTick: Locator;
  readonly individualAllowanceHeading: Locator;
  readonly individualAllowanceDescription: Locator;
  readonly addIndividualAllowance: Locator;
  readonly removeIndividualAllowance: Locator;
  readonly editIndividualAllowance: Locator;

  // Page container
  readonly individualAllowanceContainer: Locator;
  readonly addIndividualButton: Locator;
  readonly recentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedUsers: Locator;
  readonly recentlyAddedPointAmountInputPlus: Locator;
  readonly recentlyAddedPointAmountInputMinus: Locator;
  readonly recentlyAddedPointAmountRemove: Locator;
  readonly addedIndividualUser: Locator;
  readonly removeAddedIndividualUser: Locator;
  readonly saveButton: Locator;
  readonly cancelButton: Locator;

  // individual Allowance Text Box
  readonly individualAllowancePageNeutralBox: Locator;
  readonly individualAllowanceBoxMessageLine1: Locator;
  readonly individualAllowanceBoxMessageLine2: Locator;
  readonly individualAllowancePNote: Locator;

  constructor(page: Page) {
    super(page);
    //Individual Allowance
    this.individualAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(3);
    this.individualAllowanceIcon = this.individualAllowance.locator('i[data-testid="i-addUserSingle"]');
    this.individualAllowanceGreenTick = this.individualAllowance.locator('div[class*="PanelActionItem_check"]');
    this.individualAllowanceHeading = this.individualAllowance.getByRole('heading', { name: 'Individual allowances' });
    this.individualAllowanceDescription = this.individualAllowance.getByText(
      'Add individual monthly allowances for selected users'
    );
    // Action buttons
    this.addIndividualAllowance = this.individualAllowance.locator('button[aria-label="Add individual allowances"]');
    this.removeIndividualAllowance = this.individualAllowance.locator(
      'button[aria-label="Remove individual allowances"]'
    );
    this.editIndividualAllowance = this.individualAllowance.locator('button[aria-label="Edit individual allowances"]');

    // Page container
    this.individualAllowanceContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    this.addIndividualButton = this.individualAllowanceContainer.getByRole('button', { name: 'Add user' });
    this.recentlyAddedPointAmountInputBox = this.individualAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr input'
    );
    this.recentlyAddedUsers = this.individualAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"])'
    );
    this.recentlyAddedPointAmountInputPlus = this.individualAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"]) button[aria-label="Plus"]'
    );
    this.recentlyAddedPointAmountInputMinus = this.individualAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"]) button[aria-label="Minus"]'
    );
    this.recentlyAddedPointAmountRemove = this.individualAllowanceContainer.locator(
      'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"]) button[aria-label*="Remove"]'
    );
    this.addedIndividualUser = this.individualAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first();
    this.removeAddedIndividualUser = this.individualAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .last()
      .locator('td button[aria-label*="Remove"]');
    this.saveButton = this.individualAllowanceContainer.getByRole('button', { name: 'Save' });
    this.cancelButton = this.individualAllowanceContainer
      .locator('a[href="/manage/recognition/rewards/peer-gifting/allowances"]')
      .last();

    this.individualAllowancePageNeutralBox = page
      .locator('[class*="IndividualAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    this.individualAllowanceBoxMessageLine1 = this.individualAllowancePageNeutralBox.locator('p:nth-child(1)');
    this.individualAllowanceBoxMessageLine2 = this.individualAllowancePageNeutralBox.locator('p:nth-child(2)');
    this.individualAllowancePNote = this.page.locator('[class*="individualAllowances"] div div div div p').last();
  }

  async validateTheIndividualAllowanceElements(): Promise<void> {
    const containerDescriptionLine1 =
      'Individual allowances replace any other granted allowance for the selected users.';
    const containerDescriptionLine2 = 'Changes to allowances will take effect from the following month.';
    const individualAllowancePNote =
      'Users in multiple individuals will receive a single monthly allowance of the greatest value.';

    const individualAllowanceContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    const individualAllowancePageNeutralBox = this.page
      .locator('[class*="IndividualAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    const individualAllowanceBoxMessageLine1 = individualAllowancePageNeutralBox.locator('p:nth-child(1)');
    const individualAllowanceBoxMessageLine2 = individualAllowancePageNeutralBox.locator('p:nth-child(2)');
    const individualAllowancePNoteElement = this.page
      .locator('[class*="individualAllowances"] div div div div p')
      .last();

    await individualAllowanceContainer.waitFor({ state: 'visible', timeout: 15000 });
    await this.verifier.verifyTheElementIsVisible(individualAllowancePageNeutralBox);
    await this.verifier.verifyElementHasText(individualAllowanceBoxMessageLine1, containerDescriptionLine1);
    await this.verifier.verifyElementHasText(individualAllowanceBoxMessageLine2, containerDescriptionLine2);

    if (await this.verifier.isTheElementVisible(this.recentlyAddedUsers)) {
      await this.verifier.verifyElementHasText(individualAllowancePNoteElement, individualAllowancePNote);
    }
  }

  async addOneIndividualUserInTheAllowance(amount: number): Promise<void> {
    const individualAllowanceContainer = this.page.locator('div[data-testid="pageContainer-page"]');
    await this.verifier.verifyTheElementIsVisible(individualAllowanceContainer);

    const noAudienceList = individualAllowanceContainer.locator(
      '//p[text()="You haven’t created any individual allowances yet"]'
    );

    if (!(await this.verifier.verifyTheElementIsVisible(noAudienceList))) {
      const alreadyAddedUserInputBox = individualAllowanceContainer
        .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
        .first()
        .locator('td input');
      const currentValue = await alreadyAddedUserInputBox.inputValue();
      if (Number(currentValue) !== amount) {
        await this.fillInElement(this.recentlyAddedPointAmountInputBox, String(amount), {
          stepInfo: 'Filling amount in recently added input',
        });
      } else {
        await this.clickOnElement(this.addIndividualButton, {
          stepInfo: 'Clicking add audience button',
        });
        const dialogBox = new DialogBox(this.page);
        await expect(dialogBox.title).toHaveText('Add individual allowance');
        await expect(dialogBox.closeButton).toBeVisible();
        await dialogBox.container.locator('input').last().waitFor({ state: 'visible' });
        await dialogBox.container.locator('input').first().click();
        await dialogBox.container.locator('[role="menuitem"]:not([aria-disabled="true"])').last().click();
        await dialogBox.container.locator('input[id="pointAmount"]').fill(String(amount));
        await expect(dialogBox.container.getByRole('button', { name: 'Add allowance' })).toBeEnabled();
        await dialogBox.container.getByRole('button', { name: 'Add allowance' }).click();
        await this.removeAddedIndividualUser.click();
      }
    } else {
      await this.clickOnElement(this.addIndividualButton, {
        stepInfo: 'Clicking add audience button',
      });
      const dialogBox = new DialogBox(this.page);
      await expect(dialogBox.title).toHaveText('Add individual allowance');
      await expect(dialogBox.closeButton).toBeVisible();
      await dialogBox.container.locator('input').last().waitFor({ state: 'visible' });
      await dialogBox.container.locator('input').first().click();
      await dialogBox.container.locator('[role="menuitem"]:not([aria-disabled="true"])').last().click();
      await dialogBox.container.locator('input[id="pointAmount"]').fill(String(amount));
      await expect(dialogBox.container.getByRole('button', { name: 'Add allowance' })).toBeEnabled();
      await dialogBox.container.getByRole('button', { name: 'Add allowance' }).click();
    }
  }

  async getTheCurrentAmountForLatestAddedUserInIndividualAllowance() {
    await this.recentlyAddedPointAmountInputBox.waitFor({ state: 'attached' });
    const value = await this.recentlyAddedPointAmountInputBox.inputValue();
    return Number(value);
  }

  async getTheCurrentAmountForUserInIndividualAllowance(userName: string) {
    const addedSpecificIndividualUser = this.individualAllowanceContainer.locator(
      `//tr[contains(@data-testid,"dataGridRow")]//div[contains(@class,"IndividualAllowances_userName")]//p[text()="${userName}"]//ancestor::tr//input[@type="number"]`
    );
    const value = await addedSpecificIndividualUser.inputValue();
    return Number(value);
  }

  async increaseTheIndividualAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.recentlyAddedPointAmountInputPlus, {
        stepInfo: `Decreasing amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async decreaseTheIndividualAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.recentlyAddedPointAmountInputMinus, {
        stepInfo: `Decreasing amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.waitUntilElementIsVisible(this.individualAllowanceBoxMessageLine2);
  }
}
