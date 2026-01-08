import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { TopNavBarComponent } from '@/src/core/ui/components/topNavBarComponent';
import { NewHomePage } from '@/src/core/ui/pages/newHomePage';
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
    let homePage: NewHomePage;
    let homeFeedPostId: string = '';
    let homeFeedPostText: string = '';

    test.beforeEach('Setup test environment', async ({ appManagerFixture }) => {
      // Initialize page objects
      homePage = new NewHomePage(appManagerFixture.page);

      // Login as Admin and navigate to Home-Global Feed
      await homePage.loadPage();
      await homePage.verifyThePageIsLoaded();
    });

    test.afterEach('Cleanup created feed posts', async ({ appManagerFixture }) => {
      if (homeFeedPostId) {
        try {
          await appManagerFixture.feedManagementHelper.deleteFeed(homeFeedPostId);
          console.log('Cleaned up feed post:', homeFeedPostId);
        } catch (error) {
          console.warn('Failed to cleanup feed post:', error);
        }
        homeFeedPostId = '';
        homeFeedPostText = '';
      }
    });

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

        await applicationManagerHomePage.clickOnManageDashboardCarousel();
        await applicationManagerHomePage.clickOnChangeLayout();
        await applicationManagerHomePage.clickExcludeFeed();
        await appManagerFixture.navigationHelper.clickOnGlobalFeed();
        const feedPage = new FeedPage(appManagerFixture.page);
        await feedPage.verifySmartFeedBlocksAreNotVisible();
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
            await appManagerProfileScreenPage.clickEditAbout();
            await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.saveProfileChanges();
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
              await feedPage.feedList.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.verifyMustReadSectionIsVisible();
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
            await appManagerProfileScreenPage.clickEditAbout();
            await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.saveProfileChanges();
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
              await feedPage.feedList.verifySmartFeedBlockIsVisible(blockName);
            }

            await feedPage.verifyMustReadSectionIsVisible();
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
            await appManagerProfileScreenPage.clickEditAbout();
            await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.saveProfileChanges();
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
            await siteDashboardPage.clickOnEditDashboard();
            await siteDashboardPage.clickOnChangeLayout();

            if (layoutSign === 'recommended') {
              await siteDashboardPage.clickIncludeFeed();
            } else {
              await siteDashboardPage.checkIncludeFeed();
              await siteDashboardPage.selectTileLayout(layoutSign);
            }

            // Click on Feed link/tab
            await siteDashboardPage.clickOnFeedLink();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.feedList.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.verifyMustReadSectionIsVisible();
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
            await appManagerProfileScreenPage.clickEditAbout();
            await appManagerProfileScreenPage.updateDateOfBirth(birthMonth, birthDay);
            await appManagerProfileScreenPage.saveProfileChanges();
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
            await siteDashboardPage.clickOnEditDashboard();
            await siteDashboardPage.clickOnChangeLayout();

            await siteDashboardPage.checkIncludeFeed();
            await siteDashboardPage.selectTileLayout(layoutSign);

            // Click on Feed link/tab
            await siteDashboardPage.clickOnFeedLink();
            await feedPage.verifyThePageIsLoaded();

            // Verify all smart feed blocks are visible
            for (const blockName of smartFeedBlocks) {
              await feedPage.feedList.verifySmartFeedBlockIsVisible(blockName);
            }

            // Verify "Must Read" section is visible (if applicable)
            await feedPage.verifyMustReadSectionIsVisible();
          });
        }
      }
    );

    test(
      'verify End User able to change the layout of Home Dashboard to include/exclude feed',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@CONT-19607'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify End User able to change the layout of Home Dashboard to include/exclude feed',
          zephyrTestId: 'CONT-19607',
          storyId: 'CONT-19607',
        });
        const feedPage = new FeedPage(standardUserFixture.page);
        const standardUserHomePage = standardUserFixture.homePage;

        // Admin Setup Phase: Create feed post and set User as Home Control
        await test.step('Admin: Create feed post on home dashboard', async () => {
          const homeFeedTestData = TestDataGenerator.generateFeed({
            scope: 'public',
            siteId: undefined,
            waitForSearchIndex: false,
          });
          const homeFeedResponse = await appManagerFixture.feedManagementHelper.createFeed(homeFeedTestData);
          homeFeedPostId = homeFeedResponse.result.feedId;
          homeFeedPostText = homeFeedTestData.text;
        });

        await test.step('Admin: Set User as Home Control via API', async () => {
          await appManagerFixture.feedManagementHelper.configureAppGovernance({
            isHomeAppManagerControlled: false,
          });
        });

        // End User Verification Phase
        await test.step('End User: Navigate to Home tab', async () => {
          await standardUserFixture.navigationHelper.clickOnGlobalFeed();
          await standardUserFixture.homePage.loadPage();
          await standardUserFixture.homePage.verifyThePageIsLoaded();
        });

        await test.step('End User: Include Feed in Dashboard', async () => {
          await standardUserHomePage.clickOnManageDashboardCarousel();
          await standardUserHomePage.clickOnChangeLayout();
          await standardUserHomePage.clickIncludeFeed();
        });

        await test.step('End User: Verify feed post is visible on home dashboard', async () => {
          await feedPage.feedList.waitForPostToBeVisible(homeFeedPostText);
        });

        await test.step('End User: Refresh page and verify feed post is still visible', async () => {
          await feedPage.reloadPage();
          await feedPage.feedList.waitForPostToBeVisible(homeFeedPostText);
        });

        await test.step('End User: Exclude Feed from Dashboard', async () => {
          await standardUserHomePage.clickOnManageDashboardCarousel();
          await standardUserHomePage.clickOnChangeLayout();
          await standardUserHomePage.clickExcludeFeed();
        });

        await test.step('End User: Verify feed post is not visible on home dashboard', async () => {
          await feedPage.feedList.verifyPostIsNotVisible(homeFeedPostText);
        });
      }
    );
  }
);
