import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ManageContentPage } from '../../pages/manageContentPage';
import { ApplicationScreenPage } from '../../pages/manageFeaturesPage';

import { NewUxHomePage } from '@/src/core/pages/homePage/newUxHomePage';
import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

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
test.beforeEach(async ({ appManagerHomePage }) => {
  manageFeaturesPage = new ApplicationScreenPage(appManagerHomePage.page);
  homePage = new NewUxHomePage(appManagerHomePage.page);
  manageContentPage = new ManageContentPage(appManagerHomePage.page);
});
test.afterEach(async ({ page }) => {
  await page.close();
});
test(
  'Verify published status for scheduled page by app manager',
  {
    tag: [
      TestPriority.P0,
      TestGroupType.SMOKE,
      ContentFeatureTags.MY_CONTENT_FILTER,
      ContentFeatureTags.MY_CONTENT_FILTER,
      '@CONT-33059',
    ],
  },
  async ({ contentManagementHelper, siteManagementHelper }) => {
    tagTest(test.info(), {
      description: 'Verify published status for scheduled page by app manager',
      customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
      zephyrTestId: 'CONT-33059',
      storyId: 'CONT-33059',
    });
    const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, { hasPages: true });
    const pageInfo = await contentManagementHelper.createPage({
      siteId: siteInfo.siteId,
      contentInfo: { contentType: 'page', contentSubType: 'news' },
      options: {
        publishAt: getTomorrowDateIsoString(),
        publishTo: getTomorrowDateIsoString(),
      },
    });
    await homePage.actions.clickOnManageFeature();
    await manageFeaturesPage.actions.clickOnContentCard();
    await manageContentPage.actions.clickSortByButton();
    await manageContentPage.actions.selectCreatedNewestOption();
    await manageContentPage.actions.scheduledTagVisibleInManageContent();
    await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
  }
);
