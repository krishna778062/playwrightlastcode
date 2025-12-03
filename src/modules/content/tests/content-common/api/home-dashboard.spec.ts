import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { HomeDashboardApiHelper } from '@/src/modules/content/apis/apiValidation/homeDashboardApiHelper';
import { TILE_TEST_DATA } from '@/src/modules/content/test-data/tile.test-data';

test.describe(
  '@Home Dashboard API',
  {
    tag: [ContentTestSuite.API],
  },
  () => {
    let homeDashboardApiHelper: HomeDashboardApiHelper;
    let createdTileIds: string[] = [];

    test.beforeEach(async () => {
      homeDashboardApiHelper = new HomeDashboardApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      // Cleanup: Delete all created tiles
      for (const tileId of createdTileIds) {
        try {
          await appManagerApiFixture.tileManagementHelper.deleteHomeDashboardTile(tileId);
        } catch (error) {
          console.warn(`Failed to delete tile ${tileId}:`, error);
        }
      }
      createdTileIds = [];
    });

    const removeTileFromCleanup = (tileId: string) => {
      createdTileIds = createdTileIds.filter(existingTileId => existingTileId !== tileId);
    };

    test(
      'app manager can configure Home Dashboard to App Manager control and End User control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42758',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Validate App Manager can set Home Dashboard governance to App Manager control and End User control',
          zephyrTestId: 'CONT-42758',
          storyId: 'CONT-42758',
        });

        const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });
        await homeDashboardApiHelper.validateAppGovernanceResponse(governanceResponse);

        await homeDashboardApiHelper.validateHomeGovernanceControlledWithRetry(
          () => appManagerApiFixture.feedManagementHelper.getAppConfig(),
          2,
          2000,
          true
        );

        const governanceEndUserResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: false,
        });
        await homeDashboardApiHelper.validateAppGovernanceResponse(governanceEndUserResponse);

        await homeDashboardApiHelper.validateHomeGovernanceControlledWithRetry(
          () => appManagerApiFixture.feedManagementHelper.getAppConfig(),
          2,
          2000,
          false
        );
      }
    );

    test(
      'app manager can create, verify, and remove Files tile on Home Dashboard',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42763',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Ensure Files tile lifecycle works on Home Dashboard (App Manager control)',
          zephyrTestId: 'CONT-42763',
          storyId: 'CONT-42763',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const site = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          siteName: TestDataGenerator.generateRandomString('FilesTileSite'),
        });

        const beachImagePath = FileUtil.getFilePath(
          process.cwd(),
          'src',
          'modules',
          'global-search',
          'test-data',
          'beach.jpg'
        );

        const { fileInfo } = await appManagerApiFixture.contentManagementHelper.imageUploaderService.uploadIntranetFile(
          site.siteId,
          'beach.jpg',
          beachImagePath,
          'image/jpeg'
        );

        const tilePayload = TILE_TEST_DATA.FILES_TILE({
          title: TestDataGenerator.generateRandomString('FilesTile'),
          items: [fileInfo.id],
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push(tileId);

        try {
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileMetadata(tilesList, tileId, {
            title: tilePayload.tile.title,
            type: 'files',
            variant: 'intranet',
          });

          const deleteResponse =
            await appManagerApiFixture.tileManagementHelper.tileManagementService.deleteHomeDashboardTile(tileId);
          const deleteBody = await deleteResponse.json();
          await homeDashboardApiHelper.validateTileDeletion(deleteBody);
          removeTileFromCleanup(tileId);

          const updatedList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileNotVisible(updatedList, tileId);
        } finally {
          // Leave tile id in cleanup list only when deletion fails
        }
      }
    );

    test(
      'app manager can manage Sites tile with public, private, and unlisted sites',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42762',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Ensure Sites tile supports multiple site types on Home Dashboard',
          zephyrTestId: 'CONT-42762',
          storyId: 'CONT-42762',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const [publicSite, privateSite, unlistedSite] = await Promise.all([
          appManagerApiFixture.siteManagementHelper.getSiteByAccessType('public'),
          appManagerApiFixture.siteManagementHelper.getSiteByAccessType('private'),
          appManagerApiFixture.siteManagementHelper.getSiteByAccessType('unlisted'),
        ]);

        const tilePayload = TILE_TEST_DATA.SITES_TILE({
          title: TestDataGenerator.generateRandomString('SitesTile'),
          items: [publicSite.siteId, privateSite.siteId, unlistedSite.siteId],
          layout: 'list',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push(tileId);

        try {
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileMetadata(tilesList, tileId, {
            title: tilePayload.tile.title,
            type: 'sites',
            variant: 'custom',
            options: {
              layout: 'list',
            },
          });

          const deleteResponse =
            await appManagerApiFixture.tileManagementHelper.tileManagementService.deleteHomeDashboardTile(tileId);
          const deleteBody = await deleteResponse.json();
          await homeDashboardApiHelper.validateTileDeletion(deleteBody);
          removeTileFromCleanup(tileId);

          const updatedList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileNotVisible(updatedList, tileId);
        } finally {
          // If deletion fails, tile will be removed during afterEach cleanup
        }
      }
    );

    test(
      'app manager can create Site Categories tile on Home Dashboard',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42765',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Site Categories tile creation with custom size on Home Dashboard',
          zephyrTestId: 'CONT-42765',
          storyId: 'CONT-42765',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.SITE_CATEGORIES_TILE({
          title: TestDataGenerator.generateRandomString('SiteCategoriesTile'),
          size: 5,
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push(tileId);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileId, {
          title: tilePayload.tile.title,
          type: 'site_categories',
          variant: 'default',
          options: {
            size: 5,
          },
        });
      }
    );

    test(
      'app manager can create Custom People tile on Home Dashboard',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42766',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Custom People tile creation with list layout on Home Dashboard',
          zephyrTestId: 'CONT-42766',
          storyId: 'CONT-42766',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        const tilePayload = TILE_TEST_DATA.PEOPLE_CUSTOM_TILE({
          title: TestDataGenerator.generateRandomString('CustomPeopleTile'),
          items: [endUserInfo.userId],
          layout: 'list',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);

        const tileId = tileResponse.result.id;
        createdTileIds.push(tileId);

        try {
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileMetadata(tilesList, tileId, {
            title: tilePayload.tile.title,
            type: 'people',
            variant: 'custom',
            options: {
              layout: 'list',
            },
          });
        } finally {
          // Tile will be removed during afterEach cleanup
        }
      }
    );

    test(
      'creating New Hires tile on Home Dashboard using  App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          '@CONT-13056',
          ContentTestSuite.TILES,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating New Hires tile on Home Dashboard using  App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-13056',
          storyId: 'CONT-13056',
        });

        // Step 1: Set home control to app manager controlled
        await test.step('Set home control to app manager controlled', async () => {
          const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
            isHomeAppManagerControlled: true,
          });
          await homeDashboardApiHelper.validateAppGovernanceResponse(governanceResponse);

          // Verify the setting
          const config = await appManagerApiFixture.feedManagementHelper.getAppConfig();
          await homeDashboardApiHelper.validateHomeAppManagerControlled(config);
        });

        // Step 2: Create a tile with app manager
        await test.step('Create tile with app manager', async () => {
          const tilePayload = TILE_TEST_DATA.PEOPLE_NEW_HIRES_TILE({
            title: null,
            hireDaysThreshold: '30',
            pushToAllHomeDashboards: false,
          });

          const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
          await homeDashboardApiHelper.validateTileCreation(tileResponse);
          createdTileIds.push(tileResponse.result.id);
        });

        // Step 3: Verify tile visibility
        await test.step('Verify tile visibility', async () => {
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          const tileId = createdTileIds[createdTileIds.length - 1];
          await homeDashboardApiHelper.validateTileVisibility(tilesList, tileId);
        });
      }
    );

    test(
      'remove Hires tile on Home Dashboard using  App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          '@CONT-42133',
          ContentTestSuite.TILES,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Remove Hires tile on Home Dashboard using  App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-42133',
          storyId: 'CONT-42133',
        });

        // Set home control to app manager controlled
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        // Create a tile first
        const tilePayload = TILE_TEST_DATA.PEOPLE_NEW_HIRES_TILE({
          title: null,
          hireDaysThreshold: '30',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        const tileId = tileResponse.result.id;

        // Remove the tile
        await test.step('Remove tile with app manager', async () => {
          const deleteResponse =
            await appManagerApiFixture.tileManagementHelper.tileManagementService.deleteHomeDashboardTile(tileId);
          const deleteResponseBody = await deleteResponse.json();
          await homeDashboardApiHelper.validateTileDeletion(deleteResponseBody);

          // Verify tile is not visible
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileNotVisible(tilesList, tileId);
        });
      }
    );

    test(
      'creating New Hires tile on Home Dashboard using  App Manager with User Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          '@CONT-13068',
          ContentTestSuite.TILES,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Creating New Hires tile on Home Dashboard using  App Manager with User Dashboard Control',
          zephyrTestId: 'CONT-13068',
          storyId: 'CONT-13068',
        });

        // Step 1: Set home control to end user controlled
        await test.step('Set home control to end user controlled', async () => {
          const governanceResponse = await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
            isHomeAppManagerControlled: false,
          });
          await homeDashboardApiHelper.validateAppGovernanceResponse(governanceResponse);

          //retry to validate home is end user controlled
          await homeDashboardApiHelper.validateHomeGovernanceControlledWithRetry(
            () => appManagerApiFixture.feedManagementHelper.getAppConfig(),
            2,
            2000,
            false
          );
        });

        // Step 2: Create a tile (as app manager, but home is end user controlled)
        await test.step('Create tile when home is end user controlled', async () => {
          const tilePayload = TILE_TEST_DATA.PEOPLE_NEW_HIRES_TILE({
            title: null,
            hireDaysThreshold: '30',
            pushToAllHomeDashboards: false,
          });

          const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
          await homeDashboardApiHelper.validateTileCreation(tileResponse);
          createdTileIds.push(tileResponse.result.id);
        });

        // Step 3: Verify tile visibility
        await test.step('Verify tile visibility', async () => {
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          const tileId = createdTileIds[createdTileIds.length - 1];
          await homeDashboardApiHelper.validateTileVisibility(tilesList, tileId);
        });
      }
    );

    test(
      'remove Hires tile on Home Dashboard using  App Manager with User Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          '@CONT-42137',
          ContentTestSuite.TILES,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Remove Hires tile on Home Dashboard using  App Manager with User Dashboard Control',
          zephyrTestId: 'CONT-42137',
          storyId: 'CONT-42137',
        });

        // Set home control to end user controlled
        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: false,
        });

        // Create a tile first
        const tilePayload = TILE_TEST_DATA.PEOPLE_NEW_HIRES_TILE({
          title: null,
          hireDaysThreshold: '30',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        const tileId = tileResponse.result.id;

        // Remove the tile
        await test.step('Remove tile when home is end user controlled', async () => {
          const deleteResponse =
            await appManagerApiFixture.tileManagementHelper.tileManagementService.deleteHomeDashboardTile(tileId);
          const deleteResponseBody = await deleteResponse.json();
          await homeDashboardApiHelper.validateTileDeletion(deleteResponseBody);

          // Verify tile is not visible
          const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
          await homeDashboardApiHelper.validateTileNotVisible(tilesList, tileId);
        });
      }
    );

    test(
      'creating Content latest and popular tile on Home Dashboard using App Manager with User Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          '@CONT-13038',
          ContentTestSuite.TILES,
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating Content latest and popular tile on Home Dashboard using App Manager with User Dashboard Control',
          zephyrTestId: 'CONT-13038',
          storyId: 'CONT-13038',
        });

        // Create a content tile
        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: 'Latest & popular',
          type: 'all',
          siteFilter: 'following',
          siteId: null,
          layout: 'standard',
          pushToAllHomeDashboards: true,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        // Verify tile visibility
        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileVisibility(tilesList, tileResponse.result.id);
      }
    );

    test(
      'creating Content latest and popular tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13014',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Creating Content latest and popular tile on Home Dashboard using App Manager with App Manager Dashboard Control',
          zephyrTestId: 'CONT-13014',
          storyId: 'CONT-13014',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: 'Latest & popular',
          type: 'all',
          siteFilter: 'following',
          siteId: null,
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileVisibility(tilesList, tileResponse.result.id);
      }
    );

    test(
      'creating Content Pages tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13018',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Content Page tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13018',
          storyId: 'CONT-13018',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: TestDataGenerator.generateRandomString('ContentPageTile'),
          type: 'page',
          siteFilter: 'following',
          siteId: null,
          layout: 'grid',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'latest_popular',
          options: {
            type: 'page',
            siteFilter: 'following',
            siteId: null,
            layout: 'grid',
          },
        });
      }
    );

    test(
      'creating Content Events tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13022',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Content Event tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13022',
          storyId: 'CONT-13022',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: TestDataGenerator.generateRandomString('ContentEventTile'),
          type: 'event',
          siteFilter: 'following',
          siteId: null,
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'latest_popular',
          options: {
            type: 'event',
            siteFilter: 'following',
            siteId: null,
            layout: 'standard',
          },
        });
      }
    );

    test(
      'creating Content Albums tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13026',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Content Album tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13026',
          storyId: 'CONT-13026',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.CONTENT_LATEST_POPULAR_TILE({
          title: TestDataGenerator.generateRandomString('ContentAlbumTile'),
          type: 'album',
          siteFilter: 'following',
          siteId: null,
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'latest_popular',
          options: {
            type: 'album',
            siteFilter: 'following',
            siteId: null,
            layout: 'standard',
          },
        });
      }
    );

    test(
      'creating HTML tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13112',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate HTML tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13112',
          storyId: 'CONT-13112',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
          htmlTileEnabled: true,
        });

        const tilePayload = TILE_TEST_DATA.HTML_TILE({
          title: TestDataGenerator.generateRandomString('HTMLTile'),
          code: '<body><h1>Test HTML Tile</h1><p>This is a test HTML tile content.</p></body>',
          height: 200,
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'html',
          variant: 'iframe',
        });
      }
    );

    test(
      'creating Content Custom tile with specific items on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, ContentTestSuite.HOME_DASHBOARD, ContentTestSuite.TILES],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Content Custom tile creation with specific content items on Home Dashboard',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        // Create a site and content for the custom tile
        const site = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          siteName: TestDataGenerator.generateRandomString('CustomContentTileSite'),
        });

        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: site.siteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            pageName: TestDataGenerator.generateRandomString('CustomTilePage'),
            waitForSearchIndex: false,
          },
        });

        const tilePayload = TILE_TEST_DATA.CONTENT_CUSTOM_TILE({
          title: TestDataGenerator.generateRandomString('CustomContentTile'),
          items: [pageInfo.contentId],
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'custom',
        });
      }
    );

    test(
      'creating Links tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13116',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Links tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13116',
          storyId: 'CONT-13116',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.LINKS_TILE({
          title: TestDataGenerator.generateRandomString('LinksTile'),
          links: [
            {
              text: 'Test Link 1',
              url: 'https://www.example.com',
            },
            {
              text: 'Test Link 2',
              url: 'https://www.simpplr.com',
            },
          ],
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'links',
          variant: 'custom',
        });
      }
    );

    test(
      'creating RSS tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-4085',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate RSS tile creation on Home Dashboard',
          zephyrTestId: 'CONT-4085',
          storyId: 'CONT-4085',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.RSS_TILE({
          title: TestDataGenerator.generateRandomString('RSSTile'),
          url: 'http://rss.cnn.com/rss/cnn_topstories.rss',
          size: 8,
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'rss',
          variant: 'standard',
        });
      }
    );

    test(
      'creating Twitter tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-2843',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Twitter tile creation on Home Dashboard',
          zephyrTestId: 'CONT-2843',
          storyId: 'CONT-2843',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.TWITTER_TILE({
          title: TestDataGenerator.generateRandomString('TwitterTile'),
          code: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Test tweet content</p>&mdash; Test (@test) <a href="https://twitter.com/test/status/1234567890">January 1, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'twitter',
          variant: 'standard',
        });
      }
    );

    test(
      'creating Facebook tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13098',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Facebook tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13098',
          storyId: 'CONT-13098',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.FACEBOOK_TILE({
          title: TestDataGenerator.generateRandomString('FacebookTile'),
          url: 'https://www.facebook.com/simpplr',
          height: 1010,
          showPosts: true,
          showCover: true,
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'facebook',
          variant: 'standard',
        });
      }
    );

    test(
      'creating Countdown tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13123',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Countdown tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13123',
          storyId: 'CONT-13123',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        // Set stop date to 30 days from now
        const stopDate = new Date();
        stopDate.setDate(stopDate.getDate() + 30);
        const stopDateISO = stopDate.toISOString();

        const tilePayload = TILE_TEST_DATA.COUNTDOWN_TILE({
          title: TestDataGenerator.generateRandomString('CountdownTile'),
          stopAt: stopDateISO,
          endMessage: 'Countdown completed!',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'countdown',
          variant: 'standard',
        });
      }
    );

    test(
      'creating Content from Category tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-42854',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Content from Category tile creation on Home Dashboard',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        // Get a site for the tile
        const site = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          siteName: TestDataGenerator.generateRandomString('CategorySite'),
        });

        // Get or create a page category for the site
        // Sites typically have a default page category, so we'll get the first available one
        const category = await appManagerApiFixture.contentManagementHelper.contentManagementService.getPageCategoryID(
          site.siteId
        );

        const tilePayload = TILE_TEST_DATA.CONTENT_FROM_CATEGORY_TILE({
          title: TestDataGenerator.generateRandomString('ContentFromCategoryTile'),
          pageCategoryId: category.categoryId,
          siteFilter: 'site',
          siteId: site.siteId,
          layout: 'standard',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'content',
          variant: 'from_category',
        });
      }
    );

    test(
      'creating Rich Text tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13108',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Rich Text tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13108',
          storyId: 'CONT-13108',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.HTML_TEXT_TILE({
          title: TestDataGenerator.generateRandomString('RichTextTile'),
          text: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Test rich text content"}]}]}',
          bodyHtml: '<p>Test rich text content</p>',
          pushToAllHomeDashboards: false,
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'html',
          variant: 'text',
        });
      }
    );

    test(
      'creating Video tile on Home Dashboard using App Manager with App Manager Dashboard Control',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          ContentTestSuite.HOME_DASHBOARD,
          ContentTestSuite.TILES,
          '@CONT-13120',
        ],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Validate Video tile creation on Home Dashboard',
          zephyrTestId: 'CONT-13120',
          storyId: 'CONT-13120',
        });

        await appManagerApiFixture.feedManagementHelper.configureAppGovernance({
          isHomeAppManagerControlled: true,
        });

        const tilePayload = TILE_TEST_DATA.MEDIA_VIDEO_TILE({
          title: TestDataGenerator.generateRandomString('VideoTile'),
          url: 'https://www.youtube.com/watch?v=Uszj_k0DGsg',
          description: 'Test video description',
          showInfo: true,
          pushToAllHomeDashboards: false,
          videoTitle: 'Test Video Title',
          oembed: {
            provider_url: 'https://www.youtube.com/',
            cache_age: 86400,
            width: 480,
            height: 270,
            author: 'Test Author',
            html: '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%"><iframe src="https://www.youtube.com/embed/Uszj_k0DGsg?rel=0" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0" allowfullscreen="" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"></iframe></div>',
            url: 'https://www.youtube.com/watch?v=Uszj_k0DGsg',
            thumbnail_width: 480,
            duration: 0,
            version: '1.0',
            title: 'Test Video Title',
            provider_name: 'YouTube',
            type: 'video',
            thumbnail_height: 360,
            author_url: 'https://www.youtube.com/@test',
            thumbnail_url: 'https://i.ytimg.com/vi/Uszj_k0DGsg/maxresdefault.jpg',
            description: 'Test video description',
            author_name: 'Test Author',
          },
        });

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileMetadata(tilesList, tileResponse.result.id, {
          title: tilePayload.tile.title,
          type: 'media',
          variant: 'video',
        });
      }
    );
  }
);
