import { ContentType } from '@content/constants/contentType';
import { PageContentType } from '@content/constants/pageContentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { ApplicationScreenPage } from '@content/pages/applicationscreenPage';
import { ContentPreviewPage } from '@content/pages/contentPreviewPage';
import { EditPagePage } from '@content/pages/editPagePage';
import { GovernanceScreenPage } from '@content/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/pages/manageApplicationPage';
import { ManageContentPage } from '@content/pages/manageContentPage';
import { ApplicationScreenPage as ManageFeature } from '@content/pages/manageFeaturesPage';
import { ManageSitePage } from '@content/pages/manageSitePage';
import { SiteDetailsPage } from '@content/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/pages/sitePages/siteDashboardPage';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@content/test-data/sites-create.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

import { FEED_TEST_DATA } from '../../test-data/feed.test-data';

test.describe(
  `Page Creation by Application Manager`,
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER, ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishPage: string;
    let publishedPageId: string;
    let createdSite: any;
    let siteDashboardPage: SiteDashboardPage;
    let manualCleanupNeeded = false;
    let homePage: NewUxHomePage;
    let applicationscreen: ApplicationScreenPage;
    let manageFeaturePage: ManageFeature;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let manageContentPage: ManageContentPage;
    let manageSitePage: ManageSitePage;
    let siteDetailsPage: SiteDetailsPage;
    let editPagePage: EditPagePage;

    test.beforeEach(
      'Setting up the test environment for page creation using API',
      async ({
        appManagerHomePage,
        appManagersPage,
        siteManagementHelper,
        feedManagementHelper,
        contentManagementHelper,
        appManagerApiClient,
      }) => {
        // Configure app governance
        // await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });

        try {
          await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });
        } catch (error) {
          console.warn('Failed to configure app governance, continuing with test:', error);
          // Optionally skip the governance step if it's not critical
        }
        // Create home page instance
        await appManagerHomePage.verifyThePageIsLoaded();

        // Create site using API
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Store the site ID for page publishing
        siteIdToPublishPage = createdSite.siteId;

        // Create page using API instead of UI
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'Uncategorized'
        );

        // Use API to create and publish the page
        const createdPage = await contentManagementHelper.createPage({
          siteId: siteIdToPublishPage,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'news',
          },
          options: {
            pageName: pageCreationOptions.title,
            contentDescription: pageCreationOptions.description,
            waitForSearchIndex: false,
          },
        });

        // Store page ID for cleanup
        publishedPageId = createdPage.contentId;
        manualCleanupNeeded = true;

        // Initialize content preview page
        contentPreviewPage = new ContentPreviewPage(
          appManagersPage,
          createdSite.siteId,
          publishedPageId,
          ContentType.PAGE
        );

        // Initialize additional page objects for the test cases
        homePage = new NewUxHomePage(appManagersPage);
        applicationscreen = new ApplicationScreenPage(appManagersPage);
        manageFeaturePage = new ManageFeature(appManagersPage);
        manageApplicationPage = new ManageApplicationPage(appManagersPage);
        governanceScreenPage = new GovernanceScreenPage(appManagersPage);
        manageContentPage = new ManageContentPage(appManagersPage);
        manageSitePage = new ManageSitePage(appManagersPage, '');
        siteDetailsPage = new SiteDetailsPage(appManagersPage, '');
        editPagePage = new EditPagePage(appManagersPage);
        siteDashboardPage = new SiteDashboardPage(appManagersPage, '');

        console.log(
          `Created page: ${pageCreationOptions.title} with ID: ${publishedPageId} in site: ${siteIdToPublishPage}`
        );
      }
    );

    test.afterEach(async ({ contentManagementHelper }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
        console.log('Manual cleanup completed for page:', publishedPageId);
      } else {
        console.log('No page was published, hence skipping the deletion');
      }
    });

    test(
      'Verify feed and comment should not be displayed when feed and comments are disabled app level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VERIFY_COMMENTS_AND_FEEDS],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify feed and comment should not be displayed when feed and comments are disabled app level',
          zephyrTestId: 'CONT-26613',
          storyId: 'CONT-26613',
        });
        await homePage.actions.navigateToApplication();
        await applicationscreen.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.clickOnTimeline();
        await governanceScreenPage.actions.clickOnSave();
        await homePage.actions.clickOnManageFeature();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnContent();
        await contentPreviewPage.actions.checkCommentOption();
        await homePage.actions.clickOnManageFeature();
        await manageFeaturePage.actions.clickOnSitesCard();
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.actions.verfiyFeedSection();
        await homePage.actions.clickOnHomeButton();
        await homePage.actions.clickOnFeedSideMenu();
        await siteDashboardPage.actions.verfiyFeedSection();
      }
    );

    test(
      'Zeus: Edit the validation Expired Content and Cancel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VALIDATION_REQUIRED_BAR_STATE],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Zeus: Edit the validation Expired Content and Cancel',
          zephyrTestId: 'CONT-36069',
          storyId: 'CONT-36069',
        });
        await homePage.actions.clickOnManageFeature();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnViewAllButton();
        await manageContentPage.actions.verifyingValidationRequiredBarState();
        await manageContentPage.actions.clickOnEditButton();
        await editPagePage.actions.clickOnCancel();
        await manageContentPage.actions.verifyingValidationRequiredBarState();
      }
    );
  }
);
