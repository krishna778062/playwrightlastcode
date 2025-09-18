import { faker } from '@faker-js/faker';
import {
  TimeOffCategoryConfig,
  TimeOffRequestTileComponent,
} from '@integrations-components/timeOffRequestTileComponent';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'bambooHR App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.BAMBOOHR, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'BambooHR';
    const ApplyForTimeOff = 'Apply for Time Off';
    const DisplayTimeOffBalance = 'Display Time Off Balance';
    const Vacation = 'Vacation';
    const Sick = 'Sick';
    const CreateAnotherRequest = 'Create another request';

    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ tileManagementHelper, homeDashboard }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'create and edit BambooHR Display Time Off Balance tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23138',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.BAMBOOHR_DISPLAY_TIMEOFF_BALANCE,
          CONNECTOR_IDS.BAMBOOHR
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
      'create and edit BambooHR Display Time Off Balance tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-21575',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
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
      'create and edit BambooHR Apply for Time Off tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23137',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
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
      'create and verify metadata for BambooHR Display Time Off Balance tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-21608',
          storyId: 'INT-22854',
        });
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.BAMBOOHR_DISPLAY_TIMEOFF_BALANCE,
          CONNECTOR_IDS.BAMBOOHR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyDisplayTimeOffBalanceFields(createdTileTitle);
      }
    );

    test(
      'create and edit BambooHR Apply for Time Off tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23138',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.BAMBOOHR_APPLY_TIMEOFF,
          CONNECTOR_IDS.BAMBOOHR
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
      'verify BambooHR Apply for Time Off tile form submission and create another request functionality',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper, page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23143',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create BambooHR Apply for Time Off tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.BAMBOOHR_APPLY_TIMEOFF,
          CONNECTOR_IDS.BAMBOOHR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(page);
        const workingDays = 2;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Vacation);
        await leaveForm.enterComments(comments);
        await leaveForm.verifyTotalDays(workingDays);
        await leaveForm.submitTimeOffRequest();
        await leaveForm.verifyMessageOnTile(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await homeDashboard.verifyToastMessage(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await leaveForm.verifyButton(CreateAnotherRequest);
        await leaveForm.clickButton(CreateAnotherRequest);
        await leaveForm.verifyRequiredFields();
      }
    );

    test(
      'verify BambooHR Apply for Time Off tile form submission and tile removal on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient, page }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23132',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, ApplyForTimeOff, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const leaveForm = new TimeOffRequestTileComponent(page);
        const workingDays = 2;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Vacation);
        await leaveForm.enterComments(comments);
        await leaveForm.verifyTotalDays(workingDays);
        await leaveForm.submitTimeOffRequest();
        await leaveForm.verifyMessageOnTile(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await siteDashboard.verifyToastMessage(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await leaveForm.verifyButton(CreateAnotherRequest);
        await leaveForm.clickButton(CreateAnotherRequest);
        await leaveForm.verifyRequiredFields();
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify edit and remove functionality for BambooHR Display Time Off Balance tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23139',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
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
      'verify form fields for BambooHR Display Time Off Balance tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper, appManagerApiClient }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23131',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyDisplayTimeOffBalanceFields(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify BambooHR Apply for Time Off tile amount calculation for different categories',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper, page }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-23140',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Create BambooHR Apply for Time Off tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.BAMBOOHR_APPLY_TIMEOFF,
          CONNECTOR_IDS.BAMBOOHR
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(page);
        const workingDays = 3;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Vacation);
        await leaveForm.verifyTotalDays(workingDays);

        // Verify individual day amounts and total calculation (weekends will be 0)
        const vacationConfig: TimeOffCategoryConfig = { unit: 'days', amountPerDay: 1 };
        await leaveForm.verifyAmountValues(workingDays, workingDays, vacationConfig);
        await leaveForm.selectTimeOffCategory(Sick);

        // Verify hours mode (Sick category) - no need to click edit when switching categories
        const sickConfig: TimeOffCategoryConfig = { unit: 'hours', amountPerDay: 8 };
        const expectedTotalHours = workingDays * 8; // 3 working days * 8 hours = 24 hours
        await leaveForm.verifyAmountValues(workingDays, expectedTotalHours, sickConfig, false);
      }
    );
  }
);
