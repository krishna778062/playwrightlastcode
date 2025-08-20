import { expect, Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/components/baseComponent';
import { SiteCreationUI } from '@/src/modules/content-abac/constants/siteCreation';

export class SubscriptionsSectionComponent extends BaseComponent {
  readonly subscriptionsHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.subscriptionsHeading = page.getByRole('heading', { name: SiteCreationUI.HEADINGS.SUBSCRIPTIONS, exact: true });
  }

  async verifySection(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || 'Verify Subscriptions section', async () => {
      await expect(this.subscriptionsHeading).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.DESCRIPTIONS.SUBSCRIPTIONS_HELP)).toBeVisible();
      await expect(this.page.getByText(SiteCreationUI.PLACEHOLDERS.NO_SUBSCRIPTIONS)).toBeVisible();
      const addSubscriptionButton = this.page.getByRole('button', { name: SiteCreationUI.BUTTONS.ADD_SUBSCRIPTION });
      await expect(addSubscriptionButton).toBeDisabled();
      await expect(this.page.getByText(SiteCreationUI.DESCRIPTIONS.SUBSCRIPTION_WARNING)).toBeVisible();
    });
  }
}
