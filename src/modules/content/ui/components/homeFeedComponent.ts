import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/ui/components/baseComponent';

export class HomeFeedComponent extends BaseComponent {
  readonly clickOnAllPosts: Locator;
  readonly postsIFollow: Locator;
  readonly postDate: Locator;
  readonly recentActivity: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnAllPosts = page.getByText('All posts', { exact: true });
    this.postsIFollow = page.getByText('Posts I follow');
    this.postDate = page.getByText('Post date', { exact: true });
    this.recentActivity = page.getByText('Recent activity', { exact: true });
  }
}
