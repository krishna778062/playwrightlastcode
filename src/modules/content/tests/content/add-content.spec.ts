import { ContentTestSuite } from '@content/constants/testSuite';
import { contentTestFixture as test, users } from '@content/fixtures/contentFixture';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { Roles } from '@/src/core/constants/roles';
import { TestDataGenerator } from '@/src/core/utils/testDataGenerator';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageContentType } from '@/src/modules/content/constants/pageContentType';
import { ContentPreviewPage } from '@/src/modules/content/pages/contentPreviewPage';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { SiteType } from '@/src/modules/content-abac/constants/siteType';

// Test data for user-driven tests
const testCases = [
  {
    testName: 'Verify the Unlisted Sites Manager is able to add content from home dashboard on any unlisted site',
    userType: 'endUser',
    role: Roles.UNLISTED_SITES_MANAGER,
    testId: 'CONT-30521',
    description: 'Verify Unlisted site manager Add content scenarios',
  },
  {
    testName: 'Verify the Application Manager is able to add content from home dashboard on any unlisted site',
    userType: 'appManager',
    role: Roles.APPLICATION_MANAGER,
    testId: 'CONT-39680',
    description: 'Verify Application Manager Add content scenarios',
  },
];

// Generate user-driven test cases
for (const testCase of testCases) {
  test.describe(
    `@AddContent - ${testCase.testName}`,
    {
      tag: [ContentTestSuite.ADD_CONTENT_ON_UNLISTED_SITE],
    },
    () => {
      let pageCreationPage: PageCreationPage;
      let contentPreviewPage: ContentPreviewPage;
      let siteIdToPublishPage: string;
      let publishedPageId: string;
      let manualCleanupNeeded = false;

      test.beforeEach('Setup test environment', async ({ appManagerHomePage }) => {
        // Navigate to home page
        await appManagerHomePage.verifyThePageIsLoaded();
      });

      test(
        testCase.testName,
        {
          tag: [TestPriority.P0, TestGroupType.SMOKE, `@${testCase.testId}`],
        },
        async ({ appManagerHomePage, identityManagementHelper, siteManagementHelper }) => {
          tagTest(test.info(), {
            description: testCase.description,
            zephyrTestId: testCase.testId,
            storyId: testCase.testId,
          });

          let userId: string = '';
          let roleId: string = '';
          if (testCase.userType === 'endUser') {
            // Get user info based on user type
            const userEmail = users[testCase.userType as keyof typeof users].email;
            const peopleInfo = await identityManagementHelper.getUserInfoByEmail(userEmail);
            userId = peopleInfo.userId;

            // Get and assign role
            roleId = await identityManagementHelper.getListOfRoles(testCase.role);
            await identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], true);
          }

          const siteDetails = await siteManagementHelper.getSiteByAccessType(SiteType.UNLISTED, { hasPages: true });
          const siteId = siteDetails.siteId;
          const siteName = siteDetails.name;

          pageCreationPage = (await appManagerHomePage.actions.openCreateContentPageForContentType(
            ContentType.PAGE,
            siteName
          )) as PageCreationPage;

          // Generate page data using TestDataGenerator
          const pageCreationOptions = TestDataGenerator.generatePage(
            PageContentType.NEWS,
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName
          );

          // Use the new wrapper method to create and publish the page
          const { pageId } = await pageCreationPage.actions.createAndPublishPage(pageCreationOptions);

          // Store IDs for cleanup
          publishedPageId = pageId;
          siteIdToPublishPage = siteId;
          manualCleanupNeeded = true;

          // Initialize preview page and handle the promotion
          contentPreviewPage = new ContentPreviewPage(
            appManagerHomePage.page,
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

          if (testCase.userType === 'endUser') {
            // Cleanup: Remove the assigned role
            await identityManagementHelper.updateUserWithAdditionalRoles(userId, [roleId], false);
          }
        }
      );
    }
  );
}
