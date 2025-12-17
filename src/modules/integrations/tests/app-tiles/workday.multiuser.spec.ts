import { faker } from '@faker-js/faker';
import { UI_ACTIONS } from '@integrations-constants/common';
import { MESSAGES } from '@integrations-constants/messageRepo';
import { IntegrationsSuiteTags } from '@integrations-constants/testTags';
import { multiUserTileFixture } from '@integrations-fixtures/multiUserTileFixture';
import { test } from '@playwright/test';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { waitUntilTilePresentInApi } from '@/src/modules/integrations/apis/helpers/tileApiHelpers';
import { REDIRECT_URLS, WORKDAY_CREDS, WORKDAY_VALUES } from '@/src/modules/integrations/test-data/app-tiles.test-data';
import { HomeDashboard } from '@/src/modules/integrations/ui/pages/homeDashboard';
import { PeopleTabPage } from '@/src/modules/integrations/ui/pages/peopleTabPage';
import { SiteDashboard } from '@/src/modules/integrations/ui/pages/siteDashboard';

test.describe(
  'workday App Tiles Multi-user Tests',
  {
    tag: [IntegrationsSuiteTags.WORKDAY, IntegrationsSuiteTags.ABSOLUTE],
  },
  () => {
    const {
      AppName,
      pendingLearningCoursesTile,
      applyTimeOffTile,
      paystubsTileName: paystubsTile,
      inboxTileName: inboxTile,
      AppManagerDefined,
      SiteManagerDefined,
      PayslipListUrl,
      InboxTasksReportUrl,
      jobPostingsTileName,
      timeOffBalanceTileName,
    } = WORKDAY_VALUES;
    let createdTileTitle: string | undefined = undefined;

    multiUserTileFixture.afterEach(async ({ adminPage, tileManagementHelper }) => {
      if (createdTileTitle) {
        const homeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await tileManagementHelper.removeIntegrationAppTile(createdTileTitle);
        await homeDashboard.verifyTileRemoved(createdTileTitle);
        createdTileTitle = undefined;
      }
    });

    // Verify Workday connection as the first test
    multiUserTileFixture(
      'verify workday is connected with valid credentials',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, '@workdayleave'],
      },
      async ({ adminPage }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-21414',
          storyId: 'INT-21182',
        });
        const peopleTab = new PeopleTabPage(adminPage);
        await peopleTab.navigateToPeopleDataPage();
        await peopleTab.verifyNavigatedToPeoplePage();
        await peopleTab.deselectWorkdayIfChecked();
        await peopleTab.configureWorkdayCredentials({
          username: WORKDAY_CREDS.USERNAME,
          password: WORKDAY_CREDS.PASSWORD,
          wsdlUrl: WORKDAY_CREDS.WSURL,
          tenantId: WORKDAY_CREDS.TENANT_ID,
          clientId: WORKDAY_CREDS.CLIENT_ID,
          clientSecret: WORKDAY_CREDS.CLIENT_SECRET,
          refreshToken: WORKDAY_CREDS.REFRESH_TOKEN,
        });
        await peopleTab.verifyToastMessage(MESSAGES.INTEGRATION_UPDATE_SUCCESS);
      }
    );

    multiUserTileFixture(
      'verify Display pending learning courses workday apptile is visible to end users after it has been added by the App Manager',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-21420',
          storyId: 'INT-20803',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display pending learning courses apptile ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, pendingLearningCoursesTile, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify Display pending learning courses workday apptile is visible to end users on site dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-21421',
          storyId: 'INT-20803',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display pending learning courses apptile${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, pendingLearningCoursesTile, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'multi-user tile management for Workday Apply Time Off tile on Home dashboard - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28962',
          storyId: 'INT-21182',
        });

        //Generate a random tile title
        createdTileTitle = `Apply Time Off ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, applyTimeOffTile, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'multi-user tile management for Workday Apply Time Off tile on Site dashboard - Admin creates, EndUser verifies, Admin deletes',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-28963',
          storyId: 'INT-21182',
        });

        //Generate a random tile title
        createdTileTitle = `Apply Time Off ${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, applyTimeOffTile, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'verify Display recent paystubs app manager defined workday apptile is visible to end users on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-22911',
          storyId: 'INT-21590',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display recent paystubs apptile ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          paystubsTile,
          AppManagerDefined,
          PayslipListUrl,
          REDIRECT_URLS.WORKDAY_RECENT_PAYSTUBS,
          UI_ACTIONS.ADD_TO_HOME
        );
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify Display recent paystubs workday apptile is visible to end users on site dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-22912',
          storyId: 'INT-21590',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display recent paystubs apptile${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          paystubsTile,
          SiteManagerDefined,
          PayslipListUrl,
          REDIRECT_URLS.WORKDAY_RECENT_PAYSTUBS,
          UI_ACTIONS.ADD_TO_SITE
        );
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'Verify Display inbox app manager defined workday apptile is visible to end users on home dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-26010',
          storyId: 'INT-12864',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display inbox apptile ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          inboxTile,
          AppManagerDefined,
          InboxTasksReportUrl,
          REDIRECT_URLS.WORKDAY_INBOX_TASKS_REPORT,
          UI_ACTIONS.ADD_TO_HOME
        );
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await adminPage.waitForTimeout(10000); //Actual behaviour: It takes more than 10 seconds to load the tile.
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify Display inbox workday apptile is visible to end users on site dashboard',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-26031',
          storyId: 'INT-12864',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display inbox apptile${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTilewithDefinedSettings(
          createdTileTitle,
          AppName,
          inboxTile,
          SiteManagerDefined,
          InboxTasksReportUrl,
          REDIRECT_URLS.WORKDAY_INBOX_TASKS_REPORT,
          UI_ACTIONS.ADD_TO_SITE
        );
        // eslint-disable-next-line playwright/no-wait-for-timeout
        await adminPage.waitForTimeout(10000); //Actual behaviour: It takes more than 10 seconds to load the tile.
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'Verify Display workday job postings default apptile is visible to end users on home dashboard after it has been added by the App Manager',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-21576',
          storyId: 'INT-27948',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display job postings tile ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, jobPostingsTileName, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify Display workday job postings default apptile is visible to end users on site dashboard after it has been added by the Site Manager',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-22742',
          storyId: 'INT-27948',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display job postings tile${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, jobPostingsTileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );

    multiUserTileFixture(
      'Verify Display Time Off default apptile is visible to end users on home dashboard after it has been added by the App Manager',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, '@workdayleave'],
      },
      async ({ adminPage, endUserPage, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-22916',
          storyId: 'INT-20791',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display time off balance ${faker.string.alphanumeric({ length: 6 })}`;

        // Add tile, verify by both users, then remove
        const adminHomeDashboard = new HomeDashboard(adminPage, tileManagementHelper);
        await adminHomeDashboard.addTile(createdTileTitle, AppName, timeOffBalanceTileName, UI_ACTIONS.ADD_TO_HOME);
        await adminHomeDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await adminHomeDashboard.isTilePresent(createdTileTitle);
        const endUserHomeDashboard = new HomeDashboard(endUserPage, tileManagementHelper);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserHomeDashboard.reloadAndVerifyTilePresent(createdTileTitle);
      }
    );

    multiUserTileFixture(
      'Verify Display Time Off default apptile is visible to end users on site dashboard after it has been added by the Site Manager',
      {
        tag: [TestPriority.P3, TestGroupType.SANITY, '@workdayleave'],
      },
      async ({ adminPage, endUserPage, siteManagementHelper, tileManagementHelper }) => {
        tagTest(multiUserTileFixture.info(), {
          zephyrTestId: 'INT-22917',
          storyId: 'INT-20791',
        });

        //Generate a random tile title
        createdTileTitle = `Workday display time off balance${faker.string.alphanumeric({ length: 6 })}`;
        const endUserSiteDashboard = new SiteDashboard(endUserPage);
        const siteDashboard = new SiteDashboard(adminPage, tileManagementHelper);

        // Create site and navigate
        const category = await siteManagementHelper.siteManagementService.getCategoryId('Uncategorized');
        const createdSite = await siteManagementHelper.createPublicSite({ category });
        await siteDashboard.navigateToSite(createdSite.siteId);

        // Add tile, verify by both users, then remove
        await siteDashboard.addTile(createdTileTitle, AppName, timeOffBalanceTileName, UI_ACTIONS.ADD_TO_SITE);
        await siteDashboard.verifyToastMessage(MESSAGES.ADD_TILE_SUCCESS_MESSAGE);
        await siteDashboard.isTilePresent(createdTileTitle);
        await endUserSiteDashboard.navigateToSite(createdSite.siteId);
        await waitUntilTilePresentInApi(endUserPage, createdTileTitle);
        await endUserSiteDashboard.isTilePresent(createdTileTitle);
        await siteDashboard.removeTile(createdTileTitle, MESSAGES.REMOVED_TILE_SUCCESS_MESSAGE);
        createdTileTitle = undefined;
      }
    );
  }
);
