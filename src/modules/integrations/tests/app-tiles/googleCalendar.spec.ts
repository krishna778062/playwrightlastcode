import { faker } from '@faker-js/faker';
import { ACTION_LABELS, UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CONNECTOR_IDS, REDIRECT_URLS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { TEST_EMAIL } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { ExternalAppProvider, ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';

test.describe(
  'google Calendar App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.GOOGLE_CALENDAR_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { homeDashboard, tileManagementHelper } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify app manager is able to create, edit and remove display upcoming events google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Google Calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.GOOGLE_CALENDAR
        );

        //add, edit, verify
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify site manager is able to create, edit and remove a google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-27996',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, edit, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Google Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify display upcoming events metadata for google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14109',
          storyId: 'INT-13642',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;

        //add, verify
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.GOOGLE_CALENDAR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        //verify events UI and redirects
        await homeDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GOOGLE_CALENDAR);
      }
    );

    test(
      'verify display upcoming events metadata for google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14152',
          storyId: 'INT-13642',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Google Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        //verify events UI
        await siteDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behaviour for display upcoming events google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14088',
          storyId: 'INT-13642',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;

        //add, verify
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.GOOGLE_CALENDAR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        //Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display upcoming events google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14087',
          storyId: 'INT-13642',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Google Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        //Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify add tile modal for google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28356',
          storyId: 'INT-13643',
        });

        //add, verify
        const externalAppsPage = new ExternalAppsPage(homeDashboard.page);
        await homeDashboard.openAddAppTileModal(ExternalAppProvider.GOOGLE_CALENDAR);
        //Verify connection message on add tile modal
        await homeDashboard.verifyConnectionMessage(
          'Users will need to connect their ' + ExternalAppProvider.GOOGLE_CALENDAR + ' accounts',
          { connectedEmail: TEST_EMAIL.GOOGLE_CALENDAR }
        );
        //Verify add to home button is disabled
        await homeDashboard.verifyButtonStatus(UI_ACTIONS.DISABLED, UI_ACTIONS.ADD_TO_HOME);
        //Click on my settings and verify the page is loaded
        await homeDashboard.clickDialogLink(ACTION_LABELS.MY_SETTINGS);
        await externalAppsPage.verifyThePageIsLoaded();
        //Verify the integration is connected
        await externalAppsPage.isIntegrationConnected(ExternalAppProvider.GOOGLE_CALENDAR);
      }
    );

    test(
      'verify add tile modal for google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P3],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28357',
          storyId: 'INT-13643',
        });

        //add, verify
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);
        //Verify connection message on add tile modal
        const externalAppsPage = new ExternalAppsPage(siteDashboard.page);
        await siteDashboard.openAddAppTileModal(ExternalAppProvider.GOOGLE_CALENDAR);
        await siteDashboard.verifyConnectionMessage(
          'Users will need to connect their ' + ExternalAppProvider.GOOGLE_CALENDAR + ' accounts',
          { connectedEmail: TEST_EMAIL.GOOGLE_CALENDAR }
        );
        //Verify add to site dashboard button is disabled
        await siteDashboard.verifyButtonStatus(UI_ACTIONS.DISABLED, UI_ACTIONS.ADD_TO_SITE);
        //Click on my settings and verify the page is loaded
        await siteDashboard.clickDialogLink(ACTION_LABELS.MY_SETTINGS);
        await externalAppsPage.verifyThePageIsLoaded();
        //Verify the integration is connected
        await externalAppsPage.isIntegrationConnected(ExternalAppProvider.GOOGLE_CALENDAR);
      }
    );
  }
);
