import { Locator, Page, test } from '@playwright/test';

import { ContentType } from '@content/constants/contentType';
import { AlbumCreationPage } from '@content/ui/pages/albumCreationPage';
import { ContentStudioPageCreationPage } from '@content/ui/pages/contentStudioPageCreationPage';
import { EventCreationPage } from '@content/ui/pages/eventCreationPage';
import { PageCreationPage } from '@content/ui/pages/pageCreationPage';

import { BaseComponent } from '@/src/core/ui/components/baseComponent';
import { extractSiteIdFromContentAdditionUrl } from '@/src/core/utils/urlUtils';

export class AddContentModalComponent extends BaseComponent {
  readonly recentlyUsedSitesList: Locator;
  readonly siteToAddPageTo: Locator;
  readonly siteToAddAlbumTo: Locator;
  readonly siteToAddEventTo: Locator;
  readonly addSpan: Locator;
  readonly cancelButton: Locator;

  //content type locators
  readonly pageContentTypeLabel: Locator;
  readonly albumContentTypeLabel: Locator;
  readonly eventContentTypeLabel: Locator;

  //select site dropdown
  readonly selectSiteDropdown: Locator;
  readonly selectSiteDropdownOption: (siteName: string) => Locator;
  readonly clearButtonOnSelectSiteDropdown: Locator;
  readonly selectSiteDropdownOptionByIndex: (index: number) => Locator;

  //select template dropdown
  readonly selectTemplateDropdown: Locator;
  readonly selectTemplateDropdownOption: Locator;
  readonly clearButtonOnSelectTemplateDropdown: Locator;
  readonly selectTemplateDropdownOptionByIndex: (index: number) => Locator;
  readonly errorMessage: (contentType: ContentType) => Locator;

  constructor(page: Page) {
    super(page);
    // Initialize locators - these would need to be updated based on actual DOM structure

    this.recentlyUsedSitesList = page.locator("//div[text()='Recently used ']/button");
    this.siteToAddPageTo = page.locator("//*[@id='siteToAddpagetitle']");
    this.siteToAddAlbumTo = page.locator("//*[@id='siteToAddalbumtitle']");
    this.siteToAddEventTo = page.locator("//*[@id='siteToAddeventtitle']");
    this.addSpan = page.locator("//span[text()='Add']");
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });

    //content type locators
    this.pageContentTypeLabel = page.locator("label[for='addContentType_page']");
    this.albumContentTypeLabel = page.locator("label[for='addContentType_album']");
    this.eventContentTypeLabel = page.locator("label[for='addContentType_event']");

    //select site dropdown
    this.selectSiteDropdown = page.locator('input.ReactSelectInput-inputField');
    this.selectSiteDropdownOption = (siteName: string) => page.locator(`div.u-textTruncate div:text-is("${siteName}")`);
    this.clearButtonOnSelectSiteDropdown = page.getByLabel('Clear search');
    this.selectSiteDropdownOptionByIndex = (index: number) => page.locator(`span.u-textTruncate`).nth(index);

    //select template dropdown
    this.selectTemplateDropdown = page.getByPlaceholder('Select a template', { exact: false });
    this.selectTemplateDropdownOption = page.locator("div[class*='Menu-module'] div[role='menuitem']");
    this.clearButtonOnSelectTemplateDropdown = page.getByLabel("button[aria-label*='Clear']");
    this.selectTemplateDropdownOptionByIndex = (index: number) =>
      page.locator("div[class*='Menu-module'] div[role='menuitem']").nth(index);

    this.errorMessage = (contentType: ContentType) =>
      page.locator(`p:has-text('${contentType}s have been disabled within this site')`);
  }

  /**
   * Verifies the add content modal is visible
   * It will use the recently used sites list to verify the modal is visible
   */
  async verifyTheAddContentModalIsVisible(contentType: ContentType) {
    await test.step('Verify the add content modal is visible', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      if (contentType === 'Page') {
        await this.verifier.verifyTheElementIsVisible(this.siteToAddPageTo.first());
      } else if (contentType === 'Album') {
        await this.verifier.verifyTheElementIsVisible(this.siteToAddAlbumTo.first());
      } else if (contentType === 'Event') {
        await this.verifier.verifyTheElementIsVisible(this.siteToAddEventTo.first());
      } else {
        throw new Error(`Invalid content type: ${contentType}`);
      }
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
  public async selectSiteToAddContentFromDropdown(siteName?: string) {
    await test.step(`Select ${siteName} site to add content in add content modal`, async () => {
      await this.openSelectSiteDropdown();
      if (siteName) {
        await this.selectSiteFromDropdown(siteName);
      } else {
        await this.selectSiteFromDropdownByIndex(0);
      }
    });
  }

  /**
   * Opens the select site dropdown
   */
  async openSelectSiteDropdown() {
    await test.step('Open select site dropdown', async () => {
      await this.clickOnElement(this.selectSiteDropdown);
    });
  }

  /**
   * Selects the site from the select site dropdown
   * @param siteName - The site name to select
   */
  async selectSiteFromDropdown(siteName: string) {
    await test.step(`Select ${siteName} site from select site dropdown`, async () => {
      await this.typeInElement(this.selectSiteDropdown, siteName);
      try {
        console.log(`Selecting ${siteName} site from select site dropdown`);
        await this.clickOnElement(this.selectSiteDropdownOption(siteName));
      } catch (error) {
        console.log(`Error selecting ${siteName} site from select site dropdown: ${error}`);
        await this.selectSiteDropdown.clear();
        await this.typeInElement(this.selectSiteDropdown, siteName);
        await this.clickOnElement(this.selectSiteDropdownOption(siteName));
      }
    });
  }

  async selectSiteFromDropdownByIndex(index: number) {
    await test.step(`Select site from select site dropdown by index ${index}`, async () => {
      await this.clickOnElement(this.selectSiteDropdownOptionByIndex(index));
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
    options?: {
      siteName?: string;
      templateName?: string;
      recentlyUsedSiteIndex?: number;
      isFromHomePage?: boolean;
      isFromStudio?: boolean;
    }
  ): Promise<PageCreationPage | AlbumCreationPage | EventCreationPage | ContentStudioPageCreationPage> {
    /**
     * First select the content type option
     * Then select the site if provided
     * if no site is provided, it will select the first recently used site
     * Then select the template if provided
     * Then click the add button
     * Based on the content type, it will open the relevant content creation page
     */
    let contentCreationPage: PageCreationPage | AlbumCreationPage | EventCreationPage | ContentStudioPageCreationPage;

    if (options?.siteName) {
      await this.selectSiteToAddContentFromDropdown(options.siteName);
    } else if (options?.isFromHomePage) {
      // If from home page, select recently used site
      try {
        await this.selectRecentlyUsedSiteByIndex(options?.recentlyUsedSiteIndex || 0);
      } catch (error) {
        console.info(`recently used site not found:`);
        await this.selectSiteToAddContentFromDropdown();
      }
    }
    // If from site page, do nothing (already on specific site)
    switch (contentOption) {
      case ContentType.PAGE:
        await this.clickOnElement(this.pageContentTypeLabel);
        break;
      case ContentType.ALBUM:
        await this.clickOnElement(this.albumContentTypeLabel);
        break;
      case ContentType.EVENT:
        await this.clickOnElement(this.eventContentTypeLabel);
        break;
      default:
        throw new Error(`Invalid content type: ${contentOption}`);
    }

    if (options?.templateName) {
      await this.selectTemplateToAddContent(options.templateName);
    }
    await this.clickAddButton();
    await this.page.waitForURL(/add/, { timeout: 30000 });
    const siteId = extractSiteIdFromContentAdditionUrl(this.page.url());

    //based on the content type, it will open the relevant content creation page
    switch (contentOption) {
      case ContentType.PAGE:
        if (siteId) {
          // Return ContentStudioPageCreationPage if isFromStudio option is true, otherwise PageCreationPage
          if (options?.isFromStudio) {
            contentCreationPage = new ContentStudioPageCreationPage(this.page, siteId);
          } else {
            contentCreationPage = new PageCreationPage(this.page, siteId);
          }
        } else {
          throw new Error('Site id not found in the url');
        }

        break;
      case ContentType.ALBUM:
        if (siteId) {
          contentCreationPage = new AlbumCreationPage(this.page, siteId);
        } else {
          throw new Error('Site id not found in the url');
        }
        break;
      case ContentType.EVENT:
        if (siteId) {
          contentCreationPage = new EventCreationPage(this.page, siteId);
        } else {
          throw new Error('Site id not found in the url');
        }
        break;
      default:
        throw new Error(`Invalid content type: ${contentOption}`);
    }
    await contentCreationPage.verifyThePageIsLoaded();
    return contentCreationPage;
  }

  async verifyErrorMessageWhenContentSubmissionIsDisabled(contentType: ContentType) {
    await test.step('Verify error message when content submission is disabled', async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorMessage(contentType));
    });
  }
}
