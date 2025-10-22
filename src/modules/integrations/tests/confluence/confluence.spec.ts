import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

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
    tag: [IntegrationsSuiteTags.INTEGRATIONS, IntegrationsSuiteTags.PHOENIX],
  },
  () => {
    test(
      'verify confluence App & User Level Disconnection & Connection Flow for App Manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11032, INT-11041, INT-11040, INT-11037, INT-11033, INT-11035, INT-11030',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Verify App Level Connection & Disconnection Flow
        await supportAndTicketingPage.clickDisconnectConfluenceButton();
        await supportAndTicketingPage.verifyConfluenceServiceAccountIsDisconnected();
        await supportAndTicketingPage.connectConfluenceServiceAccount();
        await supportAndTicketingPage.verifyConfluenceServiceAccountConnected();

        // navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();

        // Verify User Level Connection & Disconnection Flow
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
        await externalAppsPage.connectConfluenceServiceAccount();
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
        await externalAppsPage.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
        await externalAppsPage.connectConfluenceServiceAccount();
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
      }
    );

    test(
      'verify Confluence Custom knowledge base name',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11017, 11018',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Verify App Level Connection
        const isConnected = await supportAndTicketingPage.isConfluenceServiceAccountConnected();
        if (!isConnected) {
          await supportAndTicketingPage.connectConfluenceServiceAccount();
          await supportAndTicketingPage.verifyConfluenceServiceAccountConnected();
        }

        // Navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();

        // check if User Level Connection is connected
        const isUserLevelConnected = await externalAppsPage.isIntegrationConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE
        );
        if (!isUserLevelConnected) {
          await externalAppsPage.connectConfluenceServiceAccount();
          await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
        }

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.selectConfluenceCustomKnowledgeBaseRadioBtn('Test Knowledge Base');

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
        await supportAndTicketingPage.verifyThePageIsLoaded();
        await supportAndTicketingPage.selectConfluenceDefaultKnowledgeBaseRadioBtn();
      }
    );

    test(
      'verify Confluence Custom knowledge base name with Same Name as Default',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11019',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.selectConfluenceCustomKnowledgeBaseRadioBtn('Confluence knowledge base');

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
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11020',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Select Custom Knowledge Base Radio Button
        await supportAndTicketingPage.selectConfluenceCustomKnowledgeBaseRadioBtn('');
        await supportAndTicketingPage.verifyBlankCustomNameForConfluence();
        await supportAndTicketingPage.selectConfluenceDefaultKnowledgeBaseRadioBtn();
      }
    );

    test(
      'verify Confluence Select spaces without selecting any space',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11026',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Select Search Spaces Radio Button
        await supportAndTicketingPage.selectConfluenceSelectedSpacesRadioBtn();
        await supportAndTicketingPage.verifyNotSelectingSearchSpaceForConfluence();
      }
    );

    test(
      'verify App level Disconnection by unchecking the checkbox',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11031',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Verify App Level Disconnection by unchecking the checkbox
        await supportAndTicketingPage.clickOnConfluenceCheckbox();
        await supportAndTicketingPage.verifyConfluenceCheckboxState(false);
      }
    );

    test(
      'verify App level Connection by checking the checkbox',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-11031, INT-11010',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(appManagerFixture.page);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.verifyThePageIsLoaded();

        // Verify App Level Connection by checking the checkbox
        await supportAndTicketingPage.clickOnConfluenceCheckbox();
        await supportAndTicketingPage.verifyConfluenceCheckboxState(true);

        await supportAndTicketingPage.connectConfluenceServiceAccount();
        await supportAndTicketingPage.verifyConfluenceServiceAccountConnected();
      }
    );

    test(
      'verify Confluence user level connection with incorrect credentials',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: '11039',
        });

        // navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();

        // Verify User Level Connection with incorrect credentials
        if (await externalAppsPage.isIntegrationConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE)) {
          await externalAppsPage.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        }
        await externalAppsPage.connectConfluenceServiceAccount(true);
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
      }
    );

    multiUserTileFixture(
      'verify confluence User Level Connection & Disconnection Flow for End User',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.CONFLUENCE],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-11042, INT-11036',
        });

        // Admin user - Verify Confluence is connected at app level
        const adminExternalAppsPage = new ExternalAppsPage(adminPage);
        await adminExternalAppsPage.navigateToExternalAppsPage();
        await adminExternalAppsPage.verifyThePageIsLoaded();
        await adminExternalAppsPage.isIntegrationConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE);

        // End user - Verify User Level Connection & Disconnection Flow
        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);
        await endUserExternalAppsPage.navigateToExternalAppsPage();
        await endUserExternalAppsPage.verifyThePageIsLoaded();

        // Verify end user can connect Confluence
        await endUserExternalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);
        await endUserExternalAppsPage.connectConfluenceServiceAccount();
        await endUserExternalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);

        // Verify end user can disconnect Confluence
        await endUserExternalAppsPage.disconnectIntegration(ExternalAppProvider.ATLASSIAN_CONFLUENCE);
        await endUserExternalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, false);

        // Verify end user can reconnect Confluence
        await endUserExternalAppsPage.connectConfluenceServiceAccount();
        await endUserExternalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);
      }
    );
  }
);
