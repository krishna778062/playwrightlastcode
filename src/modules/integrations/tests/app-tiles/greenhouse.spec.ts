import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '../../constants/common';
import { GREENHOUSE_VALUES } from '../../test-data/app-tiles.test-data';

import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
// import { GREENHOUSE_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';

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

    test(
      'verify App Admin is able to add Greenhouse job postings from a tile on Home Dashboard with All selected for Job Type',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-25356'],
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
  }
);
