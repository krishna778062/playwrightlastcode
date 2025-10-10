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
  readonly clickOnAboutTab: Locator;
  readonly clickOnTheMembersTab: Locator;
  readonly clickOnStartIcon: Locator;
  readonly clickOnFavouriteTabs: Locator;
  readonly clickOnPeppleTab: Locator;
  readonly clickOnTheMemberButtonInAboutTab: Locator;
  readonly clickOnAlreadyStarIcon: Locator;
  readonly clickOnTheMemberButton: Locator;
  readonly clickOnLeaveButton: Locator;
  readonly clickOnInsideContentButton: Locator;
  readonly eventsTabImage: Locator;
  readonly albumTabImage: Locator;
  readonly pageTabImage: Locator;

  constructor(readonly page: Page) {
    super(page);
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
    this.coverImage = page.locator('.SiteHeader-image:has(img[src])');
    this.contentTab = page.getByRole('tab', { name: 'Content' });
    this.eventsTab = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.searchEventInSearchBar = page.getByRole('textbox', { name: 'Search…' });
    this.albumCoverImage = page.locator('[aria-label="Open album"]').first();
    this.authorName = page.locator('[class="ContentCard"]').first();
    this.clickOnTheManageSiteButton = page.getByRole('link', { name: 'Manage site' });
    this.clickOnPageCategory = page.getByRole('tab', { name: 'Page categories' });
    this.checkTheError = page.locator('p', { hasText: 'Duplicate page category name' });
    this.clickOnAboutTab = page.getByRole('tab', { name: 'About' });
    this.clickOnTheMembersTab = page.getByRole('tab', { name: 'Members' });
    this.clickOnStartIcon = page.getByRole('button', { name: 'Favorite this user' });
    this.clickOnAlreadyStarIcon = page.getByRole('button', { name: 'Unfavorite this user' });
    this.clickOnFavouriteTabs = page.getByRole('menuitem', { name: 'Favorites Favorites' });

    this.clickOnPeppleTab = page.getByRole('tab', { name: 'People' });
    this.clickOnTheMemberButtonInAboutTab = page.locator(`[role="tab"][id="member"]`);
    this.clickOnTheMemberButton = page.getByRole('button', { name: 'Member' });
    this.clickOnLeaveButton = page.getByRole('button', { name: 'Leave' });
    this.clickOnInsideContentButton = page.getByRole('tab', { name: 'Content' });
    this.eventsTabImage = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.albumTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.pageTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
  }

  getAuthorNameByLabel(authorName: string): Locator {
    return this.page.locator(`[class="meta-link"]`).filter({ hasText: authorName }).first();
  }

  getMembersNameByLabel(membersName: string): Locator {
    return this.page.locator(`[aria-label="${membersName}"]`);
  }

  getMembersListInPeopleTab(membersName: string): Locator {
    return this.page.getByRole('link', { name: membersName });
  }

  getFavoriteButtonForUser(membersName: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: membersName })
      .getByRole('button', { name: 'Favorite this user' });
  }
}
