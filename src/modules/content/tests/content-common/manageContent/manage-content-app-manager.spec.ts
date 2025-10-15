import { ManageFeaturesPage } from '@content/ui/pages/manageFeaturesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NewHomePage } from '@/src/core';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { ApplicationScreenPage } from '@/src/modules/content/ui/pages/applicationsScreenPage';
import { FeedPage } from '@/src/modules/content/ui/pages/feedPage';
import { HomeFeedPage } from '@/src/modules/content/ui/pages/manageApplicationDefaultHomeFeedPage';
import { DefaultScreenPage } from '@/src/modules/content/ui/pages/manageApplicationDefaultScreenPage';
import { ManageApplicationPage } from '@/src/modules/content/ui/pages/manageApplicationPage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
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
    let manageSitePage: ManageSitePage;
    let siteDetailsPage: SiteDetailsPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      await appManagerFixture.homePage.verifyThePageIsLoaded();
      manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
      applicationScreenPage = new ApplicationScreenPage(appManagerFixture.page);
      manageApplicationPage = new ManageApplicationPage(appManagerFixture.page);
      defaultScreenPage = new DefaultScreenPage(appManagerFixture.page);
      homeFeedPage = new HomeFeedPage(appManagerFixture.page);
      homePage = new NewHomePage(appManagerFixture.page);
      manageSitePage = new ManageSitePage(appManagerFixture.page, '');
      siteDetailsPage = new SiteDetailsPage(appManagerFixture.page, '');
    });

    test(
      'verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify "Nothing to show here" message appears when searching non-existing content and clicking X restores filtered results',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
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
      'verify Bulk actions Functionality in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify bulk actions functionality including publish, unpublish, move, delete, and validate operations in My Content Screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20952',
          storyId: 'CONT-20952',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.selectMoveApplyButton();
        const site = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
        await manageContentPage.actions.moveContentSearchBar(site?.name || '');
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.selectPageCategoryIfVisible();
        await manageContentPage.actions.selectPageCategory();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnValidateButton();
        await manageContentPage.actions.clickOnApplyButton();
      }
    );

    test(
      'verify content publish and unpublish option in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify content publish and unpublish options are available and functional in My Content Screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20951',
          storyId: 'CONT-20951',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.addPublishContentFilter();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.checkPublishOption();
      }
    );

    test(
      'verify Delete Modal Cancel and Delete Button of Content from My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify delete modal functionality with cancel and delete button operations for content removal',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20946',
          storyId: 'CONT-20946',
        });
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify various UI elements including image container, author name, site name, and status stamps in My Content screen ',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20945',
          storyId: 'CONT-20945',
        });
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify site filter functionality and search capabilities in My Content screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20944',
          storyId: 'CONT-20944',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        const publicSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        let publicNewOneSite = publicSite;
        if (publicSite === null) {
          await appManagerFixture.siteManagementHelper.createSite({ accessType: SITE_TYPES.PUBLIC });
          publicNewOneSite = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        }
        await manageContentPage.actions.clickSiteSearchBar(publicSite?.name || publicNewOneSite?.name || '');
        await manageContentPage.actions.selectSiteSearchBarOption();
        await manageContentPage.assertions.verifySiteNameLink();
      }
    );

    test(
      'verify created Newest Filter in My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify created Newest sorting filter functionality in My Contents screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20943',
          storyId: 'CONT-20943',
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectCreatedNewestOption();
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
      'to verify the site update category option in manage site user drop down sites',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.UPDATE_CATEGORY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the site update category option in manage site user drop down sites',
          zephyrTestId: 'CONT-26056',
          storyId: 'CONT-26056',
        });
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
  }
);
