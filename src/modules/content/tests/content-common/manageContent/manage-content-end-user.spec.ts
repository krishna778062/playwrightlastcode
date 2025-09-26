import { ApplicationScreenPage } from '@content/ui/pages/manageFeaturesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { NewUxHomePage } from '@/src/core/ui/pages/homePage/newUxHomePage';
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
    let manageFeaturePage: ApplicationScreenPage;
    let manageContentPage: ManageContentPage;
    let homePage: NewUxHomePage;
    test.beforeEach(async ({ standardUserHomePage }) => {
      await standardUserHomePage.verifyThePageIsLoaded();
      manageFeaturePage = new ApplicationScreenPage(standardUserHomePage.page);
      manageContentPage = new ManageContentPage(standardUserHomePage.page);
      homePage = new NewUxHomePage(standardUserHomePage.page);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'Login as End User who is Site Owner/Manager of any site',
          customTags: [ContentFeatureTags.MANAGE_CONTENT],
          zephyrTestId: 'CONT-25055',
          storyId: 'CONT-25055',
        });
        const title = MANAGE_CONTENT_TEST_DATA.TITLE;
        await homePage.actions.clickOnManageFeature();
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
