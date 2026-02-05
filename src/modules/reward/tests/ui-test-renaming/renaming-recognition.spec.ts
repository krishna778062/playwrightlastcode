import { expect } from '@playwright/test';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { LanguageApiService } from '@rewards/api/services/LanguageApiService';
import { getRewardTenantConfigFromCache } from '@rewards/config/rewardConfig';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RenamingPage } from '@rewards/ui/pages/manage-renaming/renamingPage';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { GiveRecognitionDialogBox } from '@rewards-components/recognition/give-recognition-dialog-box';
import { RecognitionHubPage } from '@rewards-pages/recognition-hub/recognition-hub-page';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('Recognition Renaming Scenarios', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint('manage', PAGE_ENDPOINTS.MANAGE_RECOGNITION);
    await manageRecognitionPage.clickOnElement(manageRecognitionPage.renamingTab);
  });

  test(
    '[RC-6976] Validate "Edit program name & translations" page of recognition in RnR naming',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Edit program name & translations" page of recognition in RnR naming',
        zephyrTestId: 'RC-6976',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify cancel button on "edit program name and translation" for recognition',
        zephyrTestId: 'RC-6979',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify save button on edit program name and translation of recognition',
        zephyrTestId: 'RC-6980',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify manual translation button on "edit program name and translation" for recognition',
        zephyrTestId: 'RC-6981',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Validate success message after saving the change on edit program name and translation page of recognition',
        zephyrTestId: 'RC-6988',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      const isElementAlreadyCustomized = await renamingPage.isCardCustomized('recognition');
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('recognition');
      await renamingPage.validateTheEditModalElements(isElementAlreadyCustomized);
      await renamingPage.mockTheAppConfigAPIForTwoLanguages([1, 2, 3]);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      await renamingPage.validateTheEditModalWithMockedResult();
      await renamingPage.releaseTheAppConfigAPIData();
      await renamingPage.verifyThePageIsLoaded();
      //Cancel button
      await renamingPage.clickEditButtonByCardType('recognition');
      const customValue = await renamingPage.changeSomeDataAndClickOnCancel('Recognition');
      let currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      expect(currentCustomizedValue, `${currentCustomizedValue} is not matching with ${customValue!}`).not.toEqual(
        customValue!
      );
      //Save button
      await renamingPage.clickEditButtonByCardType('recognition');
      const newCustomValue = await renamingPage.changeSomeDataAndClickOnSave('Recognition');
      await renamingPage.verifyThePageIsLoaded();
      currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      expect(currentCustomizedValue, `${currentCustomizedValue} is matching with ${newCustomValue!}`).toEqual(
        newCustomValue!
      );
    }
  );

  test(
    '[RC-6993] Validate reset all translation to automatic option on edit program name and translation page of recognition',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate reset all translation to automatic option on edit program name and translation page of recognition',
        zephyrTestId: 'RC-6993',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.enableTheLanguageInTenantIfNotEnabled(['French', 'German']);
      await renamingPage.loadPage();
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('recognition');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      const defaultOtherLanguageTranslationValue = await renamingPage.getTheDefaultTranslationValues();
      await renamingPage.enableTheOtherLanguageAndEnterCustomValue('recognition');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      await renamingPage.clickOnResetButton();
      await renamingPage.validateTheLanguageDataRested(defaultOtherLanguageTranslationValue);
      await renamingPage.clickOnSaveButton();
    }
  );

  test(
    '[RC-6986] Validate when user deselect “Use this name for all languages” option for recognition',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate when user deselect “Use this name for all languages” option for recognition',
        zephyrTestId: 'RC-6986',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('recognition');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      const customOtherLanguageValue = await renamingPage.getTheDefaultTranslationValues();
      const customOtherLanguage: string[] = [defaultCustomizedValue!, defaultCustomizedValue!];
      expect(customOtherLanguageValue).toEqual(customOtherLanguage);
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      const defaultOtherLanguageTranslationValue = await renamingPage.getTheDefaultTranslationValues();
      expect(defaultOtherLanguageTranslationValue).not.toEqual(customOtherLanguage);
    }
  );

  test(
    '[RC-7106] Validate "Use the default language name for all languages" option in different languages showing in application for recognition',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate "Use the default language name for all languages" option in different languages showing in application for recognition',
        zephyrTestId: 'RC-7106',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Verify option "Use the default language name for all languages" on edit program name and translation page for recognition',
        zephyrTestId: 'RC-6978',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify home page of naming after saving the changes of recognition',
        zephyrTestId: 'RC-6989',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('recognition');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      await renamingPage.changeSomeDataAndClickOnSave('Recognition');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const recognitionTranslationsByLanguage: Map<string, string> =
        await renamingPage.getTheDefaultTranslationValuesByLanguages();
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRecognitionManualTranslationsAcrossLanguages(recognitionTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );

  test(
    '[RC-7124] Validate custom and manual translation for recognition in different languages showing in application',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate custom and manual translation for recognition in different languages showing in application',
        zephyrTestId: 'RC-7124',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Validate custom recognition name translation along with "use the name in default languages" in different languages showing in application',
        zephyrTestId: 'RC-7118',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Validate custom recognition name translation in different languages showing in application',
        zephyrTestId: 'RC-7053',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify custom and manual translation for recognition on "Edit program name and translation" page',
        zephyrTestId: 'RC-6985',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Verify translation name on "Edit program name and translation" when custom option set to Enable for recognition',
        zephyrTestId: 'RC-6992',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify home page of naming after saving the changes of recognition',
        zephyrTestId: 'RC-6989',
        storyId: 'RC-6370',
      });

      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);

      // Save a new custom label (manual translations enabled) then capture per-language translation values.
      await renamingPage.changeSomeDataAndClickOnSave('Recognition');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const recognitionTranslationsByLanguage: Map<string, string> =
        await renamingPage.getTheDefaultTranslationValuesByLanguages();
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRecognitionManualTranslationsAcrossLanguages(recognitionTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );

  test(
    '[RC-7073] Validate manual translation of recognition name in selected language showing in application',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description: 'Validate manual translation of recognition name in selected language showing in application',
        zephyrTestId: 'RC-7073',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Verify recognition name translation in different languages on "Edit program name and translation" for recognition',
        zephyrTestId: 'RC-6990',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Verify custom option enable along with "use the name in default languages" for different language for recognition',
        zephyrTestId: 'RC-6987',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('recognition');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      await renamingPage.changeSomeDataAndClickOnSave('Recognition');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const recognitionTranslationsByLanguage: Map<string, string> =
        await renamingPage.setTheManualTranslationValuesByLanguages('recognition');
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRecognitionManualTranslationsAcrossLanguages(recognitionTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );

  test(
    '[RC-7073] Validate Recognition and points custom value in selected language showing in Delete Recognition Modal when grace period is over',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          ' Validate Recognition and points custom value in selected language showing in Delete Recognition Modal when grace period is over',
        zephyrTestId: 'RC-7073',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('recognition');
      const recognitionTranslationsByLanguage: Map<string, string> =
        await renamingPage.setTheManualTranslationValuesByLanguages('recognition');
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRecognitionAndPointsLabelInDeleteRecognitionModal(recognitionTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );

  test(
    '[RC-7073] Validate Recognition and points custom value in selected language showing in Delete Recognition Modal when grace period is not over',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate Recognition and points custom value in selected language showing in Delete Recognition Modal when grace period is not over',
        zephyrTestId: 'RC-7073',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      const recognitionHub = new RecognitionHubPage(appManagerFixture.page);
      const existingOptions = await recognitionHub.visitRecognitionHub();
      await recognitionHub.verifyThePageIsLoaded();
      if (existingOptions.length <= 1) {
        await recognitionHub.setupTheMultipleGiftingOptions();
      }
      await recognitionHub.clickOnGiveRecognition();
      const giveRecognitionModal = new GiveRecognitionDialogBox(appManagerFixture.page);
      await giveRecognitionModal.selectTheUserForRecognition(getRewardTenantConfigFromCache().endUserName);
      await giveRecognitionModal.selectTheUserForRecognition(0);
      await giveRecognitionModal.selectThePeerRecognitionAwardForRecognition(1);
      const recognitionPostMessage = 'Test Message' + Math.floor(Math.random() * 1000);
      await giveRecognitionModal.enterTheRecognitionMessage(recognitionPostMessage);
      await giveRecognitionModal.giftThePoints(1);
      const [response] = await Promise.all([
        recognitionHub.page.waitForResponse(resp => resp.url().includes('/recognition/create')),
        giveRecognitionModal.recognizeButton.click({ force: true }),
      ]);

      const body = await response.json();
      if (!body?.id) throw new Error(`No id in response: ${JSON.stringify(body)}`);
      const recognitionPostUrl = String(body.id);

      // Handle dialog box if it appears
      const dialogBox = new DialogBox(appManagerFixture.page);
      if (await recognitionHub.verifier.isTheElementVisible(dialogBox.container)) {
        await dialogBox.container.waitFor({ state: 'visible' });
        await dialogBox.skipButton.click();
        await expect(dialogBox.container).not.toBeVisible();
      }
      await renamingPage.visit();
      await renamingPage.clickEditButtonByCardType('recognition');
      const recognitionTranslationsByLanguage: Map<string, string> =
        await renamingPage.setTheManualTranslationValuesByLanguages('recognition');
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRecognitionAndPointsLabelInDeleteRecognitionModalWithin24hrs(
          recognitionPostUrl,
          recognitionTranslationsByLanguage
        );
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );
});
