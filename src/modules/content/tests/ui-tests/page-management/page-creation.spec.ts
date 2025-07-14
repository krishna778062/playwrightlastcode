import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { ContentCreationAssertions } from '../../../helpers/contentAssertionHelper';
import { HomePage } from '@/src/core/pages/homePage';
import { PageCreationActions } from '../../../helpers/contentCreationPageActions';
import { CreateComponent } from '../../../components/createComponent';

test.describe(
  '@PageCreation',
  {
    tag: [ContentTestSuite.PAGE_CREATION, ContentTestSuite.COVER_IMAGE],
  },
  () => {

    test(
      'Verify admin can create a new page with cover image',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, "@cover-image"],
      },
      async ({ adminPage, appManagerApiClient }) => {
        tagTest(test.info(), {
          description: 'Test cover image upload functionality during page creation',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        // Initialize the content creation page
        const homePage = new HomePage(adminPage);
        await homePage.actions.clickOnCreateButton();
        const createComponent = new CreateComponent(adminPage);
        const addContentModal = await createComponent.selectContentTypeAndCreateContent("Page");

        //use add conent modal to say that i want to create a page using recently used site
        const pageCreationPage = await addContentModal.completeContentCreationForm("Page", {
          recentlyUsedSiteIndex: 0,
        });

        const pageCreationActions = pageCreationPage.actions as PageCreationActions;
        const pageCreationAssertions = pageCreationPage.assertions as ContentCreationAssertions;

        await pageCreationActions.uploadCoverImage(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
          {
            enableWidescreenCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForWidescreen,
            enableSquareCrop: CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.cropForSquare,
          }
        );

        await pageCreationAssertions.verifyUploadedFileIsVisible({
          timeout: CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
        });
      }
    );
  }
); 