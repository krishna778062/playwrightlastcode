import { contentTestFixture as test } from '@/src/modules/content/fixtures/contentFixture';
import { tagTest } from '@core/utils/testDecorator';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { ContentTestSuite } from '@/src/modules/content/constants/testSuite';
import { CONTENT_TEST_DATA } from '@/src/modules/content/test-data/content.test-data';
import { PageCreationAssertions } from '@/src/modules/content/helpers/pageCreationAssertions';
import { HomePage } from '@/src/core/pages/newUx/homePage';
import { PageCreationActions } from '@/src/modules/content/helpers/pageCreationActions';
import { ContentType } from '@/src/modules/content/constants/contentType';
import { PageCreationPage } from '@/src/modules/content/pages/pageCreationPage';

test.describe(
  '@PageCreation',
  {
    tag: [ContentTestSuite.PAGE_CREATION, ContentTestSuite.COVER_IMAGE],
  },
  () => {
    let pageCreationPage: PageCreationPage;
    test.beforeEach(async ({ adminPage }) => {
        // Initialize the content creation page
        const homePage = new HomePage(adminPage);
        pageCreationPage = await homePage.actions.openCreateContentPageForContentType(ContentType.PAGE) as PageCreationPage;
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