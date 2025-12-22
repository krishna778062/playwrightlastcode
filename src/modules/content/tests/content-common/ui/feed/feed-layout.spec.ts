import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { SmartFeedBlock } from '@/src/modules/content/constants/smartFeedBlocks';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@/src/modules/content/test-data/feed.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { ProfileScreenPage } from '@/src/modules/content/ui/pages/profileScreenPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  'feed Layout Tests',
  {
    tag: [ContentTestSuite.FEED_LAYOUT],
  },
  () => {
    test(
      'smart Feed blocks not visible on Home Dashboard when "Include feed on dashboard" is unchecked CONT-22570',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-22570'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks not visible on Home Dashboard when "Include feed on dashboard" is unchecked',
          zephyrTestId: 'CONT-22570',
          storyId: 'CONT-22570',
        });

        const applicationManagerHomePage = appManagerFixture.homePage;

        await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.actions.clickOnChangeLayout();
        await applicationManagerHomePage.actions.clickExcludeFeed();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.assertions.verifySmartFeedBlocksAreNotVisible();
      }
    );

    test(
      'smart Feed blocks visible on Home Dashboard across first 3 tile layouts when feed is included',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-22569'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks visible on Home Dashboard across first 3 tile layouts when feed is included',
          zephyrTestId: 'CONT-22569',
          storyId: 'CONT-22569',
        });

        let eventId: string = '';
        let siteId: string = '';

        // Setup: Create event and update user DOB so smart feed blocks are visible
        await test.step('Setup: Create event and update user DOB for smart feed blocks', async () => {
          // Get a public site
          const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          siteId = siteDetails.siteId;

          // Create an event on the site for "Upcoming events" block
          const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
            siteId: siteId,
            contentInfo: {
              contentType: 'event',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          eventId = eventInfo.contentId;

          // Update user's date of birth for celebration block
          const today = new Date();
          const appManagerTopNavBarComponent = new TopNavBarComponent(appManagerFixture.page);

          const appManagerUserId = await appManagerFixture.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });

          if (appManagerUserId) {
            // Set birth month and day (using current month and tomorrow's day)
            const birthMonth = FEED_TEST_DATA.DATES.MONTH;
            const birthDay = FEED_TEST_DATA.DATES.UPCOMING_DAY;

            await appManagerTopNavBarComponent.openViewProfile({
              stepInfo: 'Opening app manager view profile from profile icon',
            });

            const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);
            await appManagerProfileScreenPage.actions.clickEditAbout();
            await appManagerProfileScreenPage.actions.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.actions.saveProfileChanges();
          }
        });

        const applicationManagerHomePage = appManagerFixture.homePage;
        const feedPage = new FeedPage(appManagerFixture.page);

        // Define the smart feed blocks to validate
        const smartFeedBlocks = [
          SmartFeedBlock.TOP_PICKS,
          SmartFeedBlock.UPCOMING_EVENTS,
          SmartFeedBlock.RECENTLY_PUBLISHED,
          SmartFeedBlock.CELEBRATION,
        ];

        // Define all tile layouts to test (6 layouts: indices 0-5)
        const tileLayouts = ['recommended', 'o', 'g'];

        // Loop through each tile layout
        for (const layoutSign of tileLayouts) {
          await test.step(`Validate smart feed blocks for tile layout ${layoutSign}`, async () => {
            // Navigate to Home page
            await applicationManagerHomePage.loadPage();
            await applicationManagerHomePage.verifyThePageIsLoaded();

            // Click "Edit Dashboard" → "Change Layout"
            await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
            await applicationManagerHomePage.actions.clickOnChangeLayout();

            if (layoutSign === 'recommended') {
              await applicationManagerHomePage.actions.clickIncludeFeed();
            } else {
              await applicationManagerHomePage.actions.checkIncludeFeed();
              await applicationManagerHomePage.actions.selectTileLayout(layoutSign);
            }

            // Navigate to Global Feed
            await appManagerFixture.navigationHelper.clickOnGlobalFeed();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.assertions.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.assertions.verifyMustReadSectionIsVisible();
          });
        }
      }
    );

    test(
      'smart Feed blocks visible on Home Dashboard across last 3 tile layouts when feed is included',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-43302'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks visible on Home Dashboard across all tile layouts when feed is included',
          zephyrTestId: 'CONT-43302',
          storyId: 'CONT-43302',
        });

        let eventId: string = '';
        let siteId: string = '';

        // Setup: Create event and update user DOB so smart feed blocks are visible
        await test.step('Setup: Create event and update user DOB for smart feed blocks', async () => {
          // Get a public site
          const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          siteId = siteDetails.siteId;

          // Create an event on the site for "Upcoming events" block
          const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
            siteId: siteId,
            contentInfo: {
              contentType: 'event',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          eventId = eventInfo.contentId;
          console.log(`Created event via API: ${eventId} in site: ${siteId}`);

          // Update user's date of birth for celebration block
          const appManagerTopNavBarComponent = new TopNavBarComponent(appManagerFixture.page);

          const appManagerUserId = await appManagerFixture.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });

          if (appManagerUserId) {
            // Set birth month and day (using current month and tomorrow's day)
            const birthMonth = FEED_TEST_DATA.DATES.MONTH;
            const birthDay = FEED_TEST_DATA.DATES.UPCOMING_DAY;

            await appManagerTopNavBarComponent.openViewProfile({
              stepInfo: 'Opening app manager view profile from profile icon',
            });

            const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);
            await appManagerProfileScreenPage.actions.clickEditAbout();
            await appManagerProfileScreenPage.actions.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.actions.saveProfileChanges();
          }
        });

        const applicationManagerHomePage = appManagerFixture.homePage;
        const feedPage = new FeedPage(appManagerFixture.page);

        // Define the smart feed blocks to validate
        const smartFeedBlocks = [
          SmartFeedBlock.TOP_PICKS,
          SmartFeedBlock.UPCOMING_EVENTS,
          SmartFeedBlock.RECENTLY_PUBLISHED,
          SmartFeedBlock.CELEBRATION,
        ];

        // Define all tile layouts to test (6 layouts: indices 0-5)
        const tileLayouts = ['p', 'q', 'r'];

        // Loop through each tile layout
        for (const layoutSign of tileLayouts) {
          await test.step(`Validate smart feed blocks for tile layout ${layoutSign}`, async () => {
            // Navigate to Home page
            await applicationManagerHomePage.loadPage();
            await applicationManagerHomePage.verifyThePageIsLoaded();

            // Click "Edit Dashboard" → "Change Layout"
            await applicationManagerHomePage.actions.clickOnManageDashboardCarousel();
            await applicationManagerHomePage.actions.clickOnChangeLayout();

            await applicationManagerHomePage.actions.checkIncludeFeed();
            await applicationManagerHomePage.actions.selectTileLayout(layoutSign);

            // Navigate to Global Feed
            await appManagerFixture.navigationHelper.clickOnGlobalFeed();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.assertions.verifySmartFeedBlockIsVisible(blockName);
            }

            await feedPage.assertions.verifyMustReadSectionIsVisible();
          });
        }
      }
    );

    test(
      'smart Feed blocks visible on Site Dashboard across first 3 tile layouts when feed is included',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-22909'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks visible on Site Dashboard across first 3 tile layouts when feed is included',
          zephyrTestId: 'CONT-22909',
          storyId: 'CONT-22909',
        });

        let eventId: string = '';
        let allEmployeesSiteId: string = '';

        // Create event and update user DOB so smart feed blocks are visible
        await test.step('Setup: Create event and update user DOB for smart feed blocks', async () => {
          // Get "All Employees" site
          allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

          // Create an event on the "All Employees" site for "Upcoming events" block
          const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
            siteId: allEmployeesSiteId,
            contentInfo: {
              contentType: 'event',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          eventId = eventInfo.contentId;
          console.log(`Created event via API: ${eventId} in site: ${allEmployeesSiteId}`);

          // Update user's date of birth for celebration block
          const appManagerTopNavBarComponent = new TopNavBarComponent(appManagerFixture.page);

          const appManagerUserId = await appManagerFixture.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });

          if (appManagerUserId) {
            // Set birth month and day (using current month and tomorrow's day)
            const birthMonth = FEED_TEST_DATA.DATES.MONTH;
            const birthDay = FEED_TEST_DATA.DATES.UPCOMING_DAY;

            await appManagerTopNavBarComponent.openViewProfile({
              stepInfo: 'Opening app manager view profile from profile icon',
            });

            const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);
            await appManagerProfileScreenPage.actions.clickEditAbout();
            await appManagerProfileScreenPage.actions.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.actions.saveProfileChanges();
          }
        });

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, allEmployeesSiteId);
        const feedPage = new FeedPage(appManagerFixture.page);

        // Define the smart feed blocks to validate
        const smartFeedBlocks = [
          SmartFeedBlock.UPCOMING_EVENTS,
          SmartFeedBlock.RECENTLY_PUBLISHED,
          SmartFeedBlock.CELEBRATION,
        ];

        // Define first 3 tile layouts to test
        const tileLayouts = ['recommended', 'o', 'g'];

        // Loop through each tile layout
        for (const layoutSign of tileLayouts) {
          await test.step(`Validate smart feed blocks for tile layout ${layoutSign}`, async () => {
            // Navigate to Site Dashboard
            await siteDashboardPage.loadPage();
            await siteDashboardPage.verifyThePageIsLoaded();

            // Click "Edit Dashboard" → "Change Layout"
            await siteDashboardPage.actions.clickOnEditDashboard();
            await siteDashboardPage.actions.clickOnChangeLayout();

            if (layoutSign === 'recommended') {
              await siteDashboardPage.actions.clickIncludeFeed();
            } else {
              await siteDashboardPage.actions.checkIncludeFeed();
              await siteDashboardPage.actions.selectTileLayout(layoutSign);
            }

            // Click on Feed link/tab
            await siteDashboardPage.actions.clickOnFeedLink();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.assertions.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.assertions.verifyMustReadSectionIsVisible();
          });
        }
      }
    );

    test(
      'smart Feed blocks visible on Site Dashboard across last 3 tile layouts when feed is included',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-43308'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Smart Feed blocks visible on Site Dashboard across last 3 tile layouts when feed is included',
          zephyrTestId: 'CONT-43308',
          storyId: 'CONT-43308',
        });

        let eventId: string = '';
        let allEmployeesSiteId: string = '';

        // Setup: Create event and update user DOB so smart feed blocks are visible
        await test.step('Setup: Create event and update user DOB for smart feed blocks', async () => {
          // Get "All Employees" site
          allEmployeesSiteId = await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

          // Create an event on the "All Employees" site for "Upcoming events" block
          const eventInfo = await appManagerFixture.contentManagementHelper.createEvent({
            siteId: allEmployeesSiteId,
            contentInfo: {
              contentType: 'event',
            },
            options: {
              waitForSearchIndex: false,
            },
          });
          eventId = eventInfo.contentId;
          console.log(`Created event via API: ${eventId} in site: ${allEmployeesSiteId}`);

          // Update user's date of birth for celebration block
          const appManagerTopNavBarComponent = new TopNavBarComponent(appManagerFixture.page);

          const appManagerUserId = await appManagerFixture.page.evaluate(() => {
            return (window as any).Simpplr?.CurrentUser?.uid;
          });

          if (appManagerUserId) {
            // Set birth month and day (using current month and tomorrow's day)
            const birthMonth = FEED_TEST_DATA.DATES.MONTH;
            const birthDay = FEED_TEST_DATA.DATES.UPCOMING_DAY;

            await appManagerTopNavBarComponent.openViewProfile({
              stepInfo: 'Opening app manager view profile from profile icon',
            });

            const appManagerProfileScreenPage = new ProfileScreenPage(appManagerFixture.page, appManagerUserId);
            await appManagerProfileScreenPage.actions.clickEditAbout();
            await appManagerProfileScreenPage.actions.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.actions.saveProfileChanges();
          }
        });

        const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, allEmployeesSiteId);
        const feedPage = new FeedPage(appManagerFixture.page);

        // Define the smart feed blocks to validate
        const smartFeedBlocks = [
          SmartFeedBlock.UPCOMING_EVENTS,
          SmartFeedBlock.RECENTLY_PUBLISHED,
          SmartFeedBlock.CELEBRATION,
        ];

        // Define last 3 tile layouts to test
        const tileLayouts = ['p', 'q', 'r'];

        // Loop through each tile layout
        for (const layoutSign of tileLayouts) {
          await test.step(`Validate smart feed blocks for tile layout ${layoutSign}`, async () => {
            // Navigate to Site Dashboard
            await siteDashboardPage.loadPage();
            await siteDashboardPage.verifyThePageIsLoaded();

            // Click "Edit Dashboard" → "Change Layout"
            await siteDashboardPage.actions.clickOnEditDashboard();
            await siteDashboardPage.actions.clickOnChangeLayout();

            await siteDashboardPage.actions.checkIncludeFeed();
            await siteDashboardPage.actions.selectTileLayout(layoutSign);

            // Click on Feed link/tab
            await siteDashboardPage.actions.clickOnFeedLink();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.assertions.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.assertions.verifyMustReadSectionIsVisible();
          });
        }
      }
    );
  }
);
