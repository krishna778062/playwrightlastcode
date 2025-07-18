import { Locator, Page, test } from '@playwright/test';
import { BaseComponent } from '@/src/core/components/baseComponent';
import { PageCreationPage } from '../pages/pageCreationPage';
import { AlbumCreationPage } from '../pages/albumCreationPage';
import { EventCreationPage } from '../pages/eventCreationPage';
import { ContentType } from '../constants/contentType';

export class AddContentModalComponent extends BaseComponent {
  readonly recentlyUsedSitesList: Locator;
  readonly addSpan: Locator;
  readonly cancelButton: Locator;

  //select site dropdown
  readonly selectSiteDropdown: Locator;
  readonly selectSiteDropdownOption: Locator;
  readonly clearButtonOnSelectSiteDropdown: Locator;

  //select template dropdown
  readonly selectTemplateDropdown: Locator;
  readonly selectTemplateDropdownOption: Locator;
  readonly clearButtonOnSelectTemplateDropdown: Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure
  
    this.recentlyUsedSitesList = page.locator("//div[text()='Recently used ']/button");
    this.addSpan = page.locator("//span[text()='Add']");
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    //select site dropdown
    this.selectSiteDropdown = page.getByPlaceholder('Select a site', { exact: false });
    this.selectSiteDropdownOption = page.locator('#site-list');
    this.clearButtonOnSelectSiteDropdown = page.getByLabel('Clear search');

    //select template dropdown
    this.selectTemplateDropdown = page.getByPlaceholder('Select a template', { exact: false });
    this.selectTemplateDropdownOption = page.locator("div[class*='Menu-module'] div[role='menuitem']");
    this.clearButtonOnSelectTemplateDropdown = page.getByLabel("button[aria-label*='Clear']");
  }

  /**
   * Verifies the add content modal is visible
   * It will use the recently used sites list to verify the modal is visible
   */
  async verifyTheAddContentModalIsVisible() {
    await test.step('Verify the add content modal is visible', async () => {
      await this.verifier.verifyTheElementIsVisible(this.recentlyUsedSitesList.first());
    });
  }

  /**
   * Selects the recently used site by index
   * @param index - The index of the recently used site to select
   * @default 0 - if no index is provided, it will select the first recently used site
   */
  async selectRecentlyUsedSiteByIndex(index: number = 0) {
    await test.step(`Click on recently used site by index ${index}`, async () => {
      // Select the first recently used site
      const siteToSelect = this.recentlyUsedSitesList.nth(index);
      await siteToSelect.click();
    });
  }

  /**
   * Selects the site to add content from the select site dropdown
   * @param siteName - The site name to select
   */
  public async selectSiteToAddContentFromDropdown(siteName: string) {
    await test.step(`Select ${siteName} site to add content in add content modal`, async () => {
      await this.openSelectSiteDropdown();
      await this.selectSiteFromDropdown(siteName);
    });
  }

  /**
   * Opens the select site dropdown
   */
  async openSelectSiteDropdown() {
    await test.step('Open select site dropdown', async () => {
      await this.selectSiteDropdown.click();
    });
  }

  /**
   * Selects the site from the select site dropdown
   * @param siteName - The site name to select
   */
  async selectSiteFromDropdown(siteName: string) {
    await test.step(`Select ${siteName} site from select site dropdown`, async () => {
      await this.clickOnElement(this.selectSiteDropdownOption.getByText(siteName));
    });
  }

  /**
   * Clears the selected site from the select site dropdown
   */
  async clearSelectedSiteFromDropdown() {
    await test.step('Clear selected site from select site dropdown', async () => {
      await this.clickOnElement(this.clearButtonOnSelectSiteDropdown);
    });
  }

  // template dropdown actions
  async selectTemplateToAddContent(templateName: string) {
    await test.step(`Select ${templateName} template to add content in add content modal`, async () => {
      await this.openSelectTemplateDropdown();
      await this.selectTemplateFromDropdown(templateName);
    });
  }

  async openSelectTemplateDropdown() {
    await test.step('Open select template dropdown', async () => {
      await this.selectTemplateDropdown.click();
    });
  }

  async selectTemplateFromDropdown(templateName: string) {
    await test.step(`Select ${templateName} template from select template dropdown`, async () => {
      await this.clickOnElement(this.selectTemplateDropdownOption.getByText(templateName));
    });
  }

  async clearSelectedTemplateFromDropdown() {
    await test.step('Clear selected template from select template dropdown', async () => {
      await this.clickOnElement(this.clearButtonOnSelectTemplateDropdown);
    });
  }

  //final action buttons
  /**
   * Clicks on the add button
   * submit the content creation form
   */
  async clickAddButton() {
    await test.step('Click Add button', async () => {
      await this.addSpan.click();
    });
  }

  /**
   * Cancels the content creation form
   */
  async cancelContentCreationFormSubmission() {
    await test.step('Cancel content creation form submission', async () => {
      await this.cancelButton.click();
    });
  }

  /**
   * Closes the content creation form
   */
  async closeContentCreationForm() {
    await test.step('Close content creation form', async () => {
      await this.cancelButton.click();
    });
  }

  //wrapper methods for easier intrface
  /**
   * Completes the content creation form
   * @param contentOption - The content type option to add
   * @param options - The options to complete the content creation form
   * @param options.siteName - The site name to select
   * @param options.templateName - The template name to select
   * @param options.recentlyUsedSiteIndex - The index of the recently used site to select
   * @default 0 - if no index is provided, it will select the first recently used site
   */
  async completeContentCreationForm(
    contentOption: ContentType,
    options?: { siteName?: string; templateName?: string; recentlyUsedSiteIndex?: number }
  ) {
    /**
     * First select the content type option
     * Then select the site if provided
     * if no site is provided, it will select the first recently used site
     * Then select the template if provided
     * Then click the add button
     * Based on the content type, it will open the relevant content creation page
     */
    let contentCreationPage: PageCreationPage | AlbumCreationPage | EventCreationPage;

    if (options?.siteName) {
      await this.selectSiteToAddContentFromDropdown(options.siteName);
    } else {
      await this.selectRecentlyUsedSiteByIndex(options?.recentlyUsedSiteIndex || 0);
    }
    if (options?.templateName) {
      await this.selectTemplateToAddContent(options.templateName);
    }
    await this.clickAddButton();
    //based on the content type, it will open the relevant content creation page
    switch (contentOption) {
      case 'Page':
        contentCreationPage = new PageCreationPage(this.page);
        break;
      case 'Album':
        contentCreationPage = new AlbumCreationPage(this.page);
        break;
      case 'Event':
        contentCreationPage = new EventCreationPage(this.page);
        break;
      default:
        throw new Error(`Invalid content type: ${contentOption}`);
    }
    await contentCreationPage.verifyThePageIsLoaded();
    return contentCreationPage;
  }
}
