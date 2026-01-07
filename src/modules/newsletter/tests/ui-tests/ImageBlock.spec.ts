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
  test(
    'Upload Image to newsletter',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Add an image block with link to a newsletter',
      });

      const newsletterName = `Image_Block_Newsletter_${Date.now()}`;

      const newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
      const selectTemplateModal = new SelectTemplateModal(appManagerPage);
      const imageBlockComponent = new ImageBlockComponent(appManagerPage);

      await newsletterEditorPage.loadPage();
      await newsletterEditorPage.clickCreateButton();
      await newsletterEditorPage.enterNewsletterName(newsletterName);

      await newsletterEditorPage.clickNextButtonOnNameModal();
      await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
      await selectTemplateModal.clickNextButton();
      await newsletterEditorPage.verifyEditorIsLoaded();
      await imageBlockComponent.addImageBlockWithLink(IMAGE_LINK_URL);

      await imageBlockComponent.clickCloseButton();
    }
  );

  test(
    'Add image block with alt text',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P2, TestGroupType.REGRESSION],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Add an image block with alt text to a newsletter',
      });

      const newsletterName = `Image_AltText_Newsletter_${Date.now()}`;
      const altText = 'Test image alt text';

      const newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
      const selectTemplateModal = new SelectTemplateModal(appManagerPage);
      const imageBlockComponent = new ImageBlockComponent(appManagerPage);

      await newsletterEditorPage.loadPage();
      await newsletterEditorPage.clickCreateButton();
      await newsletterEditorPage.enterNewsletterName(newsletterName);

      await newsletterEditorPage.clickNextButtonOnNameModal();
      await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
      await selectTemplateModal.clickNextButton();
      await newsletterEditorPage.verifyEditorIsLoaded();
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
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify image search and filter functionality in newsletter editor',
      });

      const newsletterName = `Verify_Image_Filters_Search_${Date.now()}`;

      const newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
      const selectTemplateModal = new SelectTemplateModal(appManagerPage);
      const imageBlockComponent = new ImageBlockComponent(appManagerPage);

      await newsletterEditorPage.loadPage();
      await newsletterEditorPage.clickCreateButton();
      await newsletterEditorPage.enterNewsletterName(newsletterName);
      await newsletterEditorPage.clickNextButtonOnNameModal();
      await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
      await selectTemplateModal.clickNextButton();
      await newsletterEditorPage.verifyEditorIsLoaded();
      await imageBlockComponent.searchAndSelectImage('Google');
    }
  );
});
