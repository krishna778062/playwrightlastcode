import { IntegrationsFeatureTags, IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { multiUserTileFixture } from '../../fixtures/multiUserTileFixture';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { ExternalAppProvider, ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';
import { SupportAndTicketingPage } from '@/src/modules/integrations/ui/pages/supportAndTicketingPage';

test.describe(
  'confluence test cases',
  {
    tag: [
      IntegrationsSuiteTags.INTEGRATIONS,
      IntegrationsSuiteTags.PHOENIX,
      IntegrationsSuiteTags.CONFLUENCE,
      IntegrationsFeatureTags.CONFLUENCE,
      IntegrationsFeatureTags.RECONNECT_AND_CHANGE_USER,
    ],
  },
  () => {
    test.setTimeout(300000);
    multiUserTileFixture(
      'verify confluence change user flow',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SANITY,
          TestGroupType.SMOKE,
          IntegrationsSuiteTags.CONFLUENCE,
          IntegrationsFeatureTags.RECONNECT_AND_CHANGE_USER,
        ],
      },
      async ({ adminPage, endUserPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-27395, INT-27391, INT-27390',
        });

        const supportAndTicketingPage = new SupportAndTicketingPage(adminPage);

        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Verify "Change user" is visible when Account is connected
        const isConfluenceServiceAccountConnected =
          await supportAndTicketingPage.assertions.isConfluenceServiceAccountConnected();
        if (!isConfluenceServiceAccountConnected) {
          await supportAndTicketingPage.assertions.verifyConfluenceChangeUserButtonIsVisible(false);
          await supportAndTicketingPage.actions.connectConfluenceServiceAccount();
          await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();
        } else {
          // Disconnect Confluence Service Account and verify "Change user" is not visible
          await supportAndTicketingPage.actions.disconnectConfluenceServiceAccount();
          await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountIsDisconnected();
          await supportAndTicketingPage.assertions.verifyConfluenceChangeUserButtonIsVisible(false);
          await supportAndTicketingPage.actions.connectConfluenceServiceAccount();
          await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();
          await supportAndTicketingPage.assertions.verifyConfluenceChangeUserButtonIsVisible(true);
        }

        // navigate to external apps page
        const externalAppsPage = new ExternalAppsPage(adminPage);
        const endUserExternalAppsPage = new ExternalAppsPage(endUserPage);

        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();

        // Verify User Level Connection of confluence for admin user and end user
        const isConfluenceConnectedForAdmin = await externalAppsPage.assertions.isIntegrationConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE
        );
        if (!isConfluenceConnectedForAdmin) {
          await externalAppsPage.actions.connectConfluenceServiceAccount();
          await externalAppsPage.assertions.verifyIntegrationIsConnected(
            ExternalAppProvider.ATLASSIAN_CONFLUENCE,
            true
          );
        }

        // Verify User Level Connection of confluence for end user
        await endUserExternalAppsPage.actions.navigateToExternalAppsPage();
        await endUserExternalAppsPage.assertions.verifyThePageIsLoaded();
        const isConfluenceConnectedForEndUser = await endUserExternalAppsPage.assertions.isIntegrationConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE
        );
        if (!isConfluenceConnectedForEndUser) {
          await endUserExternalAppsPage.actions.connectConfluenceServiceAccount();
          await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
            ExternalAppProvider.ATLASSIAN_CONFLUENCE,
            true
          );
        }
        // Navigate to Support and Ticketing page
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        // Change User Confluence Service Account
        await supportAndTicketingPage.actions.changeUserConfluenceServiceAccount();
        await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();

        // verify user level connection are connected for all users
        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);

        // Also check for end user user level connection are connected
        await endUserExternalAppsPage.actions.navigateToExternalAppsPage();
        await endUserExternalAppsPage.assertions.verifyThePageIsLoaded();
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          true
        );

        // Verify "Change user" with invalid credentials, Expected: OAuth fails; original token unchanged; connections preserved.
        await supportAndTicketingPage.navigateToSupportAndTicketingPage();
        await supportAndTicketingPage.assertions.verifyThePageIsLoaded();

        await supportAndTicketingPage.actions.changeUserConfluenceServiceAccount(true);
        await supportAndTicketingPage.assertions.verifyConfluenceServiceAccountConnected();

        await externalAppsPage.actions.navigateToExternalAppsPage();
        await externalAppsPage.assertions.verifyThePageIsLoaded();
        await externalAppsPage.assertions.verifyIntegrationIsConnected(ExternalAppProvider.ATLASSIAN_CONFLUENCE, true);

        await endUserExternalAppsPage.actions.navigateToExternalAppsPage();
        await endUserExternalAppsPage.assertions.verifyThePageIsLoaded();
        await endUserExternalAppsPage.assertions.verifyIntegrationIsConnected(
          ExternalAppProvider.ATLASSIAN_CONFLUENCE,
          true
        );
      }
    );
  }
);
