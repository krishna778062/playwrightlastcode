import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '../../constants/common';
import { GREENHOUSE_VALUES } from '../../test-data/app-tiles.test-data';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { REDIRECT_URLS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'greenhouse App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.GREENHOUSE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Greenhouse';
    const tileName = 'Display job postings';
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { homeDashboard, tileManagementHelper } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test.fixme(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with All selected for Job Type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25356', 'INT-25368', 'INT-25370'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_HOME,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.ALL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with App Manager Defined as External',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25358'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with App Manager Defined as Internal',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25360'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.INTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test.fixme(
      'verify App Admin is able to add Greenhouse job postings from a tile on Site Dashboard with All selected for Job Type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28629', 'INT-28631'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          tileName,
          UI_ACTIONS.ADD_TO_SITE,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.ALL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        createdTileTitle = undefined;
      }
    );
    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Site Dashboard with App Manager Defined as External',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28630'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
        createdTileTitle = undefined;
      }
    );
    test(
      'verify UI layout for Greenhouse App Tiles on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28686', 'INT-28687', 'INT-25372'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse  report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyGreenhouseContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GREENHOUSE);
      }
    );
    test(
      'verify UI layout for Greenhouse App Tiles on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28688', 'INT-28689'],
          storyId: 'INT-24587',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyGreenhouseContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GREENHOUSE);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify Show more is visible after 4 courses for pending learning courses from Greenhouse on a tile',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28910',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify Show more is visible after 4 courses for pending learning courses from Greenhouse on a tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28911',
          storyId: 'INT-24587',
        });

        //Generate a random tile title
        createdTileTitle = `Greenhouse report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTileWithDropdownAndField(
          createdTileTitle,
          AppName,
          tileName,
          GREENHOUSE_VALUES.JOB_TYPE,
          GREENHOUSE_VALUES.EXTERNAL,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN,
          GREENHOUSE_VALUES.JOB_BOARD_TOKEN_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
