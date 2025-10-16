import { ManageContentPage } from '@content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ApplicationScreenPage } from '@content/ui/pages/manageFeaturesPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';

test.describe(
  ContentSuiteTags.MY_CONTENT_FILTER,
  {
    tag: [ContentSuiteTags.MY_CONTENT_FILTER],
  },
  () => {
    let manageFeaturesPage: ApplicationScreenPage;
    let manageContentPage: ManageContentPage;
    test.beforeEach(async ({ standardUserFixture }) => {
      manageFeaturesPage = new ApplicationScreenPage(standardUserFixture.page);
      manageContentPage = new ManageContentPage(standardUserFixture.page);
    });

    test(
      'verify if end user does not select any option from bulk options apply button should be disabled',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.MY_CONTENT_FILTER,
          ContentFeatureTags.MY_CONTENT_FILTER,
          '@CONT-25065',
        ],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify if end user does not select any option from bulk options apply button should be disabled',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25065',
          storyId: 'CONT-25065',
        });

        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
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
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25099',
          storyId: 'CONT-25099',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.selectContentFilterByType('authorByMe');
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('createdNewest');
        await manageContentPage.actions.selectCreatedNewestOption();
        if (contentCreatedAtDetailsNewest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(contentCreatedAtDetailsNewest);
        }
        const contentCreatedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('createdOldest');
        await manageContentPage.actions.selectCreatedOldestOption();
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(contentCreatedAtDetailsOldest);
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter('Published');
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewestPublished =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('publishedNewest');
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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('publishedOldest');
        if (contentCreatedAtDetailsOldestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestPublished
          );
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedNewestOption();
        const contentCreatedAtDetailsNewestEdited =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('modifiedNewest');
        if (contentCreatedAtDetailsNewestEdited !== null) {
          await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestEdited
          );
        } else {
          console.log('Skipping edited date verification - no modifiedAt date available');
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedOldestOption();
        const contentCreatedAtDetailsOldestEdited =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails('modifiedOldest');
        if (contentCreatedAtDetailsOldestEdited !== null) {
          await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestEdited
          );
        } else {
          console.log('Skipping edited date verification - no modifiedAt date available');
        }
      }
    );
  }
);
