import { getEnvConfig } from '@core/utils/getEnvConfig';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { ACTION_LABELS, APP_LABELS, UI_ACTIONS } from '@integrations-constants/common';
import { AIRTABLE_TILE_DATA, AIRTABLE_AUTH_DATA } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { test } from '@playwright/test';
import { IntegrationManagementComponent } from '../../../../components/addIntegrationComponents';
import { IntegrationApi } from '../../../../api/helpers/integrationApi';
import { TestPriority } from '@core/constants/testPriority';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe('Airtable App Tiles Integration', () => {
  let integrationComponent: IntegrationManagementComponent;
  let airtablePage: AirtableAppTilesPage;
  let integrationApi: IntegrationApi;

  test.beforeEach(async ({ page }) => {
    await LoginHelper.loginWithPassword(page, adminUser);
  });

  test(
    'Verify that App Manager is able to connect Airtable from Manage->Integrations',
    {
      tag: [
        TestPriority.P0,
        TestGroupType.SANITY,
        TestGroupType.SMOKE,
        IntegrationsSuiteTags.AIRTABLE,
        IntegrationsSuiteTags.ABSOLUTE,
      ],
    },
    async ({ page }) => {
      tagTest(test.info(), {
        zephyrTestId: 'INT-25883',
        storyId: 'INT-23049',
      });

      integrationComponent = new IntegrationManagementComponent(page);
      airtablePage = new AirtableAppTilesPage(page);
      integrationApi = new IntegrationApi(page);

      // Navigate to Manage->Integrations->Custom page
      await integrationComponent.navigateToManageIntegrationsCustom();

      // Search for "Airtable" in the search bar
      await integrationComponent.searchForApp(AIRTABLE_TILE_DATA.APP_NAME);

      // Click on the "Airtable" connector
      await integrationComponent.clickAppConnector(AIRTABLE_TILE_DATA.APP_NAME);

      // Open connector options and select "Delete"
      await integrationComponent.selectConnectorOption(ACTION_LABELS.DELETE);

      // Verify delete custom dialog box is shown
      await integrationComponent.verifyDeleteDialogVisible(APP_LABELS.DELETE_CUSTOM_APP_LABEL);

      // Click on delete in the confirmation dialog
      await integrationComponent.confirmDelete(APP_LABELS.DELETE_LABEL);

      // Verify toast message
      await airtablePage.verifyToastMessage(MESSAGES.AIRTABLE_DELETE_MESSAGE);

      // Click on "Add custom app" Dropdown
      await integrationComponent.clickAddCustomAppDropdown(APP_LABELS.ADD_CUSTOM_APP_LABEL);

      // Click on "Add prebuilt app" from Tile type dropdown
      await integrationComponent.clickAddPrebuiltApp(APP_LABELS.ADD_PREBUILT_APP_LABEL);

      // Enter "Airtable" in SearchBox
      await integrationComponent.searchForPrebuiltApp(AIRTABLE_TILE_DATA.APP_NAME);

      // Click on the "Add" button
      await integrationComponent.clickAddPrebuilt(AIRTABLE_TILE_DATA.APP_NAME);

      // Configure Airtable authentication details
      await airtablePage.configureAirtableAuth();

      // Verify toast message after adding Airtable
      await airtablePage.verifyToastMessage(MESSAGES.AIRTABLE_ADDED_MESSAGE);

      // // Click on three dots besides app name
      await integrationComponent.openConnectorOptions(ACTION_LABELS.ENABLE);

      // Verify toast message after enabling Airtable
      await airtablePage.verifyToastMessage(MESSAGES.AIRTABLE_ENABLE_MESSAGE);

      // Navigate to External Apps via API
      await integrationApi.navigateToExternalAppsViaApi();

      // Click on "Airtable" "Connect account" button
      await integrationComponent.clickOnIntegrationButton(AIRTABLE_TILE_DATA.APP_NAME, ACTION_LABELS.CONNECT_ACCOUNT);

      // // And user logs in to Airtable with credentials from test data
      await airtablePage.loginToAirtable(
        AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.EMAIL,
        AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.PASSWORD
      );

      // // Verify "Airtable" button is displayed as "Disconnect account" button
      await integrationComponent.verifyIntegrationButton(AIRTABLE_TILE_DATA.APP_NAME, ACTION_LABELS.DISCONNECT_ACCOUNT);
    }
  );
});
