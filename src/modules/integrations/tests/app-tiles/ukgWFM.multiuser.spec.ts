import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/api/helpers/tileApiHelpers';
import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { SiteDashboard } from '@/src/modules/integrations/pages/siteDashboard';

test.describe(
  'UKG Pro App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.UKG_WFM, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'UKG Pro Workforce Management';
    const ApplyForTimeOff = 'Apply for time off';
    const DisplayUpcomingSchedule = 'Display upcoming schedule';
    const ScheduleUrl = 'https://simpplr-dev.cfn.mykronos.com/wfd/ess/myschedule';
    const AppManagerDefined = 'App manager defined';
    const ScheduleUrlOption = 'Schedule URL';
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
      'multi-user tile management for UKG Pro Workforce Management Apply for Time Off app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28158',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for time off ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, ApplyForTimeOff, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'site Manager creates site with UKG Pro Apply for Time Off tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, appManagerApiClient }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28159',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for time off ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, ApplyForTimeOff, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'multi-user tile management for UKG Pro Display upcoming schedule app tile - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P7, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28160',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display upcoming schedule ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTilewithAppManagerDefined(
          createdTileTitle,
          AppName,
          DisplayUpcomingSchedule,
          AppManagerDefined,
          ScheduleUrlOption,
          ScheduleUrl,
          UI_ACTIONS.ADD_TO_HOME
        );
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'site Manager creates site with UKG Pro Display upcoming schedule tile, End User verifies, Site Manager deletes tile and deactivates site',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, appManagerApiClient }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28161',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display upcoming schedule ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage);

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        createdTileTitle = `UKG WFM Display upcoming schedule ${faker.string.alphanumeric({ length: 6 })}`;
        await siteDashboard.addTilewithAppManagerDefined(
          createdTileTitle,
          AppName,
          DisplayUpcomingSchedule,
          AppManagerDefined,
          ScheduleUrlOption,
          ScheduleUrl,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
