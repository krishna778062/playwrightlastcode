import { faker } from '@faker-js/faker';
import { FIELD_NAMES } from '@integrations-constants/common';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { REDIRECT_URLS } from '../../test-data/app-tiles.test-data';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';

test.describe(
  'salesforce App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.SALESFORCE, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'Salesforce';
    const TabularReport = 'Display a tabular report';
    const AppManagerDefined = 'App manager defined';
    const SiteManagerDefined = 'Site manager defined';
    const ReportIdOption = 'Report ID';
    const ReportId = '00O5i00000BBQuy';

    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ appManagerFixture }) => {
      const { tileManagementHelper, homeDashboard } = appManagerFixture;
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'verify that App manager should be able to add a Salesforce App Tile to view Salesforce reports on home dashboard with preference as "App Manager"',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14154', 'INT-14159', 'INT-14164', 'INT-14166'],
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific Salesforce tile
        await homeDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          AppManagerDefined,
          ReportIdOption,
          ReportId,
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
      'verify that App manager should be able to add a Salesforce App Tile to view Salesforce reports on site dashboard with preference as Site Manager',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-14155', 'INT-18325', 'INT-18324'],
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific Salesforce tile
        await siteDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          SiteManagerDefined,
          ReportIdOption,
          ReportId,
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
      'verify UI layout for added Salesforce Tile on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28575',
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific Salesforce tile
        await homeDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          AppManagerDefined,
          ReportIdOption,
          ReportId,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifySalesforceContentStructure(createdTileTitle);
      }
    );
    test(
      'verify UI layout for added Salesforce Tile on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28576'],
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific Salesforce tile
        await siteDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          SiteManagerDefined,
          ReportIdOption,
          ReportId,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifySalesforceContentStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify Redirect URL for View Complete Report on Home Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-28578',
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Using tileId instead of connectorId to create specific Salesforce tile
        await homeDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          AppManagerDefined,
          ReportIdOption,
          ReportId,
          UI_ACTIONS.ADD_TO_HOME
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await homeDashboard.verifySalesforceViewCompleteReportLink(createdTileTitle, REDIRECT_URLS.SALESFORCE);
      }
    );
    test(
      'verify Redirect URL to View Complete Report on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28578'],
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Using tileId instead of connectorId to create specific Salesforce tile
        await siteDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          TabularReport,
          SiteManagerDefined,
          ReportIdOption,
          ReportId,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifySalesforceViewCompleteReportLink(createdTileTitle, REDIRECT_URLS.SALESFORCE);
        createdTileTitle = undefined;
      }
    );
    test(
      'verify that App manager should be able to add a Salesforce App Tile to view Salesforce reports on home dashboard with preference as " User Defined"',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-18322',
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        //add,personalize,edit,verify
        await homeDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          TabularReport,
          FIELD_NAMES.REPORT_ID
        );
        await homeDashboard.setUpTileTextbox(
          createdTileTitle,
          FIELD_NAMES.REPORT_ID,
          REDIRECT_URLS.SALESFORCE_REPORT_ID
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        // Verify tile content structure
        await homeDashboard.verifySalesforceContentStructure(createdTileTitle);
      }
    );
    test(
      'verify that App manager should be able to add a Salesforce App Tile to view Salesforce reports on site dashboard with preference as " User Defined" on Site Dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteDashboard, siteManagementHelper } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: ['INT-28574'],
          storyId: 'INT-13330',
        });
        createdTileTitle = `Salesforce Tabular Report ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        //add,personalize,edit,verify
        await siteDashboard.addTilewithPersonalizeSingleField(
          createdTileTitle,
          AppName,
          TabularReport,
          FIELD_NAMES.REPORT_ID
        );
        await siteDashboard.setUpTileTextbox(
          createdTileTitle,
          FIELD_NAMES.REPORT_ID,
          REDIRECT_URLS.SALESFORCE_REPORT_ID
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);

        // Verify tile content structure
        await siteDashboard.verifySalesforceContentStructure(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
