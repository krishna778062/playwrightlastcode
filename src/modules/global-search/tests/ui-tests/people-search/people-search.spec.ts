import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { PEOPLE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/people-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';
import { SidebarFilterComponent } from '@/src/modules/global-search/ui/components/sidebarFilterComponent';

test.describe(
  'global Search - People Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.PEOPLE_SEARCH],
  },
  () => {
    const testData = PEOPLE_SEARCH_TEST_DATA;
    let userId: string;
    let testUserId: string;
    let testExpertiseId: string;

    test.beforeEach(async ({ appManagerFixture }) => {
      // Get user ID using getIdentityUserId method with data from test file
      userId = await appManagerFixture.identityManagementHelper.identityService.getIdentityUserId(
        testData.firstName,
        testData.lastName
      );

      // Get current user data to preserve existing values
      const currentUserData = await appManagerFixture.identityManagementHelper.getUserById(userId);

      // Update user information using payload from test data
      const updateResponse = await appManagerFixture.identityManagementHelper.updateUser(
        userId,
        testData.createUpdatePayload(currentUserData, testData.updateFields)
      );
      console.log('User updated successfully with specified values ', updateResponse);
    });

    test.afterEach(async ({ appManagerFixture }) => {
      // Cleanup: Unendorse user from expertise if it was created
      try {
        if (testUserId && testExpertiseId) {
          await appManagerFixture.expertiseManagementService.unendorseUserFromExpertise(testUserId, testExpertiseId);
          console.log(`User ${testUserId} unendorsed from expertise ${testExpertiseId} successfully`);
        }
      } catch (error) {
        console.warn(`Failed to cleanup test data:`, error);
      }
    });

    test(
      `verify user able to search people`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19472',
        });
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
          stepInfo: `Searching with term "${testData.searchTerm}" to verify people appear in search results`,
        });
        const peopleResult = await globalSearchResultPage.getPeopleResultItemExactlyMatchingTheSearchTerm(
          testData.searchTerm
        );
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);
        await peopleResult.verifyJobTitleAndDepartmentIsDisplayed(
          testData.updateFields.jobTitle,
          testData.updateFields.department
        );
        const expectedLocation = `${testData.updateFields.city}, ${testData.updateFields.state}, ${testData.updateFields.country}`;
        await peopleResult.verifyLocationIsDisplayed(expectedLocation);
        await peopleResult.verifyUserThumbnailIsDisplayed();
        await peopleResult.verifyNavigationToTitleLink(userId, testData.searchTerm, testData.label);
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithUserThumbnailLink(userId);
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithPeopleLink();
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithHomePageLink();
        await peopleResult.goBackToPreviousPage();
      }
    );

    test(
      `verify People Autocomplete functionality`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19473',
        });

        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(testData.searchTerm, {
          stepInfo: `Typing "${testData.searchTerm}" in search input`,
        });

        const resultList = new ResultListingComponent(appManagerFixture.page);
        await resultList.waitForAndVerifyAutocompleteListIsDisplayed(
          topNavBarComponent.globalSearchInputBox,
          testData.searchTerm
        );

        const peopleResult = resultList.getAutocompleteItemByName(testData.searchTerm);
        await peopleResult.verifyAutocompleteItemData(testData.searchTerm, testData.label);
        await peopleResult.verifyAutocompleteNavigationToTitleLink(userId, testData.searchTerm, testData.label);
      }
    );

    test(
      `verify people search with sidebar filter functionality`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19542',
        });

        testUserId = await appManagerFixture.identityManagementHelper.identityService.getIdentityUserId(
          testData.firstName,
          testData.lastName
        );

        const expertiseResponse = await appManagerFixture.expertiseManagementService.createExpertise(
          testData.expertise.name
        );
        testExpertiseId = expertiseResponse.result.uuid;

        const endorseResponse = await appManagerFixture.expertiseManagementService.endorseUserWithExpertise(
          testUserId,
          testExpertiseId
        );

        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
          stepInfo: `Searching with term "${testData.searchTerm}" to verify people appear in search results with sidebar filter`,
        });
        const peopleResult = await globalSearchResultPage.getPeopleResultItemExactlyMatchingTheSearchTerm(
          testData.searchTerm
        );
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);
        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: testData.label,
          iconType: testData.label.toLowerCase(),
        });
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        const peopleSubFilters = [
          {
            filterName: testData.peopleFilters.department,
            filterValue: testData.updateFields.department,
          },
          {
            filterName: testData.peopleFilters.location,
            filterValue: testData.updateFields.location,
          },
          {
            filterName: testData.peopleFilters.expertise,
            filterValue: testData.expertise.name,
          },
        ];

        for (const subFilter of peopleSubFilters) {
          const peopleFilterComponent = new SidebarFilterComponent(appManagerFixture.page, {
            filterText: testData.label,
            globalFilterName: subFilter.filterName,
          });

          const originalCount = await peopleFilterComponent.verifyAndClickPeopleSubFilter(subFilter.filterValue);
          await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

          await peopleFilterComponent.verifyPeopleSubFilterWithCountTracking({
            filterName: subFilter.filterName,
            originalCount: originalCount,
            expectedCountAfterFilter: 1,
            stepInfo: `Verify ${subFilter.filterName} filter count tracking and reset`,
          });
        }

        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);
      }
    );
  }
);
