import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageContentPage } from '../../pages/manageContentPage';
import { ManageFeaturePage } from '../../pages/manageFeaturePage';
import { MANAGE_CONTENT_TEST_DATA } from '../../test-data/manage-content.test-data';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';

test.describe(
  ContentSuiteTags.MANAGE_CONTENT,
  {
    tag: [ContentSuiteTags.MANAGE_CONTENT],
  },
  () => {
    let manageFeaturePage: ManageFeaturePage;
    let manageContentPage: ManageContentPage;
    test.beforeEach(async ({ appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      manageContentPage = await appManagerHomePage.actions.manageContent();
      manageFeaturePage = new ManageFeaturePage(manageContentPage.page);
      manageContentPage = new ManageContentPage(manageContentPage.page);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'Verify "Nothing to show here" message appears when searching non-existing content and clicking X restores filtered results',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });

        const title = MANAGE_CONTENT_TEST_DATA.TITLE;
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.writeRandomTextInSearchBar(title);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.assertions.nothingToShowHereText();
        await manageContentPage.actions.clickXButton();
        await manageContentPage.assertions.placeHolderTextShouldBeVisible();
      }
    );

    test(
      'Verify Bulk actions Functionality in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'Verify bulk actions functionality including publish, unpublish, move, delete, and validate operations in My Content Screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20952',
          storyId: 'CONT-20952',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstContentButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.clickOnApplyButton();
        const siteName = 'Page';
        await manageContentPage.actions.moveContentSearchBar(siteName);
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.selectPageCategoryIfVisible();
        await manageContentPage.actions.selectPageCategory();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnValidateButton();
        await manageContentPage.actions.clickOnApplyButton();
      }
    );

    test(
      'Verify content publish and unpublish option in My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify content publish and unpublish options are available and functional in My Content Screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20951',
          storyId: 'CONT-20951',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.checkPublishOption();
      }
    );

    test(
      'Verify Delete Modal Cancel and Delete Button of Content from My Content Screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify delete modal functionality with cancel and delete button operations for content removal',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20946',
          storyId: 'CONT-20946',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickOnFirstDropDownOption();
        await manageContentPage.actions.clickDeleteOption();
        await manageContentPage.actions.clickDeleteModalConfirmButton();
      }
    );

    test(
      'Verification of various aspects of My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description:
            'Verify various UI elements including image container, author name, site name, and status stamps in My Content screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20945',
          storyId: 'CONT-20945',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.assertions.verifyImageContainer();
        await manageContentPage.assertions.authorNameShouldBeVisible();
        await manageContentPage.assertions.clickOnTheAuthorName();
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.assertions.verifySiteName();
        await manageContentPage.assertions.clickOnTheSiteName();
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.assertions.verifySiteStatusStamp();
      }
    );

    test(
      'Verify Site Filter in My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify site filter functionality and search capabilities in My Content screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20944',
          storyId: 'CONT-20944',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.clickSiteSearchBar('Sales');
        await manageContentPage.actions.selectSiteSearchBarOption();
        await manageContentPage.assertions.verifySiteNameLink();
      }
    );

    test(
      'Verify created Newest Filter in My Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Verify created Newest sorting filter functionality in My Contents screen',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-20943',
          storyId: 'CONT-20943',
        });
        await manageFeaturePage.actions.navigateToContentButton();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectCreatedNewestOptionThroughUrl();
      }
    );
  }
);
