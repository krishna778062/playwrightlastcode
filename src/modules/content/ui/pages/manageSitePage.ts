import { Locator, Page } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SideNavBarComponent } from '@/src/core/ui/components/sideNavBarComponent';
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
  clickDashboardAndFeedTab: () => Promise<void>;
  setFeedPostingPermission: (permission: 'managersOnly' | 'everyone') => Promise<void>;
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
  readonly setupTab = this.page.getByRole('tab', { name: 'Setup' });
  readonly feedPostingPermissionRadio = (permission: 'managersOnly' | 'everyone') => {
    // Based on HTML: name="isBroadcast", value="no" for everyone, value="yes" for managers only
    const value = permission === 'managersOnly' ? 'yes' : 'no';
    return this.page.locator(`input[type="radio"][name="isBroadcast"][value="${value}"]`);
  };

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private sideNavBarComponent: SideNavBarComponent;
  private manageSitesComponent: ManageSitesComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
    this.sideNavBarComponent = new SideNavBarComponent(page);
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
    const noSitesFound = this.siteList.filter({ hasText: siteName });
    await this.verifier.verifyTheElementIsNotVisible(noSitesFound, {
      assertionMessage: 'No sites found should be visible on manage site page',
    });
  }

  async clickDashboardAndFeedTab(): Promise<void> {
    await test.step('Ensure Setup tab is active (feed permissions are under Setup tab)', async () => {
      // Wait for tabs to be visible
      await this.page.waitForSelector('[role="tab"]', { state: 'visible', timeout: 10000 });
      // Feed permissions are on the Setup tab, ensure it's active
      await this.verifier.verifyTheElementIsVisible(this.setupTab, {
        assertionMessage: 'Setup tab should be visible',
        timeout: 8000,
      });
      // Click Setup tab if not already active
      const isSelected = await this.setupTab.getAttribute('aria-selected');
      if (isSelected !== 'true') {
        await this.clickOnElement(this.setupTab);
      }
      // Wait for feed permissions section to be visible (radio buttons)
      await this.page.waitForSelector('input[name="isBroadcast"]', { state: 'visible', timeout: 8000 });
    });
  }

  async setFeedPostingPermission(permission: 'managersOnly' | 'everyone'): Promise<void> {
    await test.step(`Set feed posting permission to ${permission}`, async () => {
      const radioButton = this.feedPostingPermissionRadio(permission);
      await this.verifier.verifyTheElementIsVisible(radioButton, {
        assertionMessage: `Feed posting permission radio button for "${permission}" should be visible`,
        timeout: 8000,
      });
      await radioButton.click({ force: true });
      await this.expect(radioButton).toBeChecked({ timeout: 5000 });

      // Look for and click Save/Update button if it exists
      const saveButton = this.page.getByRole('button', { name: /save|update|submit/i }).first();
      await this.verifier.verifyTheElementIsVisible(saveButton, {
        assertionMessage: 'Save/Update button should be visible',
        timeout: 5000,
      });
      await saveButton.click();
      await this.page.waitForLoadState('networkidle', { timeout: 2000 }).catch(() => {});
    });
  }
}
