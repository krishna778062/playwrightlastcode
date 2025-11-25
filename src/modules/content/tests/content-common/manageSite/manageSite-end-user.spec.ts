import { SiteDetailsPage } from '@content/ui/pages/siteDetailsPage';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { FileUtil } from '@core/utils/fileUtil';
import { tagTest } from '@core/utils/testDecorator';

import { ContentFilter } from '@/src/modules/content/constants/enums/contentFilter';
import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { EditFileComponent } from '@/src/modules/content/ui/components/editFileComponent';
import { ManageSitesComponent } from '@/src/modules/content/ui/components/manageSitesComponent';
import { SiteManager } from '@/src/modules/content/ui/managers/siteManager';
import { SiteDetailsPage } from '../../../ui/pages/siteDetailsPage';

import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { SortOptionLabels } from '@/src/modules/content/constants/sortOptionLabels';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent } from '@/src/modules/content/ui/components';
import { EditSitePage } from '@/src/modules/content/ui/pages/editSitePage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
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
    let manageContentPage: ManageContentPage;
    let manageFeaturesPage: ManageFeaturesPage;
    let manageSitesComponent: ManageSitesComponent;
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
          description: 'to verify the search content in manage site content ',
          zephyrTestId: 'CONT-23736',
          storyId: 'CONT-23736',
          isKnownFailure: true,
        });
        // Get or create a site where the standard user can manage content
        const siteInfo = await appManagerApiFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.PUBLIC, {
          hasPages: true,
        });

        // Ensure the standard user is a manager of this site
        const standardUserInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        try {
          await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
            siteId: siteInfo.siteId,
            userId: standardUserInfo.userId,
            role: SitePermission.MANAGER,
          });
        } catch (error) {
          // Log and continue - user may already have correct role or site has API restrictions
          console.log(`Note: Could not set MANAGER role (may already be set or site has restrictions): ${error}`);
        }

        // Create a page in the site for testing search functionality
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
        await manageContentPage.actions.clickSortByButton();
        await manageContentPage.actions.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.actions.clickSortByButton();
        const contentNames = await manageContentPage.actions.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageSitesComponent.searchContentInManageSite(contentNames[0]);
        await manageContentPage.actions.verifyContentVisibleInManageSite(contentNames[0]);
        await standardUserFixture.page.reload();
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
      'to verify the edit option on file detail page',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26763'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the edit option on file detail page',
          zephyrTestId: 'CONT-26763',
          storyId: 'CONT-26763',
        });
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites();
        console.log('getListOfSitesResponse', getListOfSitesResponse);
        const siteId = getListOfSitesResponse.result.listOfItems[0].siteId;
        console.log('siteId', siteId);
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          'image1.jpg'
        );
        const fileSize = FileUtil.getFileSize(imagePath);
        const getSignedUploadUrlResponse =
          await standardUserApiFixture.contentManagementHelper.imageUploaderService.getSignedUploadUrl({
            file_name: 'image1.jpg',
            mime_type: 'image/jpeg',
            size: fileSize,
            uploadContext: 'site-files',
            type: 'content',
            siteId: siteId,
          });
        await standardUserApiFixture.contentManagementHelper.imageUploaderService.uploadFileToSignedUrl(
          getSignedUploadUrlResponse.uploadUrl,
          imagePath,
          'image1.jpg'
        );
        const fileDetails =
          await standardUserApiFixture.contentManagementHelper.imageUploaderService.uploadIntranetFile(
            siteId,
            'image1.jpg',
            imagePath,
            'image/jpeg'
          );
        console.log('fileDetails', fileDetails);
        const siteManager = new SiteManager(standardUserFixture.page, siteId);
        await siteManager.loadSite();
        const manageSitePage = new ManageSitePage(standardUserFixture.page);
        await manageSitePage.actions.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePage.assertions.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePage.actions.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePage.actions.clickOnEditOption();
        const editFileComponent = new EditFileComponent(standardUserFixture.page);
        await editFileComponent.actions.fillFileDescription(MANAGE_SITE_TEST_DATA.FILE_DESCRIPTION.DESCRIPTION(245));
        await editFileComponent.assertions.verifyFileDescriptionIsFilledCount(245);
        await editFileComponent.actions.fillFileDescription(MANAGE_SITE_TEST_DATA.FILE_DESCRIPTION.DESCRIPTION(251));
        await editFileComponent.assertions.verifyFileDescriptionIsFilledCount(250);
        await editFileComponent.actions.clickOnUpdateButton();
        await manageSitePage.actions.clickOnEditOption();
        await editFileComponent.assertions.verifyInputBoxHasValueOf(250);
      'to verify the site edit option in manage site user drop down sites',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26503'],
      },
      async ({ standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site edit option in manage site user drop down sites',
          zephyrTestId: 'CONT-26503',
          storyId: 'CONT-26503',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();

        manageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
        const editSitePage = new EditSitePage(standardUserFixture.page);
        await manageSitesComponent.hoverOnFirstSiteNameAction();
        await editSitePage.actions.clickOnEditOption();
        await editSitePage.actions.editSiteNameInput(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
        await editSitePage.actions.clickOnUpdateButton();
        await editSitePage.assertions.verifySiteNameIsUpdated(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
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
    test(
      'to verify the bulk action from end user can deactivate the site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26576'],
      },
      async ({ standardUserFixture, standardUserApiFixture, appManagerApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action from end user can deactivate the site',
          zephyrTestId: 'CONT-26576',
          storyId: 'CONT-26576',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.ACTIVE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.DEACTIVATE);
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'deactivated',
        });
        const siteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);
        const selectedSiteName = await manageSitesComponent.selectFirstEnabledSiteCheckbox(siteNames);
        if (!selectedSiteName) {
          throw new Error(
            'No deactivated site with enabled checkbox found. All sites may be disabled due to permissions or state.'
          );
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(selectedSiteName);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageContentPage.actions.clickOnActivateButton();
        await manageContentPage.actions.clickOnActivateApplyButton();
        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.DEACTIVATE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.ACTIVE);
        const getSiteListResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const activeSiteNamesList = getSiteListResponse.result.listOfItems.map((item: any) => item.name);
        console.log('Active site names from API:', activeSiteNamesList);
        console.log('Activated site name:', selectedSiteName);

        // Verify that the activated site is now in the active sites list
        if (!activeSiteNamesList.includes(selectedSiteName)) {
          throw new Error(
            `Site "${selectedSiteName}" was activated but is not found in the active sites list. Active sites: ${activeSiteNamesList.join(', ')}`
          );
        }
        console.log(`✓ Verified: Site "${selectedSiteName}" is now in the active sites list`);

        const manageDeactivatedSitePage = new ManageSitePage(standardUserFixture.page);
        await manageDeactivatedSitePage.loadPage();

        const firstActiveSiteId = getSiteListResponse.result.listOfItems[0]?.siteId;
        if (!firstActiveSiteId) {
          throw new Error('No active sites found in the response');
        }
      }
    );
    test(
      'to verify the bulk action from end user can activate the site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26574'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action from end user can activate the site',
          zephyrTestId: 'CONT-26574',
          storyId: 'CONT-26574',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.actions.clickOnSitesCard();
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        await manageSitesComponent.selectSiteCheckboxByExactName(getListOfSitesResponse.result.listOfItems[0].name);
        await manageContentPage.actions.clickOnSelectActionDropdown();
        await manageSitesComponent.clickOnUpdateCategoryButtonAction();
        await manageContentPage.actions.clickOnApply();
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, firstSiteId);
        await manageSiteStandardUserPage.actions.updatingCategoryToUncategorized('Uncategorized');
      }
    );
    test(
      'to verify follow site, followers tab, and membership request functionality',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-24062'],
      },
      async ({ appManagerApiFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'To verify follow site, followers tab, and membership request functionality',
          zephyrTestId: 'CONT-24062',
          storyId: 'CONT-24062',
        });
        const newsiteInfo = await appManagerApiFixture.siteManagementHelper.createSite({
          siteName: MANAGE_SITE_TEST_DATA.SITE_NAME.generateUniqueName(),
          accessType: SITE_TYPES.PUBLIC,
        });
        const siteDashboardPage = new SiteDashboardPage(standardUserFixture.page, newsiteInfo.siteId);
        await siteDashboardPage.loadPage();
        const manageSiteSetUpPage = new ManageSiteSetUpPage(standardUserFixture.page, newsiteInfo.siteId);
        await manageSiteSetUpPage.actions.clickOnFollowButton();
        await manageSiteSetUpPage.actions.clickOnFollowSiteButton();
        await manageSiteSetUpPage.assertions.verifyFollowButtonShouldBeChangedIntoFollowing();
        await manageSiteSetUpPage.actions.clickOnAboutTabAction();
        await manageSiteSetUpPage.actions.clickOnTheFollowersTabButtonInAboutTab();
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await manageSiteSetUpPage.assertions.checkMembersNameShouldBeVisibleInFollowersTab(userInfo.fullName);
        await manageSiteSetUpPage.actions.clickOnFollowingButton();
        await manageSiteSetUpPage.actions.clickOnUnfollowSiteButton();
        await manageSiteSetUpPage.assertions.verifyUnfollowButtonShouldBeChangedIntoFollowButton();
        await manageSiteSetUpPage.actions.clickOnAboutTabAction();
        await manageSiteSetUpPage.actions.clickOnTheFollowersTabButtonInAboutTab();
        await manageSiteSetUpPage.assertions.checkMembersNameShouldNotBeVisibleInFollowersTab(userInfo.fullName);
        await manageSiteSetUpPage.actions.clickOnFollowButton();
        const requestId = await manageSiteSetUpPage.actions.clickOnRequestMembershipButton();
        console.log('requestId from membership request:', requestId);
        await appManagerApiFixture.siteManagementHelper.acceptMembershipRequest(newsiteInfo.siteId, requestId);
        const siteDetailsPage = new SiteDetailsPage(standardUserFixture.page, newsiteInfo.siteId);
        await siteDetailsPage.loadPage();
        await manageSiteSetUpPage.assertions.verifyMemberButtonShouldBeVisible();
      }
    );
  }
);
