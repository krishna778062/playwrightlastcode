import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { PEOPLE_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/people-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { ResultListingComponent } from '@/src/modules/global-search/ui/components/resultsListComponent';
import { SidebarFilterComponent } from '@/src/modules/global-search/ui/components/sidebarFilterComponent';
import { PeopleFieldConfigurationHelper } from '@/src/modules/global-search/ui/helpers/peopleFieldConfigurationHelper';

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
    let originalOrgChartStatus: boolean | undefined;

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

      // Restore original app config settings
      try {
        if (originalOrgChartStatus !== undefined) {
          await appManagerFixture.appConfigurationService.updateAppConfigField(
            { orgChartEnabled: originalOrgChartStatus },
            `Restore Org Chart to original state: ${originalOrgChartStatus}`
          );
          console.log(`App configuration restored to original settings`);
        }
      } catch (error) {
        console.warn(`Failed to restore app configuration:`, error);
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

        const _endorseResponse = await appManagerFixture.expertiseManagementService.endorseUserWithExpertise(
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

    test(
      `verify org chart icon visibility based on configuration`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-ORG-CHART-VISIBILITY',
        });

        // Store original app config settings
        const currentConfig = await appManagerFixture.feedManagementHelper.feedManagementService.getAppConfig();
        originalOrgChartStatus = currentConfig.result.orgChartEnabled;
        console.log(`Current org chart status: ${originalOrgChartStatus}`);

        // Enable org chart if not already enabled
        if (originalOrgChartStatus !== testData.orgChart.enabled.orgChartEnabled) {
          await appManagerFixture.appConfigurationService.updateAppConfigField(
            testData.orgChart.enabled,
            `Enable Org Chart feature`
          );
        }
        await appManagerFixture.page.reload();
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
          stepInfo: `Searching with term "${testData.searchTerm}" to verify org chart icon visibility when enabled`,
        });
        const peopleResult = await globalSearchResultPage.getPeopleResultItemExactlyMatchingTheSearchTerm(
          testData.searchTerm
        );
        await peopleResult.verifyOrgChartIconVisibility(testData.orgChart.enabled.orgChartEnabled);
        await peopleResult.verifyOrgChartIconTooltip(testData.orgChart.tooltipText);
        await peopleResult.clickOrgChartIconAndVerifyNavigation(userId);
        await appManagerFixture.page.goBack();
        await appManagerFixture.appConfigurationService.updateAppConfigField(
          testData.orgChart.disabled,
          `Disable Org Chart feature`
        );
        await appManagerFixture.page.reload();
        await peopleResult.verifyOrgChartIconVisibility(testData.orgChart.disabled.orgChartEnabled);
      }
    );

    test(
      `verify people subfilters visibility based on field display settings via API`,
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@test'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-PEOPLE-SUBFILTER-VISIBILITY-API',
        });

        const fieldConfigHelper = new PeopleFieldConfigurationHelper(appManagerFixture.appConfigurationService);
        let originalFields: any = {};

        try {
          const fieldConfig = await fieldConfigHelper.getFieldConfiguration(testData.fieldConfiguration.fieldsToTest);
          originalFields = {
            originalDepartmentField: fieldConfig.departmentField,
            originalCityField: fieldConfig.cityField,
            originalStateField: fieldConfig.stateField,
            originalCountryField: fieldConfig.countryField,
          };

          await fieldConfigHelper.enableAllFields(fieldConfig);

          const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
            stepInfo: `Searching with term "${testData.searchTerm}" to verify subfilters when fields are enabled via API`,
          });

          await globalSearchResultPage.verifyAndClickSidebarFilter({
            filterText: testData.label,
            iconType: testData.label.toLowerCase(),
          });

          await globalSearchResultPage.verifyPeopleSubFilterVisibility('Department', true, {
            stepInfo: 'Verify Department subfilter is visible when Department field is enabled via API',
            filterText: testData.label,
            iconType: testData.label.toLowerCase(),
            globalFilterName: testData.peopleFilters.department,
          });

          await globalSearchResultPage.verifyPeopleSubFilterVisibility('Location', true, {
            stepInfo: 'Verify Location subfilter is visible when City, State, and Country fields are enabled via API',
            filterText: testData.label,
            iconType: testData.label.toLowerCase(),
            globalFilterName: testData.peopleFilters.location,
          });

          await fieldConfigHelper.disableDepartmentField(fieldConfig.departmentField);
          await fieldConfigHelper.disableLocationFields({
            cityField: fieldConfig.cityField,
            stateField: fieldConfig.stateField,
            countryField: fieldConfig.countryField,
          });

          await appManagerFixture.page.reload();

          await globalSearchResultPage.verifyPeopleSubFilterVisibility('Department', false, {
            stepInfo: 'Verify Department subfilter is not visible when Department field is disabled via API',
            filterText: testData.label,
            iconType: testData.label.toLowerCase(),
            globalFilterName: testData.peopleFilters.department,
          });

          await globalSearchResultPage.verifyPeopleSubFilterVisibility('Location', false, {
            stepInfo:
              'Verify Location subfilter is not visible when all location fields (City, State, Country) are disabled via API',
            filterText: testData.label,
            iconType: testData.label.toLowerCase(),
            globalFilterName: testData.peopleFilters.location,
          });
        } finally {
          try {
            await fieldConfigHelper.restoreOriginalSettings(originalFields);
          } catch (error) {
            console.warn('Test cleanup completed with error:', error);
          }
        }
      }
    );
  }
);
