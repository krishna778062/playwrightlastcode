import { Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';

export interface IManageSiteActions {
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
}

export interface IManageSiteAssertions {
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
  // Add assertions as needed
}

export class ManageSitePage extends BasePage implements IManageSiteActions, IManageSiteAssertions {
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
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
}
