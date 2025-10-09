import { ContentType } from '@content/constants/contentType';
import { PageContentType } from '@content/constants/pageContentType';
import { ContentTestSuite } from '@content/constants/testSuite';
import { ContentFeatureTags, ContentSuiteTags } from '@content/constants/testTags';
import { contentTestFixture as test } from '@content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@content/test-data/sites-create.test-data';
import { ApplicationScreenPage } from '@content/ui/pages/applicationscreenPage';
import { ContentPreviewPage } from '@content/ui/pages/contentPreviewPage';
import { EditPagePage } from '@content/ui/pages/editPagePage';
import { GovernanceScreenPage } from '@content/ui/pages/governanceScreenPage';
import { ManageApplicationPage } from '@content/ui/pages/manageApplicationPage';
import { ManageContentPage } from '@content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ManageFeature } from '@content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
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
    let applicationscreen: ApplicationScreenPage;
    let manageFeaturePage: ManageFeature;
    let manageApplicationPage: ManageApplicationPage;
    let governanceScreenPage: GovernanceScreenPage;
    let manageContentPage: ManageContentPage;
    let manageSitePage: ManageSitePage;
    let siteDetailsPage: SiteDetailsPage;
    let editPagePage: EditPagePage;

    test.beforeEach('Setting up the test environment for page creation using API', async ({ appManagerFixture }) => {
      // Configure app governance
      // await feedManagementHelper.configureAppGovernance({ feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE });

      try {
        await appManagerFixture.feedManagementHelper.configureAppGovernance({
          feedMode: FEED_TEST_DATA.DEFAULT_FEED_MODE,
        });
      } catch (error) {
        console.warn('Failed to configure app governance, continuing with test:', error);
        // Optionally skip the governance step if it's not critical
      }

      // Create site using API
      const category = await appManagerFixture.siteManagementHelper.siteManagementService.getCategoryId(
        SITE_TEST_DATA[0].category
      );
      createdSite = await appManagerFixture.siteManagementHelper.createPublicSite({
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
      const createdPage = await appManagerFixture.contentManagementHelper.createPage({
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
        appManagerFixture.page,
        createdSite.siteId,
        publishedPageId,
        ContentType.PAGE
      );

      // Initialize additional page objects for the test cases
      applicationscreen = new ApplicationScreenPage(appManagerFixture.page);
      manageFeaturePage = new ManageFeature(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      governanceScreenPage = new GovernanceScreenPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      manageSitePage = new ManageSitePage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
      editPagePage = new EditPagePage(appManagerFixture.page);
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');

      console.log(
        `Created page: ${pageCreationOptions.title} with ID: ${publishedPageId} in site: ${siteIdToPublishPage}`
      );
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Only cleanup manually if needed (for UI-only tests)
      if (manualCleanupNeeded && publishedPageId && siteIdToPublishPage) {
        await appManagerFixture.contentManagementHelper.deleteContent(siteIdToPublishPage, publishedPageId);
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
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify feed and comment should not be displayed when feed and comments are disabled app level',
          zephyrTestId: 'CONT-26613',
          storyId: 'CONT-26613',
        });
        // Create home page instance
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationscreen.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnGovernance();
        await governanceScreenPage.actions.clickOnTimeline();
        await governanceScreenPage.actions.clickOnSave();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnContent();
        await contentPreviewPage.actions.checkCommentOption();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnSitesCard();
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.actions.ViewSite();
        await siteDashboardPage.actions.verfiyFeedSection();
        await appManagerFixture.navigationHelper.clickOnHomeButton();
        await appManagerFixture.navigationHelper.clickOnFeedSideMenu();
        await siteDashboardPage.actions.verfiyFeedSection();
      }
    );

    test(
      'Zeus: Edit the validation Expired Content and Cancel',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VALIDATION_REQUIRED_BAR_STATE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Zeus: Edit the validation Expired Content and Cancel',
          zephyrTestId: 'CONT-36069',
          storyId: 'CONT-36069',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
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
