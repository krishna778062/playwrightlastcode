import { Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { SubscriptionComponent } from '@/src/modules/content/ui/components/subscriptionComponent';
import { UpdateSiteCategoryComponent } from '@/src/modules/content/ui/components/updateSiteCategoryComponent';

export class ManageSiteSetUpPage extends BasePage {
  readonly contentTab: Locator;
  readonly ellipses: Locator;
  readonly clickOnUpdateCategoryOption: Locator;
  readonly selectASite: Locator;
  readonly siteNameLocator: (siteName: string) => Locator;
  readonly templateRowLocator: (templateName: string) => Locator;
  readonly threeDotsButtonInRow: (row: Locator) => Locator;

  // Content Submissions locators
  readonly contentSubmissionsHeading: Locator;
  readonly contentSubmissionsToggle: Locator;
  readonly editSubmissionProcessButton: Locator;
  readonly editApprovalProcessButton: Locator;
  readonly submissionProcessTooltip: Locator;
  readonly approvalProcessTooltip: Locator;

  private updateSiteCategoryComponent: UpdateSiteCategoryComponent;
  private manageSitesComponent: ManageSitesComponent;
  private subscriptionComponent: SubscriptionComponent;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_SETUP_PAGE(siteId));
    this.manageSitesComponent = new ManageSitesComponent(page);
    this.updateSiteCategoryComponent = new UpdateSiteCategoryComponent(page);
    this.subscriptionComponent = new SubscriptionComponent(page);

    // Initialize locators
    this.contentTab = this.page.locator('a[href*="/content"], button:has-text("Content"), [data-testid="content-tab"]');
    this.ellipses = this.page.locator('[aria-label="Category option"]').first();
    this.clickOnUpdateCategoryOption = this.page.getByRole('button', { name: 'Update category' });
    this.selectASite = this.page.getByRole('cell', { name: 'Name' });
    this.siteNameLocator = (siteName: string) => this.page.getByText(siteName, { exact: true });
    this.templateRowLocator = (templateName: string) =>
      this.page.locator(`[data-testid^="dataGridRow-"]`).filter({ hasText: templateName }).first();
    this.threeDotsButtonInRow = (row: Locator) => row.getByRole('button', { name: 'Show more' });

    // Content Submissions locators
    this.contentSubmissionsHeading = page.getByRole('heading', { name: 'Content submissions' });
    // Find the toggle switch - use a more direct approach
    this.contentSubmissionsToggle = page
      .getByRole('heading', { name: 'Content submissions' })
      .locator('..')
      .locator('..')
      .getByRole('switch')
      .first();
    // Use direct page locators for buttons - they're more reliable
    this.editSubmissionProcessButton = page.getByRole('button', { name: 'Edit submission process' });
    this.editApprovalProcessButton = page.getByRole('button', { name: 'Edit approval process' });
    // Tooltip locators - these appear on hover
    this.submissionProcessTooltip = page.getByText(
      "Submission process settings aren't available until target audience changes are saved",
      { exact: false }
    );
    this.approvalProcessTooltip = page.getByText(
      "Approval process settings aren't available until target audience changes are saved",
      { exact: false }
    );
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageSitesComponent.contentTab, {
      assertionMessage: 'Content tab should be visible on manage site page',
    });
  } // OLD METHODS - from ManageSitesComponent
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
  async clickOnThePageTemplateTab(): Promise<void> {
    await this.manageSitesComponent.clickOnThePageTemplateTabAction();
  }

  async clickOnEditButton(): Promise<void> {
    await this.manageSitesComponent.clickOnEditButtonAction();
  }
  async clickThreeDotsMenuForTemplate(templateName: string): Promise<void> {
    await test.step(`Click three dots menu for template: ${templateName}`, async () => {
      const templateRow = this.templateRowLocator(templateName);
      const threeDotsButton = this.threeDotsButtonInRow(templateRow);
      await this.verifier.waitUntilElementIsVisible(threeDotsButton);
      await this.clickOnElement(threeDotsButton);
    });
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
  async searchSiteNameInSearchBar(siteName: string): Promise<void> {
    await this.manageSitesComponent.searchSiteNameInSearchBarAction(siteName);
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

  async verifySiteNameIsDisplayed(siteName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.siteNameLocator(siteName), {
      assertionMessage: 'Site name should be displayed on manage site page',
    });
  }

  async verifySitesNamesAreDisplayed(siteNames: string | string[]): Promise<void> {
    // Handle both single site name and array of site names
    const namesArray = Array.isArray(siteNames) ? siteNames : [siteNames];

    let index = 0;
    while (index < namesArray.length) {
      const siteName = namesArray[index];
      await this.searchSiteNameInSearchBar(siteName);
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

  // Subscription actions
  async clickOnSubscriptionButton(): Promise<void> {
    await this.manageSitesComponent.clickOnSubscriptionButtonAction();
  }

  // Subscription assertions
  async verifyAddSubscriptionPageIsLoaded(): Promise<void> {
    await this.subscriptionComponent.verifyAddSubscriptionPageIsLoaded();
  }

  /**
   * Verifies that Content Submissions toggle is displayed under "Content, questions & landing page" section
   */
  async verifyContentSubmissionsToggleIsDisplayed(): Promise<void> {
    await test.step('Verify Content Submissions toggle is displayed', async () => {
      // Verify the "Content, questions & landing page" heading is visible
      const contentLandingPageHeading = this.page.getByRole('heading', { name: 'Content, questions & landing page' });
      await this.verifier.verifyTheElementIsVisible(contentLandingPageHeading, {
        assertionMessage: '"Content, questions & landing page" section should be visible',
      });

      // Verify Content Submissions heading is visible
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsHeading, {
        assertionMessage: 'Content Submissions heading should be visible',
      });

      // Verify the toggle switch is visible
      await this.verifier.verifyTheElementIsVisible(this.contentSubmissionsToggle, {
        assertionMessage: 'Content Submissions toggle should be visible',
      });
    });
  }

  /**
   * Verifies user can toggle Content Submissions ON and OFF
   */
  async verifyContentSubmissionsToggleFunctionality(): Promise<void> {
    await test.step('Verify user can toggle Content Submissions ON-OFF', async () => {
      // Get initial state
      const initialState = await this.contentSubmissionsToggle.isChecked();

      // Toggle OFF if currently ON
      if (initialState) {
        await this.clickOnElement(this.contentSubmissionsToggle);
        await this.verifier.verifyTheElementIsNotChecked(this.contentSubmissionsToggle, {
          assertionMessage: 'Content Submissions toggle should be OFF after clicking',
        });
      }

      // Toggle ON
      await this.clickOnElement(this.contentSubmissionsToggle);
      await this.verifier.verifyTheElementIsChecked(this.contentSubmissionsToggle, {
        assertionMessage: 'Content Submissions toggle should be ON after clicking',
      });

      // Toggle OFF again
      await this.clickOnElement(this.contentSubmissionsToggle);
      await this.verifier.verifyTheElementIsNotChecked(this.contentSubmissionsToggle, {
        assertionMessage: 'Content Submissions toggle should be OFF after clicking again',
      });

      // Restore to initial state
      if (initialState) {
        await this.clickOnElement(this.contentSubmissionsToggle);
      }
    });
  }

  /**
   * Verifies "Who can submit content" edit option is non-interactable (disabled)
   */
  async verifyWhoCanSubmitContentEditIsDisabled(): Promise<void> {
    await test.step('Verify "Who can submit content" edit option is disabled', async () => {
      // First, ensure the toggle is ON so the button is visible
      const isToggleOn = await this.contentSubmissionsToggle.isChecked();
      if (!isToggleOn) {
        await this.clickOnElement(this.contentSubmissionsToggle);
        await this.page.waitForTimeout(500); // Wait for UI to update
      }

      // Wait for the button to be visible and attached to DOM
      await this.verifier.verifyTheElementIsVisible(this.editSubmissionProcessButton, {
        assertionMessage: '"Edit submission process" button should be visible',
        timeout: 5000,
      });

      // Verify the button is disabled
      await this.verifier.verifyTheElementIsDisabled(this.editSubmissionProcessButton, {
        assertionMessage: '"Edit submission process" button should be disabled',
        timeout: 5000,
      });
    });
  }

  /**
   * Verifies tooltip appears on hover for "Who can submit content" edit button
   * @param expectedMessage - The expected tooltip message
   */
  async verifySubmissionProcessTooltip(expectedMessage: string): Promise<void> {
    await test.step(`Verify tooltip on hover for "Who can submit content" edit button: ${expectedMessage}`, async () => {
      // First, ensure the toggle is ON so the button is visible
      const isToggleOn = await this.contentSubmissionsToggle.isChecked();
      if (!isToggleOn) {
        await this.clickOnElement(this.contentSubmissionsToggle);
        await this.page.waitForTimeout(500); // Wait for UI to update
      }

      // Wait for the button to be visible and attached to DOM
      await this.verifier.verifyTheElementIsVisible(this.editSubmissionProcessButton, {
        assertionMessage: '"Edit submission process" button should be visible',
        timeout: 5000,
      });

      // Verify the button is disabled before hovering
      await this.verifier.verifyTheElementIsDisabled(this.editSubmissionProcessButton, {
        assertionMessage: '"Edit submission process" button should be disabled',
        timeout: 5000,
      });

      // Try to find the tooltip container that wraps the button, or use force hover
      const tooltipContainer = this.editSubmissionProcessButton
        .locator('..')
        .locator('span[class*="TooltipOnHover"]')
        .first();
      const containerExists = (await tooltipContainer.count()) > 0;

      if (containerExists) {
        // Hover on the tooltip container instead
        await tooltipContainer.hover({ timeout: 5000 });
      } else {
        // Fallback: use force hover to bypass pointer event interception
        await this.editSubmissionProcessButton.hover({ timeout: 5000, force: true });
      }

      // Wait a bit for tooltip to appear
      await this.page.waitForTimeout(1000);

      // Verify tooltip is visible with expected message
      const tooltip = this.page.getByText(expectedMessage, { exact: false });
      await this.verifier.verifyTheElementIsVisible(tooltip, {
        assertionMessage: `Tooltip with message "${expectedMessage}" should be visible on hover`,
        timeout: 5000,
      });
    });
  }

  /**
   * Verifies tooltip appears on hover for "Approval process" edit button
   * @param expectedMessage - The expected tooltip message
   */
  async verifyApprovalProcessTooltip(expectedMessage: string, disableToggle: boolean = false): Promise<void> {
    await test.step(`Verify tooltip on hover for "Approval process" edit button: ${expectedMessage}`, async () => {
      // First, ensure the toggle is ON so the button is visible
      const isToggleOn = await this.contentSubmissionsToggle.isChecked();
      if (!isToggleOn) {
        await this.clickOnElement(this.contentSubmissionsToggle);
        await this.page.waitForTimeout(500); // Wait for UI to update
      }

      // Wait for the button to be visible and attached to DOM
      await this.verifier.verifyTheElementIsVisible(this.editApprovalProcessButton, {
        assertionMessage: '"Edit approval process" button should be visible',
        timeout: 5000,
      });

      if (!disableToggle) {
        // Verify the button is disabled before hovering
        await this.verifier.verifyTheElementIsDisabled(this.editApprovalProcessButton, {
          assertionMessage: '"Edit approval process" button should be disabled',
          timeout: 5000,
        });
      }

      // Try to find the tooltip container that wraps the button, or use force hover
      const tooltipContainer = this.editApprovalProcessButton
        .locator('..')
        .locator('span[class*="TooltipOnHover"]')
        .first();
      const containerExists = (await tooltipContainer.count()) > 0;

      if (containerExists) {
        // Hover on the tooltip container instead
        await tooltipContainer.hover({ timeout: 5000 });
      } else {
        // Fallback: use force hover to bypass pointer event interception
        await this.editApprovalProcessButton.hover({ timeout: 5000, force: true });
      }

      // Wait a bit for tooltip to appear
      await this.page.waitForTimeout(1000);

      // Verify tooltip is visible with expected message
      const tooltip = this.page.getByText(expectedMessage, { exact: false });
      await this.verifier.verifyTheElementIsVisible(tooltip, {
        assertionMessage: `Tooltip with message "${expectedMessage}" should be visible on hover`,
        timeout: 5000,
      });
    });
  }
}
