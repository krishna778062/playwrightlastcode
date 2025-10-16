import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';
import { DOCEBO_VALUES, REDIRECT_URLS } from '@integrations-test-data/app-tiles.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'docebo App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.DOCEBO, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Docebo';
    const tileName = 'Display learning courses';
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
      'verify users should be able to display pending learning courses from Docebo on a tile on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24660,INT-24671'],
          storyId: 'INT-24422',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_LEARNING_COURSES,
          CONNECTOR_IDS.DOCEBO
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify users should be able to display pending learning courses from Docebo on a tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24661,INT-24670'],
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
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
      'verify UI layout for pending learning courses from Docebo on a tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24676,INT-24677'],
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo reportt ${faker.string.alphanumeric({ length: 6 })}`;

        //add and verify tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_LEARNING_COURSES,
          CONNECTOR_IDS.DOCEBO
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyDoceboContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.DOCEBO);
      }
    );
    test(
      'verify UI layout for pending learning courses from Docebo on a tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28328',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyDoceboContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.DOCEBO);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify users should be able to display pending learning courses from Docebo on a tile on Home dashboard - User defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24666',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithUserDefinedOptions(
          createdTileTitle,
          AppName,
          tileName,
          DOCEBO_VALUES.ENROLLMENT_STATUS,
          DOCEBO_VALUES.COURSE_TYPE,
          DOCEBO_VALUES.ENROLLMENT_LEVEL,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.personalizeTileWithDropdowns(
          createdTileTitle,
          DOCEBO_VALUES.ENROLLMENT_STATUS,
          DOCEBO_VALUES.COMPLETED,
          DOCEBO_VALUES.COURSE_TYPE,
          DOCEBO_VALUES.E_LEARNING,
          DOCEBO_VALUES.ENROLLMENT_LEVEL,
          DOCEBO_VALUES.STUDENT
        );
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyDoceboReportData(createdTileTitle, DOCEBO_VALUES.COMPLETED, DOCEBO_VALUES.E_LEARNING);
      }
    );
    test(
      'verify users should be able to display pending learning courses from Docebo on a tile on Home dashboard - App manager defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24662',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithAppManagerDefined(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_HOME,
          DOCEBO_VALUES.ENROLLMENT_STATUS,
          DOCEBO_VALUES.COMPLETED,
          DOCEBO_VALUES.COURSE_TYPE,
          DOCEBO_VALUES.E_LEARNING,
          DOCEBO_VALUES.ENROLLMENT_LEVEL,
          DOCEBO_VALUES.STUDENT
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyDoceboReportData(createdTileTitle, DOCEBO_VALUES.COMPLETED, DOCEBO_VALUES.E_LEARNING);
      }
    );
    test(
      'verify Show more is visible after 4 courses for pending learning courses from Docebo on a tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24685',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_LEARNING_COURSES,
          CONNECTOR_IDS.DOCEBO
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify Personalize button is visible when clicked on Show more',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28456',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `Docebo report ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithUserDefinedOptions(
          createdTileTitle,
          AppName,
          tileName,
          DOCEBO_VALUES.ENROLLMENT_STATUS,
          DOCEBO_VALUES.COURSE_TYPE,
          DOCEBO_VALUES.ENROLLMENT_LEVEL,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );
  }
);
