import { test } from '@form-designer-fixtures/formFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FormSuiteTags } from '../../constants/formTestTags';
import { FormCreationPage } from '../../ui/pages/formCreation/FormPage';
import { FormParticipationPage } from '../../ui/pages/FormParticipationPage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { getCurrentDateFormatted } from '@/src/modules/form-designer/utils/dateUtils';
test.describe(
  `form E2E tests from creation to participation by Application Manager`,
  {
    tag: [FormSuiteTags.FORM_CREATION, FormSuiteTags.FORM_PARTICIPATION, FormSuiteTags.FORM_E2E],
  },
  () => {
    test.beforeEach(async ({ appManagerPage }) => {
      const formCreationPage = new FormCreationPage(appManagerPage);
      await formCreationPage.loadPage();
      await formCreationPage.verifyThePageIsLoaded();
    });

    test(
      'verify app manager able to create forms using short text and long text components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using short text and long text components and participate',
          zephyrTestId: 'ELF-865',
          storyId: 'ELF-865',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.dragAndDropElement('long text');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoShortTextField('Automation-response-Short text');
        await formParticipationPage.fillResponseIntoLongTextField('Automation-response-Long text');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');
      }
    );

    test(
      'verify app manager able to create forms using number and email components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify app manager able to create forms using number and email components and participate',
          zephyrTestId: 'ELF-878',
          storyId: 'ELF-878',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Number');
        await formCreationPage.dragAndDropElement('Email');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoNumberField('6');
        await formParticipationPage.fillResponseIntoEmailField('test@automation.com');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');
      }
    );

    test(
      'verify app manager able to create forms using Rating and opinion fields components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using Rating and opinion fields components and participate',
          zephyrTestId: 'ELF-897',
          storyId: 'ELF-897',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('rating');
        await formCreationPage.dragAndDropElement('opinion');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoRatingField('6');
        await formParticipationPage.fillResponseIntoOpinionField('7');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');
      }
    );

    test(
      'verify app manager able to create forms using media components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify app manager able to create forms using media components and participate',
          zephyrTestId: 'ELF-896',
          storyId: 'ELF-896',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('upload file');
        await formCreationPage.dragAndDropElement('upload image');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoFileUploadField('sample_csv.csv');
        await formParticipationPage.fillResponseIntoImageField('image1.jpg');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using multi choice components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify app manager able to create forms using multi choice components and participate',
          zephyrTestId: 'ELF-895',
          storyId: 'ELF-895',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('multi select');
        await formCreationPage.dragAndDropElement('single select');
        await formCreationPage.dragAndDropElement('dropdown');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoMultiSelectField('Weekly');
        await formParticipationPage.fillResponseIntoMultiSelectField('Monthly');
        await formParticipationPage.fillResponseIntoMultiSelectField('Yearly');
        await formParticipationPage.fillResponseIntoSingleSelectField('Weekly');
        await formParticipationPage.fillResponseIntoDropdownField('Yearly');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using legal components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify app manager able to create forms using legal components and participate',
          zephyrTestId: 'ELF-892',
          storyId: 'ELF-892',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('legal');
        await formCreationPage.addHeadingIntoComponent('Legal', 'Automation Test - Legal Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.addQuestionIntoLegalComponent('Legal Question-Automation');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoLegalField();
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using Date and time components and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verify app manager able to create forms using Date and time components and participate',
          zephyrTestId: 'ELF-891',
          storyId: 'ELF-891',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('date and time');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoDateField(getCurrentDateFormatted());
        await formParticipationPage.fillResponseIntoTimeField('12:15 AM');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using short text and long text components as mandatory fields and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using short text and long text components as mandatory fields and participate',
          zephyrTestId: 'ELF-63',
          storyId: 'ELF-63',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.addHeadingIntoComponent('Short text', 'Automation Test - Short text Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.dragAndDropElement('long text');
        await formCreationPage.addHeadingIntoComponent('Long text', 'Automation Test - Long text Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyShortTextFieldIsMandatory('Automation Test - Short text Description');
        await formParticipationPage.verifyLongTextFieldIsMandatory('Automation Test - Long text Description');
        await formParticipationPage.fillResponseIntoShortTextField('Automation-response-Short text');
        await formParticipationPage.fillResponseIntoLongTextField('Automation-response-Long text');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        // delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using number component as mandatory fields and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using number components as mandatory fields and participate',
          zephyrTestId: 'ELF-74',
          storyId: 'ELF-74',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Number');
        await formCreationPage.addHeadingIntoComponent('Number', 'Automation Test - Number Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyNumberFieldIsMandatory('Automation Test - Number Description');
        await formParticipationPage.fillResponseIntoNumberField('1');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using email component as mandatory field and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using email component as mandatory field and participate',
          zephyrTestId: 'ELF-86',
          storyId: 'ELF-86',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Email');
        await formCreationPage.addHeadingIntoComponent('Email', 'Automation Test - Email Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyEmailFieldIsMandatory('Automation Test - Email Description');
        await formParticipationPage.fillResponseIntoEmailField('test@automation.com');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using rating component as mandatory field and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using rating component as mandatory field and participate',
          zephyrTestId: 'ELF-88',
          storyId: 'ELF-88',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Rating');
        await formCreationPage.addHeadingIntoComponent('Rating', 'Automation Test - Rating Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyRatingFieldIsMandatory('Automation Test - Rating Description', '1');
        await formParticipationPage.fillResponseIntoRatingField('1');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using opinion component as mandatory field and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using opinion component as mandatory field and participate',
          zephyrTestId: 'ELF-125',
          storyId: 'ELF-125',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Opinion');
        await formCreationPage.addHeadingIntoComponent('Opinion', 'Automation Test - Opinion Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeComponentMandatory();
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyOpinionFieldIsMandatory('Automation Test - Opinion Description', '1');
        await formParticipationPage.fillResponseIntoOpinionField('1');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to create forms using address component as mandatory field and participate',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to create forms using address component as mandatory field and participate',
          zephyrTestId: 'ELF-890',
          storyId: 'ELF-890',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Address');
        await formCreationPage.addHeadingIntoComponent('Address', 'Automation Test - Address Description');
        await formCreationPage.clickOnSettingsIcon();
        await formCreationPage.makeAddressFieldsMandatory('Address is required');
        await formCreationPage.makeAddressFieldsMandatory('Address line 2 is required');
        await formCreationPage.makeAddressFieldsMandatory('City/Town is required');
        await formCreationPage.makeAddressFieldsMandatory('State/Region/Province is');
        await formCreationPage.makeAddressFieldsMandatory('Zip/Post code is required');
        await formCreationPage.makeAddressFieldsMandatory('Country is required');
        await formCreationPage.makeAddressFieldsMandatory('Show error messages');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.verifySubmitButtonIsDisabled();
        await formParticipationPage.verifyAddressField1IsMandatory(
          'Automation Test - Address Description',
          'Address is required'
        );
        await formParticipationPage.verifyAddressField2IsMandatory(
          'Automation Test - Address Description',
          'Address line 2 is required'
        );
        await formParticipationPage.verifyCityTownIsMandatory(
          'Automation Test - Address Description',
          'City/Town is required'
        );
        await formParticipationPage.verifyStateRegionProvinceIsMandatory(
          'Automation Test - Address Description',
          'State/Region/Province is required'
        );
        await formParticipationPage.verifyZipPostCodeIsMandatory(
          'Automation Test - Address Description',
          'Zip/Post code is required'
        );
        await formParticipationPage.verifyCountryIsMandatory(
          'Automation Test - Address Description',
          'Country is required'
        );
        await formParticipationPage.fillResponseIntoAddressLine1Field('Automation-response-Address line 1');
        await formParticipationPage.fillResponseIntoAddressLine2Field('Automation-response-Address line 2');
        await formParticipationPage.fillResponseIntoCityTownField('Automation-response-City/Town');
        await formParticipationPage.fillResponseIntoStateRegionProvinceField(
          'Automation-response-State/Region/Province'
        );
        await formParticipationPage.fillResponseIntoZipPostCodeField('123456');
        await formParticipationPage.fillResponseIntoCountryField('Automation-response-Country');
        await formCreationPage.clickOn('button', 'Submit');
        await formParticipationPage.verifyFormSubmittedMessage('Your response has been recorded');

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to fill responses on preview screen same as participation page for media components',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to fill responses on preview screen same as participation page for media components',
          zephyrTestId: 'ELF-908',
          storyId: 'ELF-908',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('upload file');
        await formCreationPage.dragAndDropElement('upload image');
        await formCreationPage.clickOnPreviewButton();
        await formParticipationPage.fillResponseIntoFileUploadField('sample_csv.csv');
        await formParticipationPage.fillResponseIntoImageField('image1.jpg');
        await formParticipationPage.verifyFileUploadResponse('sample_csv.csv');
        await formParticipationPage.verifyFileUploadResponse('image1.jpg');
      }
    );

    test(
      'email Validation Message- Verify the validation message appear when Standard user enters the invalid/Valid email and try to click on submit button.',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Email Validation Message- Verify the validation message appear when Standard user enters the invalid/Valid email and try to click on submit button.',
          zephyrTestId: 'ELF-126',
          storyId: 'ELF-126',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Email');
        await formCreationPage.addHeadingIntoComponent('Email', 'Automation Test - Email Description');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formParticipationPage.waitForFormToBePublished();
        await formParticipationPage.clickOnThreeDotsIcon();
        await formParticipationPage.clickOnCopyLink();
        await formParticipationPage.openCopiedFormLink();
        await formParticipationPage.fillResponseIntoEmailField('test');
        await formParticipationPage.verifyEmailValidationMessage(
          'Automation Test - Email Description',
          'Please enter a valid email address'
        );

        //delete the form
        await formCreationPage.goToUrl(PAGE_ENDPOINTS.FORM_CREATION_PAGE);
        await formParticipationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOn('menuitem', 'Delete');
        await formCreationPage.clickOn('button', 'Delete');
        await formParticipationPage.verifyFormDeletedMessage('Form deleted');
      }
    );

    test(
      'verify app manager able to fill responses on preview screen same as participation page for multi choice components',
      {
        tag: [
          TestPriority.P1,
          TestGroupType.SANITY,
          TestGroupType.REGRESSION,
          TestGroupType.HEALTHCHECK,
          TestGroupType.E2E,
        ],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description:
            'Verify app manager able to fill responses on preview screen same as participation page for multi choice components',
          zephyrTestId: 'ELF-907',
          storyId: 'ELF-907',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        const formParticipationPage = new FormParticipationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('multi select');
        await formCreationPage.dragAndDropElement('single select');
        await formCreationPage.dragAndDropElement('dropdown');
        await formCreationPage.clickOnPreviewButton();
        await formParticipationPage.fillResponseIntoMultiSelectField('Weekly');
        await formParticipationPage.fillResponseIntoMultiSelectField('Monthly');
        await formParticipationPage.fillResponseIntoMultiSelectField('Yearly');
        await formParticipationPage.fillResponseIntoSingleSelectField('Weekly');
        await formParticipationPage.fillResponseIntoDropdownField('Yearly');
      }
    );
  }
);
