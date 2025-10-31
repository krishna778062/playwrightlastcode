import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSiteStandardUserPage: ManageSitePage;
    test.beforeEach(async ({}) => {});

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'login as Standard User where user is Site Content Manager of Public site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'login as Standard User where user is Site Content Manager of Public site',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const publicSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);

        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          publicSite.siteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, publicSite.siteId);
        await newSiteDashboard.loadPage();
        manageSiteStandardUserPage = new ManageSitePage(standardUserFixture.page, publicSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'to verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-23740',
          storyId: 'CONT-23740',
        });
        const randDomDescription = MANAGE_SITE_TEST_DATA.DESCRIPTION.DESCRIPTION;

        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: endUserInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, siteInfo.siteId);
        await newSiteDashboard.loadPage();
        manageSiteStandardUserPage = new ManageSitePage(standardUserFixture.page, siteInfo.siteId);
        await appManagerApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: {
            pageName: MANAGE_SITE_TEST_DATA.CONTENT_NAME.generateContentName('page'),
            contentDescription: randDomDescription,
          },
        });
        await appManagerApiFixture.contentManagementHelper.createAlbum({
          siteId: siteInfo.siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: MANAGE_SITE_TEST_DATA.CONTENT_NAME.generateContentName('album'),
            contentDescription: randDomDescription,
          },
        });
        await appManagerApiFixture.contentManagementHelper.createEvent({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'event' },
          options: {
            eventName: MANAGE_SITE_TEST_DATA.CONTENT_NAME.generateContentName('event'),
            contentDescription: randDomDescription,
          },
        });
        await manageSiteStandardUserPage.actions.clickOnTheManageSiteButton();
        await manageSiteStandardUserPage.assertions.verifyEventsTabImageIsDisplayed();
        await manageSiteStandardUserPage.assertions.verifyAlbumTabImageIsDisplayed();
        await manageSiteStandardUserPage.assertions.verifyPageTabImageIsDisplayed();
        const siteAuthorNameAndEventStartDate =
          await appManagerApiFixture.siteManagementHelper.getSiteAuthorNameAndEventStartDate();
        await manageSiteStandardUserPage.assertions.checkAuthorNameIsDisplayed(
          siteAuthorNameAndEventStartDate.authorName || ''
        );
        await manageSiteStandardUserPage.assertions.verifyEventsTabMatchesApiDate(
          siteAuthorNameAndEventStartDate.startsAt || ''
        );

        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: endUserInfo.userId,
          role: SitePermission.MEMBER,
        });
      }
    );

    test(
      'login as Standard User where user is Site Content Manager of Private site',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.MANAGE_SITE,
          ContentFeatureTags.MANAGE_SITE,
          '@CONT-29063',
        ],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Private site',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const privateSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PRIVATE);
        const endUserInfoPrivate = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSite.siteId,
          endUserInfoPrivate.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, privateSite.siteId);
        await newSiteDashboard.loadPage();
        manageSiteStandardUserPage = new ManageSitePage(standardUserFixture.page, privateSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'login as Standard User where user is Site Content Manager of Unlisted site',
      {
        tag: [
          TestPriority.P0,
          TestGroupType.SMOKE,
          ContentFeatureTags.MANAGE_SITE,
          ContentFeatureTags.MANAGE_SITE,
          '@CONT-29063',
        ],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Unlisted site',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const unlistedSite = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED);
        const endUserInfoUnlisted = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          unlistedSite.siteId,
          endUserInfoUnlisted.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, unlistedSite.siteId);
        await newSiteDashboard.loadPage();
        manageSiteStandardUserPage = new ManageSitePage(standardUserFixture.page, unlistedSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );
  }
);
