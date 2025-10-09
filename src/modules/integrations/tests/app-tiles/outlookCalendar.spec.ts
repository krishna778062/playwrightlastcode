import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CONNECTOR_IDS, REDIRECT_URLS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'Outlook Calendar App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.OUTLOOK_CALENDAR_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { tileManagementHelper, homeDashboard } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify app manager is able to create, edit and remove display upcoming events outlook calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { tileManagementHelper, homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14532',
          storyId: 'INT-13648',
        });

        createdTileTitle = `Outlook Calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.OUTLOOK_CALENDAR
        );

        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify site manager is able to create, edit and remove a outlook calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28327',
          storyId: 'INT-13648',
        });

        createdTileTitle = `Outlook calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTile(
          createdTileTitle,
          'Outlook Calendar',
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
      'verify display upcoming events metadata for outlook calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14448',
          storyId: 'INT-13649',
        });
        createdTileTitle = `Display upcoming events outlook calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.OUTLOOK_CALENDAR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.OUTLOOK_CALENDAR);
      }
    );

    test(
      'verify display upcoming events metadata for outlook calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14447',
          storyId: 'INT-13649',
        });

        createdTileTitle = `Outlook calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTile(
          createdTileTitle,
          'Outlook Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behaviour for display upcoming events outlook calendar apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14444',
          storyId: 'INT-13649',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
          CONNECTOR_IDS.OUTLOOK_CALENDAR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display upcoming events outlook calendar apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14536',
          storyId: 'INT-13649',
        });

        createdTileTitle = `Outlook calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);
        await siteDashboard.addTile(
          createdTileTitle,
          'Outlook Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
