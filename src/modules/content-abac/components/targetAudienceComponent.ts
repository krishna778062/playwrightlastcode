import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class TargetAudienceComponent extends BaseComponent {
  readonly removingAudienceGroup: Locator;
  readonly warningMessage: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.removingAudienceGroup = page.locator('[aria-label="Remove audience"]').first();
    this.warningMessage = page.getByText(
      'Users who were previously able to access or manage this site may no longer be able to do so if the target audience is changed.'
    );
  }
}
