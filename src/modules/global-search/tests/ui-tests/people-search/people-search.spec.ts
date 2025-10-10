import { TestPriority } from '@/src/core/constants/testPriority';
import { TestGroupType } from '@/src/core/constants/testType';
import { tagTest } from '@/src/core/utils/testDecorator';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { PEOPLE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/people-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

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
          zephyrTestId: 'SEN-XXXXX', // Replace with actual Zephyr test ID
        });
        await appManagerFixture.homePage.verifyThePageIsLoaded();
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
        await peopleResult.verifyNavigationToTitleLink(userId, testData.searchTerm, 'People');
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithUserThumbnailLink(userId);
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithPeopleLink();
        await peopleResult.goBackToPreviousPage();
        await peopleResult.verifyNavigationWithHomePageLink();
        await peopleResult.goBackToPreviousPage();
      }
    );
  }
);
