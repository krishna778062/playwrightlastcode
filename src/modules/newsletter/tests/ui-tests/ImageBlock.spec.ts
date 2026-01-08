import { ImageBlockComponent } from '@newsletter/components/imageBlock.component';
import { SelectTemplateModal } from '@newsletter/components/selectTemplateModal.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { NewsletterEditorPage } from '@newsletter/pages/NewsletterEditorPage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

// Test data
const IMAGE_LINK_URL = 'https://www.simpplr.com';
const TEMPLATE_NAME = 'Blank template';

test.describe('Newsletter Image Block', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  let newsletterEditorPage: NewsletterEditorPage;
  let selectTemplateModal: SelectTemplateModal;
  let imageBlockComponent: ImageBlockComponent;

  test.beforeEach(async ({ appManagerPage }) => {
    // Initialize components for all tests
    newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
    selectTemplateModal = new SelectTemplateModal(appManagerPage);
    imageBlockComponent = new ImageBlockComponent(appManagerPage);

    // Create a newsletter for each test (each test needs a fresh newsletter)
    const newsletterName = `Image_Block_Test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await newsletterEditorPage.loadPage();
    await newsletterEditorPage.clickCreateButton();
    await newsletterEditorPage.enterNewsletterName(newsletterName);
    await newsletterEditorPage.clickNextButtonOnNameModal();
    await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
    await selectTemplateModal.clickNextButton();
    await newsletterEditorPage.verifyEditorIsLoaded();
  });

  test(
    'Upload Image to newsletter',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add an image block with link to a newsletter',
        zephyrTestId: 'NLP-4870',
        storyId: 'NL-1',
      });

      await imageBlockComponent.addImageBlockWithLink(IMAGE_LINK_URL);
      await imageBlockComponent.clickCloseButton();
    }
  );

  test(
    'Add image block with alt text',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P2, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add an image block with alt text to a newsletter',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const altText = 'Test image alt text';
      await imageBlockComponent.addImageBlockWithLink(IMAGE_LINK_URL);
      await imageBlockComponent.addAltTextToImage(altText);
      await imageBlockComponent.clickCloseButton();
    }
  );

  test(
    'Verify if all filters/search under added block for adding image are working',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify image search and filter functionality in newsletter editor',
        zephyrTestId: 'NLP-5736',
        storyId: 'NL-1',
      });

      await imageBlockComponent.searchAndSelectImage('Google');
    }
  );
});
