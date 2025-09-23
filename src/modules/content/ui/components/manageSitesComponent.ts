import { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class ManageSitesComponent extends BaseComponent {
  readonly clickOnSite: Locator;
  readonly coverImage: Locator;
  readonly contentTab: Locator;
  readonly eventsTab: Locator;
  readonly searchEventInSearchBar: Locator;
  readonly albumCoverImage: Locator;
  readonly authorName: Locator;
  readonly clickOnTheManageSiteButton: Locator;
  readonly clickOnPageCategory: Locator;
  readonly checkTheError: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
    this.coverImage = page.locator('.SiteHeader-image:has(img[src])');
    this.contentTab = page.getByRole('tab', { name: 'Content' });
    this.eventsTab = page.locator('[class="CalendarDay u-focus-visible"]').first();
    this.searchEventInSearchBar = page.getByRole('textbox', { name: 'Search…' });
    this.albumCoverImage = page.locator('[aria-label="Open album"]').first();
    this.authorName = page.locator('[class="ContentCard"]').first();
    this.clickOnTheManageSiteButton = page.getByRole('link', { name: 'Manage site' });
    this.clickOnPageCategory = page.getByRole('tab', { name: 'Page categories' });
    this.checkTheError = page.locator('p', { hasText: 'Duplicate page category name' });
  }

  getAuthorNameByLabel(authorName: string): Locator {
    return this.page.locator(`[aria-label="${authorName}"]`).first();
  }
}
