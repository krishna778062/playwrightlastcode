// import { CustomAppsIntegrationPage } from '@integrations/pages/customAppsIntegrationPage';
// import { ACTION_LABELS } from '@integrations-constants/common';
// import { MESSAGES } from '@integrations-constants/messageRepo';
// import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
// import { AirtableAppTilesPage } from '@integrations-pages/airtableAppTilesPage';
// import { AIRTABLE_AUTH_DATA, AIRTABLE_TILE } from '@integrations-test-data/app-tiles.test-data';
// import { test } from '@playwright/test';

// import { TestPriority } from '@core/constants/testPriority';
// import { TestGroupType } from '@core/constants/testType';
// import { LoginHelper } from '@core/helpers/loginHelper';
// import { UserCredentials } from '@core/types/test.types';
// import { getEnvConfig } from '@core/utils/getEnvConfig';
// import { tagTest } from '@core/utils/testDecorator';

// import { AppConnectorOptions } from '@/src/modules/integrations/components/customAppsListComponent';
// import { ExternalAppProvider, ExternalAppsPage } from '@/src/modules/integrations/pages/externalAppsPage';

// const adminUser: UserCredentials = {
//   email: getEnvConfig().appManagerEmail,
//   password: getEnvConfig().appManagerPassword,
// };

// test.describe(
//   'Airtable App Tiles Setup',
//   {
//     tag: [IntegrationsSuiteTags.AIRTABLE, IntegrationsSuiteTags.ABSOLUTE],
//   },
//   () => {
//     let airtablePage: AirtableAppTilesPage;
//     let externalAppPage: ExternalAppsPage;

//     test.beforeEach(async ({ page }) => {
//       await LoginHelper.loginWithPassword(page, adminUser);
//     });

//     test(
//       'Verify that App Manager is able to connect Airtable from Manage->Integrations',
//       {
//         tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
//       },
//       async ({ page }) => {
//         tagTest(test.info(), {
//           zephyrTestId: 'INT-25883',
//           storyId: 'INT-23049',
//         });
//         const customIntegrationsPage = new CustomAppsIntegrationPage(page);
//         airtablePage = new AirtableAppTilesPage(page);
//         externalAppPage = new ExternalAppsPage(page);

//         // Navigate to Manage->Integrations->Custom page
//         await customIntegrationsPage.loadPage();
//         await customIntegrationsPage.searchAndSelectAppWithNameToPerformAction(
//           AIRTABLE_TILE.APP_NAME,
//           AppConnectorOptions.Delete
//         );
//         await customIntegrationsPage.addPrebuiltApp(AIRTABLE_TILE.APP_NAME);
//         await customIntegrationsPage.configureAirtableAuth();
//         await customIntegrationsPage.verifyToastMessage(MESSAGES.AIRTABLE_ADDED_MESSAGE);
//         await customIntegrationsPage.openConnectorOptions(ACTION_LABELS.ENABLE);
//         await customIntegrationsPage.verifyToastMessage(MESSAGES.AIRTABLE_ENABLE_MESSAGE);
//         await externalAppPage.navigateToExternalAppsPage();
//         await externalAppPage.verifyThePageIsLoaded();
//         await externalAppPage.verifyIntegrationNotConnected(ExternalAppProvider.AIRTABLE);
//         await externalAppPage.connectIntegration(ExternalAppProvider.AIRTABLE);
//         await airtablePage.loginToAirtable(
//           AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.EMAIL,
//           AIRTABLE_AUTH_DATA.AUTH_CREDENTIALS.PASSWORD
//         );
//         await externalAppPage.verifyToastMessage(MESSAGES.AIRTABLE_CONNECT_SUCCESS_MESSAGE);
//         await externalAppPage.getDisconnectButton(ExternalAppProvider.AIRTABLE);
//       }
//     );
//   }
// );
