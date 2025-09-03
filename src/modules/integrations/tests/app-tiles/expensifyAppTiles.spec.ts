import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';
import { CONNECTOR_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { HomeDashboard } from '@/src/modules/integrations/pages/homeDashboard';
import { faker } from '@faker-js/faker';
import { LoginHelper } from '@core/helpers/loginHelper';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

const expensifyUser: UserCredentials = {
  email: process.env.QA_SYSTEM_ADMIN_USERNAME!,
  password: process.env.QA_SYSTEM_ADMIN_PASSWORD!,
};

test.describe(
  'Expensify App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.EXPENSIFY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let createdTileTitle: string | undefined = undefined;

    test.beforeEach(async ({ page, tileManagementHelper }) => {
      await LoginHelper.loginWithPassword(page, expensifyUser);
    });

    test.afterEach(async ({ page, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        await homeDashboard.removeTileThroughApi(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'Create and edit Expensify tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ page, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24799',
          storyId: 'INT-24430',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `Expensify report ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.createAppTileViaApi(createdTileTitle, CONNECTOR_IDS.EXPENSIFY);
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
  }
);
