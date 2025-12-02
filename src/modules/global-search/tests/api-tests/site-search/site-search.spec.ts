import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { EnterpriseSearchApiHelper } from '@/src/modules/global-search/apis/apiValidation/enterpriseSearchApiHelper';
import { SEARCH_RESULT_ITEM } from '@/src/modules/global-search/constants/siteTypes';
import { GlobalSearchSuiteTags } from '@/src/modules/global-search/constants/testTags';
import {
  SearchApiFixture,
  searchTestFixtures as test,
} from '@/src/modules/global-search/tests/fixtures/searchTestFixture';

test.describe(
  'global Search - Site Search API',
  {
    tag: [GlobalSearchSuiteTags.SITE_SEARCH_API, GlobalSearchSuiteTags.GLOBAL_SEARCH_API],
  },
  () => {
    test(
      'zeus to verify admin user able to search newly created public site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        appManagerApiFixture,
        publicSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        publicSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // Perform enterprise search for the public site from fixture
        const searchResponse = await appManagerApiFixture.enterpriseSearchService.search(publicSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          publicSite.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.PUBLIC,
          'site'
        );
      }
    );

    test(
      'zeus to verify admin user able to search newly created private site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        appManagerApiFixture,
        privateSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        privateSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // Perform enterprise search for the private site from fixture
        const searchResponse = await appManagerApiFixture.enterpriseSearchService.search(privateSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          privateSite.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.PRIVATE,
          'site'
        );
      }
    );

    test(
      'zeus to verify admin user able to search newly created unlisted site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        appManagerApiFixture,
        unlistedSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        unlistedSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // Perform enterprise search for the unlisted site from fixture
        const searchResponse = await appManagerApiFixture.enterpriseSearchService.search(unlistedSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          unlistedSite.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.UNLISTED,
          'site'
        );
      }
    );

    test(
      'zeus to validate end user able to search newly created public site in enterprise search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        standardUserApiFixture,
        publicSite,
      }: {
        standardUserApiFixture: SearchApiFixture;
        publicSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // End user performs enterprise search for the public site from fixture
        const searchResponse = await standardUserApiFixture.enterpriseSearchService.search(publicSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          publicSite.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.PUBLIC,
          'site'
        );
      }
    );

    test(
      'zeus to validate end user able to search newly created private site in enterprise search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        standardUserApiFixture,
        privateSite,
      }: {
        standardUserApiFixture: SearchApiFixture;
        privateSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // End user performs enterprise search for the private site from fixture
        const searchResponse = await standardUserApiFixture.enterpriseSearchService.search(privateSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          privateSite.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.PRIVATE,
          'site'
        );
      }
    );

    test(
      'zeus to validate standard user not able to search newly created unlisted site where user is not member of unlisted site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        standardUserApiFixture,
        unlistedSite,
      }: {
        standardUserApiFixture: SearchApiFixture;
        unlistedSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'GS-XXXXX',
        });

        // Standard user (who is NOT a member) performs enterprise search for the unlisted site from fixture
        const searchResponse = await standardUserApiFixture.enterpriseSearchService.search(unlistedSite.siteName, {
          pageSize: 10,
          exactMatch: false,
          callerContext: 'global_search',
        });

        // Validate the search response - site should NOT be found
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteNotInSearchResults(searchResponse, unlistedSite.siteName, 'site');
      }
    );
  }
);
