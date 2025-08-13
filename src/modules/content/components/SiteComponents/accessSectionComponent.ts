import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content/constants/siteCreation.abac';

export class AccessSectionComponent extends BaseComponent {
  readonly accessSectionHeading: Locator;
  readonly makePrivateSubHeading: Locator;
  readonly privateToggle: Locator;
  readonly privateToggleLabel: Locator;
  readonly helpText: Locator;
  readonly makePrivateConfirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.accessSectionHeading = page.getByRole('heading', { name: SiteCreationUI.HEADINGS.ACCESS });
    this.makePrivateSubHeading = page.getByText(SiteCreationUI.LABELS.MAKE_PRIVATE);
    this.privateToggle = page.locator('input[name="accessType"]');
    this.privateToggleLabel = page.getByRole('switch', { name: SiteCreationUI.LABELS.MAKE_PRIVATE });
    this.helpText = page.getByText(SiteCreationUI.DESCRIPTIONS.PRIVATE_HELP);
    this.makePrivateConfirmButton = page.getByRole('button', { name: SiteCreationUI.BUTTONS.MAKE_PRIVATE });
  }

  async verifyAccessSectionIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Access section is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.accessSectionHeading, {
        assertionMessage: 'Access section heading should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.makePrivateSubHeading, {
        assertionMessage: 'Make site private label should be visible',
      });
    });
  }

  async verifyPrivateToggleState(expectedState: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verify private toggle is ${expectedState ? 'enabled' : 'disabled'}`, async () => {
      await this.privateToggle.waitFor();
      const actualState = await this.privateToggle.isChecked();
      if (actualState !== expectedState) {
        throw new Error(`Expected private toggle to be ${expectedState}, but it was ${actualState}`);
      }
    });
  }

  async togglePrivateAccess(shouldBePrivate: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Set site privacy to ${shouldBePrivate ? 'private' : 'public'}`, async () => {
      const isCurrentlyPrivate = await this.privateToggle.isChecked();
      if (shouldBePrivate !== isCurrentlyPrivate) {
        await this.clickOnElement(this.privateToggleLabel);
        if (shouldBePrivate) {
          await this.page.waitForTimeout(500);
          await this.clickOnElement(this.makePrivateConfirmButton);
        }
        await this.page.waitForTimeout(1000);
        const newState = await this.privateToggle.isChecked();
        if (newState !== shouldBePrivate) {
          throw new Error(`Private toggle state did not change. Expected: ${shouldBePrivate}, Actual: ${newState}`);
        }
      }
    });
  }
} 