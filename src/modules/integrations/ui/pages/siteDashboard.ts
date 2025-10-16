import { ACTION_LABELS, DASHBOARD_BUTTONS, ORGANIZATION_SETTINGS, UI_ACTIONS } from '@integrations/constants/common';
import { AIRTABLE_TILE } from '@integrations/test-data/app-tiles.test-data';
import { ExternalAppProvider } from '@integrations/ui/pages/externalAppsPage';
import { BaseAppTileComponent } from '@integrations-components/baseAppTileComponent';
import { TileOperationsComponent } from '@integrations-components/tileOperationsComponent';
import { TimeOffRequestTileComponent } from '@integrations-components/timeOffRequestTileComponent';
import { Page, test } from '@playwright/test';

import { getEnvConfig } from '@core/utils/getEnvConfig';

/**
 * Home dashboard page for integrations
 * Provides common tile management and verification methods
 */
export class SiteDashboard {
  readonly page: Page;
  private appTileComponent!: BaseAppTileComponent;
  private timeOffRequestTileComponent!: TimeOffRequestTileComponent;
  private tileOperationsComponent!: TileOperationsComponent;
  private appManagerApiClient?: any;

  constructor(page: Page, appManagerApiClient?: any) {
    this.page = page;
    this.appManagerApiClient = appManagerApiClient;
    this.appTileComponent = new BaseAppTileComponent(page);
    this.appTileComponent = new BaseAppTileComponent(page);
    this.timeOffRequestTileComponent = new TimeOffRequestTileComponent(page);
    this.tileOperationsComponent = new TileOperationsComponent(page);
  }

  /**
   * Navigate to a specific site dashboard
   * @param siteId - The ID of the site to navigate to
   */
  async navigateToSite(siteId: string): Promise<void> {
    const siteUrl = new URL(`/site/${siteId}/dashboard`, getEnvConfig().frontendBaseUrl).toString();
    await this.page.goto(siteUrl);
    await this.verifyThePageIsLoaded();
  }

  /**
   * Verify that the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  async verifyToastMessage(message: string) {
    return this.appTileComponent.verifyToastMessageIsVisibleWithText(message);
  }

  async isTilePresent(tileTitle: string) {
    return this.appTileComponent.isTilePresent(tileTitle);
  }

  async removeTile(tileTitle: string, successMessage: string) {
    await this.appTileComponent.clickThreeDotsOnTile(tileTitle);
    await this.appTileComponent.clickTileOption(ACTION_LABELS.REMOVE);
    await this.appTileComponent.verifyRemovePopupAppears(tileTitle);
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.REMOVE);
    if (successMessage) {
      await this.appTileComponent.verifyToastMessageIsVisibleWithText(successMessage);
    }
  }

  /**
   * Edit tile name - combines all editing steps into a single method
   * @param oldTileTitle - Current tile title
   * @param newTileTitle - New tile title
   */
  async editTileName(oldTileTitle: string, newTileTitle: string): Promise<void> {
    await this.appTileComponent.clickThreeDotsOnTile(oldTileTitle);
    await this.appTileComponent.clickTileOption(ACTION_LABELS.EDIT);
    await this.appTileComponent.setTileTitle(newTileTitle);
    await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.SAVE);
  }

  /**
   * Reload page and verify tile is present
   * @param tileTitle - The title of the tile to verify
   */
  async reloadAndVerifyTilePresent(tileTitle: string): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
    await this.verifyThePageIsLoaded();
    await this.appTileComponent.isTilePresent(tileTitle);
  }

  /**
   * Open the Add tile modal for a given external app provider (pre-title state)
   */
  async openAddAppTileModal(provider: ExternalAppProvider | string): Promise<void> {
    await this.appTileComponent.openAddAppTileModal(String(provider));
  }

  /**
   * Verify the connection helper text and connected email in the Add tile modal
   */
  async verifyConnectionMessage(expectedConnectionText: string, options: { connectedEmail: string }): Promise<void> {
    await this.appTileComponent.verifyConnectionMessage(expectedConnectionText, options);
  }

  /**
   * Click the 'My settings' link in the Add tile modal
   */
  async clickDialogLink(label: string): Promise<void> {
    await this.appTileComponent.clickDialogLink(label);
  }

  /**
   * Complete workflow to add an Airtable tile
   * @param tileTitle - The title for the tile
   * @param config - Airtable configuration
   * @param destination - Where to add the tile
   */
  async addAirtableTile(tileTitle: string, config: any, destination: string): Promise<void> {
    await test.step(`Add Airtable tile: ${tileTitle}`, async () => {
      await this.appTileComponent.clickEditDashboard();
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.ADD_TILE);
      await this.appTileComponent.clickButton(DASHBOARD_BUTTONS.APP_TILES);
      await this.appTileComponent.selectAppTile(AIRTABLE_TILE.APP_NAME);
      await this.appTileComponent.setTileTitle(tileTitle);
      await this.appTileComponent.configureAppTile(config);
      await this.appTileComponent.submitTileToHomeOrDashboard(destination);
    });
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
   * Generic method to verify tile redirects to any URL
   * @param tileTitle - The title of the tile
   * @param expectedUrl - The expected URL to redirect to
   * @param linkSelector - Optional custom link selector (defaults to 'a:has(h3)')
   */
  async verifyTileRedirects(tileTitle: string, expectedUrl: string, linkSelector?: string): Promise<void> {
    await this.tileOperationsComponent.verifyTileRedirects(tileTitle, expectedUrl, linkSelector);
  }

  /**
   * Verify Airtable tile content structure with task records
   * @param tileTitle - The title of the tile to verify
   */
  async verifyAirtableTileContentStructure(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyAirtableTileContentStructure(tileTitle);
  }

  /**
   * Verify Expensify report tile data
   */
  async verifyExpensifyReportData(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyExpensifyReportData(tileTitle);
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
   * Verify Display Time Off tile metadata including VACFT and SICKFT sections
   * @param tileTitle - The title of the tile to verify
   */
  async verifyDisplayTimeOffMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyDisplayTimeOffMetadata(tileTitle);
  }

  /**
   * Complete workflow to add an app tile
   */
  async addTilewithAppManagerDefined(
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
   * Verify Show more behaviour for apptile on site dashboard
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

  /**
   * Verify UKG Pro tile metadata including pay periods, received dates, and links
   * @param tileTitle - The title of the tile to verify
   */
  async verifyUKGProTileMetadata(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyUKGProTileMetadata(tileTitle);
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
   * Verify DocuSign tile content structure with task records
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
    url: string,
    destination: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, destination, {
      fields: [{ name: fieldName, value: url }],
    });
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
   * Complete workflow to add an app tile with single field personalize option
   */
  async addTilewithPersonalizeSingleField(
    tileTitle: string,
    appName: string,
    tileName: string,
    fieldName: string
  ): Promise<void> {
    await this.addTile(tileTitle, appName, tileName, UI_ACTIONS.ADD_TO_SITE, {
      radioOptions: [{ fieldName, option: ORGANIZATION_SETTINGS.USER_DEFINED }],
    });
  }

  /**
   * Select radio button option by field name and option text
   */
  async selectRadioOption(fieldName: string, option: string): Promise<void> {
    await this.tileOperationsComponent.selectRadioOption(fieldName, option);
  }
  /**
   * Verify tasks with specific status are showing (at least one)
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
   * Verify personalize button is visible
   */
  async verifyPersonalizeVisible(tileTitle: string): Promise<void> {
    await this.tileOperationsComponent.verifyPersonalizeVisible(tileTitle);
  }

  /**
   * Personalize tile with specific field and value
   */
  async PersonalizeTile(tileTitle: string, fieldName: string, value: string): Promise<void> {
    await this.tileOperationsComponent.personalizeTile(tileTitle, fieldName, value);
  }
  /**
   * Verify label is visible using tile operations component
   */
  async verifyLabel(labelText: string): Promise<void> {
    return this.tileOperationsComponent.verifyLabel(labelText);
  }
  /**
   * Select radio option and dropdown value using tile operations component
   */
  async selectRadioOptionandValue(fieldName: string, radioOption: string, dropdownValue: string): Promise<void> {
    return this.tileOperationsComponent.selectRadioOptionandValue(fieldName, radioOption, dropdownValue);
  }
  /**
   * Complete workflow to add app tile with site manager defined configuration
   */
  async addTileWithSiteManagerDefined(
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
        { fieldName, option: ORGANIZATION_SETTINGS.SITE_MANAGER_DEFINED, value: fieldValue },
        { fieldName: fieldName2, option: ORGANIZATION_SETTINGS.SITE_MANAGER_DEFINED, value: fieldValue2 },
        { fieldName: fieldName3, option: ORGANIZATION_SETTINGS.SITE_MANAGER_DEFINED, value: fieldValue3 },
      ],
    });
  }
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
   * Select value from Organization combobox dropdown
   */
  async selectFromDropdown(option: string, itemName: string): Promise<void> {
    await this.tileOperationsComponent.selectFromDropdown(option, itemName);
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
   * Complete workflow to add app tile with user defined configuration
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
}
