import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class GovernanceComponent extends BaseComponent {
  readonly clickOnTimeline: Locator;
  readonly clickOnSave: Locator;
  readonly timelineAndFeed: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnTimeline = page.getByText('Timeline', { exact: true });
    this.clickOnSave = page.getByRole('button', { name: 'Save' });
    this.timelineAndFeed = page.getByRole('heading', { name: 'Timeline & feed' });
  }
}
