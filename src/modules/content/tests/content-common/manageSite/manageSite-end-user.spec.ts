import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { tagTest } from '@core/utils/testDecorator';

import { ManageSitesComponent } from '../../../ui/components/manageSitesComponent';
import { SiteDetailsPage } from '../../../ui/pages/siteDetailsPage';

import { ContentFilter } from '@/src/modules/content/constants/enums/contentFilter';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent } from '@/src/modules/content/ui/components';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteDashboardPage } from '@/src/modules/content/ui/pages/sitePages/siteDashboardPage';
import { SITE_TYPES } from '@/src/modules/global-search/constants/siteTypes';

test.describe(
  ContentSuiteTags.MANAGE_SITE,
  {
    tag: [ContentSuiteTags.MANAGE_SITE],
  },
  () => {
    let manageSiteStandardUserPage: ManageSiteSetUpPage;
    let manageSitesComponent: ManageSitesComponent;
    let manageContentPage: ManageContentPage;
    let manageFeaturesPage: ManageFeaturesPage;
    test.beforeEach(async ({ standardUserFixture }) => {
      manageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
      manageContentPage = new ManageContentPage(standardUserFixture.page);
      manageFeaturesPage = new ManageFeaturesPage(standardUserFixture.page);
    });

    test.afterEach(async ({ page }) => {
      await page.close();
    });
    test(
      'login as Standard User where user is Site Content Manager of Public site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, ContentSuiteTags.MANAGE_SITE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'login as Standard User where user is Site Content Manager of Public site',
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
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, publicSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'to verify the UI of Manage site content - End User',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the UI of Manage site content - End User',
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
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, siteInfo.siteId);
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
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Private site',
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
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, privateSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'login as Standard User where user is Site Content Manager of Unlisted site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Unlisted site',
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
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, unlistedSite.siteId);
        await manageSiteStandardUserPage.actions.clickOntheMemberButton();
        await manageSiteStandardUserPage.assertions.clickOnLeaveButton();
      }
    );

    test(
      'to verify the search content in manage site content',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-23736'],
      },
      async ({ standardUserFixture, standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Scheduled stamp and its options menu under-manage site content tab',
          zephyrTestId: 'CONT-23736',
          storyId: 'CONT-23736',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          hasPages: true,
        });
        await standardUserApiFixture.contentManagementHelper.createPage({
          siteId: siteInfo.siteId,
          contentInfo: { contentType: 'page', contentSubType: 'news' },
          options: {
            pageName: MANAGE_SITE_TEST_DATA.CONTENT_NAME.generateUniqueName('page'),
            contentDescription: MANAGE_SITE_TEST_DATA.DESCRIPTION.DESCRIPTION,
          },
        });
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, siteInfo.siteId);
        await newSiteDashboard.loadPage();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnInsideContentButtonAction();
        await manageSitesComponent.selectContentFilter(ContentFilter.MANAGING);
        await manageSitesComponent.verifyContentFilterIsSelectedWithValue(ContentFilter.MANAGING);
        const contentNames = await manageContentPage.actions.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageSitesComponent.searchContentInManageSite(contentNames[0]);
        await manageContentPage.actions.verifyContentVisibleInManageSite(contentNames[0]);
        await standardUserFixture.page.reload();
        await manageSitesComponent.selectContentFilter(ContentFilter.OWNED);
        await manageSitesComponent.verifyContentFilterIsSelectedWithValue(ContentFilter.OWNED);
        await manageSitesComponent.searchContentInManageSite(contentNames[0]);
        await manageContentPage.actions.verifyContentVisibleInManageSite(contentNames[0]);
      }
    );

    test(
      'to verify the site author name and event start date',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26044'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site author name and event start date',
          zephyrTestId: 'CONT-41421',
          storyId: 'CONT-41421',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites();
        const siteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);

        // Initialize ManageSitePage with first siteId for verification
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, firstSiteId);

        // Verify all site names are displayed (method handles the loop internally)
        await manageSiteStandardUserPage.assertions.verifySitesNamesAreDisplayed(siteNames);
      }
    );
    test(
      'to verify the people follow in site about members and followers tab',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24063'],
      },
      async ({ appManagerApiFixture, standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the people follow in site about members and followers tab',
          zephyrTestId: 'CONT-24063',
          storyId: 'CONT-24063',
        });
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC);
        const siteDetailsPage = new SiteDetailsPage(standardUserFixture.page, siteInfo.siteId);
        await siteDetailsPage.loadPage();
        const standardUserManageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
        await standardUserManageSitesComponent.clickOnAboutTabAction();
        await standardUserManageSitesComponent.clickOnTheMembersAndFollowersTabButtonInAboutTabAction();
        // getUserInfoByEmail requires admin permissions, so use appManagerApiFixture
        const endUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        console.log('endUserInfo', endUserInfo.userId);
        // getFollowersAndFollowingList can use standardUserApiFixture as it's the user's own data
        const followersAndFollowingList =
          await standardUserApiFixture.siteManagementHelper.getFollowersAndFollowingList(endUserInfo.userId, 100);
        // Pass callback to get updated list after clicking follow button
        const followingNames = await standardUserManageSitesComponent.followOwnersAndManager(
          followersAndFollowingList,
          async () => {
            return await standardUserApiFixture.siteManagementHelper.getFollowersAndFollowingList(
              endUserInfo.userId,
              100
            );
          }
        );
        console.log('followingNames', followingNames);
        if (followingNames.length > 0) {
          await standardUserManageSitesComponent.hoverOnTheFollwingName(followingNames[0]);
          await standardUserManageSitesComponent.clickOnFollowingButtonActionUnderSpecificName(followingNames[0]);
          await standardUserManageSitesComponent.clickOnTheMemberButtonInAboutTabAction();
          await standardUserManageSitesComponent.verifyIfFollowingButtonIsVisibleThenClickOnIt();
        }
      }
    );
  }
);
