import { faker } from '@faker-js/faker';
import { TimeOffRequestTileComponent } from '@integrations-components/timeOffRequestTileComponent';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, REDIRECT_URLS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'UKG WFM App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.UKG_WFM, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'UKG Pro Workforce Management';
    const ApplyForTimeOff = 'Apply for time off';
    const DisplayUpcomingSchedule = 'Display upcoming schedule';
    const Full = 'Full';
    const RequestTimeOff = 'Request time off';
    const TimeOffRequest = 'Time Off Request';
    const VolunteerToLeaveRequest = 'Volunteer to Leave Request';
    const Duration = 'Duration';
    const CommentType = 'Comment type';
    const RequestType = 'Request type';
    const ScheduleUrl = 'https://simpplr-dev.cfn.mykronos.com/wfd/ess/myschedule';
    const AppManagerDefined = 'Site manager defined';
    const ScheduleUrlOption = 'Schedule URL';

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
      'create and edit UKG WFM Apply for Time Off tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23138',
          storyId: 'INT-22854',
        });

        createdTileTitle = `UKG WFM Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.UKG_WFM_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.UKG_WFM
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
      'verify UKG WFM Apply for Time Off tile form submission and create another request functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23143',
          storyId: 'INT-22854',
        });

        createdTileTitle = `UKG WFM Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create BambooHR Apply for Time Off tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.UKG_WFM_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.UKG_WFM
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(appManagerFixture.page);
        const workingDays = 2;

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.clickRequestButton(RequestTimeOff);
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectRequestType(RequestType, VolunteerToLeaveRequest);
        await leaveForm.selectRequestType(Duration, Full);
        await leaveForm.selectRequestType(CommentType, TimeOffRequest);
        await leaveForm.enterCommentNote(comments);
        await leaveForm.submitTimeOffRequest();
      }
    );

    test(
      'verify edit and remove functionality for UKG WFM Apply for Time Off tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23139',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `UKG WFM Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, ApplyForTimeOff, UI_ACTIONS.ADD_TO_SITE);
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
      'verify UKG WFM Apply for Time Off tile form submission and tile removal on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23132',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `UKG WFM Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, ApplyForTimeOff, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const leaveForm = new TimeOffRequestTileComponent(appManagerFixture.page);
        const workingDays = 2;

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.clickRequestButton(RequestTimeOff);
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectRequestType(RequestType, VolunteerToLeaveRequest);
        await leaveForm.selectRequestType(Duration, Full);
        await leaveForm.selectRequestType(CommentType, TimeOffRequest);
        await leaveForm.enterCommentNote(comments);
        await leaveForm.submitTimeOffRequest();
        createdTileTitle = undefined;
      }
    );

    test(
      'create and edit UKG WFM Display upcoming schedule tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23138',
          storyId: 'INT-22854',
        });

        createdTileTitle = `UKG WFM Display upcoming schedule ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.UKG_WFM_DISPLAY_UPCOMING_SCHEDULE,
          CONNECTOR_IDS.UKG_WFM,
          { scheduleUrl: ScheduleUrl }
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
      'create and edit UKG WFM Display upcoming schedule tile on site dashboard with site manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23138',
          storyId: 'INT-22854',
        });

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

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
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify metadata for UKG WFM Display upcoming schedule tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23693',
          storyId: 'INT-22854',
        });

        createdTileTitle = `UKG WFM Display upcoming schedule ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTileWithSettings(
          createdTileTitle,
          TILE_IDS.UKG_WFM_DISPLAY_UPCOMING_SCHEDULE,
          CONNECTOR_IDS.UKG_WFM,
          { scheduleUrl: ScheduleUrl }
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyScheduleTileMetadata(createdTileTitle);
        await homeDashboard.clickShowAllAndVerifyRedirect(createdTileTitle, REDIRECT_URLS.UKG_WFM);
      }
    );

    test(
      'verify metadata for UKG WFM Display upcoming schedule tile on site dashboard with site manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23186',
          storyId: 'INT-22854',
        });

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

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
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyScheduleTileMetadata(createdTileTitle);
        await siteDashboard.clickShowAllAndVerifyRedirect(createdTileTitle, REDIRECT_URLS.UKG_WFM);
        createdTileTitle = undefined;
      }
    );
  }
);
