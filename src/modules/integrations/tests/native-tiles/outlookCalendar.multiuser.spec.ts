import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';
import { OUTLOOK_CALENDAR_GROUPS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

test.describe(
  'Outlook Calendar Native Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.OUTLOOK_CALENDAR_NATIVE_TILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    multiUserTileFixture.afterEach(async ({ adminPage, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    multiUserTileFixture(
      'verify Display upcoming events outlook calendar native tile is visible to end users after it has been added by the App Manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28271',
          storyId: 'INT-13643',
        });

        //Generate a random tile title
        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        // Add native tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
        await endUserHomeDashboard.verifyNativeCalendarUpcomingEventsTileData(
          createdTileTitle,
          undefined,
          undefined,
          undefined,
          'Outlook Calendar'
        );
      }
    );

    multiUserTileFixture(
      'Verify Display upcoming events outlook calendar native tile is visible to end users on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28272',
          storyId: 'INT-13643',
        });

        //Generate a random tile title
        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add native tile, verify by both users, then remove
        await siteDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_SITE,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.verifyNativeCalendarUpcomingEventsTileData(
          createdTileTitle,
          undefined,
          undefined,
          undefined,
          'Outlook Calendar'
        );
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
