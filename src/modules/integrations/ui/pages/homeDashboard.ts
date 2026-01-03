import { DASHBOARD_BUTTONS, ORGANIZATION_SETTINGS, UI_ACTIONS } from '@integrations/constants/common';
import { MESSAGES } from '@integrations/constants/messageRepo';
import { ExternalAppProvider } from '@integrations/ui/pages/externalAppsPage';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { NativeTileComponent } from '@integrations-components/nativeComponent';
import { TileOperationsComponent } from '@integrations-components/tileOperationsComponent';
import { TimeOffRequestTileComponent } from '@integrations-components/timeOffRequestTileComponent';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { IntegrationTileHelper } from '@/src/modules/integrations/apis/helpers/integrationTileHelper';

class AppTileComponent extends BaseAppTileComponent {
  constructor(page: Page) {
    super(page);
  }
}

export class HomeDashboard extends BasePage {
  readonly page: Page;
  private readonly airtableComponent: BaseAppTileComponent;
  private readonly appTileComponent: AppTileComponent;
  private readonly timeOffRequestTileComponent: TimeOffRequestTileComponent;
  private readonly tileOperationsComponent: TileOperationsComponent;
  private readonly nativeTileComponent: NativeTileComponent;
  private readonly tileManagementHelper: IntegrationTileHelper;
  private readonly tileContainer: Locator;
  private readonly outlookCalendarSecondDropdown: Locator;
  private readonly reactSelectListboxMenu: Locator;
  private readonly reactSelectFirstOption: Locator;

  private readonly defaultConfig = {
    baseName: AIRTABLE_TILE.BASE_NAME,
    tableId: AIRTABLE_TILE.TABLE_ID,
    sortBy: AIRTABLE_TILE.USER_DEFINED,
    sortOrder: AIRTABLE_TILE.USER_DEFINED,
  };

  constructor(page: Page, tileManagementHelper: IntegrationTileHelper) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
    this.appTileComponent = new AppTileComponent(page);
    this.timeOffRequestTileComponent = new TimeOffRequestTileComponent(page);
    this.tileOperationsComponent = new TileOperationsComponent(page);
    this.nativeTileComponent = new NativeTileComponent(page);
    this.tileManagementHelper = tileManagementHelper;
    this.tileContainer = page.locator('aside');
    this.outlookCalendarSecondDropdown = page.locator('input[id^="react-select"]').nth(1);
    this.reactSelectListboxMenu = page.locator('[id^="react-select"][id$="-listbox"]').first();
    this.reactSelectFirstOption = page
      .locator('[id^="react-select"][id$="-listbox"]')
      .first()
      .locator('.ReactSelectInput-option')
      .first();
  }

  /**
   * Get configuration object
   */
  get config() {
    return this.defaultConfig;
  }

  /**
   * Verify that the page is loaded and ready
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify home dashboard page is loaded', async () => {
      await this.page.waitForLoadState('domcontentloaded');
      await this.page.getByRole('button', { name: 'Manage dashboard & carousel' }).waitFor({ state: 'visible' });
      // await expect(this.page).toHaveTitle(/.*Dashboard.*/);
    });
  }

  /**
   * Verify the Add tile modal for a given external app provider
   */
  async openAddAppTileModal(provider: ExternalAppProvider | string): Promise<void> {
    await this.appTileComponent.openAddAppTileModal(String(provider));
  }

  /**
   * Verify the connection helper text in the Add tile modal for a given external app provider
   */
  async verifyConnectionMessage(expectedConnectionText: string, options: { connectedEmail: string }): Promise<void> {
    await this.appTileComponent.verifyConnectionMessage(expectedConnectionText, options);
  }

  /**
   * Verify connector connection status with formatted username display
   * @param connector - The connector name (e.g., 'expensify', 'google', 'outlook')
   * @param username - The username/email to verify (e.g., 'aa_tushar_roy_simpplr_com')
   */
  async verifyConnectorConnectionStatus(connector: string, username: string): Promise<void> {
    await this.appTileComponent.verifyConnectorConnectionStatus(connector, username);
  }

  /**
   * Click the 'My settings' link in the Add tile modal
   */
  async clickDialogLink(label: string): Promise<void> {
    await this.appTileComponent.clickDialogLink(label);
  }

  /**
   * Click a link inside dialog that opens in a new tab and return the new page
   * @param label - The link label to click
   * @returns The new page that opens
   */
  async clickDialogLinkAndGetNewPage(label: string): Promise<Page> {
    return await this.appTileComponent.clickDialogLinkAndGetNewPage(label);
  }

  /**
   * Verify that an app is NOT present in the enabled apps section
   * @param appName - The name of the app to verify is not present
   */
  async verifyAppNotInEnabledApps(appName: string): Promise<void> {
    return await this.appTileComponent.verifyAppNotInEnabledApps(appName);
  }

  /**
   * Verify that an app IS present in the available apps section
   * @param appName - The name of the app to verify is present
   */
  async verifyAppInAvailableApps(appName: string): Promise<void> {
    return await this.appTileComponent.verifyAppInAvailableApps(appName);
  }

  /**
   * Click on an app in the available apps section to navigate to custom apps page in new tab
   * @param appName - The name of the app to click
   * @returns The new page that opens
   */
  async clickAppInAvailableAppsAndGetNewPage(appName: string): Promise<Page> {
    return await this.appTileComponent.clickAppInAvailableAppsAndGetNewPage(appName);
  }

  /**
   * Close the currently open dialog
   */
  async closeDialog(): Promise<void> {
    return await this.appTileComponent.closeDialog();
  }

  /**
   * Verify that personalize options are not visible for a tile
   */
  async verifyPersonalizeNotVisible(tileTitle: string): Promise<void> {
    await test.step(`Verify personalize options not visible for '${tileTitle}'`, async () => {
      const personalizeButton = this.page.locator(
        `//h2[text()='${tileTitle}']/ancestor::header//button[contains(@aria-label, 'Personalize')]`
      );
      await expect(personalizeButton).not.toBeVisible();
    });
  }

  async verifyTileAscending(tileTitle: string): Promise<void> {
    return this.appTileComponent.verifyTilesAscending(tileTitle);
  }

  /**
   * Submit tile to home or dashboard
   */
  async submitTileToHomeOrDashboard(choice: string): Promise<void> {
    return this.appTileComponent.submitTileToHomeOrDashboard(choice);
  }

  /**
   * Verify that a tile is present on the dashboard
   */
  async verifyTilePresent(tileTitle: string): Promise<void> {
    return this.appTileComponent.isTilePresent(tileTitle);
  }

  /**
   * Verify that personalize options are visible for a tile
   */
  async verifyPersonalizeVisible(tileTitle: string): Promise<void> {
    return this.appTileComponent.verifyPersonalizeVisible(tileTitle);
  }
  /**
   * Click personalize and verify heading and field label are visible
   */
  async openPersonalizeAndVerify(tileTitle: string, fieldLabel: string): Promise<void> {
    await this.appTileComponent.openPersonalizeAndVerify(tileTitle, fieldLabel);
  }

  /**
   * Verify toast message appears
   */
  async verifyToastMessage(message: string): Promise<void> {
    return this.appTileComponent.verifyToastMessageIsVisibleWithText(message);
  }

  /**
   * Configure Airtable app tile with default settings
   */
  async configureAppTile(): Promise<void> {
    await test.step('Configure Airtable tile', async () => {
      await this.appTileComponent.configureBaseName(this.defaultConfig.baseName);
      await this.appTileComponent.configureTableId(this.defaultConfig.tableId);
      await this.appTileComponent.configureSortBy(this.defaultConfig.sortBy);
      await this.appTileComponent.configureSortOrder(this.defaultConfig.sortOrder);
    });
  }

  /**
   * Personalize tile sorting options
   */
  async personalizeTileSorting(tileTitle: string, sortBy: string, sortOrder: string): Promise<void> {
    return this.appTileComponent.personalizeTileSorting(tileTitle, sortBy, sortOrder);
  }

  /**
   * Complete workflow to add an Airtable tile
   */
  async addAirtableTile(tileTitle: string, config: any, destination: string): Promise<void> {
    await test.step(`Add Airtable tile: ${tileTitle}`, async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.appTileComponent.selectAppTile('Airtable');
      await this.appTileComponent.setTileTitle(tileTitle);
      await this.appTileComponent.configureAppTile(config);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Reload page and verify tile is present
   */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await test.step(`Reload page and verify tile present: ${tileTitle}`, async () => {
      await this.page.reload();
      await this.verifyTilePresent(tileTitle);
    });
  }

  /**
   * Edit tile name - combines all editing steps into a single method
   */
  async editTile(oldTileTitle: string, newTileTitle: string): Promise<void> {
    await this.airtableComponent.clickEditDashboard();
    await this.appTileComponent.clickThreeDotsOnTile(oldTileTitle);
    await this.appTileComponent.clickTileOption(DASHBOARD_BUTTONS.EDIT);
    await this.appTileComponent.setTileTitle(newTileTitle);
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }
  /**
   * Check if tile is present (alias for verifyTilePresent)
   */
  async isTilePresent(tileTitle: string): Promise<void> {
    await this.verifyTilePresent(tileTitle);
  }

  /**
   * Open add tile modal, select app and tile, then set tile title
   * @param appName - The name of the app to select
   * @param tileName - The name of the tile to select
   * @param tileTitle - The title to set for the tile
   */
  async openModalSelectAppTileAndSetTitle(appName: string, tileName: string, tileTitle: string): Promise<void> {
    await this.appTileComponent.clickEditDashboard();
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
    await this.appTileComponent.selectAppTile(appName);
    await this.appTileComponent.selectTile(tileName);
    await this.appTileComponent.tileTitleInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.appTileComponent.setTileTitle(tileTitle);
  }

  /**
   * Generic method to configure tile fields based on configuration object
   * @param config - Configuration object with field configurations
   */
  private async configureTileFields(config: {
    fields?: Array<{ name: string; value: string }>;
    radioOptions?: Array<{ fieldName: string; option: string }>;
    radioOptionsWithValues?: Array<{ fieldName: string; option: string; value: string }>;
    dropdowns?: Array<{ fieldName: string; value: string }>;
  }): Promise<void> {
    if (config.fields) {
      for (const field of config.fields) {
        await this.appTileComponent.inputFieldByName(field.name, field.value);
      }
    }

    if (config.radioOptions) {
      for (const radioOption of config.radioOptions) {
        await this.selectRadioOption(radioOption.fieldName, radioOption.option);
      }
    }

    if (config.radioOptionsWithValues) {
      for (const radioOptionWithValue of config.radioOptionsWithValues) {
        await this.selectRadioOptionandValue(
          radioOptionWithValue.fieldName,
          radioOptionWithValue.option,
          radioOptionWithValue.value
        );
      }
    }
    if (config.dropdowns) {
      for (const dropdown of config.dropdowns) {
        await this.selectDropdownValue(dropdown.fieldName, dropdown.value);
      }
    }
  }

  /**
   * Complete workflow to add an app tile with flexible configuration
   * @param tileTitle - The title of the tile to add
   * @param appName - The name of the app to add
   * @param tileName - The name of the tile to add
   * @param destination - The destination of the tile to add
   * @param config - Optional configuration object for fields and options
   */
  async addTile(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    config?: {
      fields?: Array<{ name: string; value: string }>;
      radioOptions?: Array<{ fieldName: string; option: string }>;
      radioOptionsWithValues?: Array<{ fieldName: string; option: string; value: string }>;
      dropdowns?: Array<{ fieldName: string; value: string }>;
    }
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);

      if (config) {
        await this.configureTileFields(config);
      }

      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Complete workflow to add an app tile with personalize option
   */
  async addTilewithPersonalize(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      radioOptions: [{ fieldName: fieldName, option: ORGANIZATION_SETTINGS.USER_DEFINED }],
    });
  }

  /**
   * Complete workflow to add an app tile with User defined personalize option(s).
   * fieldName is required; fieldName2 is optional.
   */
  async addTilewithPersonalizeSingleField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    fieldName2?: string
  ): Promise<void> {
    const radioOptions: Array<{ fieldName: string; option: string }> = [
      { fieldName, option: ORGANIZATION_SETTINGS.USER_DEFINED },
    ];
    if (fieldName2) {
      radioOptions.push({ fieldName: fieldName2, option: ORGANIZATION_SETTINGS.USER_DEFINED });
    }
    await this.addTile(tileTitle, appName, tileName, UI_ACTIONS.ADD_TO_HOME, {
      radioOptions,
    });
  }

  async PersonalizeTile(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.personalizeTile(tileTitle, fieldName, fieldValue);
  }

  /**
   * Verify tile is removed
   */
  async verifyTileRemoved(tileTitle: string): Promise<void> {
    await test.step(`Verify tile removed: ${tileTitle}`, async () => {
      await this.page.reload();
      await this.page.waitForLoadState('domcontentloaded');
      const tileLocator = this.page.getByRole('heading', { name: tileTitle });
      await expect(tileLocator).not.toBeVisible();
    });
  }

  /**
   * Verify GitHub PR tile data
   */
  async verifyGitHubPRTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyGitHubPRTileData(tileTitle);
  }

  /**
   * Verify GitHub My Open PRs tile data
   */
  async verifyGitHubOpenPRs(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyGitHubOpenPRs(tileTitle);
  }

  /**
   * Select radio button option by field name and option text
   */
  async selectRadioOption(fieldName: string, option: string): Promise<void> {
    await this.tileOperationsComponent.selectRadioOption(fieldName, option);
  }

  /**
   * Select any radio button option by label text (for unique labels)
   */
  async selectRadioOptionByLabel(option: string): Promise<void> {
    await this.tileOperationsComponent.selectRadioOptionByLabel(option);
  }

  /**
   * Select value from Organization combobox dropdown
   */
  async selectFromDropdown(option: string, itemName: string): Promise<void> {
    await this.tileOperationsComponent.selectFromDropdown(option, itemName);
  }

  /**
   * Select status from status dropdown menu
   */
  async selectStatus(option: string, status: string): Promise<void> {
    await this.tileOperationsComponent.selectFromDropdown(option, status);
  }

  /**
   * Verify status tag is shown in tile
   */
  async verifyStatusTag(tileTitle: string, status: string): Promise<void> {
    await this.tileOperationsComponent.verifyStatusTag(tileTitle, status);
  }

  /**
   * Verify tile shows "No results" state with settings button
   */
  async verifyNoResultsWithSettings(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyNoResultsWithSettings(tileTitle);
  }

  /**
   * Click settings button and verify personalize modal opens
   */
  async clickSettingsAndVerifyPersonalizeModal(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.clickSettingsAndVerifyPersonalizeModal(tileTitle);
  }

  /**
   * Generic method to verify tile redirects to any URL
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   * @param linkSelector - Optional custom link selector (defaults to 'a:has(h3)')
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string, linkSelector?: string): Promise<void> {
    await this.tileOperationsComponent.verifyTileRedirects(tileTitle, expectedUrl, linkSelector);
  }

  /**
   * Verify tile redirects to expected URL for native tiles
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   */
  async verifyNativeTileRedirects(tileTitle: string, expectedUrl: string): Promise<void> {
    await this.nativeTileComponent.verifyTileRedirects(tileTitle, expectedUrl);
  }

  /**
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyExpensifyReportData(tileTitle);
  }

  /**
   * Verify FreshService Tickets Submitted by Me tile data
   * @param tileTitle - The title of the tile to verify
   */
  async verifyFreshserviceTicketsSubmittedByMe(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyFreshserviceTicketsSubmittedByMe(tileTitle);
  }

  /**
   * Verify FreshService Unassigned Tickets tile data
   * @param tileTitle - The title of the tile to verify
   */
  async verifyFreshserviceUnassignedTickets(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyFreshserviceUnassignedTickets(tileTitle);
  }

  /**
   * Verify personalized Expensify report tile data with specific filters
   * @param tileTitle - The title of the tile to verify
   * @param expectedStatus - Expected status value (e.g., 'Processing')
   * @param expectedApprover - Expected approver name (e.g., 'Srikant G')
   * @param maxDaysAgo - Maximum days for last updated (e.g., 30)
   */
  async verifyPersonalizedExpensifyReportData(
    tileTitle: string,
    expectedStatus: string,
    expectedApprover: string,
    maxDaysAgo: number = 30
  ): Promise<void> {
    await this.tileOperationsComponent.verifyPersonalizedExpensifyReportData(
      tileTitle,
      expectedStatus,
      expectedApprover,
      maxDaysAgo
    );
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyAirtableTileContentStructure(tileTitle);
  }

  /**
   * Verify Apply for Time Off tile form fields are present and functional
   * @param tileTitle - The title of the tile to verify
   */
  async verifyApplyForTimeOffFields(tileTitle: string): Promise<void> {
    await this.timeOffRequestTileComponent.verifyApplyForTimeOffFields(tileTitle);
  }

  /**
   * Verify Display Time Off Balance tile content (no form fields expected)
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffBalanceFields(tileTitle: string): Promise<void> {
    await this.timeOffRequestTileComponent.verifyDisplayTimeOffBalanceFields(tileTitle);
  }

  /**
   * Verify UKG Pro tile metadata including pay periods, received dates, and links
   * @param tileTitle - The title of the tile to verify
   */
  async verifyUKGProTileMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyUKGProTileMetadata(tileTitle);
  }

  /**
   * Verify Display Time Off tile metadata including VACFT and SICKFT sections
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDisplayTimeOffMetadata(tileTitle);
  }

  /**
   * Complete workflow to add an app tile with app manager defined settings
   */
  async addTilewithDefinedSettings(
    tileTitle: string,
    appName: string,
    tileName: string,
    appManagerDefined: string,
    fieldName: string,
    url: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      await this.appTileComponent.enterUrl(fieldName, appManagerDefined, url);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Complete workflow to add an app tile with app manager defined and enable "Make user editable" before submitting
   */
  async addTilewithDefinedSettingsEnableToggle(
    tileTitle: string,
    appName: string,
    tileName: string,
    appManagerDefined: string,
    fieldName: string,
    url: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile (enable toggle): ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      await this.appTileComponent.enterUrl(fieldName, appManagerDefined, url);
      await this.tileOperationsComponent.enableToggleButton(tileTitle);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Verify Calendar upcoming events tile data
   */
  async verifyCalendarUpcomingEventsTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyUpcomingEventsTileData(tileTitle);
  }

  /**
   * Verify Calendar upcoming events tile data for native tiles
   * @param tileTitle - The title of the tile to verify
   * @param eventTitle - Optional regex pattern for event title (defaults to any text)
   * @param calDate - Optional regex pattern for calendar date (defaults to standard date format)
   * @param minExpectedCount - Optional minimum expected number of events (defaults to 1)
   * @param calendarType - Optional calendar type ('Google Calendar' or 'Outlook Calendar', defaults to 'Google Calendar')
   */
  async verifyNativeCalendarUpcomingEventsTileData(
    tileTitle: string,
    eventTitle?: RegExp,
    calDate?: RegExp,
    minExpectedCount?: number,
    calendarType?: string
  ): Promise<void> {
    await this.nativeTileComponent.verifyCalendarUpcomingEventsTileData(
      tileTitle,
      eventTitle,
      calDate,
      minExpectedCount,
      calendarType
    );
  }

  /**
   * Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed (for app tiles)
   */
  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyShowMoreBehavior(tileTitle);
  }

  /**
   * Verify "Show more" behavior for native tiles
   * Verifies that initially at least 4 events are displayed, then clicking "Show more" displays additional events
   */
  async verifyNativeShowMoreBehavior(tileTitle: string): Promise<void> {
    await this.nativeTileComponent.verifyShowMoreBehavior(tileTitle);
  }

  /**
   * Verify events are sorted in chronological order for native tiles
   */
  async verifyNativeEventsChronologicalOrder(tileTitle: string): Promise<void> {
    await this.nativeTileComponent.verifyEventsChronologicalOrder(tileTitle);
  }

  /**
   * Verify calendar day elements are displayed for native tiles
   */
  async verifyNativeCalendarDayElements(tileTitle: string): Promise<void> {
    await this.nativeTileComponent.verifyCalendarDayElements(tileTitle);
  }

  /**
   * Verify Google Calendar label is present for native tiles
   */
  async verifyNativeGoogleCalendarLabel(tileTitle: string): Promise<void> {
    await this.nativeTileComponent.verifyGoogleCalendarLabel(tileTitle);
  }

  /**
   * Verify event count for native tiles
   */
  async verifyNativeEventCount(tileTitle: string, minExpectedCount: number = 1): Promise<void> {
    await this.nativeTileComponent.verifyEventCount(tileTitle, minExpectedCount);
  }

  /**
   * Verify DocuSign tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDocuSignContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDocuSignTileContentStructure(tileTitle);
  }

  /**
   * Generic method to input any field by field name
   * @param fieldName - The name of the field (e.g., "UKG Pro instance URL")
   * @param value - The value to input
   */
  async inputFieldByName(fieldName: string, value: string): Promise<void> {
    await this.appTileComponent.inputFieldByName(fieldName, value);
  }

  /**
   * Input UKG Pro instance URL field (convenience method)
   * @param instanceUrl - The UKG Pro instance URL to input
   */
  async inputUKGProInstanceUrl(instanceUrl: string): Promise<void> {
    await this.inputFieldByName('UKG Pro instance URL', instanceUrl);
  }
  /**
   * Complete workflow to add an app tile with URL field
   */
  async addTileWithUrlField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    url: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      fields: [{ name: fieldName, value: url }],
    });
  }

  async verifyScheduleTileMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyScheduleTileMetadata(tileTitle);
  }
  async clickShowAllAndVerifyRedirect(tileTitle: string, expectedUrl: string): Promise<void> {
    await this.tileOperationsComponent.clickShowAllAndVerifyRedirect(tileTitle, expectedUrl);
  }

  /**
   * Verify Monday.com tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyMondayDotComContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyMondayDotComTileContentStructure(tileTitle);
  }
  /**
   * Verify Docebo tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDoceboContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDoceboTileContentStructure(tileTitle);
  }

  /**
   * Verify button status using tile operations component
   */
  async verifyButtonStatus(status: string, buttonName: string): Promise<void> {
    return this.tileOperationsComponent.verifyButtonStatus(status, buttonName);
  }
  /**
   * Complete workflow to add Docebo app tile with multiple user defined fields
   */
  async addTileWithUserDefinedOptions(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    fieldName2: string,
    fieldName3: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      radioOptions: [
        { fieldName, option: ORGANIZATION_SETTINGS.USER_DEFINED },
        { fieldName: fieldName2, option: ORGANIZATION_SETTINGS.USER_DEFINED },
        { fieldName: fieldName3, option: ORGANIZATION_SETTINGS.USER_DEFINED },
      ],
    });
  }
  async personalizeTileWithDropdowns(
    tileTitle: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string,
    fieldName3: string,
    fieldValue3: string
  ): Promise<void> {
    await test.step(`Personalize tile: ${tileTitle}`, async () => {
      await this.appTileComponent.openPersonalizeOptions(tileTitle);
      await this.selectFromDropdown(fieldName, fieldValue);
      await this.selectFromDropdown(fieldName2, fieldValue2);
      await this.selectFromDropdown(fieldName3, fieldValue3);
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
    });
  }
  /**
   * Verify Docebo report data  shown in tile
   */
  async verifyDoceboReportData(tileTitle: string, EnrollmentStatus: string, CourseType: string): Promise<void> {
    await this.tileOperationsComponent.verifyDoceboReportData(tileTitle, EnrollmentStatus, CourseType);
  }
  /**
   * Complete workflow to add app tile with app manager defined configuration
   */
  async addTileWithAppManagerDefined(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string,
    fieldName3: string,
    fieldValue3: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      radioOptionsWithValues: [
        { fieldName, option: ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, value: fieldValue },
        { fieldName: fieldName2, option: ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, value: fieldValue2 },
        { fieldName: fieldName3, option: ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, value: fieldValue3 },
      ],
    });
  }
  /**
   * Select radio option and dropdown value using tile operations component
   */
  async selectRadioOptionandValue(fieldName: string, radioOption: string, dropdownValue: string): Promise<void> {
    return this.tileOperationsComponent.selectRadioOptionandValue(fieldName, radioOption, dropdownValue);
  }
  /**
   * Select a dropdown value directly by field name (without radio button)
   */
  async selectDropdownValue(fieldName: string, value: string): Promise<void> {
    return this.tileOperationsComponent.selectDropdownValue(fieldName, value);
  }
  /**
   * Verify label is visible using tile operations component
   */
  async verifyLabel(labelText: string): Promise<void> {
    return this.tileOperationsComponent.verifyLabel(labelText);
  }

  /**
   * Edit tile name - combines all editing steps into a single method
   * @param oldTileTitle - Current tile title
   * @param newTileTitle - New tile title
   */
  async editTileName(oldTileTitle: string, newTileTitle: string): Promise<void> {
    await this.appTileComponent.clickThreeDotsOnTile(oldTileTitle);
    await this.appTileComponent.clickTileOption(DASHBOARD_BUTTONS.EDIT);
    await this.appTileComponent.setTileTitle(newTileTitle);
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }

  /**
   * Open edit modal for native tile and verify fields
   * @param tileTitle - The tile title to edit (this is the actual title set when creating the tile)
   * @param expectedCalendarEmail - Expected calendar email/group in dropdown
   * @param calendarType - Optional calendar type ('Google Calendar' or 'Outlook Calendar', defaults to 'Google Calendar')
   */
  async openEditModalAndVerifyFields(
    tileTitle: string,
    expectedCalendarEmail: string,
    calendarType: string = 'Google Calendar'
  ): Promise<void> {
    await test.step(`Open edit modal and verify fields for: ${tileTitle}`, async () => {
      await this.appTileComponent.clickThreeDotsOnTile(tileTitle);
      await this.appTileComponent.clickTileOption(DASHBOARD_BUTTONS.EDIT);

      // Verify modal is opened
      await this.nativeTileComponent.verifyEditModalOpened();

      // Verify all fields - tile title should match what was set when creating the tile
      await this.nativeTileComponent.verifyTileTitle(tileTitle);
      await this.nativeTileComponent.verifyEventsContentTypeSelected();

      // Verify the correct calendar type is selected
      if (calendarType === 'Outlook Calendar') {
        await this.nativeTileComponent.verifyOutlookCalendarSelected();
      } else {
        await this.nativeTileComponent.verifyGoogleCalendarSelected();
      }

      await this.nativeTileComponent.verifyCalendarEmail(expectedCalendarEmail);
    });
  }

  /**
   * Click Save button in edit modal
   */
  async clickSaveButtonInEditModal(): Promise<void> {
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }

  /**
   * Complete workflow to add an app tile with text fields
   */
  async addTileWithTextField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    url: string,
    fieldName2: string,
    id: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      fields: [
        { name: fieldName, value: url },
        { name: fieldName2, value: id },
      ],
    });
  }
  /**
   * Complete workflow to add an app tile with dropdown and text field
   * @param tileTitle - The title of the tile to add
   * @param appName - The name of the app to add
   * @param tileName - The name of the tile to add
   * @param dropdownFieldName - The name of the first dropdown field
   * @param dropdownValue - The value to select in the first dropdown
   * @param textFieldName - The name of the text field
   * @param textFieldValue - The value for the text field
   * @param destination - The destination (Add to home/Add to site)
   * @param secondDropdownFieldName - Optional second dropdown field name (appears when "All" is selected)
   * @param secondDropdownValue - Optional second dropdown value
   */
  async addTileWithDropdownAndField(
    tileTitle: string,
    appName: string,
    tileName: string,
    dropdownFieldName: string,
    dropdownValue: string,
    textFieldName: string,
    textFieldValue: string,
    destination: string,
    secondDropdownFieldName?: string,
    secondDropdownValue?: string
  ): Promise<void> {
    const dropdowns = [{ fieldName: dropdownFieldName, value: dropdownValue }];

    // If second dropdown field name and value are provided, add them to the dropdowns array
    if (secondDropdownFieldName && secondDropdownValue) {
      dropdowns.push({ fieldName: secondDropdownFieldName, value: secondDropdownValue });
    }
    await this.addTile(tileTitle, appName, tileName, destination, {
      dropdowns,
      fields: [{ name: textFieldName, value: textFieldValue }],
    });
  }
  /**
   * Complete workflow to add an app tile with manager defined settings
   */
  async addTilewithManagerDefined(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string,
    fieldStatus: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      fields: [{ name: fieldName, value: fieldValue }],
      radioOptionsWithValues: [{ fieldName: fieldName2, option: fieldValue2, value: fieldStatus }],
    });
  }

  /**
   * Verify only tasks with specific status are showing
   */
  async verifyTasksWithStatusShowing(tileTitle: string, status: string): Promise<void> {
    await this.tileOperationsComponent.verifyTasksWithStatusShowing(tileTitle, status);
  }

  /**
   * Verify tile has task data (any combination of Mark complete/Completed)
   */
  async verifyTileHasTaskData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyTileHasTaskData(tileTitle);
  }

  /**
   * Verify team goals metadata is showing
   */
  async verifyTeamGoalsMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyTeamGoalsMetadata(tileTitle);
  }

  /**
   * Complete workflow to add an app tile with user defined settings
   */
  async addTilewithUserDefined(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      fields: [{ name: fieldName, value: fieldValue }],
      radioOptions: [{ fieldName: fieldName2, option: fieldValue2 }],
    });
  }

  /**
   * Complete workflow to add a tile with App Manager Defined dropdown settings
   */
  async addAppManagerDefinedWithOptions(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      radioOptionsWithValues: [
        { fieldName: fieldName, option: ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, value: fieldValue },
      ],
    });
  }
  /**
   * Verify Greenhouse tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyGreenhouseContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyGreenhouseTileContentStructure(tileTitle);
  }

  /**
   * Verify Workday pending learning courses tile data
   */
  async verifyPendingLearningCoursesTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyPendingLearningCoursesTileData(tileTitle);
  }

  /**
   * Verify tile shows specific message
   * @param tileTitle - The title of the tile to verify
   * @param message - The message text to verify
   */
  async verifyTileMessage(tileTitle: string, message: string): Promise<void> {
    await test.step(`Verify tile "${tileTitle}" shows message: "${message}"`, async () => {
      const tileLocator = this.tileContainer.filter({ hasText: tileTitle });
      const messageLocator = tileLocator.locator(`p:has-text("${message}")`);
      await expect(messageLocator, `Expected message "${message}" for tile: "${tileTitle}"`).toBeVisible({
        timeout: 10_000,
      });
    });
  }

  /**
   * Complete workflow to add an Airtable tile
   */
  async openAddAppTile(): Promise<void> {
    await test.step(`Verify connector tile: `, async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
    });
  }

  /**
   * Verify tile shows unavailable connection message (convenience method)
   * @param tileTitle - The title of the tile to verify
   * @param appName - The app name for the message
   */
  async verifyTileUnavailableMessage(tileTitle: string, appName: string = 'Expensify'): Promise<void> {
    const message = MESSAGES.getAppConnectionUnavailableMessage(appName);
    await this.verifyTileMessage(tileTitle, message);
  }

  /**
   * Verify the "View all courses in Workday" link is visible
   */
  async verifyViewAllCoursesInWorkdayLink(tileTitle: string, expectedUrl: string): Promise<void> {
    await this.tileOperationsComponent.verifyViewAllCoursesInWorkdayLink(tileTitle, expectedUrl);
  }
  /**
   * Verify the "View all payslips in Workday" link is visible
   */
  async verifyViewAllPayslipsInWorkdayLink(tileTitle: string, expectedUrl: string): Promise<void> {
    await this.tileOperationsComponent.verifyViewAllPayslipsInWorkdayLink(tileTitle, expectedUrl);
  }
  /**
   * Verify Workday Display Recent Paystubs metadata
   */
  async verifyWorkdayPaystubsMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyWorkdayPaystubsMetadata(tileTitle);
  }
  /**
   * Verify Workday Display Inbox metadata
   */
  async verifyWorkdayInboxMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyWorkdayInboxMetadata(tileTitle);
  }
  /**
   * Verify Workday Display Time Off metadata
   */
  async verifyWorkdayTimeOffMetadata(tileTitle: string, leaveType?: string): Promise<void> {
    await this.tileOperationsComponent.verifyWorkdayTimeOffMetadata(tileTitle, leaveType);
  }
  async verifyWorkdayJobPostingsmetadata(tileTitle: string, jobType: string): Promise<void> {
    await this.tileOperationsComponent.verifyWorkdayJobPostingsmetadata(tileTitle, jobType);
  }
  async clickEditDashboard(): Promise<void> {
    await this.appTileComponent.clickEditDashboard();
  }
  /**
   *Complete workflow to add a tile with App Manager Defined settings and drop down selection and toggle on
   */
  async addAppManagerDefinedWithOptionsEnableToggle(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string
  ): Promise<void> {
    await this.addTileEnableToggle(tileTitle, appName, tileName, destination, {
      radioOptionsWithValues: [
        { fieldName: fieldName, option: ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, value: fieldValue },
      ],
    });
  }

  /**
   * Complete workflow to add a FreshService tile with App Manager Defined settings and toggle on
   */
  async addFreshServiceWithOptionsEnableToggle(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string,
    fieldName2?: string,
    fieldValue2?: string
  ): Promise<void> {
    const config: {
      radioOptionsWithValues?: Array<{ fieldName: string; option: string; value: string }>;
      fields?: Array<{ name: string; value: string }>;
    } = {
      radioOptionsWithValues: [{ fieldName: fieldName, option: 'App Manager Defined', value: fieldValue }],
    };

    // Only add second field if fieldName2 is provided
    if (fieldName2 && fieldName2.trim() !== '') {
      config.fields = [{ name: fieldName2, value: fieldValue2 || '' }];
    }

    await this.addTileEnableToggle(tileTitle, appName, tileName, destination, config);
  }
  /**
   * Complete workflow to add an app tile with flexible configuration
   * @param tileTitle - The title of the tile to add
   * @param appName - The name of the app to add
   * @param tileName - The name of the tile to add
   * @param destination - The destination of the tile to add
   * @param config - Optional configuration object for fields and options
   */
  async addTileEnableToggle(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    config?: {
      fields?: Array<{ name: string; value: string }>;
      radioOptions?: Array<{ fieldName: string; option: string }>;
      radioOptionsWithValues?: Array<{ fieldName: string; option: string; value: string }>;
    }
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      if (config) {
        await this.configureTileFields(config);
      }
      await this.tileOperationsComponent.enableToggleButton(tileTitle);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }
  /**
   * Verify Salesforce tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifySalesforceContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifySalesforceTileContentStructure(tileTitle);
  }
  /**
   * Verify Salesforce View Complete Report link is visible
   * @param tileTitle - The title of the tile to verify
   */
  async verifySalesforceViewCompleteReportLink(
    tileTitle: string,
    expectedUrl: string,
    linkSelector?: string
  ): Promise<void> {
    await this.tileOperationsComponent.verifySalesforceViewCompleteReportLink(tileTitle, expectedUrl, linkSelector);
  }
  /**
   * Verify Service Now tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyServiceNowContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyServiceNowTileContentStructure(tileTitle);
  }
  /**
   * Complete workflow to add a tile with Dropdown(without app manager defined settings)
   */
  async addTileWithDropdownField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string,
    value: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      dropdowns: [{ fieldName, value }],
    });
  }

  async addTileWithAppManagerDefinedDropdownAndText(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    dropdownFieldName: string,
    dropdownValue: string,
    textFieldName: string,
    textValue: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile with dropdown and text: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      await this.selectRadioOptionandValue(dropdownFieldName, ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, dropdownValue);
      await this.selectRadioOptionAndTextInput(textFieldName, ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, textValue);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  async selectRadioOptionAndTextInput(fieldName: string, radioOption: string, textValue: string): Promise<void> {
    return this.tileOperationsComponent.selectRadioOptionAndTextInput(fieldName, radioOption, textValue);
  }

  /**
   * Open Personalize for a tile, select a dropdown value and enter a text field(optional), then Save
   */
  async personalizeDropdownAndText(
    tileTitle: string,
    dropdownFieldName: string,
    dropdownValue: string,
    textFieldName?: string,
    textValue?: string
  ): Promise<void> {
    await test.step(`Personalize '${tileTitle}' with dropdown and text`, async () => {
      await this.appTileComponent.openPersonalizeOptions(tileTitle);
      await this.selectFromDropdown(dropdownFieldName, dropdownValue);
      if (textFieldName !== undefined && textValue !== undefined) {
        await this.appTileComponent.inputFieldByName(textFieldName, textValue);
      }
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
    });
  }
  async setUpTileDropdown(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.setUpTileDropdown(tileTitle, fieldName, fieldValue);
  }
  async setUpTileTextbox(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.setUpTileTextbox(tileTitle, fieldName, fieldValue);
  }
  /**
   * Verify Service Now Approval tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyServiceNowApprovalContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyServiceNowApprovalContentStructure(tileTitle);
  }
  /**
   * Complete workflow to create a ticket from a Service Now tile
   */
  async createTicketFromTile(
    tileTitle: string,
    category: string,
    categoryValue: string,
    subcategory: string,
    subcategoryValue: string,
    textFieldName?: string,
    textValue?: string
  ): Promise<void> {
    await this.appTileComponent.clickButton('Create ticket');
    await this.selectDropdownValue(category, categoryValue);
    await this.selectDropdownValue(subcategory, subcategoryValue);
    if (textFieldName !== undefined && textValue !== undefined) {
      await this.appTileComponent.inputFieldByName(textFieldName, textValue);
    }
    await this.appTileComponent.clickButton('Create');
    await this.verifyToastMessage(MESSAGES.CREATE_TICKET_SUCCESS_MESSAGE);
  }
  /**
   * Verify Service Now Created Ticket tile content structure
   * @param tileTitle - The title of the tile to verify
   */
  async verifyServiceNowCreatedTicketStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyServiceNowCreatedTicketStructure(tileTitle);
  }
  /**
   * Verify Jira tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyJiraContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyJiraTileContentStructure(tileTitle);
  }
  /**
   * Complete workflow to add an app tile with app manager defined settings and text area input
   */
  async addTilewithDefinedSettingsTextArea(
    tileTitle: string,
    appName: string,
    tileName: string,
    appManagerDefined: string,
    fieldName: string,
    query: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      await this.appTileComponent.enterTextAreaInput(fieldName, appManagerDefined, query);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }
  async setUpTileTextAreaInput(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.setUpTileTextArea(tileTitle, fieldName, fieldValue);
  }

  /**
   * Add a native tile (pages, events & albums) to the dashboard
   * @param tileTitle - The title to set for the tile
   * @param calendarType - The calendar type ('Google Calendar' or 'Outlook Calendar')
   * @param destination - The destination for the tile (UI_ACTIONS.ADD_TO_HOME or UI_ACTIONS.ADD_TO_SITE)
   * @param calendarEmail - Optional calendar email to select from dropdown. If not provided, selects first available
   */
  async addNativeTile(
    tileTitle: string,
    calendarType: string,
    destination: string,
    calendarEmail?: string
  ): Promise<void> {
    await test.step(`Add native tile: ${tileTitle}`, async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.nativeTileComponent.clickAddContentTileButton();
      await this.nativeTileComponent.selectEventsContentType();
      await this.nativeTileComponent.selectCalendarType(calendarType);

      if (calendarType === 'Outlook Calendar') {
        // Outlook Calendar requires two selections: group and then calendar
        if (calendarEmail) {
          await this.nativeTileComponent.selectOutlookCalendarGroupAndCalendar(calendarEmail);
        } else {
          await this.nativeTileComponent.selectFirstAvailableCalendar();
          await this.page.waitForTimeout(1000);
          await this.outlookCalendarSecondDropdown.waitFor({ state: 'visible', timeout: 10000 });
          await this.nativeTileComponent.clickOnElement(this.outlookCalendarSecondDropdown, { timeout: 30_000 });
          await this.page.waitForTimeout(500); // Brief wait for menu to render
          await this.reactSelectListboxMenu.waitFor({ state: 'visible', timeout: 10000 });
          await this.reactSelectFirstOption.waitFor({ state: 'visible', timeout: 10000 });
          await this.nativeTileComponent.clickOnElement(this.reactSelectFirstOption, { timeout: 30_000 });
        }
      } else {
        if (calendarEmail) {
          await this.nativeTileComponent.selectCalendarFromDropdown(calendarEmail);
        } else {
          await this.nativeTileComponent.selectFirstAvailableCalendar();
        }
      }

      await this.nativeTileComponent.setTileTitle(tileTitle);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }

  /**
   * Open add content tile modal and verify UI elements for Google Calendar
   */
  async openAddContentTileModalAndVerifyUI(): Promise<void> {
    await test.step('Open add content tile modal and verify UI elements', async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.nativeTileComponent.clickAddContentTileButton();

      // Verify Events content type option is available and select it
      await this.nativeTileComponent.selectEventsContentType();
      await this.nativeTileComponent.verifyEventsContentTypeSelected();

      // Verify Google Calendar source option is available and select it
      await this.nativeTileComponent.selectGoogleCalendar();
      await this.nativeTileComponent.verifyGoogleCalendarSelected();

      // Verify calendar dropdown is present
      await this.nativeTileComponent.verifyCalendarDropdownVisible();
    });
  }

  /**
   * Close the add content tile modal
   */
  async closeAddContentTileModal(): Promise<void> {
    await test.step('Close add content tile modal', async () => {
      await this.appTileComponent.closeDialog();
    });
  }
  /**
   * Complete workflow to add an app tile with app manager defined settings and text area input and dropdown
   */
  async addTilewithDefinedSettingsTextAreaAndDropdown(
    tileTitle: string,
    appName: string,
    tileName: string,
    appManagerDefined: string,
    fieldName: string,
    query: string,
    dropdownFieldName: string,
    dropdownValue: string,
    destination: string
  ): Promise<void> {
    await test.step(`Add ${appName} tile: ${tileTitle}`, async () => {
      await this.openModalSelectAppTileAndSetTitle(appName, tileName, tileTitle);
      await this.appTileComponent.enterTextAreaInputJQL(fieldName, appManagerDefined, query);
      await this.selectRadioOptionandValue(dropdownFieldName, ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED, dropdownValue);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
  }
}
