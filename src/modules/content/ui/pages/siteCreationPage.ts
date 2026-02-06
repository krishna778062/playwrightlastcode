import { Locator, Page, Response, test } from '@playwright/test';

import { PageCreationResponse } from '@content/apis/types/pageCreationResponse';

import { API_ENDPOINTS } from '@/src/core/constants/apiEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { getContentTenantConfigFromCache } from '@/src/modules/content/config/contentConfig';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';

export interface SiteCreationOptions {
  name: string;
  description: string;
  siteCategory: string;
  access: string;
  coverImage?: {
    fileName: string;
    cropOptions?: {
      widescreen?: boolean;
      square?: boolean;
    };
  };
}

export class SiteCreationPage extends BasePage {
  // API-based locators (existing)
  readonly siteNameInput: Locator;
  readonly categoryDropdown: Locator;
  readonly selectCategory: (categoryName: string) => Locator;
  readonly accessType: (type: string) => Locator;
  readonly createSiteButton: Locator;
  readonly categoryListItem: (categoryName: string) => Locator;

  // UI-based locators (new)
  readonly siteNameTextbox: Locator;
  readonly categorySection: Locator;
  readonly categoryCombobox: Locator;
  readonly addSiteButton: Locator;
  readonly addCategoryOption: (categoryName: string) => Locator;

  // Content Submissions locators
  readonly contentSubmissionsHeading: Locator;
  readonly contentSubmissionsToggle: Locator;
  readonly editSubmissionProcessButton: Locator;
  readonly editApprovalProcessButton: Locator;
  readonly submissionProcessTooltip: Locator;
  readonly approvalProcessTooltip: Locator;

  constructor(page: Page) {
    super(page);

    // API-based locators (existing)
    this.siteNameInput = page.getByRole('textbox', { name: 'Site name' });
    this.categoryDropdown = page
      .locator('div')
      .filter({ hasText: 'Add or select existing category' })
      .locator('+ div input');
    this.selectCategory = (categoryName: string) =>
      page.locator("div[class*='createOption']").getByText(categoryName, { exact: true });

    this.categoryListItem = (categoryName: string) =>
      page
        .locator('#category-list')
        .locator('div')
        .filter({ hasText: new RegExp(`^${categoryName}$`) });

    this.accessType = (type: string) => page.getByText(type, { exact: true });
    this.createSiteButton = page.getByRole('button', { name: 'Add site' });

    // UI-based locators (new)
    this.siteNameTextbox = page.getByRole('textbox', { name: 'Site name' });
    this.categorySection = page
      .locator('div')
      .filter({ hasText: /^Add or select existing category$/ })
      .nth(2);
    this.categoryCombobox = page.getByRole('combobox', { name: 'Category: This is a required' });
    this.addSiteButton = page.getByRole('button', { name: 'Add site' });
    this.addCategoryOption = (categoryName: string) => page.getByText(`Add ${categoryName}…`);

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

  /**
   * Verifies the site creation page is loaded (UI-based approach)
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify Site Creation page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.siteNameTextbox, {
        assertionMessage: 'Site name textbox should be visible',
        timeout: 10000,
      });
      await this.verifier.verifyTheElementIsVisible(this.addSiteButton, {
        assertionMessage: 'Add site button should be visible',
        timeout: 5000,
      });
    });
  }

  async verifySiteCreationPageLoaded(): Promise<void> {
    await this.verifyThePageIsLoaded();
  }

  /**
   * Fills the site name in the textbox
   * @param siteName - The site name to fill
   */
  async fillSiteName(siteName: string): Promise<void> {
    await test.step(`Fill site name: ${siteName}`, async () => {
      await this.fillInElement(this.siteNameTextbox, siteName);
    });
  }

  /**
   * Selects or creates a new category
   * @param categoryName - The category name to select or create
   */
  async selectOrCreateCategory(categoryName: string): Promise<void> {
    await test.step(`Select or create category: ${categoryName}`, async () => {
      // Click on category section
      await this.clickOnElement(this.categorySection);

      // Fill the category name in combobox
      await this.fillInElement(this.categoryCombobox, categoryName);

      // Click on "Add categoryName..." option to create new category
      const addCategoryOption = this.addCategoryOption(categoryName);
      await this.clickOnElement(addCategoryOption);
    });
  }

  /**
   * Clicks the Add Site button to submit the form
   */
  async clickAddSiteButton(): Promise<void> {
    await test.step('Click Add Site button', async () => {
      await this.clickOnElement(this.addSiteButton);
    });
  }

  /**
   * Complete flow to create a site with random category
   * @param siteName - The site name to create
   * @param categoryName - The category name to create/select
   */
  async createSiteWithRandomCategory(siteName: string, categoryName: string): Promise<void> {
    await test.step(`Create site "${siteName}" with category "${categoryName}"`, async () => {
      await this.fillSiteName(siteName);
      await this.selectOrCreateCategory(categoryName);
      await this.clickAddSiteButton();
    });
  }

  // ==================== API-BASED METHODS (EXISTING) ====================

  /**
   * Creates and publishes a site with the given options (API-based approach)
   * @param options - The options for creating the site
   * @returns Object containing site dashboard page, site name, and site ID
   */
  async addSite(options: SiteCreationOptions): Promise<{
    siteDashboard: SiteDashboardPage;
    siteId: string;
  }> {
    // Handle siteCategory - use default if not provided
    const siteCategory = options.siteCategory || (options as any).category || 'Uncategorized';

    return await test.step(`Creating and publishing site with name: ${options.name} accessType: ${options.access}`, async () => {
      // Fill in site mandatory details
      await this.fillSiteDetails({
        name: options.name,
        category: siteCategory,
        access: options.access,
      });

      // Create the site
      const createResponse = await this.createSite();

      // Parse response body
      const createResponseBody = (await createResponse.json()) as PageCreationResponse;

      // Extract site ID and name from response
      const siteId = createResponseBody.result.id;

      // Return site dashboard page with site details
      return {
        siteDashboard: new SiteDashboardPage(this.page, siteId),
        siteId: siteId,
      };
    });
  }

  /**
   * Fills in the site details (API-based approach)
   * @param options - The options for filling in the site details
   */
  async fillSiteDetails(options: { name: string; category: string; access: string }) {
    await test.step(`Filling site details`, async () => {
      // Validate that name is provided
      if (!options.name || options.name.trim() === '') {
        throw new Error('Site name is required and cannot be empty');
      }

      // Add site name
      await this.clickOnElement(this.siteNameInput);
      console.log('options.name', options.name);
      await this.fillInElement(this.siteNameInput, options.name);

      // Handle category selection
      await this.clickOnElement(this.categoryDropdown);
      await this.fillInElement(this.categoryDropdown, options.category);
      if (await this.verifier.isTheElementVisible(this.categoryListItem(options.category))) {
        await this.clickOnElement(this.categoryListItem(options.category));
      } else {
        await this.clickOnElement(this.selectCategory(options.category));
      }
      // Handle access type selection
      await this.clickOnElement(this.accessType(options.access));
    });
  }

  /**
   * Creates the site and waits for API response (API-based approach)
   */
  async createSite(): Promise<Response> {
    return await test.step(`Creating site and wait for create api response`, async () => {
      console.log('site creation url', getContentTenantConfigFromCache().apiBaseUrl + API_ENDPOINTS.site.url);
      const createResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.createSiteButton, { delay: 5_000 }),
        response =>
          response.request().url() === getContentTenantConfigFromCache().apiBaseUrl + API_ENDPOINTS.site.url &&
          response.request().method() === 'POST' &&
          response.status() === 200,
        {
          timeout: 20_000,
        }
      );
      return createResponse;
    });
  }

  /**
   * Verifies that Content Submissions toggle is displayed under "Content & landing page" section
   */
  async verifyContentSubmissionsToggleIsDisplayed(): Promise<void> {
    await test.step('Verify Content Submissions toggle is displayed', async () => {
      // Verify the "Content & landing page" heading is visible
      const contentLandingPageHeading = this.page.getByRole('heading', { name: 'Content & landing page' });
      await this.verifier.verifyTheElementIsVisible(contentLandingPageHeading, {
        assertionMessage: '"Content & landing page" section should be visible',
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
      // The tooltip container intercepts pointer events, so we need to hover on it or use force
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
  async verifyApprovalProcessTooltip(expectedMessage: string): Promise<void> {
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

      // Verify the button is disabled before hovering
      await this.verifier.verifyTheElementIsDisabled(this.editApprovalProcessButton, {
        assertionMessage: '"Edit approval process" button should be disabled',
        timeout: 5000,
      });

      // Try to find the tooltip container that wraps the button, or use force hover
      // The tooltip container intercepts pointer events, so we need to hover on it or use force
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
