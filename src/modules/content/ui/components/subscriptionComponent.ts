import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class SubscriptionComponent extends BaseComponent {
  readonly addSubscriptionButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addSubscriptionButton = page.getByRole('button', { name: 'Add subscription' });
  }
  async verifyAddSubscriptionPageIsLoaded(): Promise<void> {
    await test.step('Verify Add subscription page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addSubscriptionButton, {
        assertionMessage: 'Add subscription button should be visible',
      });
    });
  }
}
