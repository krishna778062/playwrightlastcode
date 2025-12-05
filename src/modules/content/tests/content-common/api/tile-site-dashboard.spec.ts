import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { TileApiHelper } from '@/src/modules/content/apis/apiValidation/tileApiHelper';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { TILE_TEST_DATA } from '@/src/modules/content/test-data/tile.test-data';

test.describe(
  '@Site Dashboard API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let tileApiHelper: TileApiHelper;
    let createdTileIds: Array<{ siteId: string; tileId: string }> = [];

    test.beforeEach(async () => {
      tileApiHelper = new TileApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all created tiles
      for (const { siteId, tileId } of createdTileIds) {
        try {
          await appManagerApiFixture.tileManagementHelper.deleteSiteDashboardTile(siteId, tileId);
        } catch (error) {
          console.warn(`Failed to delete tile ${tileId} from site ${siteId}:`, error);
        }
      }
      createdTileIds = [];
    });

    test(
      'creating Custom People tile on Public Site Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-13054'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating Custom People tile on Public Site Dashboard using App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-13054',
          storyId: 'CONT-13054',
        });

        // Configure site governance to App Manager control
        const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteAppManagerControlled: true,
        });
        await tileApiHelper.validateAppGovernanceResponse(governanceResponse);

        // Get site ID by name (using 'All Employees' as the default public site)
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName('All Employees');

        // Get end user info for the people tile
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // Create Custom People tile payload for site dashboard
        const tilePayload = TILE_TEST_DATA.PEOPLE_CUSTOM_TILE({
          title: TestDataGenerator.generateRandomString('CustomPeopleTile'),
          items: [endUserInfo.userId],
          layout: 'list',
          pushToAllHomeDashboards: false,
        });

        // Update payload for site dashboard (set siteId and dashboardId to 'site')
        tilePayload.siteId = siteId as any;
        tilePayload.dashboardId = 'site';

        // Create the tile on site dashboard
        const tileResponse = await appManagerApiFixture.tileManagementHelper.createSiteDashboardTile(
          siteId,
          tilePayload
        );
        await tileApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push({ siteId, tileId });

        // Validate tile is present in the tiles list
        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('site', siteId);
        await tileApiHelper.validateTileMetadata(tilesList, tileId, {
          title: tilePayload.tile.title,
          type: 'people',
          variant: 'custom',
          options: {
            layout: 'list',
          },
        });
      }
    );

    test(
      'creating Custom Content tile on Unlisted site Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-13037'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating Custom Content tile on Unlisted site Dashboard using App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-13037',
          storyId: 'CONT-13037',
        });

        // Configure site governance to App Manager control
        const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteAppManagerControlled: true,
        });
        await tileApiHelper.validateAppGovernanceResponse(governanceResponse);

        // Create an unlisted site for the test
        const unlistedSiteName = TestDataGenerator.generateRandomString('UnlistedSite');
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(unlistedSiteName, {
          accessType: SITE_TYPES.UNLISTED,
        });

        // Create content (page) for the custom tile
        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            pageName: TestDataGenerator.generateRandomString('CustomTilePage'),
            waitForSearchIndex: false,
          },
        });

        // Create Custom Content tile payload for site dashboard
        const tilePayload = TILE_TEST_DATA.CONTENT_CUSTOM_TILE({
          title: TestDataGenerator.generateRandomString('CustomContentTile'),
          items: [pageInfo.contentId],
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        // Update payload for site dashboard (set siteId and dashboardId to 'site')
        tilePayload.siteId = siteId as any;
        tilePayload.dashboardId = 'site';

        // Create the tile on site dashboard
        const tileResponse = await appManagerApiFixture.tileManagementHelper.createSiteDashboardTile(
          siteId,
          tilePayload
        );
        await tileApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push({ siteId, tileId });

        // Validate tile is present in the tiles list
        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('site', siteId);
        await tileApiHelper.validateTileMetadata(tilesList, tileId, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'custom',
          options: {
            layout: 'standard',
          },
        });
      }
    );

    test(
      'creating Content Pages tile on Private site Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentTestSuite.TILES, '@CONT-13019'],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating Content Pages tile on Private site Dashboard using App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-13019',
          storyId: 'CONT-13019',
        });

        // Configure site governance to App Manager control
        const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isSiteAppManagerControlled: true,
        });
        await tileApiHelper.validateAppGovernanceResponse(governanceResponse);

        // Create a private site for the test
        const privateSiteName = TestDataGenerator.generateRandomString('PrivateSite');
        const siteId = await appManagerApiFixture.siteManagementHelper.getSiteIdWithName(privateSiteName, {
          accessType: SITE_TYPES.PRIVATE,
        });

        // Create Content Pages tile payload for site dashboard
        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: TestDataGenerator.generateRandomString('ContentPageTile'),
          type: 'page',
          siteFilter: 'site',
          siteId: siteId,
          layout: 'grid',
          pushToAllHomeDashboards: false,
        });

        // Update payload for site dashboard (set siteId and dashboardId to 'site')
        tilePayload.siteId = siteId as any;
        tilePayload.dashboardId = 'site';

        // Create the tile on site dashboard
        const tileResponse = await appManagerApiFixture.tileManagementHelper.createSiteDashboardTile(
          siteId,
          tilePayload
        );
        await tileApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push({ siteId, tileId });

        // Validate tile is present in the tiles list
        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('site', siteId);
        await tileApiHelper.validateTileMetadata(tilesList, tileId, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'latest_popular',
          options: {
            type: 'page',
            siteFilter: 'site',
            siteId: siteId,
            layout: 'grid',
          },
        });
      }
    );
  }
);
