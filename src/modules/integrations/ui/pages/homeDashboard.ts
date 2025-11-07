import { DASHBOARD_BUTTONS, ORGANIZATION_SETTINGS, UI_ACTIONS } from '@integrations/constants/common';
import { MESSAGES } from '@integrations/constants/messageRepo';
import { ExternalAppProvider } from '@integrations/ui/pages/externalAppsPage';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { TileOperationsComponent } from '@integrations-components/tileOperationsComponent';
import { TimeOffRequestTileComponent } from '@integrations-components/timeOffRequestTileComponent';
import { AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { BasePage } from '@/src/core/ui/pages/basePage';
import { TileManagementHelper } from '@/src/modules/content/apis/helpers/tileManagementHelper';

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
  private readonly tileManagementHelper: TileManagementHelper;
  private readonly tileContainer: Locator;

  private readonly defaultConfig = {
    baseName: AIRTABLE_TILE.BASE_NAME,
    tableId: AIRTABLE_TILE.TABLE_ID,
    sortBy: AIRTABLE_TILE.USER_DEFINED,
    sortOrder: AIRTABLE_TILE.USER_DEFINED,
  };

  constructor(page: Page, tileManagementHelper: TileManagementHelper) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.page = page;
    this.airtableComponent = new BaseAppTileComponent(page);
    this.appTileComponent = new AppTileComponent(page);
    this.timeOffRequestTileComponent = new TimeOffRequestTileComponent(page);
    this.tileOperationsComponent = new TileOperationsComponent(page);
    this.tileManagementHelper = tileManagementHelper;
    this.tileContainer = page.locator('aside');
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
   * Complete workflow to add an app tile with single field personalize option
   */
  async addTilewithPersonalizeSingleField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, UI_ACTIONS.ADD_TO_HOME, {
      radioOptions: [{ fieldName, option: ORGANIZATION_SETTINGS.USER_DEFINED }],
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
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyExpensifyReportData(tileTitle);
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
   * Verify Calendar upcoming events tile data
   */
  async verifyCalendarUpcomingEventsTileData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyUpcomingEventsTileData(tileTitle);
  }

  /**
   * Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
   */
  async verifyShowMoreBehavior(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyShowMoreBehavior(tileTitle);
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
   * Complete workflow to add a Greenhouse tile with App Manager Defined settings
   */
  async addAppManagerDefinedWithOptions(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string
  ): Promise<void> {
    await this.addTile(tileTitle, 'Greenhouse', tileName, destination, {
      radioOptionsWithValues: [{ fieldName: fieldName, option: 'App Manager Defined', value: fieldValue }],
      fields: [{ name: fieldName2, value: fieldValue2 }],
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
   * Verify the "View all courses in Workday" link is visible on the tile
   */
  async verifyViewAllCoursesInWorkdayLink(tileTitle: string, expectedUrl: string): Promise<void> {
    await this.tileOperationsComponent.verifyViewAllCoursesInWorkdayLink(tileTitle, expectedUrl);
  }
  async setUpTile(tileTitle: string, fieldName: string, fieldValue: string): Promise<void> {
    await this.tileOperationsComponent.setUpTile(tileTitle, fieldName, fieldValue);
  }
  /**
   * Complete workflow to add a Greenhouse tile with App Manager Defined settings and toggle on
   */
  async addAppManagerDefinedWithOptionsEnableToggle(
    tileTitle: string,
    appName: string,
    tileName: string,
    destination: string,
    fieldName: string,
    fieldValue: string,
    fieldName2: string,
    fieldValue2: string
  ): Promise<void> {
    await this.addTileEnableToggle(tileTitle, 'Greenhouse', tileName, destination, {
      radioOptionsWithValues: [{ fieldName: fieldName, option: 'App Manager Defined', value: fieldValue }],
      fields: [{ name: fieldName2, value: fieldValue2 }],
    });
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
}
