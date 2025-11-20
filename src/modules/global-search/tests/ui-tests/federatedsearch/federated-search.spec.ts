import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import { FEDERATED_SEARCH_TEST_DATA } from '@/src/modules/global-search/test-data/federated-search.test-data';
import { searchTestFixtures as test } from '@/src/modules/global-search/tests/fixtures/searchTestFixture';
import { FederatedSearchComponent } from '@/src/modules/global-search/ui/components/federatedSearchComponent';
import { IntranetFileListComponent } from '@/src/modules/global-search/ui/components/intranetFileListComponent';

test.describe(
  'global Search - Federated Search functionality',
  {
    tag: [
      GlobalSearchSuiteTags.GLOBAL_SEARCH,
      GlobalSearchSuiteTags.FILE_SEARCH,
      GlobalSearchSuiteTags.FEDERATED_SEARCH,
    ],
  },
  () => {
    test(
      'verify Box file search functionality in federated search',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@test'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: 'TBD',
          storyId: 'TBD',
        });

        const testData = FEDERATED_SEARCH_TEST_DATA.boxIntegration;
        const globalSearchResultPage = await appManagerFixture.navigationHelper.searchForTerm(testData.searchTerm, {
          stepInfo: `Searching with term "${testData.searchTerm}" to find Box file`,
        });
        const federatedSearchComponent = new FederatedSearchComponent(appManagerFixture.page);
        await federatedSearchComponent.verifyIntegrationsHeadingIsDisplayed();
        await federatedSearchComponent.verifyIntegrationNameIsDisplayed(testData.integrationName);
        await federatedSearchComponent.verifyIntegrationLogoIsDisplayed(testData.integrationName);
        await federatedSearchComponent.verifyIntegrationCountIsDisplayed(testData.integrationName);
        await federatedSearchComponent.clickOnIntegration(testData.integrationName);
        await globalSearchResultPage.waitUntilSearchResultListIsDisplayed();
        const fileResult = await globalSearchResultPage.getFileResultItemExactlyMatchingTheSearchTerm(
          testData.fileName,
          testData.fileType
        );
        const fileResultItem = new FederatedSearchComponent(fileResult.page, fileResult.rootLocator);
        const intranetFileItem = new IntranetFileListComponent(fileResult.page, fileResult.rootLocator);
        await fileResultItem.verifyFileLogoIsDisplayed(testData.integrationName);
        await fileResultItem.verifyFileIntegrationTextIsDisplayed(testData.integrationName);
        await intranetFileItem.verifyNameIsDisplayed(testData.fileName);
        await intranetFileItem.verifyAuthorIsDisplayed(testData.author);
        await fileResultItem.verifyFederatedFileDateIsDisplayed(testData.date);
        await intranetFileItem.verifyFileThumbnailIsDisplayed();
        await intranetFileItem.verifyLabelIsDisplayed(testData.fileTypeLabel);
        await intranetFileItem.hoverOverCardAndCopyLink();
        await fileResultItem.verifyCopiedURLWithProvider(testData.integrationName);
        await fileResultItem.goBackToPreviousPage();
        await fileResultItem.verifyNavigationToFederatedFileTitleLink(testData.fileName, testData.integrationName);
      }
    );
  }
);
