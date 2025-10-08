import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageContentPage } from '../../pages/manageContentPage';
import { ApplicationScreenPage } from '../../pages/manageFeaturesPage';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';

test.describe(
  ContentSuiteTags.MY_CONTENT_FILTER,
  {
    tag: [ContentSuiteTags.MY_CONTENT_FILTER],
  },
  () => {}
);
let manageFeaturesPage: ApplicationScreenPage;
let homePage: NewUxHomePage;
let manageContentPage: ManageContentPage;
test.beforeEach(async ({ standardUserHomePage }) => {
  manageFeaturesPage = new ApplicationScreenPage(standardUserHomePage.page);
  homePage = new NewUxHomePage(standardUserHomePage.page);
  manageContentPage = new ManageContentPage(standardUserHomePage.page);
});
test.afterEach(async ({ page }) => {
  await page.close();
});
test(
  'Verify if end user does not select any option from bulk options apply button should be disabled',
  {
    tag: [
      TestPriority.P0,
      TestGroupType.SMOKE,
      ContentFeatureTags.MY_CONTENT_FILTER,
      ContentFeatureTags.MY_CONTENT_FILTER,
      '@CONT-25065',
    ],
  },
  async ({}) => {
    tagTest(test.info(), {
      description: 'Verify if end user does not select any option from bulk options apply button should be disabled',
      customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
      zephyrTestId: 'CONT-25065',
      storyId: 'CONT-25065',
    });

    await homePage.actions.clickOnManageFeature();
    await manageFeaturesPage.actions.clickOnContentCard();
    await manageContentPage.actions.clickOnSelectAllButton();
    await manageContentPage.actions.applyButtonShouldBeDisabled();
  }
);
