import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

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

  /**
   * This method is used to verify that the access section is visible.
   * @param options - optional step info to be used in the test report
   */
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

  /**
   * This method is used to toggle the private access of the site.
   * @param shouldBePrivate - boolean value to indicate if the site should be private or public
   * @param options - optional step info to be used in the test report
   */
  async togglePrivateAccess(shouldBePrivate: boolean, options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Set site privacy to ${shouldBePrivate ? 'private' : 'public'}`, async () => {
      const isCurrentlyPrivate = await this.privateToggle.isChecked();

      if (shouldBePrivate && !isCurrentlyPrivate) {
        //if site is not already private, we need to click on the private toggle label
        await this.clickOnElement(this.privateToggleLabel);
        await this.clickOnElement(this.makePrivateConfirmButton);
        return;
      } else if (!shouldBePrivate && !isCurrentlyPrivate) {
        return;
      } else if (!shouldBePrivate && isCurrentlyPrivate) {
        await this.clickOnElement(this.privateToggleLabel);
        await this.clickOnElement(this.makePrivateConfirmButton);
        return;
      }
    });
  }
}
