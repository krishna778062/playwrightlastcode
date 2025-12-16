import { faker } from '@faker-js/faker';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { LoginHelper } from '@core/helpers/loginHelper';
import { UserCredentials } from '@core/types/test.types';
import { tagTest } from '@core/utils/testDecorator';

import { JIRA_VALUES } from '../../test-data/app-tiles.test-data';
import { REDIRECT_URLS } from '../../test-data/app-tiles.test-data';
import { SiteDashboard } from '../../ui/pages/siteDashboard';

import { FIELD_NAMES, UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';

const jiraUser: UserCredentials = {
  email: process.env.QA_MANAGER_EMAIL!,
  password: process.env.QA_MANAGER_PASSWORD!,
};

test.describe(
  'jira App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.JIRA_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'JIRA';
    const DisplayRecentTickets = 'Display recent tickets';
    const DisplayRecentlyReportedTickets = 'Display recently reported tickets';
    const DisplayTicketsUsingJQL = 'Display tickets using JQL';
    const CreateNewTicket = 'Create a new ticket';
    const AppManagerDefined = 'App manager defined';
    const SiteManagerDefined = 'Site manager defined';
    const JQLQuery = 'JQL Query';
    const JQLQueryValue =
      'project = "INT" AND assignee = 607d428f1417e2006aacea72 AND type = Story ORDER BY created DESC';
    let createdTileTitle: string | undefined = undefined;

    test.beforeEach(async ({ page }) => {
      await LoginHelper.loginWithPassword(page, jiraUser);
    });

    test.afterEach(async ({ page, appManagerApiFixture }) => {
      const { tileManagementHelper } = appManagerApiFixture;
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify that App Manager should be able to add a JIRA App Tile to view recently assigned JIRA tickets with preferences set to "App manager defined" on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-13930', 'INT-14040', 'INT-14042'],
          storyId: 'INT-13220',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_HOME,
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
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
      'verify that App Manager should be able to add a JIRA App Tile to view recently assigned JIRA tickets with preferences set to "site manager defined" on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-13931', 'INT-16120', 'INT-16318'],
          storyId: 'INT-13220',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

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
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
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
      'verify that App Manager should be able to add a JIRA App Tile to view recently assigned JIRA tickets with preferences set to "User defined" on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-13927', 'INT-24024'],
          storyId: 'INT-13220',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          FIELD_NAMES.PROJECT,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.PROJECT, JIRA_VALUES.INTEGRATIONS);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );
    test(
      'verify that App Manager should be able to add a JIRA App Tile to view recently assigned JIRA tickets with preferences set to "User defined"  on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-13929', 'INT-25842'],
          storyId: 'INT-13220',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific GitHub tile
        await siteDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          FIELD_NAMES.PROJECT,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.PROJECT, JIRA_VALUES.INTEGRATIONS);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify App Manager is able to add "Display recently reported" tickets on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24017', 'INT-24020', 'INT-24021'],
          storyId: 'INT-23626',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          UI_ACTIONS.ADD_TO_HOME,
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
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

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24018', 'INT-15794', 'INT-23170'],
          storyId: 'INT-23626',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

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
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
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
      'verify App Manager is able to add "Display recently reported" tickets on Home Dashboard as User Defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24025'],
          storyId: 'INT-23626',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          FIELD_NAMES.PROJECT,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.PROJECT, JIRA_VALUES.INTEGRATIONS);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.verifyPersonalizeVisible(createdTileTitle);
      }
    );
    test(
      'verify App Manager is able to add "Display recently reported" tickets on Site Dashboard as User Defined',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29838'],
          storyId: 'INT-23626',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific GitHub tile
        await siteDashboard.addTilewithPersonalize(
          createdTileTitle,
          AppName,
          DisplayRecentlyReportedTickets,
          FIELD_NAMES.PROJECT,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.setUpTileDropdown(createdTileTitle, FIELD_NAMES.PROJECT, JIRA_VALUES.INTEGRATIONS);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.verifyPersonalizeVisible(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify created Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-24022', 'INT-15811'],
          storyId: 'INT-23626',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_HOME,
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await homeDashboard.verifyJiraContentStructure(createdTileTitle);
        await homeDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.JIRA);
      }
    );
    test(
      'verify UI layout for Jira App Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29858', 'INT-13518'],
          storyId: 'INT-13220',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

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
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await siteDashboard.verifyJiraContentStructure(createdTileTitle);
        await siteDashboard.verifyTileRedirects(createdTileTitle, REDIRECT_URLS.JIRA);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify show more behaviour on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-13520'],
          storyId: 'INT-13223',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add Jira tile
        await homeDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_HOME,
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await homeDashboard.verifyShowMoreBehavior(createdTileTitle);
      }
    );
    test(
      'verify show more behaviour on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-29843'],
          storyId: 'INT-13223',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add Jira tile
        await siteDashboard.addAppManagerDefinedWithOptions(
          createdTileTitle,
          AppName,
          DisplayRecentTickets,
          UI_ACTIONS.ADD_TO_SITE,
          JIRA_VALUES.PROJECT,
          JIRA_VALUES.INTEGRATIONS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify first 4 tasks are displayed and then click on show more button and verify all tasks are displayed
        await siteDashboard.verifyShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify that App Manager should be able to add a JIRA App Tile to Display tickets using JQL with preferences set to "App Manager defined" on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-15790', 'INT-15812', 'INT-15814'],
          storyId: 'INT-15400',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTilewithDefinedSettingsTextArea(
          createdTileTitle,
          AppName,
          DisplayTicketsUsingJQL,
          AppManagerDefined,
          JQLQuery,
          JQLQueryValue,
          UI_ACTIONS.ADD_TO_HOME
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
      'verify that App Manager should be able to add a JIRA App Tile to Display tickets using JQL with preferences set to "Site Manager defined" on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-15793', 'INT-16122', 'INT-29840'],
          storyId: 'INT-15400',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addTilewithDefinedSettingsTextArea(
          createdTileTitle,
          AppName,
          DisplayTicketsUsingJQL,
          SiteManagerDefined,
          JQLQuery,
          JQLQueryValue,
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
      'verify that App Manager should be able to add a JIRA App Tile to Display tickets using JQL with preferences set to "User defined" on Home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-15773'],
          storyId: 'INT-15400',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          DisplayTicketsUsingJQL,
          JQLQuery
        );
        await homeDashboard.setUpTileTextAreaInput(createdTileTitle, FIELD_NAMES.JQL_QUERY, JIRA_VALUES.JIRA_JQL_QUERY);
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await homeDashboard.verifyJiraContentStructure(createdTileTitle);
      }
    );
    test(
      'verify that App Manager should be able to add a JIRA App Tile to Display tickets using JQL with preferences set to "User defined" on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-15789'],
          storyId: 'INT-15400',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          DisplayTicketsUsingJQL,
          JQLQuery
        );
        await siteDashboard.setUpTileTextAreaInput(createdTileTitle, FIELD_NAMES.JQL_QUERY, JIRA_VALUES.JIRA_JQL_QUERY);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await siteDashboard.verifyJiraContentStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'vVerify that App admin is able to add a Jira Service Desk App Tile for ticket creation on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23164', 'INT-23168', 'INT-23171'],
          storyId: 'INT-21627',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewTicket,
          FIELD_NAMES.JIRA_SERVICE_DESK,
          JIRA_VALUES.JIRA_SERVICE_DESK_VALUE,
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
      'verify that App admin is able to add a Jira Service Desk App Tile for ticket creation on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23167', 'INT-23169', 'INT-23172'],
          storyId: 'INT-21627',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewTicket,
          FIELD_NAMES.JIRA_SERVICE_DESK,
          JIRA_VALUES.JIRA_SERVICE_DESK_VALUE,
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
      'verify App Mangager is able to create a ticket on Jira Service Desk through a tile in the home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },

      async ({ page, appManagerApiFixture }) => {
        const { tileManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23153'],
          storyId: 'INT-21626',
        });

        // Create HomeDashboard with tileManagementHelper
        const homeDashboard = new HomeDashboard(page, tileManagementHelper);
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Add and edit tile
        await homeDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewTicket,
          FIELD_NAMES.JIRA_SERVICE_DESK,
          JIRA_VALUES.JIRA_SERVICE_DESK_VALUE,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.createTicketFromTile(
          createdTileTitle,
          FIELD_NAMES.TICKET_GROUP,
          JIRA_VALUES.TICKET_GROUP_VALUE,
          FIELD_NAMES.TICKET_TYPE,
          JIRA_VALUES.TICKET_TYPE_VALUE,
          FIELD_NAMES.SUMMARY,
          JIRA_VALUES.SUMMARY_VALUE
        );

        // Verify tile content structure
        await homeDashboard.verifyServiceNowCreatedTicketStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify App Manager is able to create a ticket on Jira Service Desk through a tile in the site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },

      async ({ page, appManagerApiFixture }) => {
        const { siteManagementHelper } = appManagerApiFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-23154'],
          storyId: 'INT-21626',
        });

        // Create SiteDashboard instance directly (user is already logged in from beforeEach)
        const siteDashboard = new SiteDashboard(page);

        //Generate a random tile title
        createdTileTitle = `JIRA report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add and edit tile
        await siteDashboard.addTileWithDropdownField(
          createdTileTitle,
          AppName,
          CreateNewTicket,
          FIELD_NAMES.JIRA_SERVICE_DESK,
          JIRA_VALUES.JIRA_SERVICE_DESK_VALUE,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.createTicketFromTile(
          createdTileTitle,
          FIELD_NAMES.TICKET_GROUP,
          JIRA_VALUES.TICKET_GROUP_VALUE,
          FIELD_NAMES.TICKET_TYPE,
          JIRA_VALUES.TICKET_TYPE_VALUE,
          FIELD_NAMES.SUMMARY,
          JIRA_VALUES.SUMMARY_VALUE
        );
        // Verify tile content structure
        await siteDashboard.verifyServiceNowCreatedTicketStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
