import { IntegrationApi } from '@integrations/api/helpers/integrationApi';
import { CustomAppsIntegrationPage } from '@integrations/pages/customAppsIntegrationPage';
import { ACTION_LABELS, APP_LABELS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
import { AIRTABLE_AUTH_DATA, AIRTABLE_TILE_DATA } from '@integrations-test-data/app-tiles.test-data';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { getEnvConfig } from '@core/utils/getEnvConfig';
import { tagTest } from '@core/utils/testDecorator';

import {
  AppConnectorOptions,
  CustomAppsListComponent,
} from '@/src/modules/integrations/components/customAppsListComponent';

const adminUser: UserCredentials = {
  email: getEnvConfig().appManagerEmail,
  password: getEnvConfig().appManagerPassword,
};

test.describe(
  'Airtable App Tiles Setup',
  {
    tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let integrationComponent: CustomAppsListComponent;
    let airtablePage: AirtableAppTilesPage;
    let integrationApi: IntegrationApi;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, adminUser);
    });

    test(
      'Verify that App Manager is able to connect Airtable from Manage->Integrations',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-25883',
          storyId: 'INT-23049',
        });
        const customIntegrationsPage = new CustomAppsIntegrationPage(page);
        integrationComponent = new CustomAppsListComponent(page);
        airtablePage = new AirtableAppTilesPage(page);
        integrationApi = new IntegrationApi(page);

        // Navigate to Manage->Integrations->Custom page
        await customIntegrationsPage.loadPage();
        await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(
          AIRTABLE_TILE_DATA.APP_NAME,
          AppConnectorOptions.Delete
        );

        await customIntegrationsPage.addPrebuiltApp(AIRTABLE_TILE_DATA.APP_NAME);

        // Configure Airtable authentication details
        await airtablePage.configureAirtableAuth();

        // Verify toast message after adding Airtable
        await airtablePage.verifyToastMessage(MESSAGES.AIRTABLE_ADDED_MESSAGE);

        // // Click on three dots besides app name
        await integrationComponent.openConnectorOptions(ACTION_LABELS.ENABLE);

        // Verify toast message after enabling Airtable
        await airtablePage.verifyToastMessage(MESSAGES.AIRTABLE_ENABLE_MESSAGE);

        // Navigate to External Apps page

        await integrationApi.navigateToExternalAppsPage();

        // Click on "Airtable" "Connect account" button
        await integrationComponent.clickOnIntegrationButton(AIRTABLE_TILE_DATA.APP_NAME, ACTION_LABELS.CONNECT_ACCOUNT);

        // // And user logs in to Airtable with credentials from test data
        await airtablePage.loginToAirtable(
          AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.EMAIL,
          AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.PASSWORD
        );

        // // Verify "Airtable" button is displayed as "Disconnect account" button
        await integrationComponent.verifyIntegrationButton(
          AIRTABLE_TILE_DATA.APP_NAME,
          ACTION_LABELS.DISCONNECT_ACCOUNT
        );
      }
    );
  }
);
