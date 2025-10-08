import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';

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
    this.selectAllButton = page.locator('[type="checkbox"]').first();
    this.validateButton = page.getByText('Validate', { exact: true });
    this.firstDropDownOption = page.locator(`[aria-label="Category option"]`).first();
    this.publishOption = page.locator(`[title="Publish"]`).first();
    this.unpublishOption = page.locator(`[title="Unpublish"]`).first();
    this.deleteOption = page.locator(`[title="Delete"]`).first();
    this.deleteModalConfirmButton = page.locator(`[type="submit"]`);
    this.imageContainer = this.page.locator('[class*="ContentImageIcon"]').first();
    this.FilterButton = page.getByRole('button', { name: 'Filters' });
    this.siteSearchBar = page.getByRole('combobox', { name: 'Select site:' });
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
    this.viewAllButton = page
      .getByRole('button', { name: 'View all' })
      .or(page.getByRole('link', { name: 'View all' }));
    this.editButton = page
      .getByRole('button', { name: 'Edit' })
      .or(page.locator("div[role='menuitem'] > div").filter({ hasText: /^Edit$/ }));
    this.validationRequiredBar = page.locator(
      '[class*="ValidationRequired"], [data-testid*="validation"], .validation-bar, [class*="validation-required"]'
    );
    this.clickOnCancelButton = page.getByRole('button', { name: 'Cancel' });
    this.selectPublishOption = page.getByLabel('Status:');
    this.crossButton = page.getByRole('button', { name: 'Dismiss' }).first();
    this.scheduledTag = page.locator('[class="StampList"]:has-text("SCHEDULED")').first();
  }

  getPageName(pageName: string): Locator {
    return this.page.locator(`[aria-label="${pageName}"]`).first();
  }
  async clickSearchBar(): Promise<void> {
    await test.step(`Clicking on the search bar`, async () => {
      await this.clickOnElement(this.searchBar);
    });
  }

  async writeRandomTextInSearchBar(inputText: string): Promise<void> {
    await test.step(`Writing random text in the search bar`, async () => {
      await this.clickSearchBar();
      await this.searchBar.type(inputText);
    });
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
  async selectSiteSearchBar(siteName: string): Promise<void> {
    await test.step(`Selecting the site search bar`, async () => {});
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
  async applyButtonShouldBeDisabled(): Promise<void> {
    await test.step('Checking if the apply button is disabled', async () => {
      await this.verifier.verifyTheElementIsDisabled(this.applyButton);
    });
  }
}
