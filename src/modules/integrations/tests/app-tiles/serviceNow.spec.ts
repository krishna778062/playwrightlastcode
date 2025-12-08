import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags, TEST_TAGS } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { CONNECTOR_IDS, REDIRECT_URLS, SERVICENOW_VALUES, TILE_IDS } from '../../test-data/app-tiles.test-data';

import { FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';

test.describe(
  'serviceNow App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.SERVICENOW_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'ServiceNow';
    const DisplayRecentlyReportedTickets = 'Display recently reported tickets';
    const DisplayRecentTickets = 'Display recent tickets';
    const ApprovalRequests = 'Approval requests';
    const CreateNewIncident = 'Create new incident';
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
      'verify App Manager is able to add "Display recently reported" tickets on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24030', 'INT-24035', 'INT-24034', 'INT-22887'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
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
    test(
      'verify App Manager is able to add "Display recently reported" tickets on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24031', 'INT-22890', 'INT-22889', 'INT-24032'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_SITE,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await siteDashboard.isTilePresent(createdTileTitle);
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
      'verify that App manager should be able to add a ServiceNow App Tile to view recently updated ServiceNow tickets with preferences set to "App manager defined" on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14063', 'INT-14089', 'INT-14091', 'INT-26713'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_HOME,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
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
    test(
      'verify that App manager should be able to add a ServiceNow App Tile to view recently updated ServiceNow tickets with preferences set to Site manager defined" on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14064', 'INT-16710', 'INT-16711', 'INT-26712'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_SITE,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await siteDashboard.isTilePresent(createdTileTitle);
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
      'verify App Manager is able to add Service Now Approval tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28659', 'INT-28666', 'INT-28672', 'INT-28674'],
          storyId: 'INT-28229',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.SERVICENOW_APPROVAL_REQUESTS,
          CONNECTOR_IDS.SERVICENOW
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTile(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Manger is able to add Service Now Approval App Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28660', 'INT-28671', 'INT-28673', 'INT-26709'],
          storyId: 'INT-28229',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, ApprovalRequests, UI_ACTIONS.ADD_TO_SITE);
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
      'verify App Manager is able to add "Display recently reported" tickets on Home Dashboard as User Defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24038', 'INT-24037'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific Service Now tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          FIELD_NAMES.TIME_PERIOD,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.TIME_PERIOD, SERVICENOW_VALUES.DAYS_30);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
        await homeDashboard.verifyServiceNowContentStructure(createdTileTitle);
      }
    );
    test(
      'verify created Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24036', 'INT-14085'],
          storyId: 'INT-23625',
        });
        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await homeDashboard.verifyServiceNowContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.SERVICENOW);
      }
    );
    test(
      'verify created Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29603'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_SITE,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await siteDashboard.verifyServiceNowContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.SERVICENOW);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify that App manager should be able to add a ServiceNow App Tile to view recently updated ServiceNow tickets with preferences set to "User defined" on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14060'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific GitHub tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          FIELD_NAMES.TIME_PERIOD,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.TIME_PERIOD, SERVICENOW_VALUES.DAYS_30);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );
    test(
      'verify that App manager should be able to add a ServiceNow App Tile to view recently updated ServiceNow tickets with preferences set to "User defined" on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14061', 'INT-14062'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific GitHub tile
        await siteDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          FIELD_NAMES.TIME_PERIOD,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.TIME_PERIOD, SERVICENOW_VALUES.DAYS_30);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.verifyServiceNowContentStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify App Manager is able to add "Create new incident" Service Now App Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26701', 'INT-29608', 'INT-26711'],
          storyId: 'INT-25902',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewIncident,
          FIELD_NAMES.INCIDENT_VIEW,
          SERVICENOW_VALUES.INCIDENT_VIEW_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyPersonalizeNotVisible(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );
    test(
      'verify App Manager is able to add "Create new incident" Service Now App Tile Ticket on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26707', 'INT-29609', 'INT-22886', 'INT-22885'],
          storyId: 'INT-25902',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewIncident,
          FIELD_NAMES.INCIDENT_VIEW,
          SERVICENOW_VALUES.INCIDENT_VIEW_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.isTilePresent(createdTileTitle);
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
      'verify App Manager is able to add "Display recently reported" tickets on Site Dashboard as User Defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29613'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific Service Now tile
        await siteDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          FIELD_NAMES.TIME_PERIOD,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.TIME_PERIOD, SERVICENOW_VALUES.DAYS_30);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        await siteDashboard.verifyServiceNowContentStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify Show more is visible after 4 requests for service now requests from Service Now on a tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-29614',
          storyId: 'INT-23625',
        });

        //Generate a random tile title
        createdTileTitle = `Service Now report ${faker.string.alphanumeric({ length: 6 })}`;
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify Show more is visible after 4 requests for service now requests from Service Now on a tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TEST_TAGS.SHOW_MORE],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29615'],
          storyId: 'INT-23625',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_SITE,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify UI layout for Service Now Approval App Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard, tileManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28661', 'INT-28674'],
          storyId: 'INT-28229',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.SERVICENOW_APPROVAL_REQUESTS,
          CONNECTOR_IDS.SERVICENOW
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await homeDashboard.verifyServiceNowApprovalContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.SERVICENOW);
      }
    );
    test(
      'verify UI layout for Service Now Approval App Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28662'],
          storyId: 'INT-28229',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addTile(createdTileTitle, AppName, ApprovalRequests, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifyServiceNowApprovalContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.SERVICENOW);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify that user is able to add an ServiceNow app tile with "Make user editable" toggle enabled for "Time period" header on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14066'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile
        await homeDashboard.addAppManagerDefinedWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        //verify personalize button behaviour
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.openPersonalizeAndVerify(createdTileTitle, FIELD_NAMES.TIME_PERIOD);
      }
    );
    test(
      'verify that user is able to add an ServiceNow app tile with "Make user editable" toggle enabled for "Time period" header on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29631'],
          storyId: 'INT-13218',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addAppManagerDefinedWithOptionsEnableToggle(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_SITE,
          SERVICENOW_VALUES.TIME_PERIOD,
          SERVICENOW_VALUES.DAYS_30
        );
        //verify personalize button behaviour
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.openPersonalizeAndVerify(createdTileTitle, FIELD_NAMES.TIME_PERIOD);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify app manager is able to create a ticket from Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26703'],
          storyId: 'INT-25902',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewIncident,
          FIELD_NAMES.INCIDENT_VIEW,
          SERVICENOW_VALUES.INCIDENT_VIEW_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.createTicketFromTile(
          createdTileTitle,
          FIELD_NAMES.CATEGORY,
          SERVICENOW_VALUES.CATEGORY_VALUE,
          FIELD_NAMES.SUBCATEGORY,
          SERVICENOW_VALUES.SUBCATEGORY_VALUE
        );

        // Verify tile content structure
        await homeDashboard.verifyServiceNowCreatedTicketStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify app manager is able to create a ticket from Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-26708', 'INT-22883', 'INT-22882'],
          storyId: 'INT-25902',
        });

        // Use homeDashboard from fixture
        createdTileTitle = `ServiceNow report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile
        await siteDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewIncident,
          FIELD_NAMES.INCIDENT_VIEW,
          SERVICENOW_VALUES.INCIDENT_VIEW_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        //verify personalize button behaviour
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        await siteDashboard.createTicketFromTile(
          createdTileTitle,
          FIELD_NAMES.CATEGORY,
          SERVICENOW_VALUES.CATEGORY_VALUE,
          FIELD_NAMES.SUBCATEGORY,
          SERVICENOW_VALUES.SUBCATEGORY_VALUE
        );

        // Verify tile content structure
        await siteDashboard.verifyServiceNowCreatedTicketStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
