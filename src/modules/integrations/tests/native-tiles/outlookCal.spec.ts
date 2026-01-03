import { faker } from '@faker-js/faker';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { UI_ACTIONS } from '@/src/modules/integrations/constants/common';
import { MESSAGES } from '@/src/modules/integrations/constants/messageRepo';
import { IntegrationsSuiteTags } from '@/src/modules/integrations/constants/testTags';
import { integrationsFixture as test } from '@/src/modules/integrations/fixtures/integrationsFixture';
import { OUTLOOK_CALENDAR_GROUPS, REDIRECT_URLS } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { ExternalAppProvider, ExternalAppsPage } from '@/src/modules/integrations/ui/pages/externalAppsPage';

test.describe(
  'Outlook Calendar Native Tiles Integration',
  {
    tag: [IntegrationsSuiteTags.OUTLOOK_CALENDAR_APPTILES, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
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
      'verify app manager is able to create, edit and remove display upcoming events outlook calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await homeDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = updatedTileTitle;
      }
    );

    test(
      'verify app manager is able to create, edit and remove display upcoming events outlook calendar apptile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_SITE,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        const updatedTileTitle = `${createdTileTitle}-Updated`;
        await siteDashboard.editTileName(createdTileTitle, updatedTileTitle);
        await siteDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(updatedTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'application manager after updating the title of outlook calendar tile and again click on the edit option and did not update anything just click the save button',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);

        // Open edit modal and verify all fields are populated correctly
        await homeDashboard.openEditModalAndVerifyFields(
          createdTileTitle,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS,
          'Outlook Calendar'
        );

        // Click Save without making any changes
        await homeDashboard.clickSaveButtonInEditModal();
        await homeDashboard.verifyToastMessage(MESSAGES.EDIT_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
      }
    );

    test(
      'outlook Calendar View Tile Verify Custom Name of Tile Event from Outlook Calendar',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        const externalAppsPage = new ExternalAppsPage(appManagerFixture.page);
        await externalAppsPage.navigateToExternalAppsPage();
        await externalAppsPage.verifyThePageIsLoaded();
        await externalAppsPage.verifyIntegrationIsConnected(ExternalAppProvider.OUTLOOK_CALENDAR, true);
        await homeDashboard.loadPage();
        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
      }
    );

    test(
      'verify show more behaviour for display upcoming events outlook calendar apptile on home dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14088',
          storyId: 'INT-13642',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyNativeShowMoreBehavior(createdTileTitle);
      }
    );

    test(
      'verify display upcoming events metadata for outlook calendar native tile on home dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyNativeCalendarUpcomingEventsTileData(
          createdTileTitle,
          undefined,
          undefined,
          undefined,
          'Outlook Calendar'
        );
        await homeDashboard.verifyNativeTileRedirects(createdTileTitle, REDIRECT_URLS.OUTLOOK_CALENDAR);
      }
    );

    test(
      'verify show more behaviour for display upcoming events outlook calendar native tile on site dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14088',
          storyId: 'INT-13642',
        });
        createdTileTitle = `Display upcoming events ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_SITE,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyNativeShowMoreBehavior(createdTileTitle);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify display upcoming events metadata for outlook calendar native tile on site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY, TestGroupType.SMOKE, IntegrationsSuiteTags.HEALTH_CHECK],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_SITE,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyNativeCalendarUpcomingEventsTileData(
          createdTileTitle,
          undefined,
          undefined,
          undefined,
          'Outlook Calendar'
        );
        await siteDashboard.verifyNativeTileRedirects(createdTileTitle, REDIRECT_URLS.OUTLOOK_CALENDAR);
        createdTileTitle = undefined;
      }
    );

    test(
      'verify Outlook Calendar native tile modal UI elements are displayed correctly',
      {
        tag: [TestPriority.P0, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        // Navigate to home page
        await homeDashboard.loadPage();
        await homeDashboard.verifyThePageIsLoaded();

        // Open add content tile modal and verify UI elements using page object methods
        await homeDashboard.openAddContentTileModalAndVerifyUI();

        // Close the modal
        await homeDashboard.closeAddContentTileModal();
      }
    );

    test(
      'verify Outlook Calendar native tile events are displayed in chronological order on home dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        const { homeDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        await homeDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_HOME,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await homeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await homeDashboard.isTilePresent(createdTileTitle);
        await homeDashboard.verifyNativeEventsChronologicalOrder(createdTileTitle);
      }
    );

    test(
      'verify Outlook Calendar native tile events are displayed in chronological order on site dashboard',
      {
        tag: [TestPriority.P2, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        const { siteManagementHelper, siteDashboard } = appManagerFixture;
        tagTest(test.info(), {
          zephyrTestId: 'INT-14149',
          storyId: 'INT-13643',
        });

        createdTileTitle = `Outlook Calendar native tile ${faker.string.alphanumeric({ length: 6 })}`;

        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        await siteDashboard.addNativeTile(
          createdTileTitle,
          'Outlook Calendar',
          UI_ACTIONS.ADD_TO_SITE,
          OUTLOOK_CALENDAR_GROUPS.MY_CALENDARS
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.verifyNativeEventsChronologicalOrder(createdTileTitle);
        createdTileTitle = undefined;
      }
    );
  }
);
