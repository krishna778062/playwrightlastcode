import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

export class SubscriptionsSectionComponent extends BaseComponent {
  readonly subscriptionsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.subscriptionsHeading = page.getByRole('heading', { name: SiteCreationUI.HEADINGS.SUBSCRIPTIONS, exact: true });
  }

  /**
   * This method is used to verify that the subscriptions section is visible.
   * @param options - optional step info to be used in the test report
   */
  async verifySection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Subscriptions section', async () => {
      await expect(this.subscriptionsHeading, 'Subscriptions heading should be visible').toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.DESCRIPTIONS.SUBSCRIPTIONS_HELP),
        'Subscriptions help text should be visible'
      ).toBeVisible();
      await expect(
        this.page.getByText(SiteCreationUI.PLACEHOLDERS.NO_SUBSCRIPTIONS),
        'No subscriptions placeholder should be visible'
      ).toBeVisible();
      const addSubscriptionButton = this.page.getByRole('button', { name: SiteCreationUI.BUTTONS.ADD_SUBSCRIPTION });
      await expect(addSubscriptionButton, 'Add subscription button should be disabled').toBeDisabled();
      await expect(
        this.page.getByText(SiteCreationUI.DESCRIPTIONS.SUBSCRIPTION_WARNING),
        'Subscription warning should be visible'
      ).toBeVisible();
    });
  }
}
