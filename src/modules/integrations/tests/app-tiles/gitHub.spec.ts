import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { TEST_TAGS } from '@/src/modules/integrations/constants/testTags';
import {
  CONNECTOR_IDS,
  GITHUB_ORGANIZATIONS,
  REDIRECT_URLS,
  TILE_IDS,
} from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'gitHub App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.GITHUB, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'GitHub';
    const PendingPRs = 'Display pending PR reviews';
    const MyOpenPRs = 'Display my open PRs';

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
      'create and edit GitHub My Open PRs tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24073',
          storyId: 'INT-23629',
        });

        createdTileTitle = `GitHub My Open PRs ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GITHUB_MY_OPEN_PRS,
          CONNECTOR_IDS.GITHUB
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
      'create and verify metadata for GitHub My Open PRs tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24049',
          storyId: 'INT-23629',
        });
        createdTileTitle = `Display my open PRs ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GITHUB_MY_OPEN_PRS,
          CONNECTOR_IDS.GITHUB
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        await homeDashboard.verifyGitHubOpenPRs(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GITHUB);
      }
    );

    test(
      'create and edit GitHub Pending PR Reviews tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24069',
          storyId: 'INT-23629',
        });

        createdTileTitle = `GitHub Pending PR Reviews ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GITHUB_PENDING_PR_REVIEWS,
          CONNECTOR_IDS.GITHUB
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
      'create and verfiy metadata for GitHub Pending PR Reviews tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24071',
          storyId: 'INT-23629',
        });

        // Create HomeDashboard with tileManagementHelper

        createdTileTitle = `GitHub Pending PR Reviews ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GITHUB_PENDING_PR_REVIEWS,
          CONNECTOR_IDS.GITHUB
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        await homeDashboard.verifyGitHubPRTileData(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GITHUB);
      }
    );

    test(
      'create and verfiy personlize button functionality for GitHub Pending PR Reviews tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24084',
          storyId: 'INT-23629',
        });
        createdTileTitle = `GitHub Pending PR Reviews ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          PendingPRs,
          FIELD_NAMES.ORGANIZATION,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(
          createdTileTitle,
          FIELD_NAMES.ORGANIZATION,
          GITHUB_ORGANIZATIONS.SIMPPLR_TEST_ORG
        );
        await homeDashboard.verifyNoResultsWithSettings(createdTileTitle);
        await homeDashboard.clickSettingsAndVerifyPersonalizeModal(createdTileTitle);
      }
    );

    test(
      'create and verfiy personlize button functionality for GitHub My Open PRs tile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24043',
          storyId: 'INT-23629',
        });
        createdTileTitle = `Display my open PRs ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          MyOpenPRs,
          FIELD_NAMES.ORGANIZATION,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.PersonalizeTile(
          createdTileTitle,
          FIELD_NAMES.ORGANIZATION,
          GITHUB_ORGANIZATIONS.SIMPPLR_TEST_ORG
        );
        await homeDashboard.verifyNoResultsWithSettings(createdTileTitle);
        await homeDashboard.clickSettingsAndVerifyPersonalizeModal(createdTileTitle);
      }
    );

    test(
      'verify site manager is able to edit and remove a GitHub Pending PR Reviews tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24070',
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `GitHub Pending PR Reviews ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, PendingPRs, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyGitHubPRTileData(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.GITHUB);
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
      'verify site manager is able to edit and remove a GitHub My Open PRs tile on Site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24048',
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `Display my open PRs ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, MyOpenPRs, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        await siteDashboard.verifyGitHubOpenPRs(updatedTileTitle);
        await siteDashboard.verifyTileRedirects(updatedTileTitle, REDIRECT_URLS.GITHUB);
        createdTileTitle = updatedTileTitle;
        await siteDashboard.removeTile(updatedTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify show more behaviour for Git My Open PRs tile on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25168',
          storyId: 'INT-22854',
        });
        createdTileTitle = `GitHub My Open PRs ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.GITHUB_MY_OPEN_PRS,
          CONNECTOR_IDS.GITHUB
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // verify first 4 signature requests and then click on show more button and verify all signature requests are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify Personalize button is visible when clicked on Show more',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28456',
          storyId: 'INT-24422',
        });

        //Generate a random tile title
        createdTileTitle = `GitHub My Open PRs ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          MyOpenPRs,
          FIELD_NAMES.ORGANIZATION,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );

    test(
      'verify show more behavior for GitHub My Open PRs tile on site dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25169',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `DocuSign report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTile(createdTileTitle, AppName, MyOpenPRs, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify show more behavior
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Personalize button is visible when clicked on Show more for GitHub My Open PRs tile on site dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25169',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `GitHub My Open PRs ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and verify tile
        await siteDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          MyOpenPRs,
          FIELD_NAMES.ORGANIZATION,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify show more behavior
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
