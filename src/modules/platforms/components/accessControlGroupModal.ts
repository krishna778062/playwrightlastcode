import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';

export type AccessControlGroupModalMode = 'create' | 'edit';

export class AccessControlGroupModalComponent extends BaseComponent {
  private accessControlGroupModalMode: AccessControlGroupModalMode;
  private dialogFilter: string;
  private acgDialog: Locator;
  private duplicateTargetAudienceErrorMessageHeading: string =
    'An access control group with the same target audience already exists for this feature.';
  private duplicateTargetAudienceErrorMessageDescription: string =
    'You cannot have duplicate access control groups. Edit the target audience to proceed or abandon creating this access control group.';
  private closeButton: Locator;

  constructor(page: Page, accessControlGroupModalMode: AccessControlGroupModalMode) {
    super(page);
    this.accessControlGroupModalMode = accessControlGroupModalMode;
    this.dialogFilter =
      accessControlGroupModalMode === 'create' ? 'Create access control group' : 'Edit access control group';
    this.acgDialog = page.locator('[class*="athena"]').filter({ hasText: this.dialogFilter });
    this.closeButton = this.acgDialog.getByRole('button', { name: 'Close' });
  }

  async verifyDuplicateTargetGroupsErrorMessage(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(
      this.acgDialog
        .locator('[class*="Panel-module__panel"] span')
        .filter({ hasText: this.duplicateTargetAudienceErrorMessageHeading })
    );
    await this.verifier.verifyTheElementIsVisible(
      this.acgDialog
        .locator('[class*="Panel-module__panel"] p')
        .filter({ hasText: this.duplicateTargetAudienceErrorMessageDescription })
    );
  }

  async clickCloseButton(): Promise<void> {
    await super.clickCloseButton(this.closeButton, 'Click Close (X) button');
  }

  async clickOnEditButtonOnSummaryScreen(assetName: string): Promise<void> {
    await this.clickOnElement(this.acgDialog.getByRole('button', { name: assetName }));
  }

  async clickOnAddButton(buttonName: string): Promise<void> {
    await this.clickOnElement(this.acgDialog.getByRole('button', { name: buttonName }));
  }

  async clickOnRemoveButtonForAudience(audienceName: string): Promise<void> {
    let removeButtonElement = this.page
      .locator('[class*="Spacing-module__row"]')
      .filter({ hasText: audienceName })
      .getByRole('button', { name: 'Remove audience' });
    await this.clickOnElement(removeButtonElement);
  }
}
