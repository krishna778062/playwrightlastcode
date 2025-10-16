import { faker } from '@faker-js/faker';
import { DEFAULT_CUSTOM_APP_TILE_CONFIG } from '@integrations/test-data/customAppTiles.test-data';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { CustomAppTilesPage } from '@/src/modules/integrations/ui/pages/customAppTilesPage';

test.describe(
  'custom App Tiles Management',
  {
    tag: [IntegrationsSuiteTags.CUSTOM_APP_TILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    test(
      'verify Custom App Tiles page loads correctly',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-27020',
          storyId: 'INT-18854',
        });

        const customAppTilesPage = new CustomAppTilesPage(appManagerFixture.page);

        // Generate unique tile data
        const tileName = `Test Tile ${faker.string.alphanumeric({ length: 6 })}`;
        const tileDescription = `Test Description ${faker.lorem.sentence()}`;

        // test data
        const { tileType, app, apiAction, previewButton, nextButton } = DEFAULT_CUSTOM_APP_TILE_CONFIG;

        // Navigate to Custom App Tiles page and verify it loads
        await customAppTilesPage.loadPage();
        await customAppTilesPage.verifyThePageIsLoaded();
        await customAppTilesPage.clickCreateCustomAppTileButton();
        await customAppTilesPage.enterTileName(tileName);
        await customAppTilesPage.enterTileDescription(tileDescription);
        await customAppTilesPage.selectTileType(tileType);
        await customAppTilesPage.selectApp(app);
        await customAppTilesPage.selectApiAction(apiAction);
        await customAppTilesPage.clickButton(nextButton);
        await customAppTilesPage.clickButton(previewButton);
      }
    );
  }
);
