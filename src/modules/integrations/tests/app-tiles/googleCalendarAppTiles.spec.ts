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
  'google Calendar App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.GOOGLE_CALENDAR_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;
    let cleanupCtx: { location: 'home' | 'site'; siteId?: string } | undefined;
    test.afterEach(async ({ homeDashboard, siteDashboard, tileManagementHelper }) => {
      if (!createdTileTitle) return;

      const tasks =
        cleanupCtx?.location === 'site' && cleanupCtx.siteId
          ? [
              siteDashboard.navigateToSite(cleanupCtx.siteId),
              siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE),
              siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE),
            ]
          : [
              tileManagementHelper.removeIntegrationAppTile(createdTileTitle),
              homeDashboard.verifyTileRemoved(createdTileTitle),
            ];
      await Promise.allSettled(tasks);
      createdTileTitle = undefined;
      cleanupCtx = undefined;
    });

    test(
      'verify app manager is able to create, edit and remove display upcoming events google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24130',
          storyId: 'INT-23049',
        });

        createdTileTitle = `Google Calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;
        cleanupCtx = { location: 'home' };

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CALENDAR_APPTILES,
          CONNECTOR_IDS.GOOGLE_CALENDAR_APPTILES
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
      'verify site manager is able to create, edit and remove a google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);
        cleanupCtx = { location: 'site', siteId: createdSite.siteId };

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
      }
    );

    test(
      'verify display upcoming events metadata for google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24049',
          storyId: 'INT-23629',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;
        cleanupCtx = { location: 'home' };

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CALENDAR_APPTILES,
          CONNECTOR_IDS.GOOGLE_CALENDAR_APPTILES
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GOOGLE_CALENDAR);
      }
    );

    test(
      'verify display upcoming events metadata for google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);
        cleanupCtx = { location: 'site', siteId: createdSite.siteId };

        await siteDashboard.addTile(
          createdTileTitle,
          'Google Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyCalendarUpcomingEventsTileData(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display upcoming events google calendar apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24049',
          storyId: 'INT-23629',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;
        cleanupCtx = { location: 'home' };
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GOOGLE_CALENDAR_APPTILES,
          CONNECTOR_IDS.GOOGLE_CALENDAR_APPTILES
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display upcoming events google calendar apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24182',
          storyId: 'INT-23049',
        });

        createdTileTitle = `Google calendar apptile ${faker.string.alphanumeric({ length: 6 })}`;
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);
        cleanupCtx = { location: 'site', siteId: createdSite.siteId };
        await siteDashboard.addTile(
          createdTileTitle,
          'Google Calendar',
          'Display upcoming events',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
  }
);
