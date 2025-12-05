import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SERVICE_NOW_VALUES } from '../../test-data/app-tiles.test-data';

import { IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AppsPage } from '@/src/modules/integrations/ui/pages/appsPage';

let appsPage: AppsPage;

test.describe(
  'apps page - integration management',
  {
    tag: [IntegrationsSuiteTags.APPS_PAGE, IntegrationsSuiteTags.INTEGRATIONS],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      appsPage = new AppsPage(appManagerFixture.page);
      await appsPage.verifyThePageIsLoaded();
    });

    test(
      'verify app manager can search and select an integration from the list',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that app manager can search for integrations and select them',
        });

        const integrationName = 'ServiceNow';
        await appsPage.actions.clickAddIntegrationButton();
        await appsPage.assertions.verifySearchFieldIsVisible();
        await appsPage.actions.searchForIntegration(integrationName);
        await appsPage.actions.selectIntegrationFromList(integrationName);
        await appsPage.assertions.verifyConnectionNameFieldIsVisible();
      }
    );

    test(
      'verify app manager can add a new integration with valid connection name and audience',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that app manager can successfully add a new integration connection',
        });

        const integrationName = 'ServiceNow';
        const connectionName = `Test_${faker.string.alphanumeric(8)}`;
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
      }
    );

    // test(
    //   'verify validation error is displayed when connection name is empty',
    //   {
    //     tag: [TestPriority.P2, TestGroupType.REGRESSION],
    //   },
    //   async () => {
    //     tagTest(test.info(), {
    //       storyId: 'INT-XXXX',
    //       description: 'verify that validation error appears when trying to add integration without connection name',
    //     });

    //     const integrationName = 'ServiceNow';
    //     const initialConnectionName = 'Test';

    //     await appsPage.actions.clickAddIntegrationButton();
    //     await appsPage.actions.searchForIntegration(integrationName);
    //     await appsPage.actions.selectIntegrationFromList(integrationName);

    //     await appsPage.actions.enterConnectionName(initialConnectionName);
    //     await appsPage.actions.clearConnectionName();
    //     await appsPage.actions.clickBrowseButton();
    //     await appsPage.actions.selectAudience();
    //     await appsPage.actions.clickDoneButton();

    //     await appsPage.actions.clickAddButton();
    //     await appsPage.assertions.verifyConnectionNameErrorMessage();
    //   }
    // );

    test(
      'verify app manager can add multiple integrations with different connection names',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that app manager can add multiple integration connections with unique names',
        });

        const integrationName = 'ServiceNow';
        const connectionName1 = `Test_${faker.string.alphanumeric(8)}`;
        const connectionName2 = `Test_${faker.string.alphanumeric(8)}`;

        await appsPage.actions.addIntegration(integrationName, connectionName1);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName1);
        await appsPage.actions.addIntegration(integrationName, connectionName2);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName2);
      }
    );

    test(
      'verify app manager can enter ServiceNow credentials and connect to ServiceNow',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that app manager can enter ServiceNow credentials',
        });

        const integrationName = 'ServiceNow';
        const connectionName = `Test_${faker.string.alphanumeric(8)}`;
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.enterServiceNowCredentials({
          consumerKey: SERVICE_NOW_VALUES.CONSUMER_KEY,
          secretKey: SERVICE_NOW_VALUES.SECRET_KEY,
          url: SERVICE_NOW_VALUES.URL,
        });
        await appsPage.connectServiceNowAccount();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
      }
    );
  }
);
