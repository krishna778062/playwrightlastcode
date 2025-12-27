import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { getTomorrowDateIsoString } from '@/src/core/utils/dateUtil';
import { ContentSortBy, ContentStatus, ManageContentTags, SortOptionLabels } from '@/src/modules/content/constants';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
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
      'verify published status for scheduled page by app manager CONT-33059',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-33059'],
      },
      async ({ appManagerApiFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify published status for scheduled page by app manager',
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
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        await manageContentPage.manageContent.verifyTagVisibleInManageContent(ManageContentTags.SCHEDULED);
        await manageContentPage.manageContent.verifyContentDetailsVisibility(pageInfo.pageName);
      }
    );

    test(
      'verify if Application Manager does not select any option from bulk options apply button should be disabled CONT-25065',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25065'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify if Application Manager does not select any option from bulk options apply button should be disabled',
          zephyrTestId: 'CONT-25065',
          storyId: 'CONT-25065',
        });
        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 3) {
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
          const pagesToCreate = 3 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.applyButtonShouldBeDisabled();
      }
    );

    test(
      'verify application manager should be able to apply bulk options on selecting the Select All option CONT-25063',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25063'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify application manager should be able to apply bulk options on selecting the Select All option',
          zephyrTestId: 'CONT-25063',
          storyId: 'CONT-25063',
        });
        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 10) {
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
          const pagesToCreate = 10 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.manageContent.hoverOnFirstDropDownOption();
        await manageContentPage.manageContent.clickOnUnpublishButtonFromDropDown();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectPublishButton();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectContentByNumberOfItems(3);
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectUnpublishButton();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectValidateButton();
        await manageContentPage.manageContent.clickOnValidateApplyButton();
        await appManagerFixture.page.reload();
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectMoveButton();
        await manageContentPage.manageContent.selectMoveApplyButton();
        const site = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'private',
          sortBy: 'alphabetical',
        });
        const privateSite = site.result.listOfItems.find(
          (site: any) => site.isActive === true && site.isPrivate === true
        );
        await manageContentPage.manageContent.moveContentSearchBar(privateSite?.name || '');
        await manageContentPage.manageContent.siteListSelecting();
        await manageContentPage.manageContent.selectPageCategoryIfVisible();
        await manageContentPage.manageContent.selectPageCategory();
        await manageContentPage.manageContent.selectMoveConfirmButton();
        await appManagerFixture.page.reload();
        await manageContentPage.manageContent.selectContentByNumberOfItems(3);
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectDeleteButton();
        await manageContentPage.manageContent.selectDeleteApplyButton();
      }
    );

    test(
      'verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen CONT-25099',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25099'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen',
          zephyrTestId: 'CONT-25099',
          storyId: 'CONT-25099',
          isKnownFailure: true,
        });

        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const pageInfo = await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        console.log('pageInfo', pageInfo);

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.selectContentFilterByType('manageByme');
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        const contentCreatedAtDetailsNewest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_NEWEST, {
            filter: 'managing',
            contribution: 'all',
          });
        console.log('contentCreatedAtDetailsNewest', contentCreatedAtDetailsNewest);
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        if (contentCreatedAtDetailsNewest !== null) {
          await manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewest[0]
          );
        }
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        const contentCreatedAtDetailsOldest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST, {
            filter: 'managing',
            contribution: 'all',
          });
        console.log('contentCreatedAtDetailsOldest', contentCreatedAtDetailsOldest);
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.manageContent.verifyCreatedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldest[0]
          );
        }
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        const contentCreatedAtDetailsNewestPublished =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_NEWEST, {
            status: 'published',
          });
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        if (contentCreatedAtDetailsNewestPublished !== null) {
          await manageContentPage.manageContent.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestPublished[0]
          );
        }
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_OLDEST);
        const contentCreatedAtDetailsOldestPublished =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST, {
            status: 'published',
          });
        if (contentCreatedAtDetailsOldestPublished !== null) {
          await manageContentPage.manageContent.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestPublished[0]
          );
        }
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.manageContent.selectEditedNewestOptionByText();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        const contentCreatedAtDetailsNewestEdited =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_NEWEST);
        console.log('contentCreatedAtDetailsNewestEdited', contentCreatedAtDetailsNewestEdited);
        if (contentCreatedAtDetailsNewestEdited !== null) {
          await manageContentPage.manageContent.verifyEditedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewestEdited[0]
          );
          await manageContentPage.manageContent.clickSortByButton();
          await manageContentPage.manageContent.selectEditedOldestOptionByText();
          await manageContentPage.manageContent.clickFilterButton();
          await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
          await manageContentPage.manageContent.clickSortByButton();
          const contentCreatedAtDetailsOldestEdited =
            await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_OLDEST, {
              status: 'published',
            });
          console.log('contentCreatedAtDetailsOldestEdited', contentCreatedAtDetailsOldestEdited);
          if (contentCreatedAtDetailsOldestEdited !== null) {
            await manageContentPage.manageContent.verifyEditedAtDateVisibleInManageContent(
              contentCreatedAtDetailsOldestEdited[0]
            );
          }
        }
      }
    );
    test(
      'verify user should be able to filter the content on the "Created Date Oldest First" filter CONT-25057',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25057'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Created Date Oldest First" filter',
          zephyrTestId: 'CONT-25057',
          storyId: 'CONT-25057',
        });
        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.CREATED_OLDEST);

        // Get dates from API
        const contentCreatedAtDetailsOldest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST, {
            status: 'published',
          });
        console.log('contentCreatedAtDetailsOldest', contentCreatedAtDetailsOldest);

        // Verify all dates from array are visible on UI
        if (contentCreatedAtDetailsOldest !== null) {
          await manageContentPage.manageContent.verifyAllCreatedAtDatesFromArray(contentCreatedAtDetailsOldest);
        }
      }
    );
    test(
      'verify user should be able to filter the content on the "Published Date Oldest First" filter CONT-25056',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25056'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Published Date Oldest First" filter',
          zephyrTestId: 'CONT-25056',
          storyId: 'CONT-25056',
        });

        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_OLDEST);

        // Get dates from API
        const contentPublishedAtDetailsOldest =
          await appManagerFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST, {
            filter: 'owned',
            contribution: 'all',
            status: 'published',
          });
        console.log('contentPublishedAtDetailsOldest', contentPublishedAtDetailsOldest);

        // Verify all dates from array are visible on UI
        if (contentPublishedAtDetailsOldest !== null) {
          await manageContentPage.manageContent.verifyAllPublishedAtDatesFromArray(contentPublishedAtDetailsOldest);
        }
      }
    );

    test(
      'verify app manager should be able to filter the content for the content status as Published and Unpublished CONT-25058',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25058'],
      },
      async ({ appManagerFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager should be able to filter the content for the content status as Published and Unpublished',
          zephyrTestId: 'CONT-25058',
          storyId: 'CONT-25058',
        });
        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
        const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
        await appManagerFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectContentByNumberOfItems(3);
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectUnpublishButtonFromBulkActions();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.UNPUBLISHED);
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectPublishButton();
        await manageContentPage.manageContent.selectApplyButton();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectValidateButton();
        await manageContentPage.manageContent.clickOnValidateApplyButton();
        await appManagerFixture.page.reload();
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectMoveButton();
        await manageContentPage.manageContent.selectMoveApplyButton();
        const site = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          filter: 'public',
          sortBy: 'alphabetical',
        });
        const publicSite = site.result.listOfItems.find(
          (site: any) => site.isActive === true && site.isPublic === true
        );
        await manageContentPage.manageContent.moveContentSearchBar(publicSite?.name || '');
        await manageContentPage.manageContent.siteListSelecting();
        await manageContentPage.manageContent.selectPageCategoryIfVisible();
        await manageContentPage.manageContent.selectPageCategory();
        await manageContentPage.manageContent.selectMoveConfirmButton();
        await manageContentPage.page.reload();
        await manageContentPage.manageContent.selectSelectAllButton();
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.selectDeleteButton();
        await manageContentPage.manageContent.selectDeleteApplyButton();
      }
    );

    test(
      'verify for the list API for content listing, it should have a limit of 16 and show more button should come for more than 16 content CONT-25050',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25050'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify for the list API for content listing, it should have a limit of 16 and show more button should come for more than 16 content',
          zephyrTestId: 'CONT-25050',
          storyId: 'CONT-25050',
        });
        const contentListResponse =
          await appManagerFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 35) {
          const siteInfo = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 35 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await appManagerFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
        await appManagerFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnContentCard();
        await manageContentPage.manageContent.clickFilterButton();
        await manageContentPage.manageContent.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.manageContent.verifyManageContentListItemCount(16);
        await manageContentPage.manageContent.clickShowMoreButton();
        await manageContentPage.manageContent.verifyManageContentListItemCount(32);
      }
    );
  }
);
