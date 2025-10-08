import { faker } from '@faker-js/faker';
import {
  TimeOffCategoryConfig,
  TimeOffRequestTileComponent,
} from '@integrations-components/timeOffRequestTileComponent';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { integrationsFixture as test } from '@integrations-fixtures/integrationsFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { CONNECTOR_IDS, TILE_IDS } from '@/src/modules/integrations/test-data/app-tiles.test-data';

test.describe(
  'SAP SuccessFactors App Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.SAP_SUCCESSFACTORS, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const AppName = 'SAPSuccessFactors';
    const DisplayTimeOffBalance = 'Display Time Off Balance';
    const sickLeave = 'INDIA SICK LEAVE';
    const compTime = 'Comp Time';

    let createdTileTitle: string | undefined = undefined;

    test.afterEach(async ({ tileManagementHelper, homeDashboard }) => {
      if (createdTileTitle) {
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    test(
      'create and edit SAP SuccessFactors Display Time Off Balance tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24073',
          storyId: 'INT-23629',
        });

        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.SAP_DISPLAY_TIMEOFF_BALANCE,
          CONNECTOR_IDS.SAP_SUCCESSFACTORS
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
      'create and edit SAP SuccessFactors Display Time Off Balance tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24070',
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
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
      'create and edit SAP SuccessFactors Apply for Time Off tile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24069',
          storyId: 'INT-23629',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.SAP_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.SAP_SUCCESSFACTORS
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
      'verify SAP SuccessFactors Display Time Off Balance tile on Site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ siteDashboard, homeDashboard, siteManagementHelper }) => {
        void homeDashboard;
        tagTest(test.info(), {
          zephyrTestId: 'INT-24070',
          storyId: 'INT-23629',
        });

        //Generate a random tile title
        createdTileTitle = `Display Time Off Balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add, edit, and remove tile
        await siteDashboard.addTile(createdTileTitle, AppName, DisplayTimeOffBalance, UI_ACTIONS.ADD_TO_SITE);
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
      'verify SAP SuccessFactors Apply for Time Off tile amount calculation for different categories',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ homeDashboard, tileManagementHelper, appManagerPage }) => {
        tagTest(test.info(), {
          zephyrTestId: 'INT-24071',
          storyId: 'INT-23629',
        });

        createdTileTitle = `Apply for Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Create SAP SuccessFactors Apply for Time Off tile
        await tileManagementHelper.createIntegrationAppTile(
          createdTileTitle,
          TILE_IDS.SAP_APPLY_FOR_TIMEOFF,
          CONNECTOR_IDS.SAP_SUCCESSFACTORS
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        const leaveForm = new TimeOffRequestTileComponent(appManagerPage);
        const workingDays = 3;

        // Verify all required fields are present
        await leaveForm.verifyRequiredFields();

        // Select leave dates starting tomorrow for the specified working days
        await leaveForm.selectLeaveDates(workingDays);
        await leaveForm.selectTimeOffCategory(sickLeave);
        await leaveForm.verifyTotalDays(workingDays);

        // Verify individual day amounts and total calculation (weekends will be 0)
        const vacationConfig: TimeOffCategoryConfig = { unit: 'days', amountPerDay: 1 };
        await leaveForm.verifyAmountValues(workingDays, workingDays, vacationConfig);
        await leaveForm.selectTimeOffCategory(compTime);

        // Verify hours mode (Sick category) - no need to click edit when switching categories
        const sickConfig: TimeOffCategoryConfig = { unit: 'hours', amountPerDay: 8 };
        const expectedTotalHours = workingDays * 8; // 3 working days * 8 hours = 24 hours
        await leaveForm.verifyAmountValues(workingDays, expectedTotalHours, sickConfig, false);
      }
    );
  }
);
