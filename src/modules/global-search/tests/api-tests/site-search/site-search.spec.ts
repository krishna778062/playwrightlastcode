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
      'zeus to verify admin user, end user and site manager able to search newly created public site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        appManagerApiFixture,
        standardUserApiFixture,
        siteManagerApiFixture,
        publicSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        standardUserApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        publicSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15532, SEN-15544, SEN-15568',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.searchAndValidateSiteForUsers(
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: standardUserApiFixture, userType: 'end user' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          publicSite,
          SITE_TYPES.PUBLIC
        );
      }
    );

    test(
      'zeus to verify admin user, end user and site manager able to search newly created private site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        appManagerApiFixture,
        standardUserApiFixture,
        siteManagerApiFixture,
        privateSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        standardUserApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        privateSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15533, SEN-15545, SEN-15539',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.searchAndValidateSiteForUsers(
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: standardUserApiFixture, userType: 'end user' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          privateSite,
          SITE_TYPES.PRIVATE
        );
      }
    );

    test(
      'zeus to verify admin user and site manager able to search newly created unlisted site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        appManagerApiFixture,
        siteManagerApiFixture,
        unlistedSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        unlistedSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15534, SEN-15540',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.searchAndValidateSiteForUsers(
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          unlistedSite,
          SITE_TYPES.UNLISTED
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
          zephyrTestId: 'SEN-15547',
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

    test(
      'zeus to validate end user able to search newly created unlisted site in which enduser is memberof site in enterprise search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({
        standardUserApiFixture,
        unlistedSiteWithEndUserMember,
      }: {
        standardUserApiFixture: SearchApiFixture;
        unlistedSiteWithEndUserMember: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15546',
        });

        // End user (who IS a member) performs enterprise search for the unlisted site from fixture
        const searchResponse = await standardUserApiFixture.enterpriseSearchService.search(
          unlistedSiteWithEndUserMember.siteName,
          {
            pageSize: 10,
            exactMatch: false,
            callerContext: 'global_search',
          }
        );

        // Validate the search response
        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.validateSearchResponseBasic(searchResponse);
        await enterpriseSearchApiHelper.validateSiteInSearchResults(
          searchResponse,
          unlistedSiteWithEndUserMember.siteName,
          SEARCH_RESULT_ITEM.CATEGORY,
          SITE_TYPES.UNLISTED,
          'site'
        );
      }
    );

    test(
      'zeus to validate admin user, end user and site manager not able to search deleted public site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        appManagerApiFixture,
        standardUserApiFixture,
        siteManagerApiFixture,
        publicSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        standardUserApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        publicSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15551, SEN-15555, SEN-15550',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.deactivateSiteAndValidateNotSearchableForUsers(
          appManagerApiFixture,
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: standardUserApiFixture, userType: 'end user' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          publicSite
        );
      }
    );

    test(
      'zeus to validate admin user, end user and site manager not able to search deleted private site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        appManagerApiFixture,
        standardUserApiFixture,
        siteManagerApiFixture,
        privateSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        standardUserApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        privateSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15552, SEN-15556, SEN-15553',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.deactivateSiteAndValidateNotSearchableForUsers(
          appManagerApiFixture,
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: standardUserApiFixture, userType: 'end user' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          privateSite
        );
      }
    );

    test(
      'zeus to validate admin user, end user and site manager not able to search deleted unlisted site in workplace search global search page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@test'],
      },
      async ({
        appManagerApiFixture,
        standardUserApiFixture,
        siteManagerApiFixture,
        unlistedSite,
      }: {
        appManagerApiFixture: SearchApiFixture;
        standardUserApiFixture: SearchApiFixture;
        siteManagerApiFixture: SearchApiFixture;
        unlistedSite: { siteName: string; siteId: string };
      }) => {
        tagTest(test.info(), {
          zephyrTestId: 'SEN-15553, SEN-15557',
        });

        const enterpriseSearchApiHelper = new EnterpriseSearchApiHelper();
        await enterpriseSearchApiHelper.deactivateSiteAndValidateNotSearchableForUsers(
          appManagerApiFixture,
          [
            { fixture: appManagerApiFixture, userType: 'admin' },
            { fixture: standardUserApiFixture, userType: 'end user' },
            { fixture: siteManagerApiFixture, userType: 'site manager' },
          ],
          unlistedSite
        );
      }
    );
  }
);
