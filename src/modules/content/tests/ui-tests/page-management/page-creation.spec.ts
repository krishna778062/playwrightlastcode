import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { ContentCreationPage } from '@/src/modules/content/pages/contentCreationPage';
import { ContentCreationAssertions } from '../../../helpers/contentAssertionHelper';
import { HomePage } from '@/src/core/pages/homePage';
import { AddSiteContentComponents } from '../../../components/addSiteContentComponents';

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
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        // Initialize the content creation page
        const contentCreationPage = new ContentCreationPage(adminPage);
        const contentCreationAssertions = new ContentCreationAssertions(contentCreationPage);
        const homePage = new HomePage(adminPage);
        const addSiteContentComponents = new AddSiteContentComponents(contentCreationPage);
        
        // Verify the page is loaded (admin is already logged in via fixture)
        await contentCreationPage.verifyThePageIsLoaded();

        // Execute the scenario steps as described
        // Admin is already logged in via the fixture
        console.log('✅ Admin user is already logged in via fixture');

        await homePage.clickCreateSection();

        await addSiteContentComponents.clickPageOption();

        await addSiteContentComponents.selectRecentlyUsedSite();

        await addSiteContentComponents.clickAddButton();

        await contentCreationPage.actions.uploadCoverImage(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          {
            enableWidescreenCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForWidescreen,
            enableSquareCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForSquare,
          }
        );

        await contentCreationAssertions.verifyUploadedFileIsVisible({
          timeout: CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
        });
      }
    );
  }
); 