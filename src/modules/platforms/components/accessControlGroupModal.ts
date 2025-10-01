import { expect,Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';

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
  private duplicateTargetAudienceErrorMessageHeading: Locator;
  private duplicateTargetAudienceErrorMessageDescription: Locator;
  private featureSection: Locator;
  private targetAudienceSection: Locator;
  private backButton: Locator;

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
    this.featureSection = this.acgDialog.locator('[class*="Spacing-module__divider"]').filter({ hasText: 'Feature' });
    this.targetAudienceSection = this.acgDialog
      .locator('[class*="Spacing-module__divider"]')
      .filter({ hasText: 'Target audience' });
    this.backButton = this.acgDialog.getByRole('button', { name: 'Back' });
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
    await this.clickOnElement(this.closeButton);
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
   * Gets feature name from summary screen
   */
  async getFeatureNameFromSummaryScreen(): Promise<string> {
    return (await this.featureSection.locator('span').nth(1).textContent()) || 'blank';
  }

  /**
   * Gets target audience count from summary screen
   */
  async getTargetAudienceCountFromSummaryScreen(): Promise<number> {
    return await this.targetAudienceSection.locator('span').nth(1).count();
  }

  /**
   * Verifies the title of the modal
   *@param title - Title of the modal
   */
  async verifyTitleOfTheModal(title: string): Promise<void> {
    expect(
      await this.verifier.verifyTheElementIsVisible(this.acgDialog.getByRole('heading', { name: title }))
    ).toBeTruthy();
  }

  /**
   * Verifies the list count on the popup
   *@param title - Title of the popup
   *@param count - Count of the list on the popup
   */
  async verifyListCount(title: string, count: number): Promise<void> {
    expect(
      await this.acgDialog
        .filter({ hasText: title })
        .locator('[class*="AccessControlListItem-module-listItemContainer"]')
        .count()
    ).toEqual(count);
  }

  /**
   * Verifies that feature is already displayed as selected at feature selection screen
   *@param featureName - feature name to verify
   */
  async verifyFeatureIsSelectedAtFeatureSelectionScreen(featureName: string): Promise<void> {
    expect(
      await this.verifier.verifyTheElementIsVisible(
        this.acgDialog
          .locator('[class*="AutoGrid-module__item"]')
          .filter({ hasText: featureName })
          .locator('[class*="AbacFeatureRadioInput-module-radioSelected"]')
      )
    ).toBeTruthy();
  }

  /**
   * Clicks the back button on the access control group modal
   */
  async clickOnBackButton(): Promise<void> {
    await this.clickOnElement(this.backButton);
  }
}
