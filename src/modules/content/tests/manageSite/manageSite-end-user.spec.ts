import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteManagementHelper } from '@core/helpers/siteManagementHelper';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFeatureTags, ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
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
    let manageSitePage: ManageSitePage;
    let siteManagementHelper: SiteManagementHelper;
    let siteDashboardPage: SiteDashboardPage;
    test.beforeEach(async ({ standardUserHomePage, appManagerApiClient, appManagerHomePage }) => {
      await appManagerHomePage.verifyThePageIsLoaded();
      siteManagementHelper = new SiteManagementHelper(appManagerApiClient);
      const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
      manageSitePage = new ManageSitePage(standardUserHomePage.page, siteInfo.siteId);
      siteDashboardPage = new SiteDashboardPage(standardUserHomePage.page, siteInfo.siteId);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'Login as Admin/Standard User where user is Site Content Manager of Public site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNamePublic = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const site1 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNamePublic,
          categoryID,
          SITE_TYPES.PUBLIC
        );
        await siteManagementHelper.makeUserSiteMembership(
          site1.siteId,
          process.env.END_USER_USERID!,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(site1.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'To verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, '@CONT-23740'],
      },
      async ({ contentManagementHelper, siteManagementHelper, appManagerApiClient }) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-23740',
          storyId: 'CONT-23740',
        });

        const siteInfo = await siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(siteInfo.siteId);
        const appManagerSiteHelper = new SiteManagementHelper(appManagerApiClient);
        await appManagerSiteHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: process.env.END_USER_USERID!,
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
        await manageSitePage.actions.clickOnTheManageSiteButton();
        await manageSitePage.assertions.verifyEventsTabImageIsDisplayed();
        await manageSitePage.assertions.verifyAlbumTabImageIsDisplayed();
        await manageSitePage.assertions.verifyPageTabImageIsDisplayed();
        const siteAuthorNameAndEventStartDate = await siteManagementHelper.getSiteAuthorNameAndEventStartDate();
        await manageSitePage.assertions.checkAuthorNameIsDisplayed(siteAuthorNameAndEventStartDate.authorName || '');
        await manageSitePage.assertions.verifyEventsTabMatchesApiDate(siteAuthorNameAndEventStartDate.startsAt || '');

        await appManagerSiteHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: process.env.END_USER_USERID!,
          role: SitePermission.MEMBER,
        });
      }
    );

    test(
      'Login as Admin/Standard User where user is Site Content Manager of Private site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNamePrivate = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const site1 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNamePrivate,
          categoryID,
          SITE_TYPES.PRIVATE
        );
        await siteManagementHelper.makeUserSiteMembership(
          site1.siteId,
          process.env.END_USER_USERID!,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(site1.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'Login as Admin/Standard User where user is Site Content Manager of Unlisted site "Site A"',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentFeatureTags.MANAGE_SITE, ContentFeatureTags.MANAGE_SITE],
      },
      async ({}) => {
        tagTest(test.info(), {
          description: 'To verify the favourite people from manage site people',
          customTags: [ContentFeatureTags.MANAGE_SITE],
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        const siteNameUnlisted = MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName();
        const categoryID = await siteManagementHelper.getRandomCategoryId();
        const site1 = await siteManagementHelper.createSiteWithMember(
          process.env.END_USER_USERNAME!,
          siteNameUnlisted,
          categoryID,
          SITE_TYPES.UNLISTED
        );
        await siteManagementHelper.makeUserSiteMembership(
          site1.siteId,
          process.env.END_USER_USERID!,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        await siteDashboardPage.assertions.verifySiteDashboardNavigationWithSiteID(site1.siteId);
        await manageSitePage.actions.clickOntheMemberButton();
        await manageSitePage.assertions.clickOnLeaveButton();
      }
    );
  }
);
