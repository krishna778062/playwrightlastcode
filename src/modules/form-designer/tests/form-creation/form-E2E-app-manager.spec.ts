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
  }
);
