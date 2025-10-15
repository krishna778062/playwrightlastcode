import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ApplicationScreenPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MY_CONTENT_FILTER,
  {
    tag: [ContentSuiteTags.MY_CONTENT_FILTER],
  },
  () => {
    let manageFeaturesPage: ApplicationScreenPage;
    let manageContentPage: ManageContentPage;

    test.beforeEach(async ({ appManagerFixture }) => {
      manageFeaturesPage = new ApplicationScreenPage(appManagerFixture.page);
      manageContentPage = new ManageContentPage(appManagerFixture.page);
    });

    test(
      'verify published status for scheduled page by app manager',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.MY_CONTENT_FILTER,
          ContentFeatureTags.MY_CONTENT_FILTER,
          '@CONT-33059',
        ],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify published status for scheduled page by app manager',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-33059',
          storyId: 'CONT-33059',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          hasPages: true,
        });
        const pageInfo = await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: {
            publishAt: getTomorrowDateIsoString(),
            publishTo: getTomorrowDateIsoString(),
          },
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectCreatedNewestOption();
        await manageContentPage.actions.scheduledTagVisibleInManageContent();
        await manageContentPage.actions.checkContentDetailsVisibility(pageInfo.pageName);
      }
    );

    test(
      'verify if Application Manager does not select any option from bulk options apply button should be disabled',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25065'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify if Application Manager does not select any option from bulk options apply button should be disabled',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25065',
          storyId: 'CONT-25065',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.applyButtonShouldBeDisabled();
      }
    );

    test(
      'verify application manager should be able to apply bulk options on selecting the Select All option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25065'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify application manager should be able to apply bulk options on selecting the Select All option',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25063',
          storyId: 'CONT-25063',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter('Unpublished');
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnPublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.page.reload();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnUnpublishButton();
        await manageContentPage.actions.clickOnApplyButton();
        await manageContentPage.page.reload();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnValidateButton();
        await manageContentPage.actions.clickOnValidateApplyButton();
        await manageContentPage.page.reload();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnMoveButton();
        await manageContentPage.actions.selectMoveApplyButton();
        const site = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
        await manageContentPage.actions.moveContentSearchBar(site?.name || '');
        await manageContentPage.actions.siteListSelecting();
        await manageContentPage.actions.selectPageCategoryIfVisible();
        await manageContentPage.actions.selectPageCategory();
        await manageContentPage.actions.clickOnMoveConfirmButton();
        await manageContentPage.page.reload();
        await manageContentPage.actions.clickOnSelectAllButton();
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnDeleteButton();
        await manageContentPage.actions.selectDeleteApplyButton();
      }
    );
  }
);
