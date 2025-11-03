import { Locator, Page, test } from '@playwright/test';

import { SortOptionLabels } from '@modules/content/constants';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { ManageContentOptions, ManageContentTags } from '@/src/modules/content/constants/manageContentOptions';

export class ManageContentComponent extends BaseComponent {
  readonly searchBar: Locator;
  readonly searchIconButton: Locator;
  readonly nothingToShowHereText: Locator;
  readonly xButton: Locator;
  readonly placeHolderText: Locator;
  readonly firstContentCheckbox: Locator;
  readonly actionDropdown: Locator;
  readonly unpublishButton: Locator;
  readonly sendFeedback: Locator;
  readonly applyButton: Locator;
  readonly publishButton: Locator;
  readonly moveButton: Locator;
  readonly moveContentSearchBarField: Locator;
  readonly moveConfirmButton: Locator;
  readonly siteListSelect: Locator;
  readonly deleteButton: Locator;
  readonly selectAllButton: Locator;
  readonly validateButton: Locator;
  readonly firstDropDownOption: Locator;
  readonly publishOption: Locator;
  readonly unpublishOption: Locator;
  readonly deleteOption: Locator;
  readonly deleteOptionButton: Locator;
  readonly deleteModalConfirmButton: Locator;
  readonly imageContainer: Locator;
  readonly FilterButton: Locator;
  readonly siteSearchBar: Locator;
  readonly authorName: Locator;
  readonly listContainer: Locator;
  readonly siteHeading: Locator;
  readonly siteSearchBarOption: Locator;
  readonly siteStatusStamp: Locator;
  readonly pageCategorySelectorDropdown: Locator;
  readonly siteName: Locator;
  readonly actionDropdownContainer: Locator;
  readonly pageCategorySelectorDropdownOptions: Locator;
  siteSearchBarOptionText!: string;
  readonly sortByButton: Locator;
  readonly createdNewestOption: Locator;
  readonly createdNewestOptionOuterDiv: Locator;
  readonly viewAllButton: Locator;
  readonly editButton: Locator;
  readonly validationRequiredBar: Locator;
  readonly clickOnCancelButton: Locator;
  readonly statusField: Locator;
  readonly selectPublishOption: Locator;
  readonly crossButton: Locator;
  readonly scheduledTag: Locator;
  readonly openingPanelMenu: Locator;
  readonly manageContentListItems: Locator;
  readonly showMoreButton: Locator;
  readonly pageOption: Locator;
  readonly draftTag: Locator;
  readonly publishedTag: Locator;
  readonly addToCampaignOption: Locator;
  readonly pageTitleInput: Locator;
  readonly publishConfirmButton: Locator;
  readonly unpublishedTag: Locator;
  readonly checkBoxOfContent: Locator;
  readonly onboardingOption: Locator;
  constructor(page: Page) {
    super(page);
    this.searchBar = page.locator("[aria-label='Search…']");
    this.searchIconButton = page.locator('.SearchField-submit');
    this.nothingToShowHereText = page.locator('p:has-text("Nothing to show here")');
    this.sendFeedback = page.getByRole('button', { name: 'Send feedback' });

    this.xButton = page.locator('[aria-label="Clear"]');
    this.placeHolderText = page.locator(`[placeholder="Search…"]`);
    this.firstContentCheckbox = page.locator('[type="checkbox"]').nth(1);
    this.actionDropdownContainer = page.locator(`[class="Bulk Bulk--footer"]`);
    this.actionDropdown = page.locator('#action');
    this.unpublishButton = page.getByText('Unpublish', { exact: true });
    this.applyButton = page.getByRole('button', { name: 'Apply' });
    this.publishButton = page.getByText('Publish', { exact: true });
    this.moveButton = page.getByText('Move', { exact: true });
    this.moveContentSearchBarField = page
      .locator('div')
      .filter({ hasText: /^Select a site…$/ })
      .first();
    this.moveConfirmButton = page.getByRole('button', { name: 'Move' });
    this.siteListSelect = page.locator(`[role="listbox"]`).first();
    this.deleteButton = page.getByText('Delete', { exact: true });
    this.showMoreButton = page.getByRole('button', { name: 'Show more' });
    this.selectAllButton = page.locator('[type="checkbox"]').first();
    this.validateButton = page.getByText('Validate', { exact: true });
    this.firstDropDownOption = page.getByRole('button', { name: 'Category option' }).first();
    this.publishOption = page.locator(`[title="Publish"]`).first();
    this.unpublishOption = page.locator(`[title="Unpublish"]`).first();
    this.deleteOption = page.locator(`[title="Delete"]`).first();
    this.deleteModalConfirmButton = page.locator(`[type="submit"]`);
    this.imageContainer = this.page.locator('[class*="ContentImageIcon"]').first();
    this.FilterButton = page.getByRole('button', { name: 'Filters' });
    this.siteSearchBar = page.getByRole('combobox', { name: 'Select site:' });
    this.manageContentListItems = page.locator('.ManageContentListItem');
    this.listContainer = page.locator('.ListingItem-inner');
    this.authorName = this.listContainer.locator('.meta-link').first();
    this.siteHeading = this.listContainer.locator(`[target="_self"]`).first();
    this.siteStatusStamp = this.listContainer.locator('[class="StampList"]').first();
    this.siteSearchBarOption = page.locator('[role="listbox"]').first();
    this.siteName = page.locator(`[class="meta-link"]`).last();
    this.sortByButton = page.locator(`[name="sortBy"]`);
    this.statusField = page.locator('[name="status"]');

    this.pageCategorySelectorDropdown = page
      .locator('div')
      .filter({ hasText: /^Select a page category…$/ })
      .first();
    this.pageCategorySelectorDropdownOptions = page.locator('[id="undefined-list"]').first();
    this.createdNewestOption = page.locator('option').filter({ hasText: 'Created date (newest first)' }).first();
    this.createdNewestOptionOuterDiv = page.locator('[class="NativeSelect"]');
    this.deleteOptionButton = page.getByRole('button', { name: 'Delete' });
    this.viewAllButton = page
      .getByRole('button', { name: 'View all' })
      .or(page.getByRole('link', { name: 'View all' }));
    this.openingPanelMenu = page.locator('[aria-label="Category option"]').first();
    this.editButton = page.getByRole('button', { name: 'Edit' });
    this.validationRequiredBar = page.locator('.Stamp').first();
    this.clickOnCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.selectPublishOption = page.getByLabel('Status:');
    this.crossButton = page.getByRole('button', { name: 'Dismiss' }).first();
    this.scheduledTag = page.locator('[class="StampList"]:has-text("SCHEDULED")').first();
    this.pageOption = page.getByText('Page', { exact: true });
    this.draftTag = page
      .locator('div')
      .filter({ hasText: /^Draft$/ })
      .first();
    this.publishedTag = page
      .locator('div')
      .filter({ hasText: /^Published$/ })
      .first();
    this.unpublishedTag = page
      .locator('div')
      .filter({ hasText: /^Unpublished$/ })
      .first();
    this.addToCampaignOption = page.getByText('Add to campaign', { exact: true });
    this.pageTitleInput = page.locator('[id="contentTitle"]').first();
    this.publishConfirmButton = page.getByRole('button', { name: 'Publish changes' }).first();
    this.checkBoxOfContent = page.locator('[type="checkbox"]');
    this.onboardingOption = page.getByText('Onboarding', { exact: true });
  }
  getPageName(pageName: string): Locator {
    return this.page.locator(`[aria-label="${pageName}"]`).first();
  }
  getGlobalSearchResultPageName(pageName: string): Locator {
    return this.page.locator(`h2:has-text("${pageName}")`).first();
  }
  getContentNameLocator(text: string): Locator {
    return this.manageContentListItems.locator(`a:has-text("${text}")`).first();
  }

  createdAtDate(createdAtDate: string): Locator {
    // Handle special cases for Today and Yesterday
    if (createdAtDate.toLowerCase() === 'today') {
      return this.page.getByText('Created: Today').first();
    } else if (createdAtDate.toLowerCase() === 'yesterday') {
      return this.page.getByText('Created: Yesterday').first();
    } else {
      // Handle regular date format
      return this.page.getByText(`Created: ${createdAtDate}`).first();
    }
  }

  publishedAtDate(publishedAtDate: string): Locator {
    // Handle special cases for Today and Yesterday
    if (publishedAtDate.toLowerCase() === 'today') {
      return this.page.getByText('Published: Today').first();
    } else if (publishedAtDate.toLowerCase() === 'yesterday') {
      return this.page.getByText('Published: Yesterday').first();
    } else {
      // Handle regular date format - UI shows "Published: [date]" within the combined date string
      return this.page.getByText(`Published: ${publishedAtDate}`).first();
    }
  }

  editedAtDate(editedAtDate: string): Locator {
    if (editedAtDate.toLowerCase() === 'today') {
      return this.page.getByText('(edited: Today)').first();
    } else if (editedAtDate.toLowerCase() === 'yesterday') {
      return this.page.getByText('(edited: Yesterday)').first();
    } else {
      return this.page.getByText(`(edited: ${editedAtDate})`).first();
    }
  }

  async clickSearchBar(): Promise<void> {
    await test.step(`Clicking on the search bar`, async () => {
      await this.clickOnElement(this.searchBar);
    });
  }

  async waitForManageContentListItems(): Promise<void> {
    await test.step(`Waiting for manage content list items`, async () => {
      await this.manageContentListItems.first().waitFor();
    });
  }

  async writeRandomTextInSearchBar(inputText: string): Promise<void> {
    await test.step(`Writing random text in the search bar`, async () => {
      await this.clickSearchBar();
      await this.searchBar.type(inputText);
    });
  }
  get contentFilter(): Locator {
    return this.page.getByLabel('Content:');
  }

  async searchIcon(): Promise<void> {
    await test.step(`Searching for content`, async () => {
      await this.clickOnElement(this.searchIconButton, { force: true });
    });
  }

  async nothingToShowHere(): Promise<void> {
    await test.step(`Checking if nothing to show here`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.nothingToShowHereText);
    });
  }

  async clearSearchBar(): Promise<void> {
    await test.step(`Clearing the search bar`, async () => {
      await this.searchBar.clear();
    });
  }

  async clickXButton(): Promise<void> {
    await test.step(`Clicking the x button`, async () => {
      await this.clickOnElement(this.xButton);
    });
  }

  async placeHolderShouldBeVisible(): Promise<void> {
    await test.step(`Checking if the place holder text is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.placeHolderText);
    });
  }

  async createdAtDateShouldBeVisible(createdAtDate: string): Promise<void> {
    await test.step(`Checking if the created at date is visible`, async () => {
      const createdAtLocator = this.page.getByText(`Created-${createdAtDate}`);
      await this.verifier.verifyTheElementIsVisible(createdAtLocator, {
        assertionMessage: 'Created at date should be visible',
      });
    });
  }

  async selectFirstContent(): Promise<void> {
    await test.step(`Selecting the first content`, async () => {
      await this.clickOnElement(this.firstContentCheckbox, { force: true });
    });
  }

  async selectActionDropdown(): Promise<void> {
    await test.step(`Selecting the action dropdown`, async () => {
      await this.clickOnElement(this.actionDropdown);
    });
  }

  async selectUnpublishButton(): Promise<void> {
    await test.step(`Selecting the unpublish button`, async () => {
      await this.clickOnElement(this.unpublishButton);
    });
  }

  async selectApplyButton(): Promise<void> {
    await test.step(`Selecting the confirm unpublish button`, async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.applyButton, { delay: 2_000 }),
        response =>
          response.url().includes(PAGE_ENDPOINTS.MANAGE_CONTENT_APPLY_API) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return publishResponse;
    });
  }

  async selectMoveApplyButton(): Promise<void> {
    await test.step(`Selecting the confirm unpublish button`, async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.applyButton, { delay: 2_000 }),
        response =>
          response.url().includes(PAGE_ENDPOINTS.MANAGE_CONTENT_MOVE_API) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return publishResponse;
    });
  }

  async selectDeleteApplyButton(): Promise<void> {
    await test.step(`Selecting the confirm delete button`, async () => {
      const publishResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.applyButton, { delay: 2_000 }),
        response =>
          response.url().includes(PAGE_ENDPOINTS.MANAGE_CONTENT_DELETE_API) &&
          response.request().method() === 'DELETE' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return publishResponse;
    });
  }

  async scheduledTagShouldBeVisible(): Promise<void> {
    await test.step(`Checking if the scheduled tag is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledTag);
    });
  }
  async clickOnCrossButton(): Promise<void> {
    await test.step(`Clicking on the cross button`, async () => {
      await this.clickOnElement(this.crossButton);
    });
  }

  async selectPublishButton(): Promise<void> {
    await test.step(`Selecting the publish button`, async () => {
      await this.clickOnElement(this.publishButton);
    });
  }

  async selectMoveButton(): Promise<void> {
    await test.step(`Selecting the move button`, async () => {
      await this.clickOnElement(this.moveButton);
    });
  }

  async moveContentSearchBar(siteName: string): Promise<void> {
    await test.step(`Moving the content search bar`, async () => {
      await this.clickOnElement(this.moveContentSearchBarField);
      await this.moveContentSearchBarField.type(siteName);
    });
  }

  async selectMoveConfirmButton(): Promise<void> {
    await test.step(`Selecting the move confirm button`, async () => {
      await this.clickOnElement(this.moveConfirmButton);
    });
  }

  async siteListSelecting(): Promise<void> {
    await test.step(`Selecting the site list`, async () => {
      await this.clickOnElement(this.siteListSelect);
    });
  }

  async selectDeleteButton(): Promise<void> {
    await test.step(`Selecting the delete button`, async () => {
      await this.clickOnElement(this.deleteButton);
    });
  }

  async selectSelectAllButton(): Promise<void> {
    await test.step(`Selecting the select all button`, async () => {
      await this.clickOnElement(this.selectAllButton);
    });
  }

  async selectValidateButton(): Promise<void> {
    await test.step(`Selecting the validate button`, async () => {
      await this.clickOnElement(this.validateButton);
    });
  }

  async selectFirstDropDownOption(): Promise<void> {
    await test.step(`Selecting the first drop down option`, async () => {
      await this.clickOnElement(this.firstDropDownOption);
    });
  }
  async hoverOnFirstDropDownOption(): Promise<void> {
    await test.step(`Hovering on the first drop down option`, async () => {
      await this.hoverOverElementInJavaScript(this.firstDropDownOption);
    });
  }

  async clickOnOnboardingOption(): Promise<void> {
    await test.step(`Clicking on the onboarding option`, async () => {
      await this.clickOnElement(this.onboardingOption);
    });
  }

  async verifyOnboardingOptionVisibleInManageContent(): Promise<void> {
    await test.step('Verifying the onboarding option is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.onboardingOption, {
        assertionMessage: 'Onboarding option should be visible',
      });
    });
  }
  // has to fix this in next PR by aditya
  async checkPublishOption(): Promise<void> {
    await test.step(`Checking the publish option`, async () => {
      if (await this.verifier.isTheElementVisible(this.publishOption)) {
        await this.clickOnElement(this.publishOption);
      } else {
        await this.verifier.verifyTheElementIsVisible(this.unpublishOption);
        await this.clickOnElement(this.unpublishOption);
        await this.verifier.verifyTheElementIsVisible(this.publishOption);
        await this.clickOnElement(this.publishOption);
      }
    });
  }

  async clickDeleteOption(): Promise<void> {
    await test.step(`Checking the delete option`, async () => {
      await this.clickOnElement(this.deleteOption);
    });
  }

  async clickDeleteModalConfirmButton(): Promise<void> {
    await test.step(`Clicking the delete modal confirm button`, async () => {
      await this.clickOnElement(this.deleteModalConfirmButton);
    });
  }

  async verifyImageContainer(): Promise<void> {
    await test.step(`Clicking the image container`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.imageContainer);
    });
  }
  async clickFilterButton(): Promise<void> {
    await test.step(`Clicking the filter button`, async () => {
      await this.clickOnElement(this.FilterButton);
    });
  }
  async clickSiteSearchBar(siteName: string): Promise<void> {
    await test.step(`Clicking the site search bar`, async () => {
      await this.clickOnElement(this.siteSearchBar);
      await this.siteSearchBar.type(siteName);
    });
  }

  async authorNameShouldBeVisible(): Promise<void> {
    await test.step(`Checking the author name should be visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.authorName);
    });
  }
  async clickOnTheAuthorName(): Promise<void> {
    await test.step(`Clicking on the author name`, async () => {
      await this.clickOnElement(this.authorName);
    });
  }
  async verifySiteName(): Promise<void> {
    await test.step(`Verifying the site name`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteHeading);
    });
  }
  async clickOnTheSiteName(): Promise<void> {
    await test.step(`Clicking on the site name`, async () => {
      await this.clickOnElement(this.siteHeading);
    });
  }
  async verifySiteStatusStamp(): Promise<void> {
    await test.step(`Verifying the site status stamp`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteStatusStamp);
    });
  }
  async selectSiteSearchBar(siteName: string): Promise<void> {
    await test.step(`Selecting site search bar with name: ${siteName}`, async () => {
      await this.clickOnElement(this.siteSearchBar);
      await this.fillInElement(this.siteSearchBar, siteName);
      await this.selectSiteSearchBarOption();
    });
  }

  async selectSiteSearchBarOption(): Promise<void> {
    await test.step('Selecting the site search bar option', async () => {
      const fullText = (await this.siteSearchBarOption.textContent()) || '';
      // Extract site name by removing "Site" prefix
      this.siteSearchBarOptionText = fullText.replace(/^Site/, '').trim();

      // Click on the site search bar option
      await this.clickOnElement(this.siteSearchBarOption);
    });
  }

  async verifySiteNameLink(): Promise<void> {
    await test.step('Verifying the site name', async () => {
      // Get the site name
      const siteName = await this.siteName.innerText();
      console.log(siteName);
      console.log(this.siteSearchBarOptionText);

      // Check if site name matches the selected option
      if (this.siteSearchBarOptionText.trim() === siteName.trim()) {
        console.log('Site name is matching');
      } else {
        throw new Error(`Site name is not matching. Expected: ${this.siteSearchBarOptionText}, Found: ${siteName}`);
      }
    });
  }
  async clickSortByButton(): Promise<void> {
    await test.step('Clicking the sort by button', async () => {
      await this.clickOnElement(this.sortByButton);
    });
  }

  async selectTheStatusFilter(status: string): Promise<void> {
    await test.step(`Selecting the status filter: ${status}`, async () => {
      await this.clickOnElement(this.statusField);
      await this.selectPublishOption.selectOption(status);
    });
  }

  /**
   * Parameterized function to select any sort option by SortOptionLabels enum
   * @param sortBy - The sort option to select
   */
  async selectSortOption(sortBy: SortOptionLabels): Promise<void> {
    await test.step(`Selecting sort option: ${sortBy}`, async () => {
      await this.sortByButton.selectOption({ label: sortBy });
    });
  }

  async verifyManageContentListItemCount(expectedCount: number): Promise<void> {
    await test.step(`Verifying ManageContentListItem count is ${expectedCount}`, async () => {
      await this.waitForManageContentListItems();
      const actualCount = await this.manageContentListItems.count();
      console.log(`Actual count: ${actualCount}`);
      console.log(`Expected count: ${expectedCount}`);
      if (actualCount < expectedCount) {
        throw new Error(`Expected at least ${expectedCount} ManageContentListItem elements, but found ${actualCount}`);
      }
      console.log(`✅ Successfully verified ${actualCount} ManageContentListItem elements`);
    });
  }

  async selectEditedNewestOptionByText(): Promise<void> {
    await test.step('Selecting the edited newest option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Edited date (newest first)' });
    });
  }
  async selectEditedOldestOptionByText(): Promise<void> {
    await test.step('Selecting the edited oldest option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Edited date (oldest first)' });
    });
  }
  async selectCreatedNewestOption(): Promise<void> {
    await test.step('Selecting the created newest option', async () => {
      await this.sortByButton.selectOption('createdNewest');
    });
  }

  async selectCreatedNewestOptionByText(): Promise<void> {
    await test.step('Selecting the created newest option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Created date (newest first)' });
    });
  }

  async selectCreateNewestPublishedOptionByText(): Promise<void> {
    await test.step('Selecting the create newest published option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Published date (newest first)' });
    });
  }
  async selectCreateOldestPublishedOptionByText(): Promise<void> {
    await test.step('Selecting the create oldest published option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Published date (oldest first)' });
    });
  }
  async selectCreatedOldestOptionByText(): Promise<void> {
    await test.step('Selecting the created oldest option by text', async () => {
      await this.sortByButton.selectOption({ label: 'Created date (oldest first)' });
    });
  }

  async selectPageCategoryIfVisible(): Promise<void> {
    await test.step('Selecting the page category if visible', async () => {
      if (await this.verifier.isTheElementVisible(this.pageCategorySelectorDropdown)) {
        await this.clickOnElement(this.pageCategorySelectorDropdown);
      } else {
        console.log('Page category selector dropdown is not visible skipping');
      }
    });
  }
  // Fix this and add a filter for page selection on manage content by aditya
  async selectPageCategory(): Promise<void> {
    await test.step('Selecting the page category', async () => {
      if (await this.verifier.isTheElementVisible(this.pageCategorySelectorDropdownOptions)) {
        await this.clickOnElement(this.pageCategorySelectorDropdownOptions);
      } else {
        console.log('Page category selector dropdown options is not visible skipping');
      }
    });
  }
  async clickOnViewAllButton(): Promise<void> {
    await test.step('Clicking on view all button', async () => {
      await this.clickOnElement(this.viewAllButton);
    });
  }
  async clickOnEditButton(): Promise<void> {
    await test.step('Clicking on edit button', async () => {
      await this.clickOnElement(this.openingPanelMenu);
      await this.clickOnElement(this.editButton);
    });
  }
  async verifyingValidationRequiredBarState(): Promise<void> {
    await test.step('Verifying validation required bar state', async () => {
      await this.verifier.verifyTheElementIsVisible(this.validationRequiredBar);
    });
  }
  async clickOnContent(): Promise<void> {
    await test.step('Clicking on content', async () => {
      await this.clickOnElement(this.firstContentCheckbox);
    });
  }
  async clickOnCancel(): Promise<void> {
    await test.step('Clicking on cancel', async () => {
      await this.clickOnElement(this.clickOnCancelButton);
    });
  }
  async addPublishContentFilter(): Promise<void> {
    await test.step('Adding publish content filter', async () => {
      await this.clickFilterButton();
      await this.clickOnElement(this.statusField);
      await this.selectPublishOption.selectOption('Published');
      await this.clickFilterButton();
    });
  }
  async scheduledTagVisibleInManageContent(): Promise<void> {
    await test.step('Checking if the scheduled tag is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledTag, {
        assertionMessage: 'Scheduled tag should be visible',
      });
    });
  }
  async checkContentDetailsVisibility(pageName: string): Promise<void> {
    await test.step('Checking if the content details are visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scheduledTag, {
        assertionMessage: 'Scheduled tag should be visible',
      });
      await this.verifier.verifyTheElementIsVisible(this.getPageName(pageName), {
        assertionMessage: 'Content details should be visible',
      });
    });
  }

  async verifyContentDetailsVisibility(pageName: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.getPageName(pageName), {
      assertionMessage: 'Content details should be visible',
    });
  }
  async applyButtonShouldBeDisabled(): Promise<void> {
    await test.step('Checking if the apply button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.applyButton);
    });
  }

  async clickOnValidateApplyButton(): Promise<void> {
    await test.step(`Clicking on validate apply button`, async () => {
      await this.clickOnElement(this.applyButton);
    });
  }

  async selectContentFilter(managedBy: string): Promise<void> {
    await test.step('Selecting the content filter', async () => {
      await this.contentFilter.selectOption(managedBy);
    });
  }

  /**
   * Unified function to select content filter based on the filter type
   * @param filterType - 'manageByme' selects 'managing' option, 'authorByMe' selects 'owned' option
   * @example
   * // Instead of:
   * // await page.getByLabel('Content:').selectOption('managing');
   * // await page.getByLabel('Content:').selectOption('owned');
   *
   * // Use this unified function:
   * await selectContentFilterByType('manageByme'); // Selects 'managing' option
   * await selectContentFilterByType('authorByMe'); // Selects 'owned' option
   */
  async selectContentFilterByType(filterType: 'manageByme' | 'authorByMe'): Promise<void> {
    await test.step(`Selecting content filter: ${filterType}`, async () => {
      const filterValue = filterType === 'manageByme' ? 'managing' : 'owned';
      await this.contentFilter.selectOption(filterValue);
    });
  }

  async verifyPublishedAtDateVisibleInManageContent(publishedAtDate: string): Promise<void> {
    await test.step('Verifying the published at date is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.publishedAtDate(publishedAtDate), {
        assertionMessage: 'Published at date should be visible',
      });
    });
  }
  async verifyEditedAtDateVisibleInManageContent(editedAtDate: string): Promise<void> {
    await test.step('Verifying the edited at date is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.editedAtDate(editedAtDate), {
        assertionMessage: 'Edited at date should be visible',
      });
    });
  }
  async verifyCreatedAtDateVisibleInManageContent(createdAtDate: string): Promise<void> {
    await test.step('Verifying the created at date is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.createdAtDate(createdAtDate), {
        assertionMessage: 'Created at date should be visible',
      });
    });
  }

  async verifyAllCreatedAtDatesFromArray(dates: string[]): Promise<void> {
    await test.step('Verifying all created at dates from array', async () => {
      for (let i = 0; i < dates.length; i++) {
        const dateToCheck = dates[i];
        await this.verifyCreatedAtDateVisibleInManageContent(dateToCheck);
      }
    });
  }

  async verifyAllPublishedAtDatesFromArray(dates: string[]): Promise<void> {
    await test.step('Verifying all published at dates from array', async () => {
      for (let i = 0; i < dates.length; i++) {
        const dateToCheck = dates[i];
        await this.verifyPublishedAtDateVisibleInManageContent(dateToCheck);
      }
    });
  }
  async getAllContentNames(): Promise<string[]> {
    return await test.step('Get all content names from manage content page', async () => {
      const contentNames = await this.listContainer.allInnerTexts();
      return contentNames
        .map(content => {
          // Extract the title from the content text
          // Format: 'PUBLISHED\nTitle_Name\nBy...'
          const lines = content.split('\n');
          if (lines.length >= 2) {
            return lines[1].trim(); // Get the second line which contains the title
          }
          return content.trim();
        })
        .filter(name => name.length > 0);
    });
  }

  async searchAllContentsInGlobalSearchBar(contentNames: string[]): Promise<void> {
    await test.step('Searching all contents in global search bar', async () => {
      const topNavBar = new TopNavBarComponent(this.page);
      for (let i = 0; i < contentNames.length; i++) {
        const contentName = contentNames[i];
        await topNavBar.typeInSearchBarInput(contentName);
        await topNavBar.clickSearchButton();
        await this.verifier.verifyTheElementIsNotVisible(this.getGlobalSearchResultPageName(contentName), {
          assertionMessage: `Content ${contentName} should not be visible in global search bar`,
        });
        await topNavBar.clickOnXButtonToClearGlobalSearchBarInput();
      }
    });
  }

  async clickShowMoreButton(): Promise<void> {
    await test.step('Clicking the show more button', async () => {
      await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.showMoreButton, { delay: 2_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.content.contentListInSite) &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
    });
  }

  async selectPageOption(): Promise<void> {
    await test.step('Selecting the page option', async () => {
      await this.clickOnElement(this.pageOption);
    });
  }

  /**
   * Unified function to verify any option visibility in manage content
   * @param option - The enum value for the option to verify (e.g., ManageContentOptions.EDIT)
   */
  async verifyOptionVisibleInManageContent(option: ManageContentOptions): Promise<void> {
    await test.step(`Verifying ${option} option is visible in manage content`, async () => {
      const locator = this.getOptionLocator(option);
      await this.verifier.verifyTheElementIsVisible(locator, {
        assertionMessage: `${option} option should be visible`,
      });
    });
  }

  getOptionLocator(option: ManageContentOptions): Locator {
    switch (option) {
      case ManageContentOptions.EDIT:
        return this.editButton;
      case ManageContentOptions.DELETE:
        return this.deleteButton;
      case ManageContentOptions.UNPUBLISH:
        return this.unpublishButton;
      case ManageContentOptions.PUBLISH:
        return this.publishButton;
      case ManageContentOptions.MOVE:
        return this.moveButton;
      default:
        throw new Error(`Unknown option: ${option}`);
    }
  }

  async verifyTagVisibleInManageContent(tag: ManageContentTags): Promise<void> {
    await test.step(`Verifying ${tag} tag is visible in manage content`, async () => {
      const locator = this.getTagLocator(tag);
      await this.verifier.verifyTheElementIsVisible(locator, {
        assertionMessage: `${tag} tag should be visible`,
      });
    });
  }

  getTagLocator(tag: ManageContentTags): Locator {
    switch (tag) {
      case ManageContentTags.PUBLISHED:
        return this.publishedTag;
      case ManageContentTags.UNPUBLISHED:
        return this.unpublishedTag;
      case ManageContentTags.SCHEDULED:
        return this.scheduledTag;
      case ManageContentTags.DRAFT:
        return this.draftTag;
      default:
        throw new Error(`Unknown tag: ${tag}`);
    }
  }
  async verifyPublishedStampVisibleInManageContent(): Promise<void> {
    await test.step('Verifying the published stamp is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.publishedTag, {
        assertionMessage: 'Published stamp should be visible',
      });
    });
  }
  async verifyUnpublishedStampVisibleInManageContent(): Promise<void> {
    await test.step('Verifying the unpublished stamp is visible in manage content', async () => {
      await this.verifier.verifyTheElementIsVisible(this.unpublishedTag, {
        assertionMessage: 'Unpublished stamp should be visible',
      });
    });
  }

  async clickOnContentEditButton(): Promise<void> {
    await test.step('Clicking on content edit button', async () => {
      await this.clickOnElement(this.editButton);
    });
  }
  async UpdatedPageName(pageName: string): Promise<void> {
    await test.step('Verifying the updated page name', async () => {
      await this.pageTitleInput.fill(pageName);
    });
  }
  async clickOnPublishChangesButton(): Promise<void> {
    await test.step('Clicking on publish changes button', async () => {
      await this.clickOnElement(this.publishConfirmButton);
      await test.step('Click info icon', async () => {
        const fileApiPromise = this.page.waitForResponse(
          response =>
            response.url().includes(`${PAGE_ENDPOINTS.CONTENT_PAGE_UPDATE_API}`) &&
            response.request().method() === 'PUT' &&
            response.status() === 201
        );

        await fileApiPromise;
      });
    });
  }
  async clickOnDeleteOption(): Promise<void> {
    await test.step('Clicking on delete option', async () => {
      await this.clickOnElement(this.deleteButton);
    });
  }
  async verifyAllContentsAreSelected(expectedCount: number = 16): Promise<void> {
    await test.step(`Verifying ${expectedCount} contents are selected`, async () => {
      const checkBoxes = await this.checkBoxOfContent.all();
      const selectedCheckBoxes = [];

      for (let i = 0; i < checkBoxes.length; i++) {
        const checkBox = checkBoxes[i];
        const isChecked = await checkBox.isChecked();
        if (isChecked) {
          selectedCheckBoxes.push(checkBox);
        }
      }

      const actualCount = selectedCheckBoxes.length;
      if (actualCount !== expectedCount) {
        throw new Error(`Expected ${expectedCount} selected checkboxes, but found ${actualCount}`);
      }

      console.log(`✓ Verified ${actualCount} checkboxes are selected`);
    });
  }

  async verifyAllContentsAreDeleted(contentNames: string[]): Promise<void> {
    await test.step('Verifying all contents are deleted', async () => {
      const contentNameLocator = this.getContentNameLocator(contentNames[0]);
      await this.verifier.verifyTheElementIsNotVisible(contentNameLocator, {
        assertionMessage: `Content ${contentNames[0]} should not be visible`,
      });
    });
  }

  async verifyContentVisibleInManageSite(contentName: string): Promise<void> {
    await test.step(`Verifying content ${contentName} is visible in manage site`, async () => {
      const contentLocator = this.getContentNameLocator(contentName);
      await this.verifier.verifyTheElementIsVisible(contentLocator, {
        assertionMessage: `Content ${contentName} should be visible`,
      });
    });
  }
}
