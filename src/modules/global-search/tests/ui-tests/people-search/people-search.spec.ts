import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { PEOPLE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/people-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';

test.describe(
  'global Search - People Search functionality',
  {
    tag: [GlobalSearchSuiteTags.GLOBAL_SEARCH, GlobalSearchSuiteTags.PEOPLE_SEARCH],
  },
  () => {
    const testData = PEOPLE_SEARCH_TEST_DATA;
    let userId: string;

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

    test(
      `verify user able to search people`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19472', // Replace with actual Zephyr test ID
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
          zephyrTestId: 'SEN-19473', // Replace with actual Zephyr test ID
        });

        // Type in search input
        const topNavBarComponent = appManagerFixture.navigationHelper.topNavBarComponent;
        await topNavBarComponent.typeInSearchBarInput(testData.searchTerm, {
          stepInfo: `Typing "${testData.searchTerm}" in search input`,
        });

        // Wait for autocomplete to appear first
        const resultList = new ResultListingComponent(appManagerFixture.page);
        await resultList.waitForAndVerifyAutocompleteListIsDisplayed(
          topNavBarComponent.globalSearchInputBox,
          testData.searchTerm
        );

        // Then get specific autocomplete item
        const peopleResult = resultList.getAutocompleteItemByName(testData.searchTerm);

        // Verify autocomplete item data (name and label)
        await peopleResult.verifyAutocompleteItemData(testData.searchTerm, testData.label);

        // Click on the autocomplete item and verify navigation
        await peopleResult.verifyAutocompleteNavigationToTitleLink(userId, testData.searchTerm, testData.label);
      }
    );

    test(
      `verify people search with sidebar filter functionality`,
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@healthcheck', '@test'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-19474', // Replace with actual Zephyr test ID
        });

        let testUserId: string;
        let testExpertiseId: string;

        try {
          // Get user ID using getIdentityUserId method with data from test file
          testUserId = await appManagerFixture.identityManagementHelper.identityService.getIdentityUserId(
            testData.firstName,
            testData.lastName
          );

          // Create expertise
          const expertiseResponse = await appManagerFixture.expertiseManagementService.createExpertise(
            testData.expertise.name
          );
          testExpertiseId = expertiseResponse.result.uuid;
          console.log(`Expertise created: ${testData.expertise.name} with ID: ${testExpertiseId}`);

          // Endorse user with expertise
          const endorseResponse = await appManagerFixture.expertiseManagementService.endorseUserWithExpertise(
            testUserId,
            testExpertiseId
          );
          console.log(`User ${testUserId} endorsed with expertise ${testExpertiseId}:`, endorseResponse.message);
        } catch (error) {
          throw error;
        }

        // Navigate to global search and search for the user
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
          stepInfo: `Searching with term "${testData.searchTerm}" to verify people appear in search results with sidebar filter`,
        });

        // Verify the user appears in search results
        const peopleResult = await globalSearchResultPage.getPeopleResultItemExactlyMatchingTheSearchTerm(
          testData.searchTerm
        );
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        await globalSearchResultPage.verifyAndClickSidebarFilter({
          filterText: testData.label,
          iconType: testData.label.toLowerCase(),
        });

        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        // Test department filter with count tracking
        const departmentOriginalCount = await globalSearchResultPage.verifyAndClickDepartmentSubFilter({
          filterText: testData.label,
          filterName: testData.peopleFilters.department,
          departmentName: testData.updateFields.department,
        });
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        // Test location filter with count tracking
        const locationOriginalCount = await globalSearchResultPage.verifyAndClickLocationSubFilter({
          filterText: testData.label,
          filterName: testData.peopleFilters.location,
          locationName: testData.updateFields.location,
        });
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        // Test expertise filter with count tracking
        const expertiseOriginalCount = await globalSearchResultPage.verifyAndClickExpertiseSubFilter({
          filterText: testData.label,
          filterName: testData.peopleFilters.expertise,
          expertiseName: testData.expertise.name,
        });
        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        // Verify department filter count tracking and reset
        await globalSearchResultPage.verifyPeopleSubFilterWithCountTracking({
          filterText: testData.label,
          filterName: testData.peopleFilters.department,
          originalCount: departmentOriginalCount,
          expectedCountAfterFilter: 1,
          stepInfo: `Verify ${testData.peopleFilters.department} filter count tracking and reset`,
        });

        // Verify location filter count tracking and reset
        await globalSearchResultPage.verifyPeopleSubFilterWithCountTracking({
          filterText: testData.label,
          filterName: testData.peopleFilters.location,
          originalCount: locationOriginalCount,
          expectedCountAfterFilter: 1,
          stepInfo: `Verify ${testData.peopleFilters.location} filter count tracking and reset`,
        });

        // Verify expertise filter count tracking and reset
        await globalSearchResultPage.verifyPeopleSubFilterWithCountTracking({
          filterText: testData.label,
          filterName: testData.peopleFilters.expertise,
          originalCount: expertiseOriginalCount,
          expectedCountAfterFilter: 1,
          stepInfo: `Verify ${testData.peopleFilters.expertise} filter count tracking and reset`,
        });

        await peopleResult.verifyNameIsDisplayed(testData.searchTerm);

        // Test-specific cleanup
        try {
          // Cleanup: Unendorse user from expertise
          if (testUserId && testExpertiseId) {
            await appManagerFixture.expertiseManagementService.unendorseUserFromExpertise(testUserId, testExpertiseId);
            console.log(`User ${testUserId} unendorsed from expertise ${testExpertiseId} successfully`);
          }
        } catch (error) {
          console.warn(`Failed to cleanup test data:`, error);
        }
      }
    );
  }
);
