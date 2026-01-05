import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { REDIRECT_URLS } from '../../test-data/app-tiles.test-data';

import {
  ACTION_LABELS,
  FIELD_NAMES,
  ORGANIZATION_SETTINGS,
  UI_ACTIONS,
} from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';

test.describe(
  'asana App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.ASANA, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Asana';
    const DisplayRecentTasks = 'Display recent tasks';
    const DisplayTeamGoals = 'Display team goals';
    const WorkspaceIDOption = 'Workspace ID';
    const WorkspaceID = '486859659301136';
    const TeamIDOption = 'Team ID';
    const TeamID = '1209399125931640';

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
      'create and edit Asana Display Recent Tasks tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23106', 'INT-23103'],
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'create and edit Asana Display Recent Tasks tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23107', 'INT-23108'],
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
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
      'create and edit Asana Display team goals tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26445', 'INT-23104'],
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'create and edit Asana Display team goals tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26444',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
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
      'verify the Display recent tasks details are visible on Home dashboard by app manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23435',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyTileHasTaskData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.ASANA);
      }
    );

    test(
      'verify the Display recent tasks details are visible on Site dashboard by app manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25190',
          storyId: 'INT-22854',
        });

        //Generate a random tile title
        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyTileHasTaskData(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.ASANA);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify app manager defined for Asana Display Recent Tasks tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26920',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTilewithManagerDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.APP_MANAGER_DEFINED,
          ACTION_LABELS.COMPLETED,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await homeDashboard.verifyTileHasTaskData(createdTileTitle);
      }
    );
    test(
      'verify display recent tasks details Personalize button is visible on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23687',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTilewithUserDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.USER_DEFINED,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyTileHasTaskData(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, ACTION_LABELS.COMPLETED);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify the Display team goals details are visible on Home dashboard by app manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26450', 'INT-26451'],
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        // Verify team goals metadata is showing
        await homeDashboard.verifyTeamGoalsMetadata(createdTileTitle);
        // Verify tile redirects to Asana recent tasks page
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.ASANA);
      }
    );

    test(
      'verify show more behavior for Asana Display team goals on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26454',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        // Verify first 4 goals are displayed and then click on show more button and verify all goals are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        // Verify team goals metadata is showing after clicking on show more button
        await homeDashboard.verifyTeamGoalsMetadata(createdTileTitle);
      }
    );

    test(
      'verfiy show more behavior for Asana Display Recent Tasks on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26456',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyTileHasTaskData(createdTileTitle);
      }
    );

    test(
      'verify personalize and show more behavior for Asana Display Recent Tasks tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23687',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Add, edit, and remove tile
        await homeDashboard.addTilewithUserDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.USER_DEFINED,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, ACTION_LABELS.COMPLETED);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify app manager defined for Asana Display Recent Tasks tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29052',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addTilewithManagerDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.SITE_MANAGER_DEFINED,
          ACTION_LABELS.COMPLETED,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await siteDashboard.verifyTileHasTaskData(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify display recent tasks details Personalize button is visible on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26446',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addTilewithUserDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.USER_DEFINED,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyTileHasTaskData(createdTileTitle);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, ACTION_LABELS.COMPLETED);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Asana Display team goals metadata on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26451',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyTeamGoalsMetadata(createdTileTitle);
        // Verify tile redirects to Asana team goals page
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.ASANA);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behavior for Asana Display team goals on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26453',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Team Goals ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTileWithTextField(
          createdTileTitle,
          AppName,
          DisplayTeamGoals,
          WorkspaceIDOption,
          WorkspaceID,
          TeamIDOption,
          TeamID,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        // Verify first 4 goals are displayed and then click on show more button and verify all goals are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        // Verify team goals metadata is showing after clicking on show more button
        await siteDashboard.verifyTeamGoalsMetadata(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behavior for Asana Display Recent Tasks on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-26457',
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addTileWithUrlField(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        await siteDashboard.verifyTileHasTaskData(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify personalize and show more behavior for Asana Display Recent Tasks tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26446', 'INT-26458'],
          storyId: 'INT-22854',
        });

        createdTileTitle = `Display Recent Tasks ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addTilewithUserDefined(
          createdTileTitle,
          AppName,
          DisplayRecentTasks,
          WorkspaceIDOption,
          WorkspaceID,
          FIELD_NAMES.STATUS,
          ORGANIZATION_SETTINGS.USER_DEFINED,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        // Verify show more behavior is working properly and personalize button is visible
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        // Personalize the tile and verify the tasks are showing with the personalized status
        await siteDashboard.PersonalizeTile(createdTileTitle, FIELD_NAMES.STATUS, ACTION_LABELS.COMPLETED);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyTasksWithStatusShowing(createdTileTitle, ACTION_LABELS.COMPLETED);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
