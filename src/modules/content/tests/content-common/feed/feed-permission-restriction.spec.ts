import { SitePageTab } from '@content/constants/sitePageEnums';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

test.describe(
  '@FeedPost - Restrict feed posting permission to managers only',
  {
    tag: [ContentTestSuite.FEED_STANDARD_USER, '@feed-permission-restriction'],
  },
  () => {
    const verifyRestrictionForUser = async (siteId: string, page: any) => {
      const siteDashboard = new SiteDashboardPage(page, siteId);
        await siteDashboard.navigateToTab(SitePageTab.DashboardTab);
      // Verify that restriction message is visible on dashboard
      await siteDashboard.assertions.verifyFeedRestrictionMessageVisible(FEED_TEST_DATA.RESTRICTION_MESSAGE);
    };

    test(
      'public | private | unlisted | SCM and Member see restriction message on dashboard',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.REGRESSION,
          '@Public_Site_Permission_Restriction @Private_Site_Permission_Restriction @Unlisted_Site_Permission_Restriction',
        ],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'SCM and Member see restriction message on dashboard for public',
          zephyrTestId: 'CONT-37172',
          storyId: 'CONT-37172',
        });

        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        const publicSite = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: false,
        });
        const publicSiteId = publicSite.siteId;

        // Use UI automation to set feed posting permission
        const manageSitePage = new ManageSitePage(appManagerFixture.page, publicSiteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          publicSiteId,
          'managersOnly',
          manageSitePage
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: publicSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(publicSiteId, standardUserFixture.page);

        const privateSite = await appManagerApiFixture.siteManagementHelper.createPrivateSite({
          waitForSearchIndex: false,
        });
        const privateSiteId = privateSite.siteId;

        // Use UI automation to set feed posting permission
        const managePrivateSitePage = new ManageSitePage(appManagerFixture.page, privateSiteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          privateSiteId,
          'managersOnly',
          managePrivateSitePage
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: privateSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(privateSiteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: privateSiteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(privateSiteId, standardUserFixture.page);

        // Unlisted sites don't appear in public search, so skip waitForSearchIndex to avoid timeout
        const unlistedSite = await appManagerApiFixture.siteManagementHelper.createUnlistedSite({
          waitForSearchIndex: false,
        });
        const unlistedSiteId = unlistedSite.siteId;

        // Use UI automation to set feed posting permission
        const manageUnlistedSitePage = new ManageSitePage(appManagerFixture.page, unlistedSiteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          unlistedSiteId,
          'managersOnly',
          manageUnlistedSitePage
        );

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: unlistedSiteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(unlistedSiteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: unlistedSiteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(unlistedSiteId, standardUserFixture.page);
      }
    );
  }
);
