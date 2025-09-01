import test, { Locator, Page } from '@playwright/test';

import { BaseComponent } from '@core/components/baseComponent';

export class ManageContentComponent extends BaseComponent {
  readonly searchBar: Locator;
  readonly searchIconButton: Locator;
  readonly nothingToShowHereText: Locator;
  readonly xButton: Locator;
  readonly placeHolderText: Locator;
  readonly firstContentCheckbox: Locator;
  readonly actionDropdown: Locator;
  readonly unpublishButton: Locator;
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
  readonly siteName: Locator;
  siteSearchBarOptionText!: string;
  readonly sortByButton: Locator;
  readonly createdNewestOption = '?sortBy=publishedNewest';
  constructor(page: Page) {
    super(page);
    this.searchBar = page.locator("[aria-label='Search…']");
    this.searchIconButton = page.locator('.SearchField-submit');
    this.nothingToShowHereText = page.locator('p:has-text("Nothing to show here")');
    this.xButton = page.locator('[aria-label="Clear"]');
    this.placeHolderText = page.locator(`[placeholder="Search…"]`);
    this.firstContentCheckbox = page.locator('[type="checkbox"]').nth(1);
    this.actionDropdown = page.locator(`[role="combobox"]`);
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
    this.publishOption = page.locator(`[title="Publish"]`);
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
  }

  async clickSearchBar(): Promise<void> {
    await test.step(`Clicking on the search bar`, async () => {
      await this.searchBar.click();
    });
  }

  async writeRandomTextInSearchBar(inputText: string): Promise<void> {
    await test.step(`Writing random text in the search bar`, async () => {
      await this.clickSearchBar();
      await this.searchBar.type(inputText);
      await this.page.waitForTimeout(10000);
    });
  }

  async searchIcon(): Promise<void> {
    await test.step(`Searching for content`, async () => {
      await this.searchIconButton.click({ force: true });
      await this.page.waitForTimeout(5000);
    });
  }

  async nothingToShowHere(): Promise<void> {
    await test.step(`Checking if nothing to show here`, async () => {
      await this.nothingToShowHereText.isVisible();
    });
  }

  async clearSearchBar(): Promise<void> {
    await test.step(`Clearing the search bar`, async () => {
      await this.searchBar.clear();
    });
  }

  async clickXButton(): Promise<void> {
    await test.step(`Clicking the x button`, async () => {
      await this.xButton.click();
    });
  }

  async placeHolderShouldBeVisible(): Promise<void> {
    await test.step(`Checking if the place holder text is visible`, async () => {
      await this.placeHolderText.isVisible();
    });
  }

  async selectFirstContent(): Promise<void> {
    await test.step(`Selecting the first content`, async () => {
      await this.firstContentCheckbox.click({ force: true });
      await this.page.waitForTimeout(2000);
    });
  }

  async selectActionDropdown(): Promise<void> {
    await test.step(`Selecting the action dropdown`, async () => {
      await this.actionDropdown.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectUnpublishButton(): Promise<void> {
    await test.step(`Selecting the unpublish button`, async () => {
      await this.unpublishButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectApplyButton(): Promise<void> {
    await test.step(`Selecting the confirm unpublish button`, async () => {
      await this.applyButton.click();
      await this.page.waitForTimeout(5000);
    });
  }

  async selectPublishButton(): Promise<void> {
    await test.step(`Selecting the publish button`, async () => {
      await this.publishButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectMoveButton(): Promise<void> {
    await test.step(`Selecting the move button`, async () => {
      await this.moveButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async moveContentSearchBar(siteName: string): Promise<void> {
    await test.step(`Moving the content search bar`, async () => {
      await this.moveContentSearchBarField.click();
      await this.moveContentSearchBarField.type(siteName);
      await this.page.waitForTimeout(1000);
    });
  }

  async selectMoveConfirmButton(): Promise<void> {
    await test.step(`Selecting the move confirm button`, async () => {
      await this.moveConfirmButton.click();
      await this.page.waitForTimeout(2000);
    });
  }

  async siteListSelecting(): Promise<void> {
    await test.step(`Selecting the site list`, async () => {
      await this.siteListSelect.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectDeleteButton(): Promise<void> {
    await test.step(`Selecting the delete button`, async () => {
      await this.deleteButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectSelectAllButton(): Promise<void> {
    await test.step(`Selecting the select all button`, async () => {
      await this.selectAllButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectValidateButton(): Promise<void> {
    await test.step(`Selecting the validate button`, async () => {
      await this.validateButton.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async selectFirstDropDownOption(): Promise<void> {
    await test.step(`Selecting the first drop down option`, async () => {
      await this.firstDropDownOption.click();
      await this.page.waitForTimeout(1000);
    });
  }

  async checkPublishOption(): Promise<void> {
    await test.step(`Checking the publish option`, async () => {
      if (await this.publishOption.isVisible()) {
        await this.publishOption.click();
      } else {
        await this.page.waitForTimeout(1000);
        await this.unpublishOption.isVisible();
        await this.unpublishOption.click();
        await this.page.waitForTimeout(1000);
        await this.publishOption.isVisible();
        await this.publishOption.click();
        await this.page.waitForTimeout(1000);
      }
    });
  }

  async clickDeleteOption(): Promise<void> {
    await test.step(`Checking the delete option`, async () => {
      await this.deleteOption.click();
    });
  }

  async clickDeleteModalConfirmButton(): Promise<void> {
    await test.step(`Clicking the delete modal confirm button`, async () => {
      await this.deleteModalConfirmButton.click();
    });
  }

  async verifyImageContainer(): Promise<void> {
    await test.step(`Clicking the image container`, async () => {
      await this.imageContainer.isVisible();
    });
  }
  async clickFilterButton(): Promise<void> {
    await test.step(`Clicking the filter button`, async () => {
      await this.FilterButton.click();
    });
  }
  async clickSiteSearchBar(siteName: string): Promise<void> {
    await test.step(`Clicking the site search bar`, async () => {
      await this.siteSearchBar.click();
      await this.siteSearchBar.type(siteName);
    });
  }
  async selectSiteSearchBar(siteName: string): Promise<void> {
    await test.step(`Selecting the site search bar`, async () => {});
  }
  async authorNameShouldBeVisible(): Promise<void> {
    await test.step(`Checking the author name should be visible`, async () => {
      await this.authorName.isVisible();
    });
  }
  async clickOnTheAuthorName(): Promise<void> {
    await test.step(`Clicking on the author name`, async () => {
      await this.authorName.click();
      await this.page.waitForTimeout(5000);
    });
  }
  async verifySiteName(): Promise<void> {
    await test.step(`Verifying the site name`, async () => {
      await this.siteHeading.isVisible();
    });
  }
  async clickOnTheSiteName(): Promise<void> {
    await test.step(`Clicking on the site name`, async () => {
      await this.siteHeading.click();
      await this.page.waitForTimeout(5000);
    });
  }
  async verifySiteStatusStamp(): Promise<void> {
    await test.step(`Verifying the site status stamp`, async () => {
      await this.siteStatusStamp.isVisible();
    });
  }
  async selectSiteSearchBarOption(): Promise<void> {
    await test.step('Selecting the site search bar option', async () => {
      this.siteSearchBarOptionText = await this.siteSearchBarOption.innerText();

      // Click on the site search bar option
      await this.siteSearchBarOption.click();

      // Get the text of the selected option

      // Log the selected option text (optional)
      console.log(this.siteSearchBarOptionText);
    });
  }

  async verifySiteNameLink(): Promise<void> {
    await test.step('Verifying the site name', async () => {
      // Get the text of the site name
      const siteName = await this.siteName.innerText();

      // Compare the texts
      if (this.siteSearchBarOptionText === siteName) {
        console.log('Site name is matching');
      } else {
        console.log('Site name is not matching');
      }
    });
  }
  async clickSortByButton(): Promise<void> {
    await test.step('Clicking the sort by button', async () => {
      await this.sortByButton.click();
    });
  }
  async selectCreatedNewestOption(): Promise<void> {
    await test.step('Selecting the created newest option', async () => {
      await this.page.goto(`${this.page.url()}${this.createdNewestOption}`);
    });
  }
}
