import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';

import { BasePage } from '@/src/core/ui/pages/basePage';

export class ManageSitePageCategoryPage extends BasePage {
  readonly addCategoryButton: Locator;
  readonly customCategoryLink: (categoryName: string) => Locator;
  readonly searchCategoryTextbox: Locator;
  readonly noResultsFoundMessage: Locator;
  readonly showMoreButton: Locator;
  readonly contentListContainer: Locator;

  constructor(page: Page, siteId: string) {
    super(page, PAGE_ENDPOINTS.MANAGE_SITE_PAGE_CATEGORIES_PAGE(siteId));
    this.addCategoryButton = page.getByRole('button', { name: 'Add category' });
    this.customCategoryLink = (categoryName: string) =>
      page.getByTestId('dataGridRow').getByRole('link', { name: categoryName, exact: true });
    this.searchCategoryTextbox = page.getByRole('textbox', { name: 'Search categories…' });
    this.noResultsFoundMessage = page.getByText('Nothing to show here', { exact: true });
    this.showMoreButton = page.getByRole('button', { name: 'Show more' });
    this.contentListContainer = page.locator('.ManageContentListItem-content');
  } /**
   * Verifies that the Manage Site Page Categories page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Manage Site Page Categories page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.addCategoryButton, {
        assertionMessage: 'Add category button should be visible on Manage Site Page Categories page',
        timeout: 15000,
      });
    });
  }

  /**
   * Clicks the Add Category button
   */
  async clickOnAddCategoryButton(): Promise<void> {
    await test.step('Click Add Category button', async () => {
      await this.clickOnElement(this.addCategoryButton);
    });
  }

  async clickOnCustomCategory(categoryName: string): Promise<void> {
    await test.step(`Click on custom category: ${categoryName}`, async () => {
      await this.clickOnElement(this.customCategoryLink(categoryName));
    });
  }

  async verifyContentListLoaded(siteId: string, pageCategoryId: string): Promise<void> {
    await test.step('Verify content list is loaded', async () => {
      const expectedUrl = PAGE_ENDPOINTS.MANAGE_SITE_CONTENT_PAGE(siteId, pageCategoryId);
      // Wait for navigation to the expected URL
      await this.page.waitForURL(`**/${expectedUrl}`, { timeout: 15000 });
      await this.verifier.verifyTheElementIsVisible(this.contentListContainer.first(), {
        assertionMessage: 'Content list should be visible',
        timeout: 15000,
      });
    });
    //element list size should be 16
    const elementListSize = await this.contentListContainer.count();
    expect(elementListSize).toBe(16);
  }

  async searchCategory(categoryName: string): Promise<void> {
    await test.step(`Search category: ${categoryName}`, async () => {
      await this.clickOnElement(this.searchCategoryTextbox);
      await this.fillInElement(this.searchCategoryTextbox, categoryName);
    });
  }

  async verifyNoResultsFoundIsNotVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsNotVisible(this.noResultsFoundMessage, {
      assertionMessage: 'No results found message should not be visible',
    });
  }

  async clickOnShowMoreButton(): Promise<void> {
    await test.step('Click Show More button', async () => {
      await this.clickOnElement(this.showMoreButton);
    });
  }

  async verifyShowMoreButtonIsVisible(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.showMoreButton, {
      assertionMessage: 'Show More button should be visible',
    });
  }

  async verifyContentListAfterClickingShowMoreButton(): Promise<void> {
    //element list size should be 16
    const elementListSize = await this.contentListContainer.count();
    expect(elementListSize).toBeGreaterThan(16);
  }
}
