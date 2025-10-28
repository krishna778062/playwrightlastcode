import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { ContentSortBy, ContentStatus, SortOptionLabels } from '@/src/modules/content/constants';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage as ApplicationScreenPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';

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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_NEWEST);
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        if (contentCreatedAtDetailsNewest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewest[0]
          );
        }
        const contentCreatedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST);
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldest[0]
          );
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewestPublished =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_NEWEST);
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        if (contentCreatedAtDetailsNewestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestPublished[0]
          );
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_OLDEST);
        const contentCreatedAtDetailsOldestPublished =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST);
        if (contentCreatedAtDetailsOldestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestPublished[0]
          );
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedNewestOption();
        const contentCreatedAtDetailsNewestEdited =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_NEWEST);
        if (contentCreatedAtDetailsNewestEdited !== null) {
          await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestEdited[0]
          );
        } else {
          console.log('Skipping edited date verification - no modifiedAt date available');
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedOldestOption();
        const contentCreatedAtDetailsOldestEdited =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_OLDEST);
        if (contentCreatedAtDetailsOldestEdited !== null) {
          await manageContentPage.assertions.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestEdited[0]
          );
        } else {
          console.log('Skipping edited date verification - no modifiedAt date available');
        }
      }
    );

    test(
      'verify user should be able to filter the content on the "Created Date Oldest First" filter',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25057'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Created Date Oldest First" filter',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25057',
          storyId: 'CONT-25057',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_OLDEST);

        // Get dates from API
        const contentCreatedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST);
        console.log('contentCreatedAtDetailsOldest', contentCreatedAtDetailsOldest);

        // Verify all dates from array are visible on UI
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.assertions.verifyAllCreatedAtDatesFromArray(contentCreatedAtDetailsOldest);
        }
      }
    );
    test(
      'verify user should be able to filter the content on the "Published Date Oldest First" filter',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25056'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Published Date Oldest First" filter',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25056',
          storyId: 'CONT-25056',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_OLDEST);

        // Get dates from API
        const contentPublishedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST);
        console.log('contentPublishedAtDetailsOldest', contentPublishedAtDetailsOldest);

        // Verify all dates from array are visible on UI
        if (contentPublishedAtDetailsOldest !== null) {
          await manageContentPage.assertions.verifyAllPublishedAtDatesFromArray(contentPublishedAtDetailsOldest);
        }
      }
    );
    test(
      'verify for the list API for content listing, it should have a limit of 16 and show more button should come for more than 16 content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-25050'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify for the list API for content listing, it should have a limit of 16 and show more button should come for more than 16 content',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-25050',
          storyId: 'CONT-25050',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.assertions.verifyManageContentListItemCount(16);
        await manageContentPage.actions.clickShowMoreButton();
        await manageContentPage.assertions.verifyManageContentListItemCount(17);
      }
    );

    test(
      'application allow to filter on my content page using Author By filter',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MY_CONTENT_FILTER, '@CONT-10822'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Application allow to filter on my content page using Author By filter',
          customTags: [ContentFeatureTags.MY_CONTENT_FILTER],
          zephyrTestId: 'CONT-10822',
          storyId: 'CONT-10822',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectPageOption();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.DRAFT);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.assertions.verifyTagVisibleInManageContent(ManageContentTags.DRAFT);
      }
    );
  }
);
