import { expect, Locator, Page } from '@playwright/test';

import { BasePage } from '@core/ui';

export class RewardsAllowancePage extends BasePage {
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

  // User Allowance elements
  readonly userAllowance: Locator;
  readonly userAllowanceIcon: Locator;
  readonly userAllowanceGreenTick: Locator;
  readonly userAllowanceHeading: Locator;
  readonly userAllowanceDescription: Locator;
  readonly addUserAllowance: Locator;
  readonly editUserAllowance: Locator;
  readonly removeUserAllowance: Locator;
  readonly currencyConversionInfoIcon: Locator;
  readonly pointAmountInput: Locator;
  readonly increaseAmountButton: Locator;
  readonly decreaseAmountButton: Locator;
  readonly pointAmountLimitError: Locator;

  // Manager Allowance elements
  readonly managerAllowance: Locator;
  readonly managerAllowanceIcon: Locator;
  readonly managerAllowanceGreenTick: Locator;
  readonly managerAllowanceHeading: Locator;
  readonly managerAllowanceDescription: Locator;
  readonly addManagerAllowance: Locator;
  readonly editManagerAllowance: Locator;
  readonly removeManagerAllowance: Locator;
  readonly fixedCurrencyConversionInfoIcon: Locator;
  readonly variableCurrencyConversionInfoIcon: Locator;
  readonly fixedPointAmountLimitError: Locator;
  readonly variablePointAmountLimitError: Locator;
  readonly fixedPointAmountInput: Locator;
  readonly variablePointAmountInput: Locator;
  readonly increaseFXMonthlyAmountButton: Locator;
  readonly decreaseFXMonthlyAmountButton: Locator;
  readonly increaseVariableMonthlyAmountButton: Locator;
  readonly decreaseVariableMonthlyAmountButton: Locator;

  // Audience Allowance elements
  readonly audienceAllowance: Locator;
  readonly audienceAllowanceIcon: Locator;
  readonly audienceAllowanceGreenTick: Locator;
  readonly audienceAllowanceHeading: Locator;
  readonly audienceAllowanceDescription: Locator;
  readonly addAudienceAllowance: Locator;
  readonly editAudienceAllowance: Locator;
  readonly removeAudienceAllowance: Locator;
  readonly addAudienceButton: Locator;
  readonly recentlyAddedIndicator: Locator;
  readonly recentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedPointUserCount: Locator;
  readonly errorTitle: Locator;
  readonly errorSubtitle: Locator;
  readonly errorReloadButton: Locator;

  // Individual Allowance elements
  readonly individualAllowance: Locator;
  readonly individualAllowanceIcon: Locator;
  readonly individualAllowanceGreenTick: Locator;
  readonly individualAllowanceHeading: Locator;
  readonly individualAllowanceDescription: Locator;
  readonly addIndividualAllowance: Locator;
  readonly editIndividualAllowance: Locator;
  readonly removeIndividualAllowance: Locator;
  readonly addIndividualButton: Locator;
  readonly recentlyAddedUsers: Locator;
  readonly individualRecentlyAddedPointAmountInputBox: Locator;
  readonly recentlyAddedPointAmountInputPlus: Locator;
  readonly recentlyAddedPointAmountInputMinus: Locator;

  constructor(page: Page) {
    super(page, '/manage/recognition/rewards/peer-gifting/allowances');

    // Page elements
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

    // User Allowance elements
    this.userAllowance = page.locator('div[class*="PanelActionItem_layout"]').first();
    this.userAllowanceIcon = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .locator('i[data-testid="i-addUserMulti"]');
    this.userAllowanceGreenTick = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .locator('div[class*="PanelActionItem_check"]');
    this.userAllowanceHeading = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .getByRole('heading', { name: 'Users allowance' });
    this.userAllowanceDescription = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .getByText('Add a monthly allowance for');
    this.addUserAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .getByRole('link', { name: 'Add users allowance' });
    this.editUserAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .getByRole('link', { name: 'Edit users allowance' });
    this.removeUserAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .first()
      .getByRole('button', { name: 'Remove users allowance' });
    this.currencyConversionInfoIcon = page.locator('button[aria-label="Currency conversion information"]');
    this.pointAmountInput = page.locator('#pointAmount');
    this.increaseAmountButton = page.locator('[aria-label="Plus"]');
    this.decreaseAmountButton = page.locator('[aria-label="Minus"]');
    this.pointAmountLimitError = page.locator('div[class*="Field-module__error"] p');

    // Manager Allowance elements
    this.managerAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(1);
    this.managerAllowanceIcon = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .locator('i[data-testid="i-orgchartUser"]');
    this.managerAllowanceGreenTick = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .locator('div[class*="PanelActionItem_check"]');
    this.managerAllowanceHeading = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .getByRole('heading', { name: 'Manager allowances' });
    this.managerAllowanceDescription = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .getByText('Add monthly allowances for people managers');
    this.addManagerAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .getByRole('link', { name: 'Add manager allowances' });
    this.editManagerAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .getByRole('link', { name: 'Edit manager allowances' });
    this.removeManagerAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1)
      .getByRole('button', { name: 'Remove manager allowances' });
    this.fixedCurrencyConversionInfoIcon = page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(0);
    this.variableCurrencyConversionInfoIcon = page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(1);
    this.fixedPointAmountLimitError = page.locator('[class*="Allowances_numberInput"] p[role="alert"]').nth(0);
    this.variablePointAmountLimitError = page.locator('[class*="Allowances_numberInput"] p[role="alert"]').nth(1);
    this.fixedPointAmountInput = page.locator('[class*="NumberInput-module"]').locator('input').nth(0);
    this.variablePointAmountInput = page.locator('[class*="NumberInput-module"]').locator('input').nth(1);
    this.increaseFXMonthlyAmountButton = page
      .locator('[class*="NumberInput-module"]')
      .locator('[aria-label="Plus"]')
      .nth(0);
    this.decreaseFXMonthlyAmountButton = page
      .locator('[class*="NumberInput-module"]')
      .locator('[aria-label="Minus"]')
      .nth(0);
    this.increaseVariableMonthlyAmountButton = page
      .locator('[class*="NumberInput-module"]')
      .locator('[aria-label="Plus"]')
      .nth(1);
    this.decreaseVariableMonthlyAmountButton = page
      .locator('[class*="NumberInput-module"]')
      .locator('[aria-label="Minus"]')
      .nth(1);

    // Audience Allowance elements
    this.audienceAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(2);
    this.audienceAllowanceIcon = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .locator('i[data-testid="i-addProfileImageMulti"]');
    this.audienceAllowanceGreenTick = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .locator('div[class*="PanelActionItem_check"]');
    this.audienceAllowanceHeading = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .getByRole('heading', { name: 'Audience allowances' });
    this.audienceAllowanceDescription = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .getByText('Add monthly allowances for users in selected audiences');
    this.addAudienceAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .getByRole('link', { name: 'Add audience allowances' });
    this.editAudienceAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .getByRole('link', { name: 'Edit audience allowances' });
    this.removeAudienceAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2)
      .getByRole('button', { name: 'Remove audience allowances' });
    this.addAudienceButton = page
      .locator('div[data-testid="pageContainer-page"]')
      .getByRole('button', { name: 'Add audience' });
    this.recentlyAddedIndicator = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('table[class*="Table-module__table"] tr:has(div[class*="AudienceAllowances_indicator"])');
    this.recentlyAddedPointAmountInputBox = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('table[class*="Table-module__table"] tr:has(div[class*="AudienceAllowances_indicator"]) input');
    this.recentlyAddedPointUserCount = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"] td:nth-child(2) p');
    this.errorTitle = page.getByText('Something went wrong', { exact: true });
    this.errorSubtitle = page.getByText('Reload the page to try again', { exact: true });
    this.errorReloadButton = page.getByRole('button', { name: 'Reload' });

    // Individual Allowance elements
    this.individualAllowance = page.locator('div[class*="PanelActionItem_layout"]').nth(3);
    this.individualAllowanceIcon = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .locator('i[data-testid="i-addUserSingle"]');
    this.individualAllowanceGreenTick = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .locator('div[class*="PanelActionItem_check"]');
    this.individualAllowanceHeading = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .getByRole('heading', { name: 'Individual allowances' });
    this.individualAllowanceDescription = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .getByText('Add individual monthly allowances for selected users');
    this.addIndividualAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .getByRole('link', { name: 'Add individual allowances' });
    this.editIndividualAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .getByRole('link', { name: 'Edit individual allowances' });
    this.removeIndividualAllowance = page
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(3)
      .getByRole('button', { name: 'Remove individual allowances' });
    this.addIndividualButton = page
      .locator('div[data-testid="pageContainer-page"]')
      .getByRole('button', { name: 'Add user' });
    this.recentlyAddedUsers = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"])');
    this.individualRecentlyAddedPointAmountInputBox = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('table[class*="Table-module__table"] tr input');
    this.recentlyAddedPointAmountInputPlus = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator(
        'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"]) button[aria-label="Plus"]'
      );
    this.recentlyAddedPointAmountInputMinus = page
      .locator('div[data-testid="pageContainer-page"]')
      .locator(
        'table[class*="Table-module__table"] tr:has(div[class*="IndividualAllowances_indicator"]) button[aria-label="Minus"]'
      );
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
        await this.clickOnElement(this.removeUserAllowance, {
          stepInfo: 'Removing user allowance',
        });
        break;
      case 'audience':
        await this.clickOnElement(this.removeAudienceAllowance, {
          stepInfo: 'Removing audience allowance',
        });
        break;
      case 'individual':
        await this.clickOnElement(this.removeIndividualAllowance, {
          stepInfo: 'Removing individual allowance',
        });
        break;
      case 'manager':
        await this.clickOnElement(this.removeManagerAllowance, {
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
    await this.verifier.verifyTheElementIsVisible(this.individualAllowanceHeading);
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

  // User Allowance methods
  async validateTheUsersAllowanceElements(): Promise<void> {
    const containerDescriptionLine1 = 'The monthly users allowance applies individually to each intranet user.';
    const containerDescriptionLine2 = 'Changes to allowances will take effect from the following month.';
    const userAllowancePageNeutralBox = this.page.locator(
      '[class*="UserAllowances_flexCenter"] div[class*="Panel-module__panel"]'
    );
    const userAllowanceBoxMessageLine1 = userAllowancePageNeutralBox.locator('p:nth-child(1)');
    const userAllowanceBoxMessageLine2 = userAllowancePageNeutralBox.locator('p:nth-child(2)');

    await this.verifier.verifyTheElementIsVisible(userAllowancePageNeutralBox);
    await this.verifier.verifyElementHasText(userAllowanceBoxMessageLine1, containerDescriptionLine1);
    await this.verifier.verifyElementHasText(userAllowanceBoxMessageLine2, containerDescriptionLine2);
  }

  async enterThePointAmount(amount: number): Promise<void> {
    await this.fillInElement(this.pointAmountInput, String(amount), {
      stepInfo: `Entering point amount: ${amount}`,
    });
  }

  async increaseTheUserAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.increaseAmountButton, {
        stepInfo: `Increasing amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async decreaseTheUserAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.decreaseAmountButton, {
        stepInfo: `Decreasing amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async getTheCurrentAmountInInputBox(): Promise<number> {
    const value = await this.pointAmountInput.inputValue();
    return parseInt(value) || 0;
  }

  // Manager Allowance methods
  async validateTheManagerAllowanceElements(): Promise<void> {
    const containerDescriptionLine1 =
      'Manager allowances apply individually to every people manager, replacing any users allowance they have.';
    const containerDescriptionLine2 =
      'Users eligible for both a manager and audience allowance will receive whichever single allowance has the greatest value.';
    const containerDescriptionLine3 = 'Changes to allowances will take effect from the following month.';
    const managerAllowancePNote = 'Managers are not restricted to gifting points to direct reports.';

    const managerAllowancePageNeutralBox = this.page
      .locator('[class*="ManagerAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    const managerAllowanceBoxMessageLine1 = managerAllowancePageNeutralBox.locator('p:nth-child(1)');
    const managerAllowanceBoxMessageLine2 = managerAllowancePageNeutralBox.locator('p:nth-child(2)');
    const managerAllowanceBoxMessageLine3 = managerAllowancePageNeutralBox.locator('p:nth-child(3)');
    const fixedMonthlyAllowanceRadioButton = this.page.locator('label[for="allowanceTypeFIXED"] input');
    const variableMonthlyAllowanceRadioButton = this.page.locator('label[for="allowanceTypePER_DIRECT_REPORT"] input');
    const managerAllowancePNoteElement = this.page.locator('[class*="Field-module__note"]');

    await this.verifier.verifyTheElementIsVisible(managerAllowancePageNeutralBox);
    await this.verifier.verifyElementHasText(managerAllowanceBoxMessageLine1, containerDescriptionLine1);
    await this.verifier.verifyElementHasText(managerAllowanceBoxMessageLine2, containerDescriptionLine2);
    await this.verifier.verifyElementHasText(managerAllowanceBoxMessageLine3, containerDescriptionLine3);
    await this.verifier.verifyTheElementIsVisible(fixedMonthlyAllowanceRadioButton);
    await this.verifier.verifyTheElementIsVisible(variableMonthlyAllowanceRadioButton);
    await this.verifier.verifyElementHasText(managerAllowancePNoteElement, managerAllowancePNote);
  }

  async enterTheFixedPointAmount(amount: number): Promise<void> {
    await this.fillInElement(this.fixedPointAmountInput, String(amount), {
      stepInfo: `Entering fixed point amount: ${amount}`,
    });
  }

  async increaseTheFXMonthlyAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.increaseFXMonthlyAmountButton, {
        stepInfo: `Increasing fixed monthly amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async decreaseTheFXMonthlyAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.decreaseFXMonthlyAmountButton, {
        stepInfo: `Decreasing fixed monthly amount by 1 (${i + 1}/${amount})`,
      });
    }
  }

  async getTheCurrentAmountInFixedInputBox(): Promise<number> {
    const value = await this.fixedPointAmountInput.inputValue();
    return parseInt(value) || 0;
  }

  async getTheCurrentAmountInVariableInputBox(): Promise<number> {
    const value = await this.variablePointAmountInput.inputValue();
    return parseInt(value) || 0;
  }

  async addTheVariableAmount(amount: number): Promise<void> {
    await this.page.waitForTimeout(2000);
    const variableMonthlyAllowanceRadioButton = this.page.locator('label[for="allowanceTypePER_DIRECT_REPORT"] input');
    const variableCurrencyConversionInfoIcon = this.page
      .locator('[class*="Allowances_numberInput"] button[aria-label="Currency conversion information"]')
      .nth(1);
    const managerAllowanceBoxMessageVariableLine1 = this.page
      .locator('[class*="ManagerAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(1)
      .locator('p:nth-child(1)');
    const managerAllowanceBoxMessageVariableLine2 = this.page
      .locator('[class*="ManagerAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(1)
      .locator('p:nth-child(2)');

    await this.clickOnElement(variableMonthlyAllowanceRadioButton, { force: true });
    await this.verifier.verifyTheElementIsVisible(variableCurrencyConversionInfoIcon);
    await this.fillInElement(this.variablePointAmountInput, String(amount), {
      stepInfo: `Adding variable amount: ${amount}`,
    });

    await this.verifier.verifyTheElementIsVisible(managerAllowanceBoxMessageVariableLine1);
    await this.verifier.verifyTheElementIsVisible(managerAllowanceBoxMessageVariableLine2);
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
    const audienceAllowancePageNeutralBox = this.page
      .locator('[class*="AudienceAllowances_flexCenter"] div[class*="Panel-module__panel"]')
      .nth(0);
    const audienceAllowanceBoxMessageLine1 = audienceAllowancePageNeutralBox.locator('p:nth-child(1)');
    const audienceAllowanceBoxMessageLine2 = audienceAllowancePageNeutralBox.locator('p:nth-child(2)');
    const audienceAllowanceBoxMessageLine3 = audienceAllowancePageNeutralBox.locator('p:nth-child(3)');
    const addedAudienceRowInContainer = this.page
      .locator('div[data-testid="pageContainer-page"]')
      .locator('tr:has(div[class*="AudienceAllowances"]) input');
    const audienceAllowancePNoteElement = this.page.locator('[class*="AudienceAllowances"] div div div div p').last();

    await audienceAllowancePageNeutralBox.waitFor({ state: 'visible' });
    await this.verifier.verifyTheElementIsVisible(audienceAllowanceHeadingInContainer);
    await this.verifier.verifyElementHasText(audienceAllowanceHeadingInContainer, allowancePageHeading);
    await this.verifier.verifyElementHasText(audienceAllowanceDescriptionLine1, allowancePageDescription);
    await this.verifier.verifyElementHasText(audienceAllowanceDescriptionLine2, allowancePageDescription2);
    await this.verifier.verifyTheElementIsVisible(audienceAllowancePageNeutralBox);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine1, containerDescriptionLine1);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine2, containerDescriptionLine2);
    await this.verifier.verifyElementHasText(audienceAllowanceBoxMessageLine3, containerDescriptionLine3);

    if (await this.verifier.isTheElementVisible(addedAudienceRowInContainer)) {
      await this.verifier.verifyElementHasText(audienceAllowancePNoteElement, audienceAllowancePNote);
    }
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

  async getTheCurrentAmountForLatestAddedAudience(): Promise<number> {
    const value = await this.recentlyAddedPointAmountInputBox.inputValue();
    return Number(value);
  }

  async getTheCurrentUserCountForLatestAddedAudience(): Promise<number> {
    const userCountInAudience = await this.recentlyAddedPointUserCount.textContent();
    return Number(userCountInAudience?.replace(/\D/g, ''));
  }

  async visitAudienceAllowancePage(): Promise<void> {
    await this.page.goto('/manage/recognition/rewards/peer-gifting/allowances/audience');
    await this.verifyThePageIsLoaded();
  }

  async visitToAllowanceWithInterruption(): Promise<void> {
    await this.page.route('**/recognition/admin/rewards/allowances/monthly/audience', route => route.abort());
  }

  async verifyErrorMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.errorTitle);
    await this.verifier.verifyTheElementIsVisible(this.errorSubtitle);
    await this.verifier.verifyTheElementIsVisible(this.errorReloadButton);
  }

  async clickOnReloadButtonWithoutAnyInterruption(): Promise<void> {
    await this.page.unroute('**/recognition/admin/rewards/allowances/monthly/audience');
    await this.clickOnElement(this.errorReloadButton, {
      stepInfo: 'Clicking reload button',
    });
    await this.page.waitForLoadState('domcontentloaded');
    await this.verifier.verifyTheElementIsVisible(this.saveButton);
  }

  // Individual Allowance methods
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
    await individualAllowanceContainer.waitFor({ state: 'attached' });

    const addedIndividualUser = individualAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .first();
    const removeAddedIndividualUser = individualAllowanceContainer
      .locator('table[class*="Table-module__table"] tr[data-testid*="dataGridRow"]')
      .last()
      .locator('td button[aria-label*="Remove"]');

    let anyUserAdded: boolean;
    try {
      await addedIndividualUser.waitFor({ state: 'visible', timeout: 10000 });
      anyUserAdded = true;
    } catch {
      console.log('❌ Element not visible within 10s');
      anyUserAdded = false;
    }

    if (!anyUserAdded) {
      await this.clickOnElement(this.addIndividualButton, {
        stepInfo: 'Clicking add individual button',
      });
      // Dialog handling would go here
    } else {
      const currentValue = await this.getTheCurrentAmountForLatestAddedUserInIndividualAllowance();
      if (currentValue !== amount) {
        await this.fillInElement(this.individualRecentlyAddedPointAmountInputBox, String(amount), {
          stepInfo: 'Filling amount in recently added input',
        });
      } else {
        await this.clickOnElement(this.addIndividualButton, {
          stepInfo: 'Clicking add individual button',
        });
        // Dialog handling would go here
        await this.clickOnElement(removeAddedIndividualUser, {
          stepInfo: 'Removing added individual user',
        });
      }
    }
  }

  async getTheCurrentAmountForLatestAddedUserInIndividualAllowance(): Promise<number> {
    await this.individualRecentlyAddedPointAmountInputBox.waitFor({ state: 'attached' });
    const value = await this.individualRecentlyAddedPointAmountInputBox.inputValue();
    return Number(value);
  }

  async increaseTheIndividualAmountBy(amount: number): Promise<void> {
    for (let i = 0; i < amount; i++) {
      await this.clickOnElement(this.recentlyAddedPointAmountInputPlus, {
        stepInfo: `Increasing amount by 1 (${i + 1}/${amount})`,
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
}
