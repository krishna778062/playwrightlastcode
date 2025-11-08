import { faker } from '@faker-js/faker';
import { TimeOffRequestTileComponent } from '@integrations-components/timeOffRequestTileComponent';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { CONNECTOR_IDS, REDIRECT_URLS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

const CreateAnotherRequest = 'Create another request';
const Vacation = 'Vacation';
const Wedding = 'Wedding';

test.describe(
  'workday App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.WORKDAY, IntegrationsSuiteTags.ABSOLUTE],
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
      'verify app manager is able to create, edit and remove pending learning courses workday apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-21415, INT-21561',
          storyId: 'INT-20803',
        });

        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_DISPLAY_PENDING_LEARNING_COURSES,
          CONNECTOR_IDS.WORKDAY
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
      'verify site manager is able to create, edit and remove pending learning courses workday apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-21416',
          storyId: 'INT-20803',
        });

        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, edit, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Workday',
          'Display pending learning courses',
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
      'verify display pending learning courses metadata for workday apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-21423',
          storyId: 'INT-20801',
        });
        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        //add, verify
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_DISPLAY_PENDING_LEARNING_COURSES,
          CONNECTOR_IDS.WORKDAY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        //verify events UI and redirects
        await homeDashboard.verifyPendingLearningCoursesTileData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.WORKDAY);
      }
    );

    test(
      'verify display pending learning courses metadata for workday apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-21564',
          storyId: 'INT-20801',
        });

        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Workday',
          'Display pending learning courses',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        //verify events UI
        await siteDashboard.verifyPendingLearningCoursesTileData(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behaviour for display pending learning courses workday apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-27858',
          storyId: 'INT-26436',
        });
        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        //add, verify
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_DISPLAY_PENDING_LEARNING_COURSES,
          CONNECTOR_IDS.WORKDAY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        //Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display pending learning courses workday apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-27846',
          storyId: 'INT-26436',
        });

        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Workday',
          'Display pending learning courses',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        //Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify "View all courses in Workday" behaviour for display pending learning courses workday apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-27857',
          storyId: 'INT-26436',
        });
        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        //add, verify
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_DISPLAY_PENDING_LEARNING_COURSES,
          CONNECTOR_IDS.WORKDAY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        //Verify "View all courses in Workday" button is displayed and then click on it and verify the page is redirected to the Workday portal
        await homeDashboard.verifyViewAllCoursesInWorkdayLink(createdTileTitle, REDIRECT_URLS.WORKDAY);
      }
    );

    test(
      'verify "View all courses in Workday" behaviour for display pending learning courses workday apptile on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-22870',
          storyId: 'INT-26436',
        });

        createdTileTitle = `workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, verify
        await siteDashboard.addTile(
          createdTileTitle,
          'Workday',
          'Display pending learning courses',
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        //Verify "View all courses in Workday" button is displayed and then click on it and verify the page is redirected to the Workday portal
        await siteDashboard.verifyViewAllCoursesInWorkdayLink(createdTileTitle, REDIRECT_URLS.WORKDAY);
        createdTileTitle = undefined;
      }
    );

    test(
      'create and edit Workday Apply for Time Off tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-22814, INT-22828, INT-22832',
          storyId: 'INT-21182',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.WORKDAY
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
      'create and edit Workday Apply for Time Off tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, homeDashboard, siteManagementHelper } = appManagerFixture;
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-22813, INT-22829, INT-22833',
          storyId: 'INT-21182',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, 'Workday', 'Apply for Time Off', UI_ACTIONS.ADD_TO_SITE);
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
      'verify Workday Apply for Time Off tile form submission and create another request functionality on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-22836',
          storyId: 'INT-21182',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create Workday Apply for Time Off tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.WORKDAY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(appManagerFixture.page);
        const workingDays = 2;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Vacation);
        await leaveForm.enterComments(comments);
        await leaveForm.verifyTotalHours(workingDays * 8);
        await leaveForm.submitTimeOffRequest();
        await leaveForm.verifyMessageOnTile(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await homeDashboard.verifyToastMessage(MESSAGES.REQUESTED_TIME_OFF_LABEL);
        await leaveForm.verifyButton(CreateAnotherRequest);
        await leaveForm.clickButton(CreateAnotherRequest);
        await leaveForm.verifyRequiredFields();
      }
    );

    test(
      'verify Workday Apply for Time Off tile form submission on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, homeDashboard, siteManagementHelper } = appManagerFixture;
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28928',
          storyId: 'INT-21182',
        });

        //Generate a random tile title
        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const comments = faker.lorem.sentence();

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, 'Workday', 'Apply for Time Off', UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const leaveForm = new TimeOffRequestTileComponent(appManagerFixture.page);
        const workingDays = 2;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Vacation);
        await leaveForm.enterComments(comments);
        await leaveForm.verifyTotalHours(workingDays * 8);
        await leaveForm.submitTimeOffRequest();
        await leaveForm.verifyMessageOnTile(MESSAGES.REQUESTED_TIME_OFF_ERROR_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REQUESTED_TIME_OFF_ERROR_LABEL);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Edit amount button functionality for Workday Apply for Time Off on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, TestGroupType.SMOKE, '@workday-multiuser'],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-22964',
          storyId: 'INT-21182',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile and open form
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.WORKDAY_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.WORKDAY
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(appManagerFixture.page);

        // Select current/next working day range 2 working days total
        const workingDays = 2;
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(Wedding);
        await leaveForm.verifyTotalDays(workingDays);

        // Click Edit amount and verify split amounts
        await leaveForm.verifyAmountValues(workingDays, workingDays, { unit: 'days', amountPerDay: 1 });
      }
    );
  }
);
