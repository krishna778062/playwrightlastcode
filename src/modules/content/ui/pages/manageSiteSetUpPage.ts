import { Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';

export interface IManageSiteSetUpActions {
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
  clickOnThePeopleTab: () => Promise<void>;
  clickOnThePageCategoryButton: () => Promise<void>;
  searchEventInSearchBar: (eventName: string) => Promise<void>;
  clickOntheMemberButton: () => Promise<void>;
  clickOnInsideContentButton: () => Promise<void>;
  // Follow/Unfollow methods
  clickOnAboutTabAction: () => Promise<void>;
  clickOnTheFollowersTabButtonInAboutTab: () => Promise<void>;
  clickOnFollowButton: () => Promise<void>;
  clickOnFollowSiteButton: () => Promise<void>;
  clickOnFollowingButton: () => Promise<void>;
  clickOnUnfollowSiteButton: () => Promise<void>;
  clickOnRequestMembershipButton: () => Promise<string>;
  // New methods from develop
  clickOnUpdateCategory: () => Promise<void>;
  clickOnCancelOption: () => Promise<void>;
  clickOnSites: () => Promise<void>;
  updatingCategoryToUncategorized: (categoryName: string) => Promise<void>;
  searchForSite: (siteName: string) => Promise<void>;
  selectSite: () => Promise<void>;
}

export interface IManageSiteSetUpAssertions {
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
  verifyThePageIsLoaded: () => Promise<void>;
  verifySitesNamesAreDisplayed: (siteNames: string | string[]) => Promise<void>;
  // Follow/Unfollow assertions
  checkMembersNameShouldBeVisibleInFollowersTab: (membersName: string) => Promise<void>;
  checkMembersNameShouldNotBeVisibleInFollowersTab: (membersName: string) => Promise<void>;
  verifyFollowButtonShouldBeChangedIntoFollowing: () => Promise<void>;
  verifyUnfollowButtonShouldBeChangedIntoFollowButton: () => Promise<void>;
  verifyMemberButtonShouldBeVisible: () => Promise<void>;
  verifyMemberNameAndSiteOwnerStatus: (membersName: string) => Promise<void>;
}

export class ManageSiteSetUpPage extends BasePage implements IManageSiteSetUpActions, IManageSiteSetUpAssertions {
  readonly contentTab = this.page.locator(
    'a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]'
  );
  readonly ellipses = this.page.locator('[aria-label="Category option"]').first();
  readonly clickOnUpdateCategoryOption = this.page.getByRole('button', { name: 'Update category' });
  readonly selectASite = this.page.getByRole('cell', { name: 'Name' });
  readonly siteNameLocator = (siteName: string) => this.page.getByText(siteName, { exact: true });

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  }

  get actions(): IManageSiteSetUpActions {
    return this;
  }

  get assertions(): IManageSiteSetUpAssertions {
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

  async clickOnThePeopleTab(): Promise<void> {
    await this.manageSitesComponent.clickOnThePeopleTabAction();
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

  // Follow/Unfollow actions
  async clickOnAboutTabAction(): Promise<void> {
    await this.manageSitesComponent.clickOnAboutTabAction();
  }

  async clickOnTheFollowersTabButtonInAboutTab(): Promise<void> {
    await this.manageSitesComponent.clickOnTheFollowersTabButtonInAboutTabAction();
  }

  async clickOnFollowButton(): Promise<void> {
    await this.manageSitesComponent.clickOnFollowButtonAction();
  }

  async clickOnFollowSiteButton(): Promise<void> {
    await this.manageSitesComponent.clickOnFollowSiteButtonAction();
  }

  async clickOnFollowingButton(): Promise<void> {
    await this.manageSitesComponent.clickOnFollowingButtonAction();
  }

  async clickOnUnfollowSiteButton(): Promise<void> {
    await this.manageSitesComponent.clickOnUnfollowSiteButtonAction();
  }

  async clickOnRequestMembershipButton(): Promise<string> {
    return await this.manageSitesComponent.clickOnRequestMembershipButtonAction();
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

  // NEW METHODS - from develop (kept here for backward compatibility)
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

  async verifySitesNamesAreDisplayed(siteNames: string | string[]): Promise<void> {
    // Handle both single site name and array of site names
    const namesArray = Array.isArray(siteNames) ? siteNames : [siteNames];

    let index = 0;
    while (index < namesArray.length) {
      const siteName = namesArray[index];
      await this.verifier.verifyTheElementIsVisible(this.siteNameLocator(siteName), {
        assertionMessage: 'Site name should be displayed on manage site page',
      });
      index++;
    }
  }

  async selectSite(): Promise<void> {
    await test.step('Selecting the site', async () => {
      await this.clickOnElement(this.selectASite);
      await this.page.keyboard.press('Tab');
      await this.page.keyboard.press('Enter');
    });
  }

  // Follow/Unfollow assertions
  async checkMembersNameShouldBeVisibleInFollowersTab(membersName: string): Promise<void> {
    await this.manageSitesComponent.checkMembersNameShouldBeVisibleInFollowersTab(membersName);
  }

  async checkMembersNameShouldNotBeVisibleInFollowersTab(membersName: string): Promise<void> {
    await this.manageSitesComponent.checkMembersNameShouldNotBeVisibleInFollowersTab(membersName);
  }

  async verifyFollowButtonShouldBeChangedIntoFollowing(): Promise<void> {
    await this.manageSitesComponent.verifyFollowButtonShouldBeChangedIntoFollowing();
  }

  async verifyUnfollowButtonShouldBeChangedIntoFollowButton(): Promise<void> {
    await this.manageSitesComponent.verifyUnfollowButtonShouldBeChangedIntoFollowButton();
  }

  async verifyMemberButtonShouldBeVisible(): Promise<void> {
    await this.manageSitesComponent.verifyMemberButtonShouldBeVisible();
  }

  async verifyMemberNameAndSiteOwnerStatus(membersName: string): Promise<void> {
    await this.manageSitesComponent.verifyMemberNameAndSiteOwnerStatus(membersName);
  }
}
