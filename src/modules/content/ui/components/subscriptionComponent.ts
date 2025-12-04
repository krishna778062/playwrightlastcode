import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export interface ISubscriptionComponentAssertions {
  verifyAddSubscriptionPageIsLoaded: () => Promise<void>;
}

export class SubscriptionComponent extends BaseComponent implements ISubscriptionComponentAssertions {
  readonly addSubscriptionButton: Locator;

  constructor(page: Page) {
    super(page);
    this.addSubscriptionButton = page.getByRole('button', { name: 'Add subscription' });
  }

  get assertions(): ISubscriptionComponentAssertions {
    return this;
  }

  async verifyAddSubscriptionPageIsLoaded(): Promise<void> {
    await test.step('Verify Add subscription page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addSubscriptionButton, {
        assertionMessage: 'Add subscription button should be visible',
      });
    });
  }
}
