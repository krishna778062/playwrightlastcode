import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SERVICE_NOW_VALUES } from '../../test-data/app-tiles.test-data';
import { ExternalAppProvider, ExternalAppsPage } from '../../ui/pages/externalAppsPage';

import { IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { AppsPage, IntegrationStatus } from '@/src/modules/integrations/ui/pages/appsPage';

let appsPage: AppsPage;

test.describe(
  'apps page - integration management',
  {
    tag: [IntegrationsSuiteTags.APPS_PAGE, IntegrationsSuiteTags.INTEGRATIONS],
  },
  () => {
    test.beforeEach(async ({ appManagerFixture }) => {
      appsPage = new AppsPage(appManagerFixture.page);
      await appsPage.actions.navigateToAppsPage();
      await appsPage.assertions.verifyThePageIsLoaded();
    });

    test.skip(
      'verify app manager can search and select an integration from the list',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29641',
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

    test.skip(
      'verify app manager can add a new integration with valid connection name and audience',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29642',
          description: 'verify that app manager can successfully add a new integration connection',
        });

        const integrationName = 'ServiceNow';
        const connectionName = `Test_${faker.string.alphanumeric(8)}`;
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
        await appsPage.assertions.verifyStatusBadgeText(connectionName, IntegrationStatus.DISABLED);
      }
    );

    test.skip(
      'verify app manager can add a new integration with special characters in connection name and audience',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-29650', 'INT-29706'],
          description: 'verify that app manager can add a new integration connection with special characters',
        });

        const integrationName = 'ServiceNow';
        const connectionName = '#@&!D@SAD';
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
        await appsPage.assertions.verifyStatusBadgeText(connectionName, IntegrationStatus.DISABLED);
      }
    );

    test.skip(
      'verify app manager can add multiple integrations with different connection names',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29645',
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

    test.skip(
      'verify app manager can enter ServiceNow credentials and connect to ServiceNow on apps page and external apps page',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-30204', 'INT-30205', 'INT-29707'],
          description: 'verify that app manager can enter ServiceNow credentials',
        });

        const integrationName = 'ServiceNow';
        const connectionName = `ServiceNow_${faker.string.alphanumeric(8)}`;
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.enterServiceNowCredentials({
          consumerKey: SERVICE_NOW_VALUES.CONSUMER_KEY,
          secretKey: SERVICE_NOW_VALUES.SECRET_KEY,
          url: SERVICE_NOW_VALUES.URL,
        });
        await appsPage.connectServiceNowAccount();
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
        await appsPage.assertions.verifyStatusBadgeText(connectionName, IntegrationStatus.ENABLED);
        const externalAppsPage = new ExternalAppsPage(appsPage.page);
        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await externalAppsPage.connectServiceNowAccount(connectionName);
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.SERVICENOW, true);
      }
    );

    test.skip(
      'verify app manager can enter confluence credentials and connect to confluence',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-30205',
          description: 'verify that app manager can enter ServiceNow credentials',
        });

        const integrationName = 'Confluence';
        const connectionName = `Confluence_${faker.string.alphanumeric(8)}`;
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.enterConfluenceCredentials({
          site: 'https://confluence.simpplr.com', // TODO: Add valid confluence site
        });
        await appsPage.actions.navigateToAppsTab();
        await appsPage.verifyThePageIsLoaded();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
      }
    );

    test.skip(
      'verify add integration pop up can be closed by clicking on x button',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: ['INT-29643', 'INT-29644'],
          description: 'verify that add integration pop up can be closed by clicking on x button',
        });

        await appsPage.actions.clickAddIntegrationButton();
        await appsPage.assertions.verifyAddIntegrationButtonIsVisible();
        await appsPage.actions.closePopup();
        await appsPage.assertions.verifyAddIntegrationButtonIsNotVisible();
      }
    );

    test.skip(
      'verify save button is disabled when connection name is empty',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29646',
          description: 'verify that save button is disabled when connection name is empty',
        });

        const integrationName = 'ServiceNow';
        const connectionName = '';
        await appsPage.actions.clickAddIntegrationButton();
        await appsPage.actions.searchForIntegration(integrationName);
        await appsPage.actions.selectIntegrationFromList(integrationName);
        await appsPage.actions.enterConnectionName(connectionName);
        await appsPage.actions.clickBrowseButton();
        await appsPage.actions.selectAudience();
        await appsPage.actions.clickDoneButton();
        await appsPage.assertions.verifyAddButtonIsDisabled();
      }
    );

    test.skip(
      'verify save button is disabled when target audience is not selected',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-29648',
          description: 'verify that save button is disabled when target audience is not selected',
        });

        const integrationName = 'ServiceNow';
        const connectionName = '';
        await appsPage.actions.clickAddIntegrationButton();
        await appsPage.actions.searchForIntegration(integrationName);
        await appsPage.actions.selectIntegrationFromList(integrationName);
        await appsPage.actions.enterConnectionName(connectionName);
        await appsPage.assertions.verifyAddButtonIsDisabled();
      }
    );

    test.skip(
      'verify app manager can add integration and search for it by connection name',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async () => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-29642',
          description:
            'verify that after adding an integration, app manager can search for it by connection name and verify it exists',
        });

        const integrationName = 'ServiceNow';
        const connectionName = `Test_${faker.string.alphanumeric(8)}`;

        // Add a new integration
        await appsPage.actions.addIntegration(integrationName, connectionName);
        await appsPage.actions.navigateToAppsTab();
        await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);

        // Search for the integration tile by connection name
        await appsPage.actions.searchIntegrationTile(connectionName);
        await appsPage.assertions.verifyIntegrationTileIsVisible(connectionName);
      }
    );
  }
);
