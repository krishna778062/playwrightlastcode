import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NewHomePage } from '@/src/core';
import { ContentStatus, SortOptionLabels } from '@/src/modules/content/constants';
import { ManageContentOptions, ManageContentTags } from '@/src/modules/content/constants/manageContentOptions';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { DEFAULT_PUBLIC_SITE_NAME } from '@/src/modules/content/test-data/sites-create.test-data';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { EditPagePage } from '@/src/modules/content/ui/pages/editPagePage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { HomeFeedPage } from '@/src/modules/content/ui/pages/manageApplicationDefaultHomeFeedPage';
import { DefaultScreenPage } from '@/src/modules/content/ui/pages/manageApplicationDefaultScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SitesPage } from '@/src/modules/content/ui/pages/sitesPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_CONTENT,
  {
    tag: [ContentSuiteTags.MANAGE_CONTENT],
  },
  () => {
    let manageFeaturesPage: ManageFeaturesPage;
    let manageContentPage: ManageContentPage;
    let homePage: NewHomePage;
    let applicationScreenPage: ApplicationScreenPage;
    let manageApplicationPage: ManageApplicationPage;
    let defaultScreenPage: DefaultScreenPage;
    let homeFeedPage: HomeFeedPage;
    let editPage: EditPagePage;
    let manageSitePage: ManageSiteSetUpPage;
    let siteDetailsPage: SiteDetailsPage;
    let siteDashboardPage: SiteDashboardPage;
    let contentPreviewPage: ContentPreviewPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      defaultScreenPage = new DefaultScreenPage(appManagerFixture.page);
      homeFeedPage = new HomeFeedPage(appManagerFixture.page);
      editPage = new EditPagePage(appManagerFixture.page, '', '');
      homePage = new NewHomePage(appManagerFixture.page);
      manageSitePage = new ManageSiteSetUpPage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
      siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, '');
      contentPreviewPage = new ContentPreviewPage(appManagerFixture.page);
    });

    test(
      'verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters CONT-25055',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25055'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify "Nothing to show here" message appears when searching non-existing content and clicking X restores filtered results',
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });

        const title = MANAGE_CONTENT_TEST_DATA.TITLE;
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.writeRandomTextInSearchBar(title);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.assertions.nothingToShowHereText();
        await manageContentPage.actions.clickXButton();
        await manageContentPage.assertions.placeHolderTextShouldBeVisible();
      }
    );

    test(
      'verify Bulk actions Functionality in My Content Screen CONT-20952',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20952'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify bulk actions functionality including publish, unpublish, move, delete, and validate operations in My Content Screen',
          zephyrTestId: 'CONT-20952',
          storyId: 'CONT-20952',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.selectUnpublishButtonFromBulkActions();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.selectContentByNumberOfItems(3);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.selectMoveApplyButton();
        const site = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'private',
          sortBy: 'alphabetical',
        });
        const privateSite = site.result.listOfItems.find(
          (site: any) => site.isActive === true && site.isPrivate === true
        );
        await manageContentPage.actions.moveContentSearchBar(privateSite?.name || '');
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.selectPageCategoryIfVisible();
        await manageContentPage.actions.selectPageCategory();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
        await manageContentPage.actions.selectContentByNumberOfItems(3);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnValidateButton();
        await manageContentPage.actions.clickOnValidateApplyButton();
      }
    );

    test(
      'verify content publish and unpublish option in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20951'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify content publish and unpublish options are available and functional in My Content Screen',
          zephyrTestId: 'CONT-20951',
          storyId: 'CONT-20951',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.UNPUBLISH);
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.PUBLISH);
      }
    );

    test(
      'verify Delete Modal Cancel and Delete Button of Content from My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20945'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify delete modal functionality with cancel and delete button operations for content removal',
          zephyrTestId: 'CONT-20946',
          storyId: 'CONT-20946',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.addPublishContentFilter();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.clickDeleteOption();
        await manageContentPage.actions.clickDeleteModalConfirmButton();
      }
    );

    test(
      'verification of various aspects of My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20945'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify various UI elements including image container, author name, site name, and status stamps in My Content screen ',
          zephyrTestId: 'CONT-20945',
          storyId: 'CONT-20945',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.assertions.verifyImageContainer();
        await manageContentPage.assertions.authorNameShouldBeVisible();
        await manageContentPage.assertions.clickOnTheAuthorName();
        await manageContentPage.load();
        await manageContentPage.assertions.verifySiteName();
        await manageContentPage.assertions.clickOnTheSiteName();
        await manageContentPage.load();
        await manageContentPage.assertions.verifySiteStatusStamp();
      }
    );

    test(
      'verify Site Filter in My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20944'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify site filter functionality and search capabilities in My Content screen',
          zephyrTestId: 'CONT-20944',
          storyId: 'CONT-20944',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        const publicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        await manageContentPage.actions.clickSiteSearchBar(publicSite?.name || '');
        await manageContentPage.actions.selectSiteSearchBarOption();
        await manageContentPage.assertions.verifySiteNameLink();
      }
    );

    test(
      'verify created Newest Filter in My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20943'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify created Newest sorting filter functionality in My Contents screen',
          zephyrTestId: 'CONT-20943',
          storyId: 'CONT-20943',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
      }
    );
    test(
      'in Zeus Verify Default filters (Posts I follow and Recent Activity) are applied for Home Feed for New users',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.HOME_FEED],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'In Zeus Verify Default filters (Posts I follow and Recent Activity) are applied for Home Feed for New users',
          zephyrTestId: 'CONT-29493',
          storyId: 'CONT-29493',
        });
        await appManagerFixture.navigationHelper.openApplicationSettings();
        await applicationScreenPage.actions.clickOnApplication();
        await manageApplicationPage.actions.clickOnDefaults();
        await defaultScreenPage.actions.clickOnHomeFeed();
        await homeFeedPage.actions.selectingPostsIFollow();
        await homeFeedPage.actions.recentActivity();

        // Verify with standard user in parallel browser context
        await test.step('Verify home feed defaults for standard user', async () => {
          await standardUserFixture.homePage.verifyThePageIsLoaded();
          const standardUserFeedPage = new FeedPage(standardUserFixture.page);
          console.log('Successfully logged in as standard user');
          console.log('Verifying home feed defaults are applied for standard user');
          await standardUserFeedPage.assertions.verifyPostsIFollow();
          await standardUserFeedPage.assertions.verifySortByRecentActivity();
          await standardUserFeedPage.actions.clickOnShowOption('toMe');
          await standardUserFeedPage.actions.clickOnSortByOption('createdAt');
        });
      }
    );
    test(
      'to verify the site update category option in manage site user drop down sites CONT-26056',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.UPDATE_CATEGORY],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the site update category option in manage site user drop down sites',
          zephyrTestId: 'CONT-26056',
          storyId: 'CONT-26056',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSitePage.actions.clickOnUpdateCategory();
        await manageSitePage.actions.clickOnCancelOption();
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.assertions.validatingCategory();
        await manageSitePage.actions.clickOnSites();
        await manageSitePage.actions.clickOnUpdateCategory();
        await manageSitePage.actions.updatingCategoryToUncategorized('Uncategorized');
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.assertions.validatingCategoryToUncategorized();
      }
    );
    test(
      'to verify validate option in manage content CONT-33591',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.CONTENT_VALIDATE_OPTION, '@CONT-33591'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify validate option in manage content',
          zephyrTestId: 'CONT-33591',
          storyId: 'CONT-33591',
        });
        // Get the DEFAULT_PUBLIC_SITE_NAME site ID for API page creation
        const allEmployeesSiteId =
          await appManagerFixture.siteManagementHelper.getSiteIdWithName(DEFAULT_PUBLIC_SITE_NAME);

        // Use test data for page name
        const randomPageName = CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.title;

        // Create page using API
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: allEmployeesSiteId,
          contentInfo: {
            contentType: 'page',
            contentSubType: 'knowledge',
          },
          options: {
            pageName: randomPageName,
            contentDescription: CONTENT_TEST_DATA.DEFAULT_PAGE_CONTENT.description,
            waitForSearchIndex: false,
          },
        });

        console.log(
          `Created page via API: Test Page Title with ID: ${pageInfo.contentId} and name ${pageInfo.pageName} in ${DEFAULT_PUBLIC_SITE_NAME} site: ${allEmployeesSiteId}`
        );
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.writeRandomTextInSearchBar(randomPageName);
        await manageContentPage.actions.clickSearchIcon();
        await appManagerFixture.page.reload();
        await manageContentPage.assertions.checkValidateOptionInBulkActions();
        await manageContentPage.actions.openContentDetailsPage();
        await contentPreviewPage.assertions.verifyValidateOptionOnContentPreviewPage();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSitePage.actions.searchForSite(DEFAULT_PUBLIC_SITE_NAME);
        await manageSitePage.actions.clickOnSite();
        await siteDetailsPage.actions.clickOnContentTab();
        await siteDetailsPage.actions.typeContentInSearchBar(randomPageName);
        await siteDetailsPage.actions.clickSearchIcon();
        await siteDetailsPage.actions.openContentDetailsPage();
        await contentPreviewPage.assertions.verifyValidateOptionOnContentPreviewPage();
      }
    );

    test(
      'zeus: Edit the validation Expired Content and Cancel CONT-36069',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.VALIDATION_REQUIRED_BAR_STATE],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Zeus: Edit the validation Expired Content and Cancel',
          zephyrTestId: 'CONT-36069',
          storyId: 'CONT-36069',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnViewAllButton();
        await manageContentPage.actions.verifyingValidationRequiredBarState();
        await manageContentPage.actions.clickOnEditButton();
        await editPage.actions.clickOnCancel();
        await manageContentPage.actions.verifyingValidationRequiredBarState();
      }
    );
    test(
      'verify the bulk action in manage site content CONT-23981',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23981'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the bulk action in manage site content',
          zephyrTestId: 'CONT-23981',
          storyId: 'CONT-23981',
          isKnownFailure: true,
        });

        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.clickOnSelectAllButton();
        const contentNames = await manageContentPage.actions.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
        await manageContentPage.assertions.searchAllContentsInGlobalSearchBar(contentNames);
      }
    );
    test(
      'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site CONT-20532',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20532'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'verify published and unpublished stamp and its options menu on content under Content tab in Manage Site',
          zephyrTestId: 'CONT-20532',
          storyId: 'CONT-20532',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        console.log('pageInfo', pageInfo);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.actions.verifyContentDetailsVisibility(pageInfo.pageName);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.EDIT);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.DELETE);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.UNPUBLISH);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.MOVE);
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.PUBLISHED);
        await manageContentPage.actions.verifyOptionVisibleInManageContent(ManageContentOptions.ADD_TO_CAMPAIGN);
        await manageContentPage.actions.clickOnContentEditButton();
        await manageContentPage.actions.UpdatedPageName(MANAGE_CONTENT_TEST_DATA.UPDATED_PAGE_NAME);
        await manageContentPage.actions.clickOnPublishChangesButton();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.MODIFIED_NEWEST);
        await manageContentPage.actions.verifyContentVisibleInManageSite(MANAGE_CONTENT_TEST_DATA.UPDATED_PAGE_NAME);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.UNPUBLISHED);
        await manageContentPage.actions.hoverOnFirstDropDownOption();
        await manageContentPage.actions.clickOnDeleteOption();
        await manageContentPage.actions.clickDeleteModalConfirmButton();
      }
    );

    test(
      'verify user able to move unpublished content under Content tab in Manage Site CONT-20540',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20540'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'verify user able to move unpublished content under Content tab in Manage Site',
          zephyrTestId: 'CONT-20540',
          storyId: 'CONT-20540',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
        }
        console.log('contentListResponse', contentListResponse);
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.selectMoveApplyButton();
        const site = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'private',
          sortBy: 'alphabetical',
        });
        const privateSite = site.result.listOfItems.find(
          (site: any) => site.isActive === true && site.isPrivate === true
        );
        console.log('privateSite', privateSite);
        await manageContentPage.actions.moveContentSearchBar(privateSite?.name || '');
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.selectPageCategoryIfVisible();
        await manageContentPage.actions.selectPageCategory();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.verifyToastMessageIsVisibleWithText(
          MANAGE_CONTENT_TEST_DATA.TOAST_MESSAGES.MOVED_ITEM_SUCCESSFULLY
        );
      }
    );

    test(
      'verify user able to select all max 50 items under Content tab in Manage Content page CONT-20541',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-20541'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify user able to select all max 50 items under Content tab in Manage Content page',
          zephyrTestId: 'CONT-20541',
          storyId: 'CONT-20541',
        });
        const contentListResponse =
          await appManagerApiFixture.contentManagementHelper.contentManagementService.getContentList();
        if (contentListResponse.result.listOfItems.length < 50) {
          const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 50 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
          await manageFeaturesPage.actions.clickOnContentCard();
          await manageContentPage.actions.clickOnSelectAllButton();
          await manageContentPage.actions.verifyAllContentsAreSelected(17);
        }
      }
    );
    test(
      'to verify the navigation menu of recently visited site on home dashboard CONT-22482',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-22482'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the navigation menu of recently visited site on home dashboard',
          zephyrTestId: 'CONT-22482',
          storyId: 'CONT-22482',
        });
        // Get list of public sites
        const sitesResponse = await appManagerFixture.siteManagementHelper.getListOfSites({
          filter: 'public',
          size: 1000,
        });
        const activePublicSites = sitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        if (activePublicSites.length < 4) {
          throw new Error(`Not enough active public sites found. Found: ${activePublicSites.length}, Required: 4`);
        }

        // Get 4 unique sites (use Set to ensure uniqueness by siteId)
        const uniqueSites: any[] = [];
        const seenSiteIds = new Set<string>();
        for (const site of activePublicSites) {
          if (!seenSiteIds.has(site.siteId)) {
            uniqueSites.push(site);
            seenSiteIds.add(site.siteId);
            if (uniqueSites.length === 4) break;
          }
        }

        if (uniqueSites.length < 4) {
          throw new Error(`Not enough unique active public sites found. Found: ${uniqueSites.length}, Required: 4`);
        }

        // Perform the actions for 4 different sites
        for (let i = 0; i < 4; i++) {
          await test.step(`Navigate to site ${i + 1} of 4: ${uniqueSites[i].name}`, async () => {
            const siteInfo = uniqueSites[i];
            const siteDashboardPage = new SiteDashboardPage(appManagerFixture.page, siteInfo.siteId);
            await siteDashboardPage.loadPage();
            await siteDashboardPage.verifyThePageIsLoaded();
            const manageSitePageAppManagerSite = new ManageSiteSetUpPage(appManagerFixture.page, siteInfo.siteId);
            await manageSitePageAppManagerSite.actions.clickOnTheAboutTab();
          });
        }
        const newHomePage = new NewHomePage(appManagerFixture.page);
        await newHomePage.loadPage();
        await newHomePage.verifyThePageIsLoaded();
        await Promise.all([
          newHomePage.assertions.verifyRecentlyVisitedSiteIsDisplayed(uniqueSites[0].name),
          newHomePage.assertions.verifyRecentlyVisitedSiteIsDisplayed(uniqueSites[1].name),
          newHomePage.assertions.verifyRecentlyVisitedSiteIsDisplayed(uniqueSites[2].name),
          newHomePage.assertions.verifyRecentlyVisitedSiteIsDisplayed(uniqueSites[3].name),
        ]);
      }
    );
    test(
      'verify All Sites site category takes the user to respective category screen with list of Sites CONT-26918',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26918'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'verify All Sites site category takes the user to respective category screen with list of Sites',
          zephyrTestId: 'CONT-26918',
          storyId: 'CONT-26918',
        });
        await manageFeaturesPage.actions.clickOnSitesCard();
        const sitesPage = new SitesPage(appManagerFixture.page, '');
        await sitesPage.actions.clickOnCategoryTab();
        const categoryList = await appManagerApiFixture.siteManagementHelper.getCategoryList();

        // Find a category with exactly 1 site
        const categoryWithOneSite = categoryList.result.listOfItems.find((item: any) => item.siteCount === 1);

        if (!categoryWithOneSite) {
          throw new Error('No category found with exactly 1 site');
        }

        // Get all sites and find the site in this category
        const sitesResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites();
        const siteInCategory = sitesResponse.result.listOfItems.find(
          (site: any) => site.category?.categoryId === categoryWithOneSite.categoryId
        );

        if (!siteInCategory) {
          throw new Error(`No site found in category: ${categoryWithOneSite.name}`);
        }

        const siteName = siteInCategory.name;

        await sitesPage.actions.selectCategoryDropDown();
        await sitesPage.actions.selectCategoryDropDownOption(categoryWithOneSite.name);
        await sitesPage.assertions.verifySiteNameInSitesPage(siteName);
        await sitesPage.actions.clickOnSiteName(siteName);
        const siteDashboardPageInstance = new SiteDashboardPage(appManagerFixture.page, siteInCategory.siteId);
        await siteDashboardPageInstance.assertions.verifyThePageIsLoaded();
      }
    );
  }
);
