import { SelectTemplateModal } from '@newsletter/components/selectTemplateModal.component';
import { SurveyBlockComponent } from '@newsletter/components/surveyBlock.component';
import { NEWSLETTER_FEATURE_TAGS, NEWSLETTER_SUITE_TAGS } from '@newsletter/constants/testTags';
import { newsletterFixture as test } from '@newsletter/fixtures/newsletterFixture';
import { SurveyBlockModal } from '@newsletter/Modals/surveyBlockModal';
import { NewsletterEditorPage } from '@newsletter/pages/NewsletterEditorPage.page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

// Test data
const TEMPLATE_NAME = 'Blank template';

test.describe('Newsletter Survey Block', { tag: [NEWSLETTER_SUITE_TAGS.NEWSLETTER] }, () => {
  let newsletterEditorPage: NewsletterEditorPage;
  let selectTemplateModal: SelectTemplateModal;
  let surveyBlockComponent: SurveyBlockComponent;
  let surveyBlockModal: SurveyBlockModal;

  test.beforeEach(async ({ appManagerPage }) => {
    // Initialize components for all tests
    newsletterEditorPage = new NewsletterEditorPage(appManagerPage);
    selectTemplateModal = new SelectTemplateModal(appManagerPage);
    surveyBlockComponent = new SurveyBlockComponent(appManagerPage);
    surveyBlockModal = new SurveyBlockModal(appManagerPage);

    // Create a newsletter for each test (each test needs a fresh newsletter)
    const newsletterName = `Survey_Block_Test_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await newsletterEditorPage.loadPage();
    await newsletterEditorPage.verifyThePageIsLoaded();
    await newsletterEditorPage.clickCreateButton();
    await newsletterEditorPage.enterNewsletterName(newsletterName);
    await newsletterEditorPage.clickNextButtonOnNameModal();
    await selectTemplateModal.selectTemplateByName(TEMPLATE_NAME);
    await selectTemplateModal.clickNextButton();
    await newsletterEditorPage.verifyEditorIsLoaded();
  });

  test(
    'Validate survey block should be visible',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Validate survey block should be visible',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockComponent.assertSurveysBlockAddedSuccussfully();
      await surveyBlockComponent.searchSurvey();
    }
  );

  test(
    'Newsletter creator can browse and select surveys using a modal with search and filter options',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Newsletter creator can browse and select surveys using a modal with search and filter options',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'Employee engagement';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
    }
  );

  test(
    'Remove added survey block from the smart block',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Remove added survey block from the smart block',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'All-purpose';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
      await surveyBlockModal.removeSurveyBlock();
    }
  );

  test(
    'Preview survey block and validation survey data',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Preview survey block and validate survey data',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'All-purpose';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
      //await newsletterEditorPage.clickPreviewButton();
      await surveyBlockModal.previewSurveyBlock();
    }
  );

  test(
    'Add Survey block sidebar options',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Add Survey block sidebar options',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockComponent.clickToBrowseSurvyeFromSideBar();
      await surveyBlockModal.selectMultipleSurvey();
    }
  );

  test(
    'Survey block is rendered properly in newsletter preview in mobile view',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Survey block is rendered properly in newsletter preview in mobile view',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'All-purpose';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
      await newsletterEditorPage.clickPreviewButton();
      await surveyBlockComponent.previewMobileView();
      await surveyBlockModal.previewSurveyBlock();
    }
  );

  test(
    'Verify survey block data',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify survey block data',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'All-purpose';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
      await surveyBlockModal.assertAllDataOfSurvey();
    }
  );

  test(
    'Survey listing upon performing search in survey block sidebar option is based upon survey type and various other criteria',
    {
      tag: [NEWSLETTER_FEATURE_TAGS.NEWSLETTER_HOME_PAGE, TestPriority.P1, TestGroupType.REGRESSION],
    },
    async () => {
      tagTest(test.info(), {
        description:
          'Survey listing upon performing search in survey block sidebar option is based upon survey type and various other criteria',
        zephyrTestId: 'NL-1',
        storyId: 'NL-1',
      });

      const filterName = 'Employee engagement';
      await surveyBlockComponent.assertSurveysBlock();
      await surveyBlockComponent.clickToAddSurveysBlock();
      await surveyBlockModal.assertSurveyAndAddServeyBlock(filterName);
    }
  );
});
