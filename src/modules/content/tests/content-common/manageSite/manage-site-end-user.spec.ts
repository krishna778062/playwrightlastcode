import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent } from '@/src/modules/content/ui/components';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe('manage Site Tests', () => {
  let manageSitesComponent: ManageSitesComponent;
  let manageContentPage: ManageContentPage;

  test.beforeEach(async ({ standardUserFixture }) => {
    await standardUserFixture.homePage.verifyThePageIsLoaded();
    manageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
    manageContentPage = new ManageContentPage(standardUserFixture.page);
  });

  test(
    'to verify the search content in manage site content',
    {
      tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_CONTENT, '@CONT-23736'],
    },
    async ({ standardUserFixture, standardUserApiFixture, appManagerApiFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
        zephyrTestId: 'CONT-23736',
        storyId: 'CONT-23736',
      });
      const siteInfo = await standardUserApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
        hasPages: true,
      });
      await appManagerApiFixture.contentManagementHelper.createPage({
        siteId: siteInfo.siteId,
        contentInfo: { contentType: 'page', contentSubType: 'news' },
        options: {
          pageName: MANAGE_SITE_TEST_DATA.CONTENT_NAME.generateUniqueName('page'),
          contentDescription: MANAGE_SITE_TEST_DATA.DESCRIPTION.DESCRIPTION,
        },
      });
      const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, siteInfo.siteId);
      await newSiteDashboard.loadPage();
      await manageSitesComponent.clickOnTheManageSiteButtonAction();
      await manageSitesComponent.clickOnInsideContentButtonAction();
      await manageSitesComponent.selectManagingContentFilter();
      await manageSitesComponent.verifyContentFilterIsSelectedWithValue('managing');
      const contentNames = await manageContentPage.actions.getAllContentNames();
      console.log('contentNames', contentNames);
      await manageSitesComponent.searchContentInManageSite(contentNames[0]);
      await manageContentPage.actions.verifyContentVisibleInManageSite(contentNames[0]);
      await standardUserFixture.page.reload();
      await manageSitesComponent.selectManagingContentFilter();
      await manageSitesComponent.verifyContentFilterIsSelectedWithValue('owned');
      await manageSitesComponent.searchContentInManageSite(contentNames[0]);
      await manageContentPage.actions.verifyContentVisibleInManageSite(contentNames[0]);
    }
  );
});
