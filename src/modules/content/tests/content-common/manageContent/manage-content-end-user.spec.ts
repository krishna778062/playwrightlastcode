import { ManageFeaturesPage } from '@content/ui/pages/manageFeaturesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';

test.describe(
  ContentSuiteTags.MANAGE_CONTENT,
  {
    tag: [ContentSuiteTags.MANAGE_CONTENT],
  },
  () => {
    let manageFeaturePage: ManageFeaturesPage;
    let manageContentPage: ManageContentPage;
    test.beforeEach(async ({ standardUserFixture }) => {
      manageFeaturePage = new ManageFeaturesPage(standardUserFixture.page);
      manageContentPage = new ManageContentPage(standardUserFixture.page);
    });

    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Login as End User who is Site Owner/Manager of any site',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        const title = MANAGE_CONTENT_TEST_DATA.TITLE;
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturePage.actions.clickOnContentCard();
        await manageContentPage.actions.writeRandomTextInSearchBar(title);
        await manageContentPage.actions.clickSearchIcon();
        await manageContentPage.assertions.nothingToShowHereText();
        await manageContentPage.actions.clickXButton();
        await manageContentPage.assertions.placeHolderTextShouldBeVisible();
      }
    );
  }
);
