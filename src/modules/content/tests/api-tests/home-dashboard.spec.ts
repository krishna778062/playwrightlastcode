import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { HomeDashboardApiHelper } from '@/src/modules/content/apis/apiValidation/homeDashboardApiHelper';

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

        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: TestDataGenerator.generateRandomString('FilesTile'),
            options: {},
            pushToAllHomeDashboards: false,
            items: [fileInfo.id],
            type: 'files',
            variant: 'intranet',
          },
          isNewTiptap: false,
        };

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

        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: TestDataGenerator.generateRandomString('SitesTile'),
            options: {
              layout: 'list',
            },
            pushToAllHomeDashboards: false,
            items: [publicSite.siteId, privateSite.siteId, unlistedSite.siteId],
            type: 'sites',
            variant: 'custom',
          },
          isNewTiptap: false,
        };

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

        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: TestDataGenerator.generateRandomString('SiteCategoriesTile'),
            options: {
              size: 5,
            },
            pushToAllHomeDashboards: false,
            items: [],
            type: 'site_categories',
            variant: 'default',
          },
          isNewTiptap: false,
        };

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

        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: TestDataGenerator.generateRandomString('CustomPeopleTile'),
            options: {
              layout: 'list',
            },
            pushToAllHomeDashboards: false,
            items: [endUserInfo.userId],
            type: 'people',
            variant: 'custom',
          },
        };

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
          const tilePayload = {
            siteId: null,
            dashboardId: 'home',
            tile: {
              title: null,
              options: {
                hireDaysThreshold: '30',
              },
              pushToAllHomeDashboards: false,
              items: [],
              type: 'people',
              variant: 'new_hires',
            },
          };

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
        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: null,
            options: {
              hireDaysThreshold: '30',
            },
            pushToAllHomeDashboards: false,
            items: [],
            type: 'people',
            variant: 'new_hires',
          },
        };

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
          const tilePayload = {
            siteId: null,
            dashboardId: 'home',
            tile: {
              title: null,
              options: {
                hireDaysThreshold: '30',
              },
              pushToAllHomeDashboards: false,
              items: [],
              type: 'people',
              variant: 'new_hires',
            },
          };

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
        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: null,
            options: {
              hireDaysThreshold: '30',
            },
            pushToAllHomeDashboards: false,
            items: [],
            type: 'people',
            variant: 'new_hires',
          },
        };

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
        const tilePayload = {
          siteId: null,
          dashboardId: 'home',
          tile: {
            title: 'Latest & popular',
            options: {
              type: 'all',
              siteFilter: 'following',
              siteId: null,
              layout: 'standard',
            },
            pushToAllHomeDashboards: true,
            items: [],
            type: 'content',
            variant: 'latest_popular',
          },
          isNewTiptap: false,
        };

        const tileResponse = await appManagerApiFixture.tileManagementHelper.createHomeDashboardTile(tilePayload);
        await homeDashboardApiHelper.validateTileCreation(tileResponse);
        createdTileIds.push(tileResponse.result.id);

        // Verify tile visibility
        const tilesList = await appManagerApiFixture.tileManagementHelper.listTiles('home', null);
        await homeDashboardApiHelper.validateTileVisibility(tilesList, tileResponse.result.id);
      }
    );
  }
);
