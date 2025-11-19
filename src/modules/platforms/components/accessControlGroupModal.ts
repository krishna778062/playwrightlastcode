import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import {
  ACG_ERROR_MESSAGES_TITLE,
  ACG_ERROR_MESSAGES_DESCRIPTION,
  ACG_EDIT_ASSETS,
  ACG_TOOLTIPS,
} from '../constants/acg';

export type AccessControlGroupModalMode = 'create' | 'edit';

export class AccessControlGroupModalComponent extends BaseComponent {
  private accessControlGroupModalMode: AccessControlGroupModalMode;
  private dialogFilter: string;
  private acgDialog: Locator;
  private duplicateTargetAudienceErrorMessageHeadingText: string =
    'An access control group with the same target audience already exists for this feature.';
  private duplicateTargetAudienceErrorMessageDescriptionText: string =
    'You cannot have duplicate access control groups. Edit the target audience to proceed or abandon creating this access control group.';
  private closeButton: Locator;
  private cancelButton: Locator;
  private duplicateTargetAudienceErrorMessageHeading: Locator;
  private duplicateTargetAudienceErrorMessageDescription: Locator;
  private editSummaryScreenAssetButtons: Locator;
  private summaryScreenAssetButtons: (buttonName: string) => Locator;

  constructor(page: Page, accessControlGroupModalMode: AccessControlGroupModalMode) {
    super(page);
    this.accessControlGroupModalMode = accessControlGroupModalMode;
    this.dialogFilter =
      accessControlGroupModalMode === 'create' ? 'Create access control group' : 'Edit access control group';
    this.acgDialog = page.locator('[class*="athena"]').filter({ hasText: this.dialogFilter });
    this.closeButton = this.acgDialog.getByRole('button', { name: 'Close' });
    this.duplicateTargetAudienceErrorMessageHeading = this.acgDialog
      .locator('[class*="Panel-module__panel"] span')
      .filter({ hasText: this.duplicateTargetAudienceErrorMessageHeadingText });
    this.duplicateTargetAudienceErrorMessageDescription = this.acgDialog
      .locator('[class*="Panel-module__panel"] p')
      .filter({ hasText: this.duplicateTargetAudienceErrorMessageDescriptionText });
    this.editSummaryScreenAssetButtons = this.acgDialog.locator('[class*="TooltipOnHover-module__hoverContainer"]');
    this.summaryScreenAssetButtons = (buttonName: string) => this.acgDialog.getByRole('button', { name: buttonName });
    this.cancelButton = this.acgDialog.getByRole('button', { name: 'Cancel' });
  }

  /**
   * Verifies the duplicate target audience error message is visible
   */
  async verifyDuplicateTargetGroupsErrorMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.duplicateTargetAudienceErrorMessageHeading);
    await this.verifier.verifyTheElementIsVisible(this.duplicateTargetAudienceErrorMessageDescription);
  }

  /**
   * Clicks the close button on the access control group modal
   */
  async clickCloseButton(): Promise<void> {
    await test.step('Click on Cross (X) button', async () => {
      await this.clickOnElement(this.closeButton);
    });
  }

  async clickOnCancelButton(): Promise<void> {
    await test.step('Click on Cancel button', async () => {
      await this.clickOnElement(this.cancelButton);
    });
  }

  /**
   * Clicks the edit button for a specific asset on the access control group modal
   *@param assetName - The name of the asset to click on(e.g. 'Target audience', 'Features' etc)
   */
  async clickOnEditButtonOnSummaryScreen(assetName: string): Promise<void> {
    await this.clickOnElement(this.acgDialog.getByRole('button', { name: assetName }));
  }

  /**
   * Clicks the add button to add new users or audiences
   *@param buttonName - The name of the button to click
   */
  async clickOnAddButton(buttonName: string): Promise<void> {
    await this.clickOnElement(this.acgDialog.getByRole('button', { name: buttonName }));
  }

  /**
   * Clicks the remove button for a specific audience or user on the access control group modal
   *@param audienceName - The name of the audience for which remove button need to be clicked
   */
  async clickOnRemoveButtonForAudience(audienceName: string): Promise<void> {
    const removeButtonElement = this.page
      .locator('[class*="Spacing-module__row"]')
      .filter({ hasText: audienceName })
      .getByRole('button', { name: 'Remove audience' });
    await this.clickOnElement(removeButtonElement);
  }

  /**
   * Verifies the default control group only managers and admins can be modified error message is visible
   */
  async verifyDefaultControlGroupOnlyManagersAndAdminsCanBeModifiedErrorMessage(
    accessControlType: string
  ): Promise<void> {
    const errorMessageTitle =
      accessControlType == 'RBAC'
        ? this.acgDialog
            .locator('[class*="Panel-module__panel"] span')
            .filter({ hasText: ACG_ERROR_MESSAGES_TITLE.RBAC })
        : this.acgDialog
            .locator('[class*="Panel-module__panel"] span')
            .filter({ hasText: ACG_ERROR_MESSAGES_TITLE.ABAC });
    await expect(errorMessageTitle).toBeVisible();
    const errorMessageDescription =
      accessControlType == 'RBAC'
        ? this.acgDialog.locator('[class*="Panel-module__panel"] p').filter({
            hasText: ACG_ERROR_MESSAGES_DESCRIPTION.RBAC,
          })
        : this.acgDialog.locator('[class*="Panel-module__panel"] p').filter({
            hasText: ACG_ERROR_MESSAGES_DESCRIPTION.ABAC,
          });
    await expect(errorMessageDescription).toBeVisible();
  }

  /**
   * Verifies the default control group only managers and admins can be modified tooltip is visible
   */
  async verifyDefaultControlGroupOnlyManagersAndAdminsCanBeModifiedTooltip(accessControlType: string): Promise<void> {
    await this.hoverOverButtonAndVerifyTooltip(ACG_EDIT_ASSETS.FEATURE, accessControlType);
    await this.hoverOverButtonAndVerifyTooltip(ACG_EDIT_ASSETS.TARGET_AUDIENCE, accessControlType);
  }

  /**
   * Verifies the feature cannot be edited tooltip is visible
   */
  async verifyTooltipForButton(buttonName: string, accessControlType: string): Promise<void> {
    await this.hoverOverButtonAndVerifyTooltip(buttonName, accessControlType);
  }

  /**
   * Hovers cursor over a button and verify the tooltip is visible
   * @param buttonName - The name of the button to hover over and verify the tooltip for
   * @param accessControlType - The type of access control (RBAC or ABAC)
   */
  async hoverOverButtonAndVerifyTooltip(buttonName: string, accessControlType: string) {
    const buttonLocator: Locator = this.editSummaryScreenAssetButtons.filter({
      has: this.page.getByRole('button', {
        name: buttonName,
        exact: true,
      }),
    });
    const tooltipLocator: Locator = buttonLocator.getByRole('tooltip', {
      name:
        accessControlType == 'RBAC'
          ? ACG_TOOLTIPS.RBAC
          : accessControlType == 'ABAC'
            ? ACG_TOOLTIPS.ABAC
            : ACG_TOOLTIPS.FEATURE_CANNOT_BE_EDITED,
      exact: true,
    });
    await test.step(`Hover over the ${buttonName} button`, async () => {
      await buttonLocator.hover({ force: true });
    });
    await test.step(`Verify the tooltip with message ${accessControlType == 'RBAC' ? ACG_TOOLTIPS.RBAC : accessControlType == 'ABAC' ? ACG_TOOLTIPS.ABAC : ACG_TOOLTIPS.FEATURE_CANNOT_BE_EDITED} is visible`, async () => {
      await expect(tooltipLocator).toBeVisible();
    });
  }

  /**
   * Verifies the title of the access control group modal
   * @param title - The title of the access control group modal
   */
  async verifyTitleOfModal(title: string): Promise<void> {
    await expect(this.acgDialog.locator('h2').filter({ hasText: title })).toBeVisible();
  }

  async verifySummaryScreenAssetButtonIsEnabled(buttonName: string): Promise<void> {
    await this.verifier.verifyTheElementIsEnabled(this.summaryScreenAssetButtons(buttonName), {
      assertionMessage: `expecting ${buttonName} button to be enabled`,
    });
  }

  async verifySummaryScreenAssetButtonIsDisabled(buttonName: string): Promise<void> {
    await this.verifier.verifyTheElementIsDisabled(this.summaryScreenAssetButtons(buttonName), {
      assertionMessage: `expecting ${buttonName} button to be disabled`,
    });
  }
}
