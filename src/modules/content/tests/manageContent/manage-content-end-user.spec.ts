import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ManageContentPage } from '@/src/modules/content/pages/manageContentPage';
import { ManageFeaturePage } from '@/src/modules/content/pages/manageFeaturePage';
import { MANAGE_CONTENT_TEST_DATA } from '@/src/modules/content/test-data/manage-content.test-data';

test.describe(
  ContentSuiteTags.MANAGE_CONTENT,
  {
    tag: [ContentSuiteTags.MANAGE_CONTENT],
  },
  () => {
    let manageFeaturePage: ManageFeaturePage;
    let manageContentPage: ManageContentPage;
    test.beforeEach(async ({ standardUserApiClient, standardUserHomePage }) => {
      await standardUserHomePage.verifyThePageIsLoaded();
      manageContentPage = await standardUserHomePage.actions.manageContent();
      manageFeaturePage = new ManageFeaturePage(standardUserHomePage.page);
      manageContentPage = new ManageContentPage(standardUserHomePage.page);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });

    test(
      'Verify "Nothing to show here" should come when user searches non-existing content and on clicking x all results should come based on relevant filters - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Login as End User who is Site Owner/Manager of any site',
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
  }
);
