import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { ContentCreationPage } from '@/src/modules/content/pages/contentCreationPage';

test.describe(
  'Page Creation with Cover Image Upload',
  {
    tag: [ContentTestSuite.PAGE_CREATION, ContentTestSuite.COVER_IMAGE],
  },
  () => {
    test(
      'Verify admin can create page content with cover image upload using Select from computer option',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ adminPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          description: 'Test cover image upload functionality during page creation',
        });

        // Initialize the content creation page
        const contentCreationPage = new ContentCreationPage(adminPage);
        
        // Verify the page is loaded (admin is already logged in via fixture)
        await contentCreationPage.verifyThePageIsLoaded();

        // Execute the scenario steps as described
        await test.step('Given Login as Admin', async () => {
          // Admin is already logged in via the fixture
          console.log('✅ Admin user is already logged in via fixture');
        });

        await test.step('And Click on Create section', async () => {
          await contentCreationPage.actions.clickCreateSection({
            stepInfo: 'Click on Create section',
          });
        });

        await test.step('And Click on Page text', async () => {
          await contentCreationPage.actions.clickPageOption({
            stepInfo: 'Click on Page text option',
          });
        });

        await test.step('And Click on recently used site to create content on home page', async () => {
          await contentCreationPage.actions.selectRecentlyUsedSite({
            stepInfo: 'Select recently used site for content creation',
          });
        });

        await test.step('And Click on Add', async () => {
          await contentCreationPage.actions.clickAddButton({
            stepInfo: 'Click on Add button to proceed',
          });
        });

        await test.step('And Add cover image "300x300 RATIO_Text.png" via Select from computer and add background for Widescreen and Square crop', async () => {
          await contentCreationPage.actions.uploadCoverImage(
            CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
            {
              stepInfo: 'Upload cover image with widescreen and square crop settings',
              enableWidescreenCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForWidescreen,
              enableSquareCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForSquare,
            }
          );
        });

        await test.step('Then Verify that user should be able to upload any file properly', async () => {
          await contentCreationPage.assertions.verifyFileUploadSuccessful({
            stepInfo: 'Verify cover image upload was successful',
            timeout: CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
          });
        });
      }
    );
  }
); 