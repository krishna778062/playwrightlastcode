import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { IdentityManagementHelper } from '@/src/core/helpers/identityManagementHelper';
import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { ManageSitePage } from '@/src/modules/content/pages/manageSitePage';
import { SiteDashboardPage } from '@/src/modules/content/pages/siteDashboardPage';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSiteStandardUserPage: ManageSitePage;
    let identityManagementHelper: IdentityManagementHelper;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(async ({ standardUserHomePage, siteManagementHelper, appManagerApiClient }) => {
      const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
      manageSiteStandardUserPage = new ManageSitePage(standardUserHomePage.page, siteInfo.siteId);
      siteDashboardPage = new SiteDashboardPage(standardUserHomePage.page, siteInfo.siteId);
      identityManagementHelper = new IdentityManagementHelper(appManagerApiClient);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Login as Standard User where user is Site Content Manager of Public site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({ siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNamePublic = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const publicSite = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNamePublic,
          categoryID,
          SITE_TYPES.PUBLIC
        );

        const endUserInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await siteManagementHelper.makeUserSiteMembership(
          publicSite.siteId,
          endUserInfo.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(publicSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'To verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, '@CONT-23740'],
      },
      async ({ contentManagementHelper, siteManagementHelper, identityManagementHelper }) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-23740',
          storyId: 'CONT-23740',
        });

        const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(siteInfo.siteId);
        const endUserInfo = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: endUserInfo.userId,
          role: SitePermission.CONTENT_MANAGER,
        });
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(siteInfo.siteId);
        await contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: {
            pageName: MANAGE_SITE_TEST_DATA.PAGE_NAME.generateUniqueName(),
            contentDescription: 'Test Description',
          },
        });
        await contentManagementHelper.createAlbum({
          siteId: siteInfo.siteId,
          imageName: 'beach.jpg',
          options: {
            albumName: MANAGE_SITE_TEST_DATA.ALBUM_NAME.generateUniqueName(),
            contentDescription: 'Test Description',
          },
        });
        await contentManagementHelper.createEvent({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'event' },
          options: {
            eventName: MANAGE_SITE_TEST_DATA.EVENT_NAME.generateUniqueName(),
            contentDescription: 'Test Description',
          },
        });
        await manageSiteStandardUserPage.actions.clickOnTheManageSiteButton();
        await manageSiteStandardUserPage.assertions.verifyEventsTabImageIsDisplayed();
        await manageSiteStandardUserPage.assertions.verifyAlbumTabImageIsDisplayed();
        await manageSiteStandardUserPage.assertions.verifyPageTabImageIsDisplayed();
        const siteAuthorNameAndEventStartDate = await siteManagementHelper.getSiteAuthorNameAndEventStartDate();
        await manageSiteStandardUserPage.assertions.checkAuthorNameIsDisplayed(
          siteAuthorNameAndEventStartDate.authorName || ''
        );
        await manageSiteStandardUserPage.assertions.verifyEventsTabMatchesApiDate(
          siteAuthorNameAndEventStartDate.startsAt || ''
        );

        await siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: endUserInfo.userId,
          role: SitePermission.MEMBER,
        });
      }
    );

    test(
      'Login as Standard User where user is Site Content Manager of Private site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({ siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Private site',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNamePrivate = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const privateSite = await siteManagementHelper.createSiteWithMember(
          users.endUser.email,
          siteNamePrivate,
          categoryID,
          SITE_TYPES.PRIVATE
        );
        const endUserInfoPrivate = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await siteManagementHelper.makeUserSiteMembership(
          privateSite.siteId,
          endUserInfoPrivate.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(privateSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'Login as Standard User where user is Site Content Manager of Unlisted site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({ siteManagementHelper }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Unlisted site',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNameUnlisted = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const unlistedSite = await siteManagementHelper.createSiteWithMember(
          users.endUser.email,
          siteNameUnlisted,
          categoryID,
          SITE_TYPES.UNLISTED
        );
        const endUserInfoUnlisted = await identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await siteManagementHelper.makeUserSiteMembership(
          unlistedSite.siteId,
          endUserInfoUnlisted.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(unlistedSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );
  }
);
