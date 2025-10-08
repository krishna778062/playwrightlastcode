import { ManageContentPage } from '@content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ApplicationScreenPage } from '@content/ui/pages/manageFeaturesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MY_CONTENT_FILTER,
  {
    tag: [ContentSuiteTags.MY_CONTENT_FILTER],
  },
  () => {
    let manageFeaturesPage: ApplicationScreenPage;
    let manageContentPage: ManageContentPage;

    test.beforeEach(async ({ appManagersPage }) => {
      manageFeaturesPage = new ApplicationScreenPage(appManagersPage);
      manageContentPage = new ManageContentPage(appManagersPage);
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
      async ({ contentManagementHelper, siteManagementHelper, appManagerUINavigationHelper }) => {
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
        await appManagerUINavigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectCreatedNewestOption();
        await manageContentPage.actions.scheduledTagVisibleInManageContent();
        await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
      }
    );

    test(
      'Verify if Application Manager does not select any option from bulk options apply button should be disabled',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25065'],
      },
      async ({ appManagerUINavigationHelper }) => {
        tagTest(test.info(), {
          description:
            'Verify if Application Manager does not select any option from bulk options apply button should be disabled',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25065',
          storyId: 'CONT-25065',
        });
        await appManagerUINavigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.applyButtonShouldBeDisabled();
      }
    );
  }
);
