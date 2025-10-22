import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ConfluenceHelper } from '../../apis/helpers/confluenceHelper';
import { multiUserTileFixture } from '../../fixtures/multiUserTileFixture';
import { ExternalAppProvider, ExternalAppsPage } from '../../ui/pages/externalAppsPage';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { SupportAndTicketingPage } from '@/src/modules/integrations/ui/pages/supportAndTicketingPage';

test.describe(
  'confluence test cases',
  {
    tag: [
      IntegrationsSuiteTags.INTEGRATIONS,
      IntegrationsSuiteTags.PHOENIX,
      IntegrationsSuiteTags.CONFLUENCE,
      IntegrationsFeatureTags.CONFLUENCE,
    ],
  },
  () => {
    test(
      'verify confluence App & User Level Disconnection & Connection Flow for App Manager',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11032, INT-11041, INT-11040, INT-11037, INT-11033, INT-11035, INT-11030',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Verify App Level Connection & Disconnection Flow
        await supportAndTicketingPage.actions.clickDisconnectConfluenceButton();
        await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountIsDisconnected();
        await supportAndTicketingPage.actions.connectConfluenceServiceAccount();
        await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();

        // navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();

        // Verify User Level Connection & Disconnection Flow
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
        await externalAppsPage.actions.connectConfluenceServiceAccount();
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
        await externalAppsPage.actions.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
        await externalAppsPage.actions.connectConfluenceServiceAccount();
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
      }
    );

    test(
      'verify Confluence Custom knowledge base name',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11017, 11018',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Verify App Level Connection
        const isConnected = await supportAndTicketingPage.assertions.isConfluenceServiceAccountConnected();
        if (!isConnected) {
          await supportAndTicketingPage.actions.connectConfluenceServiceAccount();
          await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();
        }

        // Navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();

        // check if User Level Connection is connected
        const isUserLevelConnected = await externalAppsPage.assertions.isIntegrationConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE
        );
        if (!isUserLevelConnected) {
          await externalAppsPage.actions.connectConfluenceServiceAccount();
          await externalAppsPage.assertions.verifyIntegrationIsConnected(
            ExternalAppProvider.ATLASSIAN_CONFLUENCE,
            true
          );
        }

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.actions.selectCustomKnowledgeBaseWithName('Test Knowledge Base');

        // Search for Overview
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm('Overview', {
          stepInfo: `Searching with term "Overview" and intent is to find the content`,
        });

        await globalSearchResultPage.verifyThePageIsLoaded();
        // Verify Confluence Knowledge Base Name in Search Results
        await new ConfluenceHelper(appManagerFixture.page).verifyConfluenceKnowledgeBaseNameInSearchResults(
          'Test Knowledge Base',
          globalSearchResultPage
        );

        // Cleanup
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();
        await supportAndTicketingPage.actions.selectDefaultKnowledgeBase();
      }
    );

    test(
      'verify Confluence Custom knowledge base name with Same Name as Default',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11019',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.actions.selectCustomKnowledgeBaseWithName('Confluence knowledge base');

        // Search for Overview
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm('Overview', {
          stepInfo: `Searching with term "Overview" and intent is to find the content`,
        });

        await globalSearchResultPage.verifyThePageIsLoaded();
        // Verify Confluence Knowledge Base Name in Search Results
        await new ConfluenceHelper(appManagerFixture.page).verifyConfluenceKnowledgeBaseNameInSearchResults(
          'Confluence knowledge base',
          globalSearchResultPage
        );
      }
    );

    test(
      'verify Confluence Custom knowledge base name with blank value',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11020',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.actions.selectCustomKnowledgeBaseWithName('');
        await supportAndTicketingPage.assertions.verifyCustomKnowledgeBaseNameIsRequired();
        await supportAndTicketingPage.actions.selectDefaultKnowledgeBase();
      }
    );

    test(
      'verify Confluence Select spaces without selecting any space',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11026',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Select Search Spaces Radio Button
        await supportAndTicketingPage.actions.selectSpecificSpacesOption();
        await supportAndTicketingPage.assertions.verifySearchSpaceSelectionIsRequired();
      }
    );

    test(
      'verify App level Disconnection by unchecking the checkbox',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11031',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Verify App Level Disconnection by unchecking the checkbox
        await supportAndTicketingPage.actions.toggleConfluenceIntegration();
        await supportAndTicketingPage.assertions.verifyConfluenceIntegrationCheckboxState(false);
      }
    );

    test(
      'verify App level Connection by checking the checkbox',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11031, INT-11010',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Verify App Level Connection by checking the checkbox
        await supportAndTicketingPage.actions.toggleConfluenceIntegration();
        await supportAndTicketingPage.assertions.verifyConfluenceIntegrationCheckboxState(true);

        await supportAndTicketingPage.actions.connectConfluenceServiceAccount();
        await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();
      }
    );

    test(
      'verify Confluence user level connection with incorrect credentials',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: '11039',
        });

        // navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();

        // Verify User Level Connection with incorrect credentials
        if (await externalAppsPage.assertions.isIntegrationConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE)) {
          await externalAppsPage.actions.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        }
        await externalAppsPage.actions.connectConfluenceServiceAccount(true);
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
      }
    );

    multiUserTileFixture(
      'verify confluence User Level Connection & Disconnection Flow for End User',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-11042, INT-11036',
        });

        // Admin user - Verify Confluence is connected at app level
        const adminExternalAppsPage = new ExternalAppsPage(adminPage);
        await adminExternalAppsPage.actions.navigateToExternalAppsPage();
        await adminExternalAppsPage.assertions.verifyThePageIsLoaded();
        await adminExternalAppsPage.assertions.isIntegrationConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE);

        // End user - Verify User Level Connection & Disconnection Flow
        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.actions.navigateToExternalAppsPage();
        await endUserExternalAppsPage.assertions.verifyThePageIsLoaded();

        // Verify end user can connect Confluence
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          false
        );
        await endUserExternalAppsPage.actions.connectConfluenceServiceAccount();
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          true
        );

        // Verify end user can disconnect Confluence
        await endUserExternalAppsPage.actions.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          false
        );

        // Verify end user can reconnect Confluence
        await endUserExternalAppsPage.actions.connectConfluenceServiceAccount();
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          true
        );
      }
    );
  }
);
