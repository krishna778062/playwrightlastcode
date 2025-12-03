import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

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
    test.beforeEach(async ({ standardUserFixture }) => {
      manageFeaturesPage = new ApplicationScreenPage(standardUserFixture.page);
      manageContentPage = new ManageContentPage(standardUserFixture.page);
    });

    test(
      'verify if end user does not select any option from bulk options apply button should be disabled',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25065'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify if end user does not select any option from bulk options apply button should be disabled',
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25099'],
      },
      async ({ standardUserFixture, standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify different combination for filters for Manage By/Author By, Content type and sort by filter on Manage > Content screen',
          zephyrTestId: 'CONT-25099',
          storyId: 'CONT-25099',
          isKnownFailure: true,
        });
        // Get list of public sites and find one where canManage=true and isOwner=true
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'public',
        });
        const publicSites = getListOfSitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        console.log(`Found ${publicSites.length} active public sites to check`);

        // Check each site's details to find one where canManage=true and isOwner=true
        let selectedSite: { siteId: string; name: string } | null = null;
        for (const site of publicSites) {
          try {
            const siteDetails = await appManagerApiFixture.siteManagementHelper.siteManagementService.getSiteDetails(
              site.siteId
            );
            console.log(
              `Checking site ${site.siteId} (${site.name}) - canManage: ${siteDetails.result?.canManage}, isOwner: ${siteDetails.result?.isOwner}`
            );

            if (siteDetails.result?.canManage === true && siteDetails.result?.isOwner === true) {
              selectedSite = { siteId: site.siteId, name: site.name };
              console.log(`✓ Found site where user can manage and is owner: ${site.siteId} (${site.name})`);
              break;
            }
          } catch (error) {
            console.log(
              `⚠ Skipping site ${site.siteId} (${site.name}) - failed to get site details: ${error instanceof Error ? error.message : String(error)}`
            );
            // Continue to next site
          }
        }

        if (!selectedSite) {
          throw new Error('No public sites found with canManage=true and isOwner=true');
        }

        await standardUserApiFixture.contentManagementHelper.createPage({
          siteId: selectedSite.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
        });

        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.selectContentFilterByType('manageByme');
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsNewest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_NEWEST, {
            status: 'published',
          });
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_NEWEST);
        if (contentCreatedAtDetailsNewest !== null) {
          await manageContentPage.assertions.verifyCreatedAtDateVisibleInManageContent(
            contentCreatedAtDetailsNewest[0]
          );
        }
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST, {
            status: 'published',
          });
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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_NEWEST, {
            status: 'published',
          });
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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST, {
            status: 'published',
          });
        if (contentCreatedAtDetailsOldestPublished !== null) {
          await manageContentPage.assertions.verifyPublishedAtDateVisibleInManageContent(
            contentCreatedAtDetailsOldestPublished[0]
          );
        }
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectEditedNewestOption();
        const contentCreatedAtDetailsNewestEdited =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_NEWEST, {
            status: 'published',
          });
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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.MODIFIED_OLDEST, {
            status: 'published',
          });
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25057'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Created Date Oldest First" filter',
          zephyrTestId: 'CONT-25057',
          storyId: 'CONT-25057',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnContentCard();
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.CREATED_OLDEST);
        await manageContentPage.actions.clickFilterButton();
        await manageContentPage.actions.selectTheStatusFilter(ContentStatus.PUBLISHED);
        await manageContentPage.actions.clickSortByButton();
        const contentCreatedAtDetailsOldest =
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.CREATED_OLDEST, {
            status: 'published',
          });
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25056'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'verify user should be able to filter the content on the "Published Date Oldest First" filter',
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
          await standardUserFixture.contentManagementHelper.getContentCreatedAtDetails(ContentSortBy.PUBLISHED_OLDEST, {
            status: 'published',
          });
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-25050'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description:
            'Verify for the list API for content listing, it should have a limit of 16 and show more button should come for more than 16 content',
          zephyrTestId: 'CONT-25050',
          storyId: 'CONT-25050',
        });
        const contentListResponse =
          await standardUserApiFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
            contribution: 'all',
            status: 'published',
          });
        console.log('contentListResponse', contentListResponse);
        if (contentListResponse.result.listOfItems.length < 17) {
          const siteInfo = await standardUserApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          console.log('siteInfo', siteInfo);
          const pagesToCreate = 17 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await standardUserApiFixture.contentManagementHelper.createPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-10822'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Application allow to filter on my content page using Author By filter',
          zephyrTestId: 'CONT-10822',
          storyId: 'CONT-10822',
        });
        const contentListResponse =
          await standardUserFixture.contentManagementHelper.contentManagementService.getContentList({
            filter: 'owned',
          });
        if (contentListResponse.result.listOfItems.length < 5) {
          const siteInfo = await standardUserFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
          const pagesToCreate = 5 - contentListResponse.result.listOfItems.length;
          for (let i = 0; i < pagesToCreate; i++) {
            await standardUserFixture.contentManagementHelper.createDraftPage({
              siteId: siteInfo.siteId,
              contentInfo: { contentType: 'page', contentSubType: 'news' },
            });
          }
          console.log('contentListResponse', contentListResponse);
        }
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
