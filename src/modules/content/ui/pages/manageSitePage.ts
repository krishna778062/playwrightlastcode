import { Page } from '@playwright/test';
import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';

export interface IManageSiteActions {
  // Old methods from ManageSitesComponent
  clickOnSite: () => Promise<void>;
  clickOnAboutTab: () => Promise<void>;
  clickOnTheMembersTab: () => Promise<void>;
  hoverOnMembersName: (membersName: string) => Promise<void>;
  clickOnTheFavouriteTabs: () => Promise<void>;
  markAsUnfavorite: (membersName: string) => Promise<void>;
  clickOnTheMemberButtonInAboutTab: () => Promise<void>;
  clickOnTheAboutTab: () => Promise<void>;
  clickOnTheManageSiteButton: () => Promise<void>;
  clickOnThePageCategoryButton: () => Promise<void>;
  searchEventInSearchBar: (eventName: string) => Promise<void>;
  clickOntheMemberButton: () => Promise<void>;
  clickOnInsideContentButton: () => Promise<void>;
  // New methods from develop
  clickOnUpdateCategory: () => Promise<void>;
  clickOnCancelOption: () => Promise<void>;
  clickOnSites: () => Promise<void>;
  updatingCategoryToUncategorized: (categoryName: string) => Promise<void>;
  searchForSite: (siteName: string) => Promise<void>;
}

export interface IManageSiteAssertions {
  // Old methods from ManageSitesComponent
  checkIsUserMarkedAsFavorite: () => Promise<void>;
  clickOnPeppleTab: () => Promise<void>;
  verifyEventsTabMatchesApiDate: (startsAt: string) => Promise<void>;
  checkAuthorNameIsDisplayed: (authorName: string) => Promise<void>;
  checkTheError: () => Promise<void>;
  markAsFavoriteAndCheckRGBColor: (membersName: string) => Promise<void>;
  checkMarkedAsFavoriteInPeopleList: (membersName: string) => Promise<void>;
  checkMarkedAsFavoriteInPeopleListShouldNotBeVisible: (membersName: string) => Promise<void>;
  clickOnLeaveButton: () => Promise<void>;
  verifyEventsTabImageIsDisplayed: () => Promise<void>;
  verifyAlbumTabImageIsDisplayed: () => Promise<void>;
  verifyPageTabImageIsDisplayed: () => Promise<void>;
  // New methods from develop
  verifyNoSitesFound: (siteName: string) => Promise<void>;
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  // Locators from develop
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );
  readonly ellipses = this.page.locator('[aria-label="Category option"]').first();
  readonly clickOnUpdateCategoryOption = this.page.getByRole('button', { name: 'Update category' });
  readonly clickOnSearchBar = this.page.getByRole('textbox', { name: 'Search sites…' });
  readonly clickingOnSearchButton = this.page.locator('[type="submit"][aria-label="Search"]');
  readonly siteList = this.page.locator('.type--title').first();

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.clickOnSite = this.clickOnSite.bind(this);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): IManageSiteActions {
    return this;
  }

  get assertions(): IManageSiteAssertions {
    return this;
  }

  // OLD METHODS - from ManageSitesComponent
  async clickOnSite(): Promise<void> {
    await this.manageSitesComponent.clickOnSiteAction();
  }

  async searchEventInSearchBar(eventName: string): Promise<void> {
    await this.manageSitesComponent.searchEventInSearchBarAction(eventName);
  }

  async verifyEventsTabMatchesApiDate(startsAt: string): Promise<void> {
    await this.manageSitesComponent.verifyEventsTabMatchesApiDate(startsAt);
  }

  async checkAuthorNameIsDisplayed(authorName: string | undefined): Promise<void> {
    await this.manageSitesComponent.checkAuthorNameIsDisplayed(authorName);
  }

  async clickOnTheManageSiteButton(): Promise<void> {
    await this.manageSitesComponent.clickOnTheManageSiteButtonAction();
  }

  async clickOnThePageCategoryButton(): Promise<void> {
    await this.manageSitesComponent.clickOnThePageCategoryButtonAction();
  }

  async checkTheError(): Promise<void> {
    await this.manageSitesComponent.checkTheErrorAction();
  }

  async clickOnAboutTab(): Promise<void> {
    await this.manageSitesComponent.clickOnAboutTabAction();
  }

  async clickOnTheMembersTab(): Promise<void> {
    await this.manageSitesComponent.clickOnTheMembersTabAction();
  }

  async hoverOnMembersName(membersName: string): Promise<void> {
    await this.manageSitesComponent.hoverOnMembersName(membersName);
  }

  async markAsFavoriteAndCheckRGBColor(membersName: string): Promise<void> {
    await this.manageSitesComponent.markAsFavoriteAndCheckRGBColor(membersName);
  }

  async checkIsUserMarkedAsFavorite(): Promise<void> {
    await this.manageSitesComponent.checkIsUserMarkedAsFavorite();
  }

  async clickOnTheFavouriteTabs(): Promise<void> {
    await this.manageSitesComponent.clickOnTheFavouriteTabsAction();
  }

  async clickOnPeppleTab(): Promise<void> {
    await this.manageSitesComponent.clickOnPeppleTabAction();
  }

  async checkMarkedAsFavoriteInPeopleList(membersName: string): Promise<void> {
    await this.manageSitesComponent.checkMarkedAsFavoriteInPeopleList(membersName);
  }

  async markAsUnfavorite(membersName: string): Promise<void> {
    await this.manageSitesComponent.markAsUnfavorite(membersName);
  }

  async clickOnTheAboutTab(): Promise<void> {
    await this.manageSitesComponent.clickOnTheAboutTabAction();
  }

  async clickOnTheMemberButtonInAboutTab(): Promise<void> {
    await this.manageSitesComponent.clickOnTheMemberButtonInAboutTabAction();
  }

  async checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName: string): Promise<void> {
    await this.manageSitesComponent.checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName);
  }

  async clickOntheMemberButton(): Promise<void> {
    await this.manageSitesComponent.clickOntheMemberButtonAction();
  }

  async clickOnLeaveButton(): Promise<void> {
    await this.manageSitesComponent.clickOnLeaveButtonAction();
  }

  async clickOnInsideContentButton(): Promise<void> {
    await this.manageSitesComponent.clickOnInsideContentButtonAction();
  }

  async verifyEventsTabImageIsDisplayed(): Promise<void> {
    await this.manageSitesComponent.verifyEventsTabImageIsDisplayed();
  }

  async verifyAlbumTabImageIsDisplayed(): Promise<void> {
    await this.manageSitesComponent.verifyAlbumTabImageIsDisplayed();
  }

  async verifyPageTabImageIsDisplayed(): Promise<void> {
    await this.manageSitesComponent.verifyPageTabImageIsDisplayed();
  }

  // NEW METHODS - from develop
  async clickOnUpdateCategory(): Promise<void> {
    await this.updateSiteCategoryComponent.hoverOverElementInJavaScript(this.updateSiteCategoryComponent.ellipses);
  }

  async clickOnCancelOption(): Promise<void> {
    await this.updateSiteCategoryComponent.clickOnCancelOption();
  }

  async clickOnSites(): Promise<void> {
    await this.manageSitesComponent.clickOnSiteAction();
  }

  async updatingCategoryToUncategorized(categoryName: string): Promise<void> {
    await this.updateSiteCategoryComponent.updatingCategoryToUncategorized(categoryName);
  }

  async searchForSite(siteName: string): Promise<void> {
    await this.manageSitesComponent.searchEventInSearchBarAction(siteName);
  }

  getSiteNameLocator(siteName: string): Locator {
    return this.page.getByText(siteName, { exact: true });
  }
  async verifySitesNamesAreDisplayed(siteNames: string | string[]): Promise<void> {
    // Handle both single site name and array of site names
    const namesArray = Array.isArray(siteNames) ? siteNames : [siteNames];

    let index = 0;
    while (index < namesArray.length) {
      const siteName = namesArray[index];
      await this.verifier.verifyTheElementIsVisible(this.getSiteNameLocator(siteName), {
        assertionMessage: 'Site name should be displayed on manage site page',
      });
      index++;
    }
  }
  async verifyNoSitesFound(siteName: string): Promise<void> {
    await this.manageSitesComponent.verifyNoSitesFoundAction(siteName);
    const noSitesFound = this.siteList.filter({ hasText: siteName });
    await this.verifier.verifyTheElementIsNotVisible(noSitesFound, {
      assertionMessage: 'No sites found should be visible on manage site page',
    });
  }
}
