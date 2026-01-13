import { faker } from '@faker-js/faker';
import { integrationsFixture as test } from '@integrations/fixtures/integrationsFixture';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import {
  ApiResponseAssertions,
  ContentTilesApiHelper,
} from '@/src/modules/integrations/apis/apiValidation/contentTilesApiValidations';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'Outlook Calendar Native Tiles API Integration',
  {
    tag: [IntegrationsSuiteTags.OUTLOOK_CALENDAR_NATIVE_TILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    let contentTilesApiHelper: ContentTilesApiHelper;
    let createdTileId: string | undefined = undefined;
    let createdTileTitle: string | undefined = undefined;

    test.beforeEach(async () => {
      contentTilesApiHelper = new ContentTilesApiHelper();
    });

    test.afterEach(async ({ appManagerApiFixture }) => {
      await contentTilesApiHelper.cleanupAfterTest(
        appManagerApiFixture.tileManagementHelper,
        createdTileTitle,
        createdTileId,
        appManagerApiFixture.contentTilesHelper
      );
      createdTileId = undefined;
      createdTileTitle = undefined;
      await appManagerApiFixture.tileManagementHelper.cleanup();
      await appManagerApiFixture.contentTilesHelper.cleanup();
    });

    test(
      'verify API can retrieve content tiles list for home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const listResponse = await appManagerApiFixture.contentTilesHelper.getContentTilesListForHome();
        await contentTilesApiHelper.validateContentTilesList(listResponse, true);
        ApiResponseAssertions.expectSuccess(listResponse);
      }
    );

    test(
      'verify app manager can create Outlook Calendar native tile via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar API Tile ${faker.string.alphanumeric({ length: 6 })}`;

        const payload = appManagerApiFixture.tileManagementHelper.buildValidTilePayload({
          tileInstanceName: createdTileTitle,
          connectorId: CONNECTOR_IDS.OUTLOOK_CALENDAR,
          tileId: TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
        });

        const { tileId, response } = await appManagerApiFixture.tileManagementHelper.createAndValidate(payload);
        await contentTilesApiHelper.validateTileCreation(response, createdTileTitle);
        createdTileId = tileId;
      }
    );

    test(
      'verify app manager can retrieve Outlook Calendar native tile metadata via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar API Tile ${faker.string.alphanumeric({ length: 6 })}`;

        const payload = appManagerApiFixture.tileManagementHelper.buildValidTilePayload({
          tileInstanceName: createdTileTitle,
          connectorId: CONNECTOR_IDS.OUTLOOK_CALENDAR,
          tileId: TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
        });

        createdTileId = await appManagerApiFixture.tileManagementHelper.createAndGetId(payload);

        const metadata =
          await appManagerApiFixture.tileManagementHelper.tileManagementService.fetchInstanceMetadata(createdTileId);

        await contentTilesApiHelper.validateTileMetadata(metadata, createdTileTitle, CONNECTOR_IDS.OUTLOOK_CALENDAR);
        ApiResponseAssertions.expectSuccess(metadata);
      }
    );

    test(
      'verify app manager can delete Outlook Calendar native tile via API',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar API Tile ${faker.string.alphanumeric({ length: 6 })}`;

        const payload = appManagerApiFixture.tileManagementHelper.buildValidTilePayload({
          tileInstanceName: createdTileTitle,
          connectorId: CONNECTOR_IDS.OUTLOOK_CALENDAR,
          tileId: TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
        });

        createdTileId = await appManagerApiFixture.tileManagementHelper.createAndGetId(payload);

        await contentTilesApiHelper.deleteTileAndValidate(
          appManagerApiFixture.tileManagementHelper,
          appManagerApiFixture.contentTilesHelper,
          createdTileTitle!,
          createdTileId
        );

        createdTileId = undefined;
        createdTileTitle = undefined;
      }
    );

    test(
      'verify API can retrieve content tiles list for site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const { siteManagementHelper } = appManagerApiFixture;
        const category = await siteManagementHelper.siteManagementService.getCategoryId(SITE_TYPES.CATEGORY);
        const createdSite = await siteManagementHelper.createPublicSite({ category });

        const listResponse = await appManagerApiFixture.contentTilesHelper.getContentTilesListForSite(
          createdSite.siteId
        );
        await contentTilesApiHelper.validateContentTilesList(listResponse, true);
        ApiResponseAssertions.expectSuccess(listResponse);

        await siteManagementHelper.deactivateSite(createdSite.siteId);
      }
    );

    test(
      'verify app manager can get tiles by Outlook Calendar connector ID',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const response = await appManagerApiFixture.tileManagementHelper.tileManagementService.getTilesByConnector(
          CONNECTOR_IDS.OUTLOOK_CALENDAR
        );

        await contentTilesApiHelper.validateTilesByConnector(response, TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS);
        ApiResponseAssertions.expectSuccess(response);
      }
    );

    test(
      'verify app manager can get root app tiles instances',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const rootInstances =
          await appManagerApiFixture.tileManagementHelper.tileManagementService.getRootAppTilesInstances();

        await contentTilesApiHelper.validateRootAppTilesInstances(rootInstances);
        ApiResponseAssertions.expectSuccess(rootInstances);
      }
    );

    test(
      'verify API returns 404 when fetching metadata for non-existent tile',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const nonExistentId = 'non-existent-tile-id-12345' as const;
        const errorResponse =
          await appManagerApiFixture.tileManagementHelper.attemptFetchMetadataWithInvalidId(nonExistentId);
        ApiResponseAssertions.expectNotFound(errorResponse);
      }
    );

    test(
      'verify API returns error when creating tile with invalid connector ID',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const invalidPayload = appManagerApiFixture.tileManagementHelper.buildInvalidTilePayload({
          tileInstanceName: `Invalid Tile ${faker.string.alphanumeric({ length: 6 })}`,
          connectorId: 'invalid-connector-id-12345' as const,
          tileId: TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
        });

        const errorResponse = await appManagerApiFixture.tileManagementHelper.attemptCreateWithInvalidConnectorId(
          invalidPayload as any
        );
        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify API returns error when creating tile with invalid tile ID',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const invalidPayload = appManagerApiFixture.tileManagementHelper.buildInvalidTilePayload({
          tileInstanceName: `Invalid Tile ${faker.string.alphanumeric({ length: 6 })}`,
          connectorId: CONNECTOR_IDS.OUTLOOK_CALENDAR,
          tileId: 'invalid-tile-id-12345' as const,
        });

        const errorResponse = await appManagerApiFixture.tileManagementHelper.attemptCreateWithInvalidTileId(
          invalidPayload as any
        );
        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify app manager can create Outlook Calendar native tile on site dashboard via API',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const { siteManagementHelper } = appManagerApiFixture;
        const category = await siteManagementHelper.siteManagementService.getCategoryId(SITE_TYPES.CATEGORY);
        const createdSite = await siteManagementHelper.createPublicSite({ category });

        createdTileTitle = `Outlook Calendar Site Tile ${faker.string.alphanumeric({ length: 6 })}`;

        const payload = appManagerApiFixture.tileManagementHelper.buildValidTilePayload({
          tileInstanceName: createdTileTitle,
          connectorId: CONNECTOR_IDS.OUTLOOK_CALENDAR,
          tileId: TILE_IDS.OUTLOOK_CAL_DISPLAY_UPCOMING_EVENTS,
        });

        const { tileId, response } = await appManagerApiFixture.tileManagementHelper.createAndValidate(payload);
        await contentTilesApiHelper.validateTileCreation(response, createdTileTitle);
        createdTileId = tileId;

        await contentTilesApiHelper.deleteTileByTitle(
          appManagerApiFixture.tileManagementHelper,
          appManagerApiFixture.contentTilesHelper,
          createdTileTitle!,
          createdTileId
        );

        createdTileId = undefined;
        createdTileTitle = undefined;

        await siteManagementHelper.deactivateSite(createdSite.siteId);
      }
    );

    test(
      'verify API returns error when content tiles list is called with invalid dashboard ID',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const errorResponse = await appManagerApiFixture.contentTilesHelper.attemptGetContentTilesListWithInvalidParams(
          {
            dashboardId: 'invalid-dashboard',
            siteId: null,
          }
        );

        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );

    test(
      'verify API returns error when content tiles list is called with missing dashboard ID',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerApiFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        const errorResponse = await appManagerApiFixture.contentTilesHelper.attemptGetContentTilesListWithInvalidParams(
          {
            siteId: null,
          }
        );

        ApiResponseAssertions.expectValidationError(errorResponse);
      }
    );
  }
);
