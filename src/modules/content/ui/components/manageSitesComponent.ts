import { expect, Locator, Page, test } from '@playwright/test';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { ContentFilter } from '@/src/modules/content/constants/enums/contentFilter';
import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';

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
  readonly searchSiteNameInSearchBar: Locator;
  readonly clickOnSearchBar: Locator;
  readonly firstSiteDropDownOption: Locator;
  readonly clickOnThePeopleTab: Locator;
  readonly clickOnFollowButton: Locator;
  readonly clickOnFollowSiteButton: Locator;
  readonly followingButton: Locator;
  readonly clickOnTheFollowersTabButtonInAboutTab: Locator;
  readonly unfollowSiteButton: Locator;
  readonly followSiteButton: Locator;
  readonly requestMembershipButton: Locator;
  readonly clickOnTheMembersAndFollowersTabButtonInAboutTab: Locator;
  readonly memberButton: Locator;
  readonly followButtonUnderAboutTab: Locator;
  readonly followButtonUnderMemberTab: Locator;
  readonly followingButtonUnderMemberTab: Locator;
  readonly clickOnUpdateCategoryButton: Locator;
  readonly contentFilterDropdown: Locator;
  readonly contentFilterSelectedValue: Locator;
  readonly contentSearchBar: Locator;
  readonly checkboxLocator: Locator;
  readonly clickOnAddAnotherButton: Locator;
  readonly clickOnMemberTab: Locator;
  readonly clickOnAddPersonInDialog: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.clickOnSite = page.getByRole('cell', { name: 'Name' });
    this.coverImage = page.locator('.SiteHeader-image:has(img[src])');
    this.contentTab = page.getByRole('tab', { name: 'Content' });
    this.eventsTab = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.searchEventInSearchBar = page.getByRole('textbox', { name: 'Search sites…' });
    this.albumCoverImage = page.locator('[aria-label="Open album"]').first();
    this.authorName = page.locator('[class="ContentCard"]').first();
    this.clickOnTheManageSiteButton = page.getByRole('link', { name: 'Manage site' });
    this.memberButton = page.getByRole('button', { name: 'Member' });
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
    this.clickOnLeaveButton = page.getByRole('button', { name: 'Leave', exact: true });
    this.clickOnMemberTab = page.locator('label').filter({ hasText: 'Member' });
    this.clickOnInsideContentButton = page.getByRole('tab', { name: 'Content' });
    this.eventsTabImage = page.locator('[class="CalendarDay CalendarDay--xlarge"]').first();
    this.albumTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.pageTabImage = page.locator('[class="Image Image--objectFit Image--square"]').first();
    this.searchSiteNameInSearchBar = page.getByRole('textbox', { name: 'Search sites…' });
    this.clickOnSearchBar = page.locator('button[name="submitbutton"]');
    this.firstSiteDropDownOption = page.locator('[aria-label="Category option"]').nth(1);
    this.clickOnThePeopleTab = page.getByRole('tab', { name: 'People' });
    this.clickOnFollowButton = page.getByRole('button', { name: 'Follow', exact: true });
    this.clickOnFollowSiteButton = page.getByRole('button', { name: 'Follow site' });
    this.followingButton = page.getByRole('button', { name: 'Following', exact: true });
    this.followButtonUnderMemberTab = page.getByLabel('About').getByRole('button', { name: 'Follow', exact: true });
    this.followingButtonUnderMemberTab = page
      .getByLabel('About')
      .getByRole('button', { name: 'Following', exact: true });
    this.clickOnTheFollowersTabButtonInAboutTab = page.locator('[role="tab"][id="follower"]');
    this.unfollowSiteButton = page.getByRole('button', { name: 'Unfollow site', exact: true });
    this.followSiteButton = page.getByRole('button', { name: 'Follow', exact: true });
    this.requestMembershipButton = page.getByRole('button', { name: 'Request membership', exact: true });
    this.clickOnTheMembersAndFollowersTabButtonInAboutTab = page.locator('[role="tab"][id="ownerandmanager"]');
    this.followButtonUnderAboutTab = page.getByLabel('About').getByRole('button', { name: 'Follow', exact: true });
    this.clickOnUpdateCategoryButton = page.getByText('Update category', { exact: true });
    this.contentFilterDropdown = page.getByLabel('Content:');
    this.contentFilterSelectedValue = page.getByLabel('Content:').locator(':checked');
    this.clickOnUpdateCategoryButton = page.getByText('Update category', { exact: true });
    this.contentSearchBar = page.getByRole('textbox', { name: 'Search…' });
    this.checkboxLocator = page.locator('input[type="checkbox"][aria-label="Select"]').first();
    this.clickOnAddAnotherButton = page.getByRole('button', { name: 'Add person' });
    this.clickOnAddPersonInDialog = page.getByRole('dialog', { name: 'Add person to site' });
  }
  getAuthorNameByLabel(authorName: string): Locator {
    return this.page.locator(`[class="meta-link"]`).filter({ hasText: authorName }).first();
  }

  getMembersNameByLabel(membersName: string): Locator {
    return this.page.locator(`[aria-label="${membersName}"]`);
  }

  getNameByLabel(name: string): Locator {
    return this.page.locator(`a:has-text("${name}")`);
  }
  getMembersListInPeopleTab(membersName: string): Locator {
    return this.page.getByRole('link', { name: membersName });
  }

  getSiteOwnerStatusForMember(membersName: string): Locator {
    return this.page.getByRole('listitem').filter({ hasText: membersName }).getByText('Site owner');
  }

  getFavoriteButtonForUser(membersName: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: membersName })
      .getByRole('button', { name: 'Favorite this user' });
  }

  getFollowButtonForUser(membersName: string): Locator {
    return this.page
      .getByRole('listitem')
      .filter({ hasText: membersName })
      .getByRole('button', { name: 'Follow', exact: true });
  }

  // Action methods
  async clickOnSiteAction(): Promise<void> {
    await test.step('Clicking on save', async () => {
      await this.clickOnElement(this.clickOnSite);
      await this.clickOnSite.press('Tab');
      await this.clickOnSite.press('Enter');
    });
  }

  async searchEventInSearchBarAction(eventName: string): Promise<void> {
    await test.step('Searching event in search bar', async () => {
      await this.typeInElement(this.searchEventInSearchBar, eventName);
      await this.searchEventInSearchBar.press('Enter');
    });
  }

  async verifyEventsTabMatchesApiDate(startsAt: string): Promise<void> {
    await test.step('Verify events tab matches API startsAt date', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTab, {
        assertionMessage: 'Events tab should be visible',
      });

      const eventsTabText = await this.eventsTab.allTextContents();
      const { month, day } = this.parseStartsAtDate(startsAt);

      if (!this.doesTextMatchDate(eventsTabText[0], month, day)) {
        throw new Error(
          `Events tab text does not match API date.\n` +
            `API startsAt: ${startsAt} (${month} ${day})\n` +
            `Events tab text: "${eventsTabText[0]}"`
        );
      }
    });
  }

  private parseStartsAtDate(startsAt: string): { month: string; day: string } {
    if (!startsAt || startsAt.trim() === '') {
      throw new Error(`Invalid startsAt date: "${startsAt}"`);
    }

    const date = new Date(startsAt);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: "${startsAt}"`);
    }

    const monthNames = MANAGE_SITE_TEST_DATA.MONTH_NAMES.MONTH_NAMES;
    const month = monthNames[date.getMonth()];
    const day = date.getDate().toString();
    return { month, day };
  }

  private doesTextMatchDate(text: string, expectedMonth: string, expectedDay: string): boolean {
    const cleanText = text.trim().replace(/[\s\u200C\u200D\uFEFF\u00A0\u2000-\u200F\u2028-\u202F\u205F\u3000]+/g, ' ');
    const lowerText = cleanText.toLowerCase();
    const lowerMonth = expectedMonth.toLowerCase();

    return lowerText.includes(lowerMonth) && cleanText.includes(expectedDay);
  }

  async checkAuthorNameIsDisplayed(authorName: string | undefined): Promise<void> {
    await test.step('Check author name is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getAuthorNameByLabel(authorName || ''), {
        assertionMessage: `Author name '${authorName}' should be visible`,
      });
    });
  }

  async clickOnTheManageSiteButtonAction(): Promise<void> {
    await test.step('Click on the manage site button', async () => {
      await this.clickOnElement(this.clickOnTheManageSiteButton);
    });
  }
  async clickOnThePeopleTabAction(): Promise<void> {
    await test.step('Click on the people tab', async () => {
      await this.clickOnElement(this.clickOnThePeopleTab);
    });
  }
  async clickOnAddAnotherButtonAction(): Promise<void> {
    await test.step('Click on the add another button', async () => {
      await this.clickOnElement(this.clickOnAddAnotherButton);
    });
  }
  async selectMemberTabAction(): Promise<void> {
    await test.step('Select the member tab', async () => {
      await this.clickOnElement(this.clickOnMemberTab);
    });
  }

  async clickOnThePageCategoryButtonAction(): Promise<void> {
    await test.step('Click on the page category button', async () => {
      await this.clickOnElement(this.clickOnPageCategory);
    });
  }

  async checkTheErrorAction(): Promise<void> {
    await test.step('Check the error', async () => {
      await this.verifier.verifyTheElementIsVisible(this.checkTheError, {
        assertionMessage: 'The error should be visible',
      });
    });
  }

  async clickOnAboutTabAction(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.clickOnAboutTab);
    });
  }
  async clickOnTheMembersAndFollowersTabButtonInAboutTabAction(): Promise<void> {
    await test.step('Click on the members and followers tab button in about tab', async () => {
      await this.clickOnElement(this.clickOnTheMembersAndFollowersTabButtonInAboutTab);
    });
  }
  getFollowingNameByLabel(followingName: string): Locator {
    return this.page.getByRole('button', { name: followingName, exact: true });
  }
  getFollowingButtonByLabel(followingName: string): Locator {
    return this.getFollowingNameByLabel(followingName).getByRole('button', { name: 'Following', exact: true });
  }
  async hoverOnTheFollwingName(followingName: string): Promise<void> {
    await test.step(`Hover on following name: ${followingName}`, async () => {
      await this.hoverOverElementInJavaScript(this.getFollowingNameByLabel(followingName));
    });
  }

  async clickOnFollowingButtonActionUnderSpecificName(followingName: string): Promise<void> {
    await test.step(`Click on following button under specific name: ${followingName}`, async () => {
      await this.clickOnElement(this.getFollowingButtonByLabel(followingName));
    });
  }

  async clickOnTheMembersTabAction(): Promise<void> {
    await test.step('Click on the members tab', async () => {
      await this.clickOnElement(this.clickOnTheMembersTab);
    });
  }

  async hoverOnMembersName(membersName: string): Promise<void> {
    await test.step('Hover on the members name', async () => {
      await this.getMembersNameByLabel(membersName).hover();
    });
  }

  async markAsFavoriteAndCheckRGBColor(membersName: string): Promise<void> {
    const publishResponse = await this.performActionAndWaitForResponse(
      () => this.clickOnElement(this.clickOnStartIcon),
      response =>
        response.url().includes(PAGE_ENDPOINTS.IDENTITY_FAVOURITES) &&
        response.request().method() === 'POST' &&
        response.status() === 200,
      {
        timeout: 20_000,
      }
    );
    await publishResponse.finished();

    const favoriteButton = this.getFavoriteButtonForUser(membersName);

    // Target the SVG path specifically
    const svgPath = favoriteButton.locator('svg path');

    // Debug: Log the actual fill color
    const fillColor = await svgPath.evaluate(el => window.getComputedStyle(el).fill);

    await expect(svgPath).toHaveCSS('fill', 'rgb(207, 130, 7)');
  }

  async checkIsUserMarkedAsFavorite(): Promise<void> {
    await test.step('Check is user marked as favorite', async () => {
      if (await this.verifier.isTheElementVisible(this.clickOnAlreadyStarIcon)) {
        const publishResponse = await this.performActionAndWaitForResponse(
          () => this.clickOnElement(this.clickOnStartIcon),
          response =>
            response.url().includes(PAGE_ENDPOINTS.IDENTITY_FAVOURITES) &&
            response.request().method() === 'POST' &&
            response.status() === 200,
          {
            timeout: 20_000,
          }
        );
        await publishResponse.finished();
      }
    });
  }

  async clickOnTheFavouriteTabsAction(): Promise<void> {
    await test.step('Click on the favourite tabs', async () => {
      await this.clickOnElement(this.clickOnFavouriteTabs);
    });
  }

  async clickOnPeppleTabAction(): Promise<void> {
    await test.step('Click on the pepple tab', async () => {
      await this.clickOnElement(this.clickOnPeppleTab);
    });
  }

  async checkMarkedAsFavoriteInPeopleList(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getMembersListInPeopleTab(membersName), {
        assertionMessage: 'The user should be marked as favorite',
      });
    });
  }

  async clickOnUpdateCategoryButtonAction(): Promise<void> {
    await test.step('Click on the update category button', async () => {
      await this.clickOnElement(this.clickOnUpdateCategoryButton);
    });
  }
  async markAsUnfavorite(membersName: string): Promise<void> {
    await test.step('Mark as Favorite', async () => {
      await this.clickOnElement(this.getFavoriteButtonForUser(membersName));
    });
  }

  async clickOnTheAboutTabAction(): Promise<void> {
    await test.step('Click on the about tab', async () => {
      await this.clickOnElement(this.clickOnAboutTab);
    });
  }

  async clickOnTheMemberButtonInAboutTabAction(): Promise<void> {
    await test.step('Click on the member button in about tab', async () => {
      await this.clickOnElement(this.clickOnTheMemberButtonInAboutTab);
    });
  }
  async verifyIfFollowingButtonIsVisibleThenClickOnIt(): Promise<void> {
    await test.step('Verify if following button is visible then click on it', async () => {
      if (await this.verifier.isTheElementVisible(this.followButtonUnderMemberTab)) {
        await this.clickOnElement(this.followButtonUnderMemberTab);
      } else {
        await this.verifier.verifyTheElementIsVisible(this.followingButtonUnderMemberTab, {
          assertionMessage: 'Following button should be visible under member tab and user has already followed',
        });
      }
    });
  }

  async clickOnTheFollowersButtonInAboutTabAction(): Promise<void> {
    await test.step('Click on the followers button in about tab', async () => {
      await this.clickOnElement(this.clickOnTheFollowersTabButtonInAboutTab);
    });
  }
  async checkMarkedAsFavoriteInPeopleListShouldNotBeVisible(membersName: string): Promise<void> {
    await test.step('Check marked as favorite in people list should not be visible', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.getMembersListInPeopleTab(membersName), {
        assertionMessage: 'The user should not be marked as favorite',
      });
    });
  }

  async clickOntheMemberButtonAction(): Promise<void> {
    await test.step('Click on the member button', async () => {
      await this.clickOnElement(this.clickOnTheMemberButton);
    });
  }
  async verifyManageSiteButtonShouldBeVisible(): Promise<void> {
    await test.step('Verify manage site button should be visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.clickOnTheManageSiteButton, {
        assertionMessage: 'Manage site button should be visible',
      });
    });
  }

  async clickOnLeaveButtonAction(): Promise<void> {
    await test.step('Click on the leave button', async () => {
      await this.clickOnElement(this.clickOnLeaveButton);
    });
  }

  async clickOnInsideContentButtonAction(): Promise<void> {
    await test.step('Click on the manage content button', async () => {
      await this.clickOnElement(this.clickOnInsideContentButton);
    });
  }

  async verifyEventsTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify events tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.eventsTabImage, {
        assertionMessage: 'Events tab image should be visible',
      });
    });
  }

  async searchSiteNameInSearchBarAction(siteName: string): Promise<void> {
    await test.step('Searching site name in search bar', async () => {
      await this.clickOnElement(this.searchSiteNameInSearchBar);
      await this.fillInElement(this.searchSiteNameInSearchBar, siteName);
      await this.clickOnElement(this.clickOnSearchBar);
    });
  }

  getSiteFilterByTextLocator(bulkActionOption: BulkActionOptions): Locator {
    return this.page.getByText(bulkActionOption).first();
  }

  async selectSiteFilterByText(bulkActionOption: BulkActionOptions): Promise<void> {
    await test.step('Select site filter by text', async () => {
      const locator = this.getSiteFilterByTextLocator(bulkActionOption);
      await this.clickOnElement(locator);
    });
  }
  getFilterByTextLocator(bulkActionOption: BulkActionOptions): Locator {
    return this.page.locator('#react-select-2-listbox').getByText(bulkActionOption);
  }
  async selectFilterByText(bulkActionOption: BulkActionOptions): Promise<void> {
    await test.step('Select filter by text', async () => {
      const filterByTextLocator = this.getFilterByTextLocator(bulkActionOption);
      await this.clickOnElement(filterByTextLocator);
    });
  }
  async verifyAlbumTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify album tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.albumTabImage, {
        assertionMessage: 'Album tab image should be visible',
      });
    });
  }
  async hoverOnFirstSiteNameAction(): Promise<void> {
    await test.step('Hover on the first site name', async () => {
      await this.hoverOverElementInJavaScript(this.firstSiteDropDownOption);
    });
  }
  async clickOnFollowButtonAction(): Promise<void> {
    await test.step('Click on the follow button', async () => {
      await this.clickOnElement(this.clickOnFollowButton);
    });
  }
  async clickOnFollowingButtonAction(): Promise<void> {
    await test.step('Click on the following button', async () => {
      await this.clickOnElement(this.followingButton);
    });
  }
  async clickOnFollowSiteButtonAction(): Promise<void> {
    await test.step('Click on the follow site button', async () => {
      await this.clickOnElement(this.clickOnFollowSiteButton);
    });
  }
  async clickOnRequestMembershipButtonAction(): Promise<string> {
    return await test.step('Click on the request membership button', async () => {
      const requestMembershipResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.requestMembershipButton, { delay: 2_000 }),
        response => {
          const urlMatches = response.url().includes(API_ENDPOINTS.site.requestMembership);
          const methodMatches = response.request().method() === 'POST';
          const statusMatches = response.status() === 201 || response.status() === 200;

          // Log for debugging
          if (urlMatches && methodMatches) {
          }

          return urlMatches && methodMatches && statusMatches;
        },
        {
          timeout: 20_000,
        }
      );

      const responseJson = await requestMembershipResponse.json();

      // Extract request_id from response: result.request_id
      const requestId = responseJson.result?.request_id || responseJson.request_id;
      if (!requestId) {
        throw new Error(`No request_id found in membership request response: ${JSON.stringify(responseJson)}`);
      }
      return requestId;
    });
  }
  async clickOnUnfollowSiteButtonAction(): Promise<void> {
    await test.step('Click on the unfollow site button', async () => {
      await this.clickOnElement(this.unfollowSiteButton);
    });
  }
  async verifyFollowButtonShouldBeChangedIntoFollowing(): Promise<void> {
    await test.step('Verify follow button should be changed into following', async () => {
      await this.verifier.verifyTheElementIsVisible(this.followingButton, {
        assertionMessage: 'Follow button should be changed into following',
      });
    });
  }
  async verifyUnfollowButtonShouldBeChangedIntoFollowButton(): Promise<void> {
    await test.step('Verify unfollow button should be changed into follow button', async () => {
      await this.verifier.verifyTheElementIsVisible(this.followSiteButton, {
        assertionMessage: 'Unfollow button should be changed into follow button',
      });
    });
  }
  async verifyPageTabImageIsDisplayed(): Promise<void> {
    await test.step('Verify page tab image is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.pageTabImage, {
        assertionMessage: 'Page tab image should be visible',
      });
    });
  }
  async clickOnTheFollowersTabButtonInAboutTabAction(): Promise<void> {
    await test.step('Click on the followers tab button in about tab', async () => {
      await this.clickOnElement(this.clickOnTheFollowersTabButtonInAboutTab);
    });
  }
  async checkMembersNameShouldBeVisibleInFollowersTab(membersName: string): Promise<void> {
    await test.step('Check members name should be visible in followers tab', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getMembersNameByLabel(membersName), {
        assertionMessage: 'The members name should be visible in followers tab',
      });
    });
  }
  async checkMembersNameShouldNotBeVisibleInFollowersTab(membersName: string): Promise<void> {
    await test.step('Check members name should not be visible in followers tab', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.getMembersNameByLabel(membersName), {
        assertionMessage: 'The members name should not be visible in followers tab',
      });
    });
  }
  async verifyMemberButtonShouldBeVisible(): Promise<void> {
    await test.step('Verify member button should be visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.memberButton, {
        assertionMessage: 'Member button should be visible',
      });
    });
  }
  async followOwnersAndManager(
    followersAndFollowingList: any,
    getUpdatedListCallback?: () => Promise<any>
  ): Promise<string[]> {
    return await test.step('Follower owners and manager', async () => {
      // Extract the following list from API response
      const followingList = followersAndFollowingList.result?.find((item: any) => item.type === 'following');

      // Get all names from API (empty array if no following list)
      const allApiNames = followingList?.listOfItems
        ? followingList.listOfItems
            .map((item: any) => item.name || item.fullName || `${item.firstName} ${item.lastName}`)
            .filter(Boolean)
        : [];
      // If following list is empty, user is not following anyone - click follow button
      if (allApiNames.length > 0) {
        // Check which names are visible on screen
        const visibleNames: string[] = [];
        for (const userName of allApiNames) {
          const nameLocator = this.getNameByLabel(userName);
          const isVisible = await nameLocator.isVisible().catch(() => false);
          if (isVisible) {
            visibleNames.push(userName);
          }
        }

        // If names are found and visible, return them
        if (visibleNames.length > 0) {
          return visibleNames;
        }
      }

      // Click follow button when no names in following list or names not visible
      let followButtonClicked = false;
      const followButtonCount = await this.followButtonUnderAboutTab.count();
      if (followButtonCount > 0) {
        const isFollowButtonVisible = await this.followButtonUnderAboutTab.isVisible().catch(() => false);
        if (isFollowButtonVisible) {
          await this.clickOnElement(this.followButtonUnderAboutTab);
          // Wait for API to update after clicking follow button
          followButtonClicked = true;
        }
      }

      // Get updated list and return the names that were added
      if (followButtonClicked && getUpdatedListCallback) {
        // Retry getting updated list with a few attempts
        let retries = 3;
        while (retries > 0) {
          const updatedList = await getUpdatedListCallback();
          const updatedFollowingList = updatedList.result?.find((item: any) => item.type === 'following');

          if (updatedFollowingList?.listOfItems && updatedFollowingList.listOfItems.length > 0) {
            const updatedNames = updatedFollowingList.listOfItems
              .map((item: any) => item.name || item.fullName || `${item.firstName} ${item.lastName}`)
              .filter(Boolean);

            // Find names that were added (in updated list but not in original)
            const addedNames = updatedNames.filter((name: string) => !allApiNames.includes(name));
            return addedNames.length > 0 ? addedNames : updatedNames;
          } else {
            retries--;
            if (retries > 0) {
              await this.page.waitForTimeout(2000);
            }
          }
        }
      }

      return [];
    });
  }
  async verifyFollowButtonShouldBeChangedIntoUnfollow(): Promise<void> {
    await test.step('Verify follow button should be changed into unfollow', async () => {
      await this.verifier.verifyTheElementIsVisible(this.unfollowSiteButton, {
        assertionMessage: 'Follow button should be changed into unfollow',
      });
    });
  }

  async verifyMemberNameAndSiteOwnerStatus(membersName: string): Promise<void> {
    await test.step(`Verify member name and site owner status for ${membersName}`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.getMembersListInPeopleTab(membersName), {
        assertionMessage: `Member name ${membersName} should be visible in people tab`,
      });
      await this.verifier.verifyTheElementIsVisible(this.getSiteOwnerStatusForMember(membersName), {
        assertionMessage: `Site owner status should be visible for ${membersName}`,
      });
    });
  }
  /**
   * Gets the locator for a site row by exact site name
   * @param siteName - The exact name of the site
   * @returns Locator for the site row
   */
  getSiteRowByExactName(siteName: string): Locator {
    return this.page
      .locator('tr')
      .filter({ has: this.page.locator('td.cell-details').locator('h2', { hasText: siteName }) })
      .first();
  }
  /**
   * Finds and selects the first site with an enabled checkbox from a list of site names
   * @param siteNames - Array of site names to try
   * @returns The name of the selected site, or null if none found
   */
  async selectFirstEnabledSiteCheckbox(siteNames: string[]): Promise<string | null> {
    return await test.step('Finding and selecting first site with enabled checkbox', async () => {
      for (const siteName of siteNames) {
        try {
          const siteRow = this.getSiteRowByExactName(siteName);
          // Try specific checkbox locator first, fallback to getByLabel
          let checkbox = siteRow.locator(this.checkboxLocator);
          let isVisible = await checkbox.isVisible().catch(() => false);

          if (!isVisible) {
            // Fallback to getByLabel if specific locator doesn't find it
            checkbox = siteRow.getByLabel('Select');
            isVisible = await checkbox.isVisible().catch(() => false);
          }

          if (!isVisible) {
            continue;
          }

          const isEnabled = await checkbox.isEnabled().catch(() => false);
          const isDisabled = await checkbox.getAttribute('enabled').catch(() => null);

          if (isEnabled && !isDisabled) {
            await this.clickOnElement(checkbox);
            return siteName;
          }
        } catch {
          // Continue to next site if this one fails
          continue;
        }
      }
      return null;
    });
  }
  /**
   * Selects the checkbox for a site by its exact name
   * @param siteName - The exact name of the site
   */
  async selectSiteCheckboxByExactName(siteName: string): Promise<void> {
    await test.step(`Selecting checkbox for site: ${siteName}`, async () => {
      const siteRow = this.getSiteRowByExactName(siteName);
      // Try specific checkbox locator first, fallback to getByLabel
      let checkbox = siteRow.locator('input[type="checkbox"][aria-label="Select"]').first();
      let isVisible = await checkbox.isVisible().catch(() => false);

      if (!isVisible) {
        // Fallback to getByLabel if specific locator doesn't find it
        checkbox = siteRow.getByLabel('Select');
        isVisible = await checkbox.isVisible().catch(() => false);
      }

      if (!isVisible) {
        throw new Error(`Checkbox for site "${siteName}" is not visible`);
      }

      // Check if checkbox is already checked to avoid duplicate clicks
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (isChecked) {
        return; // Already selected, no need to click again
      }

      const isEnabled = await checkbox.isEnabled().catch(() => false);
      const isDisabled = await checkbox.getAttribute('disabled').catch(() => null);

      if (!isEnabled || isDisabled) {
        throw new Error(`Checkbox for site "${siteName}" is disabled and cannot be clicked`);
      }

      await this.clickOnElement(checkbox);
    });
  }
  async hoverOnSiteCheckboxByExactName(siteName: string): Promise<void> {
    await test.step(`Hovering on site drop by exact name: ${siteName}`, async () => {
      const siteRow = this.getSiteRowByExactName(siteName);
      // Try specific checkbox locator first, fallback to getByLabel
      let checkbox = siteRow.locator('[aria-label="Category option"]').first();
      let isVisible = await checkbox.isVisible().catch(() => false);

      if (!isVisible) {
        // Fallback to getByLabel if specific locator doesn't find it
        checkbox = siteRow.getByLabel('Category option');
        isVisible = await checkbox.isVisible().catch(() => false);
      }

      if (!isVisible) {
        throw new Error(`Dropdown for site "${siteName}" is not visible`);
      }

      // Check if checkbox is already checked to avoid duplicate clicks
      const isChecked = await checkbox.isChecked().catch(() => false);
      if (isChecked) {
        return; // Already selected, no need to click again
      }

      const isEnabled = await checkbox.isEnabled().catch(() => false);
      const isDisabled = await checkbox.getAttribute('disabled').catch(() => null);

      if (!isEnabled || isDisabled) {
        throw new Error(`Checkbox for site "${siteName}" is disabled and cannot be clicked`);
      }

      await this.hoverOverElementInJavaScript(checkbox);
    });
  }

  async selectContentFilter(filter: ContentFilter): Promise<void> {
    await test.step(`Select content filter: ${filter}`, async () => {
      const contentFilterResponse = await this.performActionAndWaitForResponse(
        () => this.contentFilterDropdown.selectOption(filter),
        response =>
          response.url().includes(API_ENDPOINTS.content.contentListInSite) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      await contentFilterResponse.finished();
    });
  }

  async verifyContentFilterIsSelectedWithValue(value: ContentFilter): Promise<void> {
    await test.step(`Verify content filter is selected with value: ${value}`, async () => {
      const selectedValue = await this.contentFilterDropdown.inputValue();
      if (selectedValue !== value) {
        throw new Error(`Content filter should be selected with value: ${value}, but found: ${selectedValue}`);
      }
    });
  }

  async searchContentInManageSite(contentName: string): Promise<void> {
    await test.step(`Search content ${contentName} in manage site`, async () => {
      if (!contentName || typeof contentName !== 'string') {
        throw new Error(`Invalid contentName provided: ${contentName}. Expected a non-empty string.`);
      }
      await this.typeInElement(this.contentSearchBar, contentName);
      await this.contentSearchBar.press('Enter');
    });
  }
}
