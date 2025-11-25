import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

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

          // Verify the setting
          const config = await appManagerApiFixture.feedManagementHelper.getAppConfig();
          await homeDashboardApiHelper.validateHomeEndUserControlled(config);
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
