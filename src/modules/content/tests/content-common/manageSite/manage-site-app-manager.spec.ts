import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentFeatureTags, SortOptionLabels } from '@/src/modules/content/constants';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe('manage Site Tests', () => {
  let manageFeaturesPage: ManageFeaturesPage;
  let manageContentPage: ManageContentPage;

  test.beforeEach(async ({ appManagerFixture }) => {
    await appManagerFixture.homePage.verifyThePageIsLoaded();
    manageFeaturesPage = new ManageFeaturesPage(appManagerFixture.page);
    manageContentPage = new ManageContentPage(appManagerFixture.page);
  });

  test(
    'verify Scheduled stamp and its options menu under-manage site content tab',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-23966'],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
        zephyrTestId: 'CONT-23966',
        storyId: 'CONT-23966',
      });
      const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
        hasPages: true,
      });
      const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
        siteId: siteInfo.siteId,
        contentInfo: { contentType: 'page', contentSubType: 'news' },
        options: {
          publishAt: getTomorrowDateIsoString(),
        },
      });
      await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
      await manageFeaturesPage.actions.clickOnContentCard();
      await manageContentPage.actions.clickSortByButton();
      await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
      await manageContentPage.actions.scheduledTagVisibleInManageContent();
      await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
      await manageContentPage.actions.hoverOnFirstDropDownOption();
      await manageContentPage.actions.verifyEditOptionVisibleInManageContent();
      await manageContentPage.actions.verifyDeleteOptionVisibleInManageContent();
      await manageContentPage.actions.verifyPublishOptionVisibleInManageContent();
      await manageContentPage.actions.verifyMoveOptionVisibleInManageContent();
      await manageContentPage.actions.clickOnPublishButton();
    }
  );
});
