import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'Docebo App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.DOCEBO, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ homeDashboard, tileManagementHelper }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify users should be able to display pending learning courses from Docebo on a tile on Home dashboard',
      {
        tag: [TestPriority.P4, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24660',
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
  }
);
