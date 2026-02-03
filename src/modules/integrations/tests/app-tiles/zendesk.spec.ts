import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { CONNECTOR_IDS, TILE_IDS, ZENDESK_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'zendesk apptile integration',
  {
    tag: [IntegrationsSuiteTags.ZENDESK, IntegrationsSuiteTags.ABSOLUTE],
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
      'verify app manager is able to create, edit and remove display open tickets zendesk apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23910, INT-23916',
          storyId: 'INT-22853',
        });

        createdTileTitle = `zendesk display open tickets apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.ZENDESK_DISPLAY_OPEN_TICKETS,
          CONNECTOR_IDS.ZENDESK
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
      'verify site manager is able to create, edit and remove display open tickets zendesk apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23913, INT-23917',
          storyId: 'INT-22853',
        });

        createdTileTitle = `zendesk display open tickets apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, edit, verify
        await siteDashboard.addTile(
          createdTileTitle,
          ZENDESK_VALUES.AppName,
          ZENDESK_VALUES.OpenTicketsTile,
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
      'verify app manager is able to create, edit and remove display submitted requests zendesk apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23911, INT-23917',
          storyId: 'INT-22918',
        });

        createdTileTitle = `zendesk display submitted requests apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.ZENDESK_SUBMITTED_REQUESTS,
          CONNECTOR_IDS.ZENDESK
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
      'verify site manager is able to create, edit and remove display submitted requests zendesk apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23914, INT-23918',
          storyId: 'INT-22918',
        });

        createdTileTitle = `zendesk display submitted requests apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, edit, verify
        await siteDashboard.addTile(
          createdTileTitle,
          ZENDESK_VALUES.AppName,
          ZENDESK_VALUES.SubmittedRequestsTile,
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
      'verify app manager is able to create, edit and remove display unassigned tickets zendesk apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23929, INT-23976',
          storyId: 'INT-22919',
        });

        createdTileTitle = `zendesk display unassigned tickets apptile ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.ZENDESK_DISPLAY_UNASSIGNED_TICKETS,
          CONNECTOR_IDS.ZENDESK
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
      'verify site manager is able to create, edit and remove display unassigned tickets zendesk apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-23966, INT-23977',
          storyId: 'INT-22919',
        });

        createdTileTitle = `zendesk display unassigned tickets apptile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add, edit, verify
        await siteDashboard.addTile(
          createdTileTitle,
          ZENDESK_VALUES.AppName,
          ZENDESK_VALUES.UnassignedTicketsTile,
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
  }
);
