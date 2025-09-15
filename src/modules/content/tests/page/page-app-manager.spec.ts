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
import { PageCreationPage } from '@content/pages/pageCreationPage';
import { SiteDashboardPage } from '@content/pages/siteDashboardPage';
import { SiteDetailsPage } from '@content/pages/siteDetailsPage';
import { CONTENT_TEST_DATA } from '@content/test-data/content.test-data';
import { SITE_TEST_DATA } from '@content/test-data/sites-create.test-data';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { NewUxHomePage } from '@core/pages/homePage/newUxHomePage';
import { TestDataGenerator } from '@core/utils/testDataGenerator';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  `Page Creation by Application Manager`,
  {
    tag: [ContentTestSuite.PAGE_APP_MANAGER, ContentSuiteTags.PAGE_CREATION],
  },
  () => {
    let pageCreationPage: PageCreationPage;
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
      'Setting up the test environment for page creation by opening page creation page from home page',
      async ({ appManagerHomePage, appManagersPage, siteManagementHelper }) => {
        // Create home page instance and navigate to page creation
        await appManagerHomePage.verifyThePageIsLoaded();
        contentPreviewPage = new ContentPreviewPage(
          appManagersPage,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );

        // Initialize additional page objects for the moved test cases
        homePage = new NewUxHomePage(appManagersPage);
        applicationscreen = new ApplicationScreenPage(appManagersPage);
        manageFeaturePage = new ManageFeature(appManagersPage);
        manageApplicationPage = new ManageApplicationPage(appManagersPage);
        governanceScreenPage = new GovernanceScreenPage(appManagersPage);
        manageContentPage = new ManageContentPage(appManagersPage);
        manageSitePage = new ManageSitePage(appManagersPage, '');
        siteDetailsPage = new SiteDetailsPage(appManagersPage, '');
        editPagePage = new EditPagePage(appManagersPage);
        siteDashboardPage = new SiteDashboardPage(appManagersPage, '', siteManagementHelper);

        // Reset cleanup flag for each test
        manualCleanupNeeded = false;
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
      'Verify admin is able to publish a new page created with cover image from home page',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.COVER_IMAGE,
          ContentSuiteTags.PAGE_CREATION,
          '@CONT-11635',
        ],
      },
      async ({ appManagerHomePage, appManagersPage, siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from home page',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        pageCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
          ContentType.PAGE
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );

        // Use the new wrapper method to create and publish the page
        const { pageId, siteId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );

        console.log(`Created page: ${pageCreationOptions.title} with ID: ${pageId} in site: ${siteId}`);
      }
    );
    test(
      'Verify admin is able to publish a new page created with cover image from site dashboard',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.COVER_IMAGE, ContentSuiteTags.PAGE_CREATION],
      },
      async ({ appManagerApiClient, siteManagementHelper, appManagersPage }) => {
        tagTest(test.info(), {
          description: 'Verify admin is able to publish a new page created with cover image from site dashboard',
          zephyrTestId: 'CONT-39089',
          storyId: 'CONT-39089',
        });
        const category = await appManagerApiClient.getSiteManagementService().getCategoryId(SITE_TEST_DATA[0].category);
        createdSite = await siteManagementHelper.createPublicSite({
          category,
          overrides: { access: SITE_TEST_DATA[0].siteType },
        });
        console.log(`Created site: ${createdSite.siteName} with ID: ${createdSite.siteId}`);

        // Store the site ID for page publishing
        siteIdToPublishPage = createdSite.siteId;
        // Navigate from site dashboard to page creation
        siteDashboardPage = new SiteDashboardPage(appManagersPage, siteIdToPublishPage, siteManagementHelper);

        //flow
        await siteDashboardPage.loadPage();
        pageCreationPage = await siteDashboardPage.actions.navigateToPageCreationFromSiteDashboard();

        // Generate page data using TestDataGenerator
        const pageCreationOptions = TestDataGenerator.generatePage(
          PageContentType.NEWS,
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          'uncategorized'
        );

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store page ID for cleanup (siteIdToPublishPage is already set above)
        publishedPageId = pageId;

        // Initialize preview page and handle the promotion
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );

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
