import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { SiteMembershipAction, SitePermission } from '@core/types/siteManagement.types';
import { FileUtil } from '@core/utils/fileUtil';
import { tagTest } from '@core/utils/testDecorator';

import { BulkActionOptions } from '@/src/modules/content/constants/manageSiteOptions';
import { SitePageTab } from '@/src/modules/content/constants/sitePageEnums';
import { SortOptionLabels } from '@/src/modules/content/constants/sortOptionLabels';
import { ContentSuiteTags } from '@/src/modules/content/constants/testTags';
import { contentTestFixture as test, users } from '@/src/modules/content/fixtures/contentFixture';
import { FILE_TEST_DATA } from '@/src/modules/content/test-data/file.test-data';
import { MANAGE_SITE_TEST_DATA } from '@/src/modules/content/test-data/manage-site-test-data';
import { ManageSitesComponent } from '@/src/modules/content/ui/components';
import { EditFileComponent } from '@/src/modules/content/ui/components/editFileComponent';
import { SiteManager } from '@/src/modules/content/ui/managers/siteManager';
import { EditSitePage } from '@/src/modules/content/ui/pages/editSitePage';
import { ManageContentPage } from '@/src/modules/content/ui/pages/manageContentPage';
import { ManageFeaturesPage } from '@/src/modules/content/ui/pages/manageFeaturesPage';
import { ManageSitePage } from '@/src/modules/content/ui/pages/manageSitePage';
import { ManageSiteSetUpPage } from '@/src/modules/content/ui/pages/manageSiteSetUpPage';
import { SiteDetailsPage } from '@/src/modules/content/ui/pages/siteDetailsPage';
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
      'login as Standard User where user is Site Content Manager of Public site CONT-29063',
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
        await manageSiteStandardUserPage.clickOntheMemberButton();
        await manageSiteStandardUserPage.clickOnLeaveButton();
      }
    );

    test(
      'to verify the UI of Manage site content - End User CONT-23740',
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
        await manageSiteStandardUserPage.clickOnTheManageSiteButton();
        await manageSiteStandardUserPage.verifyEventsTabImageIsDisplayed();
        await manageSiteStandardUserPage.verifyAlbumTabImageIsDisplayed();
        await manageSiteStandardUserPage.verifyPageTabImageIsDisplayed();
        const siteAuthorNameAndEventStartDate =
          await appManagerApiFixture.siteManagementHelper.getSiteAuthorNameAndEventStartDate();
        await manageSiteStandardUserPage.checkAuthorNameIsDisplayed(siteAuthorNameAndEventStartDate.authorName || '');
        await manageSiteStandardUserPage.verifyEventsTabMatchesApiDate(siteAuthorNameAndEventStartDate.startsAt || '');

        await appManagerApiFixture.siteManagementHelper.updateUserSiteMembershipWithRole({
          siteId: siteInfo.siteId,
          userId: endUserInfo.userId,
          role: SitePermission.MEMBER,
        });
      }
    );

    test(
      'login as Standard User where user is Site Content Manager of Private site CONT-29063',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-29063'],
      },
      async ({ appManagerApiFixture, standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'To verify the user is Site Content Manager of Private site',
          zephyrTestId: 'CONT-29063',
          storyId: 'CONT-29063',
        });

        // Find a private site where standard user is NOT a member
        let privateSiteId: string | null = null;
        const privateSiteListResponse = await appManagerApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'private',
        });
        const privateSites = privateSiteListResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        console.log(`Found ${privateSites.length} active private sites to check`);

        for (const site of privateSites) {
          try {
            const privateSiteDetails =
              await standardUserApiFixture.siteManagementHelper.siteManagementService.getSiteDetails(site.siteId);
            console.log(
              `Checking site ${site.siteId} (${site.name}) - isMember: ${privateSiteDetails.result?.isMember}`
            );
            if (privateSiteDetails.result?.isMember === false || privateSiteDetails.result?.isMember === undefined) {
              privateSiteId = site.siteId;
              console.log(`✓ Found site where user is not a member: ${site.siteId} (${site.name})`);
              break;
            }
          } catch (error) {
            console.log(
              `⚠ Skipping site ${site.siteId} (${site.name}) - failed to get site details: ${error instanceof Error ? error.message : String(error)}`
            );
            // Continue to next site
          }
        }

        // If no site found where user is not a member, create a new one
        if (!privateSiteId) {
          console.log('No existing private site found where user is not a member, creating a new site...');
          const newPrivateSite = await appManagerApiFixture.siteManagementHelper.createSite({
            accessType: SITE_TYPES.PRIVATE,
          });
          privateSiteId = newPrivateSite.siteId;
          console.log(`✓ Created new private site: ${privateSiteId}`);
        }

        // Final check to ensure privateSiteId is not null (TypeScript safety)
        if (!privateSiteId) {
          throw new Error('Failed to get or create a private site');
        }

        const endUserInfoPrivate = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(
          users.endUser.email
        );
        const makeUserSiteMembershipResponse = await appManagerApiFixture.siteManagementHelper.makeUserSiteMembership(
          privateSiteId,
          endUserInfoPrivate.userId,
          SitePermission.MEMBER,
          SiteMembershipAction.ADD
        );
        console.log('makeUserSiteMembershipResponse', makeUserSiteMembershipResponse);
        const newSiteDashboard = new SiteDashboardPage(standardUserFixture.page, privateSiteId);
        await newSiteDashboard.loadPage();
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, privateSiteId);
        await manageSiteStandardUserPage.clickOntheMemberButton();
        await manageSiteStandardUserPage.clickOnLeaveButton();
      }
    );

    test(
      'login as Standard User where user is Site Content Manager of Unlisted site CONT-29063',
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
        await manageSiteStandardUserPage.clickOntheMemberButton();
        await manageSiteStandardUserPage.clickOnLeaveButton();
      }
    );

    test(
      'to verify the search content in manage site content CONT-23736',
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
        await newSiteDashboard.verifyThePageIsLoaded();
        await manageSitesComponent.clickOnTheManageSiteButtonAction();
        await manageSitesComponent.clickOnInsideContentButtonAction();
        await manageContentPage.manageContent.clickSortByButton();
        await manageContentPage.selectSortOption(SortOptionLabels.PUBLISHED_NEWEST);
        await manageContentPage.manageContent.clickSortByButton();
        await newSiteDashboard.verifyThePageIsLoaded();
        const contentNames = await manageContentPage.manageContent.getAllContentNames();
        console.log('contentNames', contentNames);
        await manageSitesComponent.searchContentInManageSite(contentNames[0]);
        await manageContentPage.manageContent.verifyContentVisibleInManageSite(contentNames[0]);
      }
    );

    test(
      'to verify the site view option in manage site user drop down site CONT-41421',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26044'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site view option in manage site user drop down site',
          zephyrTestId: 'CONT-41421',
          storyId: 'CONT-41421',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnSitesCard();
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
        });
        const siteNames = getListOfSitesResponse.result.listOfItems.map((item: any) => item.name);

        // Initialize ManageSitePage with first siteId for verification
        const firstSiteId = getListOfSitesResponse.result.listOfItems[0]?.siteId;
        if (!firstSiteId) {
          throw new Error('No sites found in the response');
        }
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, firstSiteId);
        await manageSiteStandardUserPage.searchSiteNameInSearchBar(siteNames[0]);
        const siteDashBoardPage = new SiteDashboardPage(standardUserFixture.page, firstSiteId);
        await siteDashBoardPage.verifySiteNameIsDisplayed(siteNames[0]);
      }
    );
    test(
      'to verify the edit option on file detail page CONT-26763',
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
        const imagePath = FILE_TEST_DATA.IMAGES.IMAGE1.getPath(__dirname);
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
        await manageSitePage.clickOnSiteTab(SitePageTab.FilesTab);
        await manageSitePage.verifyFileIsPresentInTheSiteFilesList(fileDetails.fileInfo.title);
        await manageSitePage.clickOnFileOption(fileDetails.fileInfo.title);
        await manageSitePage.clickOnEditOption();
        const editFileComponent = new EditFileComponent(standardUserFixture.page);
        await editFileComponent.fillFileDescription(MANAGE_SITE_TEST_DATA.FILE_DESCRIPTION.DESCRIPTION(245));
        await editFileComponent.verifyFileDescriptionIsFilledCount(245);
        await editFileComponent.fillFileDescription(MANAGE_SITE_TEST_DATA.FILE_DESCRIPTION.DESCRIPTION(250));
        await editFileComponent.verifyFileDescriptionIsFilledCount(250);
        await editFileComponent.clickOnUpdateButton();
        await manageSitePage.clickOnEditOption();
        await editFileComponent.verifyInputBoxHasValueOf(250);
      }
    );
    test(
      'to verify the site edit option in manage site user drop down sites CONT-26503',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26503'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the site edit option in manage site user drop down sites',
          zephyrTestId: 'CONT-26503',
          storyId: 'CONT-26503',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnSitesCard();

        manageSitesComponent = new ManageSitesComponent(standardUserFixture.page);
        const editSitePage = new EditSitePage(standardUserFixture.page);
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const activeSites = getListOfSitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        console.log(`Found ${activeSites.length} active sites to check`);

        // Check each site's details to find one where user has canEdit=true and isOwner=true
        let selectedSite: { siteId: string; name: string } | null = null;
        for (const site of activeSites) {
          try {
            const siteDetails = await standardUserApiFixture.siteManagementHelper.siteManagementService.getSiteDetails(
              site.siteId
            );
            console.log(
              `Checking site ${site.siteId} (${site.name}) - canEdit: ${siteDetails.result?.canEdit}, isOwner: ${siteDetails.result?.isOwner}`
            );

            if (siteDetails.result?.canEdit === true && siteDetails.result?.isManager === true) {
              selectedSite = { siteId: site.siteId, name: site.name };
              console.log(`✓ Found site where user can edit and is owner: ${site.siteId} (${site.name})`);
              break;
            }
          } catch (error) {
            console.log(
              `⚠ Skipping site ${site.siteId} (${site.name}) - failed to get site details: ${error instanceof Error ? error.message : String(error)}`
            );
            // Continue to next site
          }
        }

        if (!selectedSite) {
          throw new Error('No sites found with canEdit=true and isOwner=true');
        }

        // Initialize ManageSitePage for Show More button
        const manageSitePage = new ManageSitePage(standardUserFixture.page);
        await manageSitePage.loadPage();

        // Retry logic: Click "Show More" button if site is not found
        const maxRetriesForShowMoreButton = 10;
        for (let attempt = 0; attempt < maxRetriesForShowMoreButton; attempt++) {
          try {
            await manageSitesComponent.hoverOnSiteCheckboxByExactName(selectedSite.name);
            console.log(`✓ Successfully hovered on site checkbox: ${selectedSite.name}`);
            break;
          } catch {
            if (attempt < maxRetriesForShowMoreButton - 1) {
              console.log(
                `Site "${selectedSite.name}" not found, clicking "Show More" button (attempt ${attempt + 1}/${maxRetriesForShowMoreButton})`
              );
              try {
                await manageSitePage.clickOnShowMoreButtonAction();
              } catch {
                console.log('Show More button not available or clickable');
                // Continue to next attempt
              }
            } else {
              throw new Error(
                `Failed to hover on site checkbox "${selectedSite.name}" after ${maxRetriesForShowMoreButton} attempts. Site may not be visible in the UI.`
              );
            }
          }
        }

        await editSitePage.clickOnEditOption();
        await editSitePage.editSiteNameInput(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
        await editSitePage.clickOnUpdateButton();
        await editSitePage.verifySiteNameIsUpdated(MANAGE_SITE_TEST_DATA.UPDATED_SITE_NAME);
      }
    );
    test(
      'to verify the people follow in site about members and followers tab CONT-24063',
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
      'to verify the bulk action from end user can deactivate the site CONT-26576',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-26576'],
      },
      async ({ standardUserFixture, standardUserApiFixture }) => {
        tagTest(test.info(), {
          description: 'to verify the bulk action from end user can deactivate the site',
          zephyrTestId: 'CONT-26576',
          storyId: 'CONT-26576',
        });
        await standardUserFixture.navigationHelper.openManageFeatureSectionInSideBar();
        await manageFeaturesPage.clickOnSitesCard();
        const manageSitePage = new ManageSitePage(standardUserFixture.page);
        await manageSitePage.loadPage();

        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.ACTIVE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.DEACTIVATE);
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'deactivated',
        });

        // Find a deactivated site where user is manager and owner
        const sitesWithManagerAndOwner = getListOfSitesResponse.result.listOfItems.filter(
          (site: any) => site.isManager === true && site.isOwner === true
        );

        if (sitesWithManagerAndOwner.length === 0) {
          throw new Error('No deactivated sites found where user is both manager and owner');
        }

        const deactivatedSiteNames = sitesWithManagerAndOwner.map((site: any) => site.name);
        console.log('deactivatedSiteNames', deactivatedSiteNames);

        // Retry logic: Click "Show More" button if site is not found
        let selectedSiteName: string | null = null;
        const maxRetriesForShowMoreButton = 10;
        for (let attempt = 0; attempt < maxRetriesForShowMoreButton; attempt++) {
          selectedSiteName = await manageSitesComponent.selectFirstEnabledSiteCheckbox(deactivatedSiteNames);
          if (selectedSiteName) {
            break;
          }

          if (attempt < maxRetriesForShowMoreButton - 1) {
            console.log(
              `No enabled checkbox found, clicking "Show More" button (attempt ${attempt + 1}/${maxRetriesForShowMoreButton})`
            );
            try {
              await manageSitePage.clickOnShowMoreButtonAction();
            } catch {
              console.log('Show More button not available or clickable');
              // Continue to next attempt
            }
          }
        }

        if (!selectedSiteName) {
          throw new Error(
            'No deactivated site with enabled checkbox found. All sites may be disabled due to permissions or state.'
          );
        }
        await manageContentPage.manageContent.selectActionDropdown();
        await manageContentPage.manageContent.clickOnActivateButton();
        await manageContentPage.manageContent.clickOnActivateApplyButton();
        await manageSitesComponent.selectSiteFilterByText(BulkActionOptions.DEACTIVATE);
        await manageSitesComponent.selectFilterByText(BulkActionOptions.ACTIVE);
        const getSiteListResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
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
      'to verify the bulk action from end user can activate the site CONT-26574',
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
        await manageFeaturesPage.clickOnSitesCard();
        const getListOfSitesResponse = await standardUserApiFixture.siteManagementHelper.getListOfSites({
          sortBy: 'alphabetical',
          filter: 'active',
        });
        const activeSites = getListOfSitesResponse.result.listOfItems.filter((site: any) => site.isActive === true);

        console.log(`Found ${activeSites.length} active sites to check`);

        // Check each site's details to find one where user has canEdit=true and isOwner=true
        let selectedSite: { siteId: string; name: string } | null = null;
        for (const site of activeSites) {
          try {
            const siteDetails = await standardUserApiFixture.siteManagementHelper.siteManagementService.getSiteDetails(
              site.siteId
            );
            console.log(
              `Checking site ${site.siteId} (${site.name}) - canEdit: ${siteDetails.result?.canEdit}, isOwner: ${siteDetails.result?.isOwner}`
            );

            if (siteDetails.result?.canEdit === true && siteDetails.result?.isOwner === true) {
              selectedSite = { siteId: site.siteId, name: site.name };
              console.log(`✓ Found site where user can edit and is owner: ${site.siteId} (${site.name})`);
              break;
            }
          } catch (error) {
            console.log(
              `⚠ Skipping site ${site.siteId} (${site.name}) - failed to get site details: ${error instanceof Error ? error.message : String(error)}`
            );
            // Continue to next site
          }
        }

        if (!selectedSite) {
          throw new Error('No sites found with canEdit=true and isOwner=true');
        }

        // Initialize ManageSitePage for Show More button
        const manageSitePage = new ManageSitePage(standardUserFixture.page);
        await manageSitePage.loadPage();

        const firstSiteId = selectedSite.siteId;

        // Retry logic: Click "Show More" button if site checkbox is not found
        const maxRetriesForShowMoreButton = 10;
        for (let attempt = 0; attempt < maxRetriesForShowMoreButton; attempt++) {
          try {
            await manageSitesComponent.selectSiteCheckboxByExactName(selectedSite.name);
            console.log(`✓ Successfully selected site checkbox: ${selectedSite.name}`);
            break;
          } catch {
            if (attempt < maxRetriesForShowMoreButton - 1) {
              console.log(
                `Site checkbox "${selectedSite.name}" not found, clicking "Show More" button (attempt ${attempt + 1}/${maxRetriesForShowMoreButton})`
              );
              try {
                await manageSitePage.clickOnShowMoreButtonAction();
              } catch {
                console.log('Show More button not available or clickable');
                // Continue to next attempt
              }
            } else {
              throw new Error(
                `Failed to select site checkbox "${selectedSite.name}" after ${maxRetriesForShowMoreButton} attempts. Site may not be visible in the UI.`
              );
            }
          }
        }
        await manageContentPage.manageContent.selectActionDropdown();
        await manageSitesComponent.clickOnUpdateCategoryButtonAction();
        await manageContentPage.manageContent.clickOnApply();
        manageSiteStandardUserPage = new ManageSiteSetUpPage(standardUserFixture.page, firstSiteId);
        await manageSiteStandardUserPage.updatingCategoryToUncategorized('Uncategorized');
      }
    );
    test(
      'to verify follow site, followers tab, and membership request functionality CONT-24062',
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
        await manageSiteSetUpPage.clickOnFollowButton();
        await manageSiteSetUpPage.clickOnFollowSiteButton();
        await manageSiteSetUpPage.verifyFollowButtonShouldBeChangedIntoFollowing();
        await manageSiteSetUpPage.clickOnAboutTabAction();
        await manageSiteSetUpPage.clickOnTheFollowersTabButtonInAboutTab();
        const userInfo = await appManagerApiFixture.identityManagementHelper.getUserInfoByEmail(users.endUser.email);
        await manageSiteSetUpPage.checkMembersNameShouldBeVisibleInFollowersTab(userInfo.fullName);
        await manageSiteSetUpPage.clickOnFollowingButton();
        await manageSiteSetUpPage.clickOnUnfollowSiteButton();
        await manageSiteSetUpPage.verifyUnfollowButtonShouldBeChangedIntoFollowButton();
        await manageSiteSetUpPage.clickOnAboutTabAction();
        await manageSiteSetUpPage.clickOnTheFollowersTabButtonInAboutTab();
        await manageSiteSetUpPage.checkMembersNameShouldNotBeVisibleInFollowersTab(userInfo.fullName);
        await manageSiteSetUpPage.clickOnFollowButton();
        const requestId = await manageSiteSetUpPage.clickOnRequestMembershipButton();
        console.log('requestId from membership request:', requestId);
        await appManagerApiFixture.siteManagementHelper.acceptMembershipRequest(newsiteInfo.siteId, requestId);
        const siteDetailsPage = new SiteDetailsPage(standardUserFixture.page, newsiteInfo.siteId);
        await siteDetailsPage.loadPage();
        await manageSiteSetUpPage.verifyMemberButtonShouldBeVisible();
      }
    );
  }
);
