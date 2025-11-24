import { test } from '@form-designer-fixtures/formFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { FormSuiteTags } from '../../constants/formTestTags';
import { FormCreationPage } from '../../ui/pages/formCreation/FormPage';
test.describe(
  `form E2E tests from creation to participation by Application Manager`,
  {
    tag: [FormSuiteTags.FORM_CREATION, FormSuiteTags.FORM_E2E],
  },
  () => {
    test.beforeEach(async ({ appManagerPage }) => {
      const formCreationPage = new FormCreationPage(appManagerPage);
      await formCreationPage.loadPage();
      await formCreationPage.verifyThePageIsLoaded();
    });

    test(
      'verfiy app manager able to publish and participate in a form',
      {
        tag: [TestPriority.P1, TestGroupType.SANITY, TestGroupType.REGRESSION, TestGroupType.HEALTHCHECK],
      },
      async ({ appManagerPage }) => {
        tagTest(test.info(), {
          description: 'Verfiy app manager able to publish and participate in a form',
          zephyrTestId: 'ELF-865',
          storyId: 'ELF-865',
        });

        const formCreationPage = new FormCreationPage(appManagerPage);
        await formCreationPage.clickOnCreateFormButton();
        await formCreationPage.dragAndDropElement('Short text');
        await formCreationPage.dragAndDropElement('multi select');
        // await formCreationPage.dragAndDropElement('file upload');
        // await formCreationPage.dragAndDropElement('rating');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.enterFormName('Automation-E2E-Form-');
        await formCreationPage.clickOn('button', 'Browse');
        await formCreationPage.clickOn('switch', 'All organization');
        await formCreationPage.clickOn('button', 'Done');
        await formCreationPage.clickOn('button', 'Publish');
        await formCreationPage.verifyPublishedFormToastMessage();
        await formCreationPage.waitForFormToBePublished();
        await formCreationPage.clickOnThreeDotsIcon();
        await formCreationPage.clickOnCopyLink();
        await formCreationPage.openCopiedFormLink();
        await formCreationPage.fillResponseIntoShortTextField('Automation-response-Short text');
        await formCreationPage.clickOn('button', 'Submit');
        await formCreationPage.verifyFormSubmittedMessage('Your response has been recorded');
      }
    );
  }
);
