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
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify published status for scheduled page by app manager',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-33059',
          storyId: 'CONT-33059',
        });
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          hasPages: true,
        });
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
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
      'verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25099'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25099',
          storyId: 'CONT-25099',
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.selectContentFilterByType('manageByme');
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('createdNewest');
        await manageContentPage.actions.selectCreatedNewestOption();
        if (contentCreatedAtDetailsNewest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(contentCreatedAtDetailsNewest);
        }
        const contentCreatedAtDetailsOldest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('createdOldest');
        await manageContentPage.actions.selectCreatedOldestOption();
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(contentCreatedAtDetailsOldest);
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter('Published');
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewestPublished =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('publishedNewest');
        await manageContentPage.actions.selectCreateNewestPublishedOption();
        if (contentCreatedAtDetailsNewestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestPublished
          );
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter('Published');
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectCreateOldestPublishedOption();
        const contentCreatedAtDetailsOldestPublished =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('publishedOldest');
        if (contentCreatedAtDetailsOldestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestPublished
          );
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedNewestOption();
        const contentCreatedAtDetailsNewestEdited =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('modifiedNewest');
        if (contentCreatedAtDetailsNewestEdited !== null) {
          await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestEdited
          );
          await manageContentPage.actions.clickSortByButton();
          await manageContentPage.actions.selectEditedOldestOption();
          const contentCreatedAtDetailsOldestEdited =
            await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails('modifiedOldest');
          if (contentCreatedAtDetailsOldestEdited !== null) {
            await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
              contentCreatedAtDetailsOldestEdited
            );
          }
        }
      }
    );
  }
);
