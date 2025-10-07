import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class TargetAudienceComponent extends BaseComponent {
  readonly removingAnAudienceGroup: Locator;
  readonly warningMessage: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.removingAnAudienceGroup = page.locator('[aria-label="Remove audience"]').first();
    this.warningMessage = page.getByText(
      'Users who were previously able to access or manage this site may no longer be able to do so if the target audience is changed.'
    );
  }

  async removingAudienceGroup(): Promise<void> {
    await test.step('Removing audience group', async () => {
      await this.clickOnElement(this.removingAnAudienceGroup);
    });
  }

  async verifyWarningMessage(): Promise<void> {
    await test.step('Verifying warning message', async () => {
      await this.verifier.verifyTheElementIsVisible(this.warningMessage, {
        assertionMessage: 'Warning message should be visible',
      });
    });
  }
}
