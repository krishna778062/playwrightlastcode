import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { Roles } from '@/src/core/constants/roles';
import { FileUtil } from '@/src/core/utils/fileUtil';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { SITE_TYPES } from '@/src/modules/content/constants/siteTypes';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { AddContentModalComponent } from '@/src/modules/content/ui/components/addContentModal';
import { ContentPreviewPage } from '@/src/modules/content/ui/pages/contentPreviewPage';
import { PageCreationPage } from '@/src/modules/content/ui/pages/pageCreationPage';

test.describe(
  '@AddContent - Add content on unlisted site',
  {
    tag: [ContentTestSuite.ADD_CONTENT_ON_UNLISTED_SITE],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    let contentPreviewPage: ContentPreviewPage;
    let siteIdToPublishPage: string;
    let publishedPageId: string;
    let manualCleanupNeeded = false;
    let addContentModal: AddContentModalComponent;
    let userId: string = '';
    let roleId: string = '';

    test.afterEach('Cleanup after test', async ({ appManagerFixture }) => {
      // Cleanup: Remove the assigned role (runs even if test fails)
      if (typeof userId !== 'undefined' && typeof roleId !== 'undefined') {
        try {
          await appManagerFixture.identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], false);
          console.log('Successfully removed assigned role during cleanup');
        } catch (error) {
          console.warn('Failed to remove assigned role during cleanup:', error);
        }
      }
    });

    test.only(
      'Verify the Unlisted Sites Manager is able to add content from home dashboard on any unlisted site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-30521'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Unlisted site manager Add content scenarios',
          zephyrTestId: 'CONT-30521',
          storyId: 'CONT-30521',
        });

        // Login with standard user and assign Unlisted Sites Manager role
        const userEmail = users.endUser.email;
        const peopleInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(userEmail);
        userId = peopleInfo.userId;

        // Get and assign Unlisted Sites Manager role
        roleId = await appManagerFixture.identityManagementHelper.getListOfRoles(Roles.UNLISTED_SITES_MANAGER);
        await appManagerFixture.identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], true);

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          waitForSearchIndex: true,
          hasPages: true,
        });
        const siteId = siteDetails.siteId;
        const siteName = siteDetails.name;
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        pageCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          siteName
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );

    test(
      'Verify the Application Manager is able to add content from home dashboard on any unlisted site',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39680'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify Application Manager Add content scenarios',
          zephyrTestId: 'CONT-39680',
          storyId: 'CONT-39680',
        });

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          hasPages: true,
        });
        const siteId = siteDetails.siteId;
        const siteName = siteDetails.name;
        console.log('siteName :   ', siteName);
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          siteName
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );
    // Additional test for disabled content submission
    test(
      'Verify the App Manager be able to add content from home dashboard on any unlisted site when Content submission is disabled at site level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39774'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the app Manager can add content when content submission is disabled at site level',
          zephyrTestId: 'CONT-39774',
          storyId: 'CONT-39774',
        });

        // Create site with content submission disabled
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByIdWithContentSubmissions(
          SITE_TYPES.UNLISTED,
          false
        );
        const siteId = siteDetails.siteId;
        const siteName = siteDetails.siteName;
        await appManagerFixture.homePage.verifyThePageIsLoaded();
        pageCreationPage = (await appManagerFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          siteName
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        contentPreviewPage = new ContentPreviewPage(
          appManagerFixture.page,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );
    // Additional test for disabled content submission
    test(
      'Verify the unlisted site Manager be able to add content from home dashboard on any unlisted site when Content submission is disabled at site level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39775'],
      },
      async ({ appManagerFixture, standardUserFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the app Manager can add content when content submission is disabled at site level',
          zephyrTestId: 'CONT-39775',
          storyId: 'CONT-39775',
        });

        // Login with standard user and assign Unlisted Sites Manager role
        const userEmail = users.endUser.email;
        const peopleInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(userEmail);
        userId = peopleInfo.userId;

        // Get and assign Unlisted Sites Manager role
        roleId = await appManagerFixture.identityManagementHelper.getListOfRoles(Roles.UNLISTED_SITES_MANAGER);
        await appManagerFixture.identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], true);

        // Create site with content submission disabled

        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByIdWithContentSubmissions(
          SITE_TYPES.UNLISTED,
          false
        );

        const siteId = siteDetails.siteId;
        const siteName = siteDetails.siteName;

        await standardUserFixture.homePage.verifyThePageIsLoaded();
        pageCreationPage = (await standardUserFixture.navigationHelper.openCreateContentPageForContentType(
          ContentType.PAGE,
          siteName
        )) as PageCreationPage;

        // Generate page data using TestDataGenerator
        const imagePath = FileUtil.getFilePath(
          __dirname,
          '..',
          '..',
          '..',
          'test-data',
          'static-files',
          'images',
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
        );
        const pageCreationOptions = TestDataGenerator.generatePage(PageContentType.NEWS, imagePath);

        // Use the new wrapper method to create and publish the page
        const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

        // Store IDs for cleanup
        publishedPageId = pageId;
        siteIdToPublishPage = siteId;
        manualCleanupNeeded = true;

        // Initialize preview page and handle the promotion
        contentPreviewPage = new ContentPreviewPage(
          standardUserFixture.page,
          siteIdToPublishPage,
          publishedPageId,
          ContentType.PAGE
        );
        await contentPreviewPage.actions.handlePromotionPageStep();

        // Verify content was published successfully via UI
        await contentPreviewPage.assertions.verifyContentPublishedSuccessfully(
          pageCreationOptions.title,
          "Created page successfully - it's published"
        );
      }
    );

    // Additional test for disabled content submission
    test(
      'Verify the App Manager not able to add content from home dashboard on any unlisted site when specific Content type is disabled at site level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39777'],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the app Manager can add content when content submission is disabled at site level',
          zephyrTestId: 'CONT-39777',
          storyId: 'CONT-39777',
        });

        // Create site with content submission disabled
        const siteDetails = await appManagerFixture.siteManagementHelper.getSiteByAccessType(SITE_TYPES.UNLISTED, {
          hasPages: false,
          waitForSearchIndex: true,
        });
        const siteName = siteDetails.name;

        await appManagerFixture.homePage.verifyThePageIsLoaded();
        addContentModal = await appManagerFixture.navigationHelper.openAddContentModal(ContentType.PAGE);

        await addContentModal.selectSiteToAddContentFromDropdown(siteName);

        await addContentModal.verifyErrorMessageWhenContentSubmissionIsDisabled(ContentType.PAGE);
      }
    );
    // Additional test for disabled content submission
    test(
      'Verify the unlisted site Manager not able to add content from home dashboard on any unlisted site when Content submission is disabled at site level',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, '@CONT-39780'],
      },
      async ({ standardUserFixture, appManagerFixture }) => {
        tagTest(test.info(), {
          description: 'Verify the app Manager can add content when content submission is disabled at site level',
          zephyrTestId: 'CONT-39780',
          storyId: 'CONT-39780',
        });

        // Login with standard user and assign Unlisted Sites Manager role
        const userEmail = users.endUser.email;
        const peopleInfo = await appManagerFixture.identityManagementHelper.getUserInfoByEmail(userEmail);
        userId = peopleInfo.userId;

        // Get and assign Unlisted Sites Manager role
        roleId = await appManagerFixture.identityManagementHelper.getListOfRoles(Roles.UNLISTED_SITES_MANAGER);
        await appManagerFixture.identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], true);

        // Create site with content submission disabled
        await appManagerFixture.siteManagementHelper.createUnlistedSite({
          hasPages: false,
          waitForSearchIndex: true,
        });
        await appManagerFixture.siteManagementHelper.getSiteByIdWithContentSubmissions(SITE_TYPES.UNLISTED, false);
        await standardUserFixture.homePage.verifyThePageIsLoaded();
        addContentModal = await standardUserFixture.navigationHelper.openAddContentModal(ContentType.PAGE);
        await standardUserFixture.navigationHelper.verifyErrorMessageWhenContentSubmissionIsDisabled(
          addContentModal,
          ContentType.PAGE
        );
        await appManagerFixture.identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], false);
      }
    );
  }
);
