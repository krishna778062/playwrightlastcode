import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { PageCreationAssertions } from '@/src/modules/content/helpers/pageCreationAssertions';
import { HomePage } from '@/src/core/pages/newUx/homePage';
import { PageCreationActions } from '@/src/modules/content/helpers/pageCreationActions';
import { CreateComponent } from '@content/components/createComponent';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { AddContentModalComponent } from '@content/components/addContentModal';

test.describe(
  '@PageCreation',
  {
    tag: [ContentTestSuite.PAGE_CREATION, ContentTestSuite.COVER_IMAGE],
  },
  () => {
    let addContentModal: AddContentModalComponent;
    test.beforeEach(async ({ adminPage }) => {
        // Initialize the content creation page
        const homePage = new HomePage(adminPage);
        const createComponent = await homePage.actions.clickOnContentCreateButton();
        if(createComponent instanceof CreateComponent) {
          addContentModal = await createComponent.selectContentTypeAndCreateContent(ContentType.PAGE);
        } else {
          addContentModal = createComponent;
        }
      });

    test(
      'Verify admin can create a new page with cover image without cropping it',
      {
        tag: [TestPriority.P0, TestGroupType.SMOKE, "@cover-image"],
      },
      async () => {
        tagTest(test.info(), {
          description: 'Test cover image upload functionality during page creation',
          zephyrTestId: 'CONT-11635',
          storyId: 'CONT-11635',
        });

        //use add content modal to say that i want to create a page using recently used site
        const pageCreationPage = await addContentModal.completeContentCreationForm(ContentType.PAGE, {
          recentlyUsedSiteIndex: 0,
        });

        const pageCreationActions = pageCreationPage.actions as PageCreationActions;
        const pageCreationAssertions = pageCreationPage.assertions as PageCreationAssertions;

        await pageCreationActions.uploadCoverImage(
          CONTENT_TEST_DATA.COVER_IMAGES.RATIO_300x300.fileName,
        );

        await pageCreationAssertions.verifyUploadedCoverImagePreviewIsVisible({
          timeout: CONTENT_TEST_DATA.TIMEOUTS.UPLOAD,
        });
      }
    );
  }
); 