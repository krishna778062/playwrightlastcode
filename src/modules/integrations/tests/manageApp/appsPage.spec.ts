import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

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
      await appsPage.navigateToAppsPage();
      await appsPage.verifyThePageIsLoaded();
    });

    test(
      'verify app manager can navigate to apps page and add integration button is visible',
      {
        tag: [TestPriority.P1, TestGroupType.SMOKE],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that app manager can access apps page and see add integration button',
        });
        await appsPage.assertions.verifyAddIntegrationButtonIsVisible();
      }
    );

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
        const audienceName = 'unqlawmodd (1)';

        await test.step('Click Add Integration button', async () => {
          await appsPage.actions.clickAddIntegrationButton();
        });

        await test.step(`Search for ${integrationName}`, async () => {
          await appsPage.actions.searchForIntegration(integrationName);
        });

        await test.step(`Select ${integrationName} from list`, async () => {
          await appsPage.actions.selectIntegrationFromList(integrationName);
        });

        await test.step(`Enter connection name: ${connectionName}`, async () => {
          await appsPage.actions.enterConnectionName(connectionName);
        });

        await test.step('Select audience', async () => {
          await appsPage.actions.clickBrowseButton();
          await appsPage.actions.selectAudienceFromList(audienceName);
          await appsPage.actions.clickDoneButton();
        });

        await test.step('Submit the integration', async () => {
          await appsPage.actions.clickAddButton();
        });

        await test.step('Verify integration is added successfully', async () => {
          await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName);
        });
      }
    );

    test(
      'verify validation error is displayed when connection name is empty',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that validation error appears when trying to add integration without connection name',
        });

        const integrationName = 'ServiceNow';
        const initialConnectionName = 'Test';
        const audienceName = 'unqlawmodd (1)';

        await test.step('Click Add Integration button', async () => {
          await appsPage.actions.clickAddIntegrationButton();
        });

        await test.step(`Search for ${integrationName}`, async () => {
          await appsPage.actions.searchForIntegration(integrationName);
        });

        await test.step(`Select ${integrationName} from list`, async () => {
          await appsPage.actions.selectIntegrationFromList(integrationName);
        });

        await test.step('Enter and then clear connection name', async () => {
          await appsPage.actions.enterConnectionName(initialConnectionName);
          await appsPage.actions.clearConnectionName();
        });

        await test.step('Select audience', async () => {
          await appsPage.actions.clickBrowseButton();
          await appsPage.actions.selectAudienceFromList(audienceName);
          await appsPage.actions.clickDoneButton();
        });

        await test.step('Try to submit without connection name', async () => {
          await appsPage.actions.clickAddButton();
        });

        await test.step('Verify validation error is displayed', async () => {
          await appsPage.assertions.verifyConnectionNameErrorMessage();
        });
      }
    );

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
        const audienceName = 'unqlawmodd (1)';

        await test.step(`Add first integration with name: ${connectionName1}`, async () => {
          await appsPage.addIntegrationWithDetails(integrationName, connectionName1, audienceName);
          await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName1);
        });

        await test.step('Navigate back to Apps page', async () => {
          await appsPage.actions.navigateToIntegrationsTab();
          await appsPage.actions.navigateToAppsTab();
          await appsPage.verifyThePageIsLoaded();
        });

        await test.step(`Add second integration with name: ${connectionName2}`, async () => {
          await appsPage.addIntegrationWithDetails(integrationName, connectionName2, audienceName);
          await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionName2);
        });
      }
    );

    test(
      'verify special characters are handled in connection name',
      {
        tag: [TestPriority.P3, TestGroupType.REGRESSION],
      },
      async () => {
        tagTest(test.info(), {
          storyId: 'INT-XXXX',
          description: 'verify that connection names with special characters are handled correctly',
        });

        const integrationName = 'ServiceNow';
        const connectionNameWithSpecialChars = `Test@#$_${faker.string.alphanumeric(5)}`;
        const audienceName = 'unqlawmodd (1)';

        await test.step('Add integration with special characters in connection name', async () => {
          await appsPage.addIntegrationWithDetails(integrationName, connectionNameWithSpecialChars, audienceName);
        });

        await test.step('Verify integration is added successfully', async () => {
          await appsPage.assertions.verifyIntegrationIsAddedSuccessfully(connectionNameWithSpecialChars);
        });
      }
    );
  }
);
