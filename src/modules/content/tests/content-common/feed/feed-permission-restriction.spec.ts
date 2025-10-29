import { SitePageTab } from '@content/constants/sitePageEnums';
import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { FEED_TEST_DATA } from '@content/test-data/feed.test-data';
import { ManageSitePage } from '@content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@content/ui/pages/sitePages/siteDashboardPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SitePermission } from '@core/types/siteManagement.types';

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
      'public | SCM and Member see restriction message on dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@Public_Site_Permission_Restriction'],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        const created = await appManagerApiFixture.siteManagementHelper.createPublicSite({
          waitForSearchIndex: true,
        });
        const siteId = created.siteId;

        // Use UI automation to set feed posting permission
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          siteId,
          'managersOnly',
          manageSitePage
        );

        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);
      }
    );

    test(
      'private | SCM and Member see restriction message on dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@Private_Site_Permission_Restriction'],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        const created = await appManagerApiFixture.siteManagementHelper.createPrivateSite({
          waitForSearchIndex: true,
        });
        const siteId = created.siteId;

        // Use UI automation to set feed posting permission
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          siteId,
          'managersOnly',
          manageSitePage
        );

        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);
      }
    );

    test(
      'unlisted | SCM and Member see restriction message on dashboard',
      {
        tag: [TestPriority.P1, TestGroupType.REGRESSION, '@Unlisted_Site_Permission_Restriction'],
      },
      async ({ appManagerApiFixture, appManagerFixture, standardUserFixture }) => {
        // Unlisted sites don't appear in public search, so skip waitForSearchIndex to avoid timeout
        const created = await appManagerApiFixture.siteManagementHelper.createUnlistedSite({
          waitForSearchIndex: false,
        });
        const siteId = created.siteId;

        // Use UI automation to set feed posting permission
        const manageSitePage = new ManageSitePage(appManagerFixture.page, siteId);
        await appManagerApiFixture.siteManagementHelper.setSiteFeedPostingPermission(
          siteId,
          'managersOnly',
          manageSitePage
        );

        const { userId } = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        // As Site Content Manager
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);

        // As Member
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId,
          userId,
          role: SitePermission.MEMBER,
        });
        await verifyRestrictionForUser(siteId, standardUserFixture.page);
      }
    );
  }
);
