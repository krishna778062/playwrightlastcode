import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';
import { REDIRECT_URLS } from '@integrations-test-data/app-tiles.test-data';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '../../constants/common';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'docuSign App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.DOCUSIGN, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Docusign';
    const tileName = 'Display Docusign signature requests';
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
      'verify app/site manager is able to edit Display Docusign signature requests App tile  on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25171',
          storyId: 'INT-24586',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `DocuSign report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_DOCUSIGN_SIGNATURE_REQUESTS,
          CONNECTOR_IDS.DOCUSIGN
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
      'verify app/site manager is able to edit Display Docusign signature requests App tile  on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25172',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `DocuSign report ${faker.string.alphanumeric({ length: 6 })}`;

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
      'verify "Display Docusign signature requests" details are visible on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25170',
          storyId: 'INT-24586',
        });

        //Generate a random tile title
        createdTileTitle = `DocuSign report ${faker.string.alphanumeric({ length: 6 })}`;

        //add and verify tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_DOCUSIGN_SIGNATURE_REQUESTS,
          CONNECTOR_IDS.DOCUSIGN
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifyDocuSignContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.DOCUSIGN);
      }
    );
    test(
      'verify "Display Docusign signature requests" details are visible on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
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
        await siteDashboard.addTile(createdTileTitle, AppName, tileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyDocuSignContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.DOCUSIGN);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyToastMessage(MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify show more behaviour for display docuSign tasks apptile on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-25168',
          storyId: 'INT-22854',
        });
        createdTileTitle = `Display DocuSign signature requests ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.DISPLAY_DOCUSIGN_SIGNATURE_REQUESTS,
          CONNECTOR_IDS.DOCUSIGN
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // verify first 4 signature requests and then click on show more button and verify all signature requests are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
  }
);
