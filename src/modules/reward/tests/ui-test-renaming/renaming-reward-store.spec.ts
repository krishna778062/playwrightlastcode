import { expect } from '@playwright/test';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { LanguageApiService } from '@rewards/api/services/LanguageApiService';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RenamingPage } from '@rewards/ui/pages/manage-renaming/renamingPage';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('renaming page', () => {
  test.beforeEach(async ({ appManagerFixture }) => {
    const { page: appManagerPage } = appManagerFixture;
    const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
    await manageRecognitionPage.navigateManageRecognitionPageViaEndpoint('manage', PAGE_ENDPOINTS.MANAGE_RECOGNITION);
    await manageRecognitionPage.clickOnElement(manageRecognitionPage.renamingTab);
  });

  test(
    '[RC-7033] Validate "Edit program name & translations" page of reward store in RnR naming',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Edit program name & translations" page of reward store in RnR naming',
        zephyrTestId: 'RC-7033',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify cancel button on edit program name and translation for reward store',
        zephyrTestId: 'RC-7007',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify save button on edit program name and translation of reward store',
        zephyrTestId: 'RC-7009',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Validate success message after saving the change on edit program name and translation page of reward store',
        zephyrTestId: 'RC-7000',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      const isElementAlreadyCustomized = await renamingPage.isCardCustomized('rewardsStore');
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      await renamingPage.validateTheEditModalElements(isElementAlreadyCustomized);
      await renamingPage.mockTheAppConfigAPIForTwoLanguages([1, 2, 3]);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      await renamingPage.validateTheEditModalWithMockedResult();
      await renamingPage.releaseTheAppConfigAPIData();
      await renamingPage.verifyThePageIsLoaded();
      //Cancel button
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const customValue = await renamingPage.changeSomeDataAndClickOnCancel('Rewards Store');
      let currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
      expect(currentCustomizedValue, `${currentCustomizedValue} is not matching with ${customValue!}`).not.toEqual(
        customValue!
      );
      //Save button
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const newCustomValue = await renamingPage.changeSomeDataAndClickOnSave('Rewards Store');
      await renamingPage.verifyThePageIsLoaded();
      currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
      expect(currentCustomizedValue, `${currentCustomizedValue} is matching with ${newCustomValue!}`).toEqual(
        newCustomValue!
      );
    }
  );

  test(
    '[RC-7011] Validate reset all translation to automatic option on edit program name and translation page of Reward Store',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate reset all translation to automatic option on edit program name and translation page of Reward Store',
        zephyrTestId: 'RC-7011',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.enableTheLanguageInTenantIfNotEnabled(['French', 'German']);
      await renamingPage.loadPage();
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      const defaultOtherLanguageTranslationValue = await renamingPage.getTheDefaultTranslationValues();
      await renamingPage.enableTheOtherLanguageAndEnterCustomValue('rewardsStore');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      await renamingPage.clickOnResetButton();
      await renamingPage.validateTheLanguageDataRested(defaultOtherLanguageTranslationValue);
      await renamingPage.clickOnSaveButton();
    }
  );

  test(
    '[RC-7108] Validate when user deselect “Use this name for all languages” option for reward store',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate when user deselect “Use this name for all languages” option for reward store',
        zephyrTestId: 'RC-7108',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
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
    '[RC-6991] Validate "Use the default language name for all languages" option in different languages showing in application for Reward store',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate "Use the default language name for all languages" option in different languages showing in application for Reward store',
        zephyrTestId: 'RC-6991',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      await renamingPage.changeSomeDataAndClickOnSave('Rewards Store');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const rewardStoreTranslationsByLanguage: Map<string, string> =
        await renamingPage.getTheDefaultTranslationValuesByLanguages();
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRewardStoreManualTranslationsAcrossLanguages(rewardStoreTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );

  test(
    '[RC-7125] Validate custom and manual translation for reward store in different languages showing in application',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate custom and manual translation for reward store in different languages showing in application',
        zephyrTestId: 'RC-7125',
        storyId: 'RC-6370',
      });

      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('rewardsStore');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);

      // Save a new custom label (manual translations enabled) then capture per-language translation values.
      await renamingPage.changeSomeDataAndClickOnSave('Rewards Store');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('rewardsStore');
      const rewardStoreTranslationsByLanguage: Map<string, string> =
        await renamingPage.getTheDefaultTranslationValuesByLanguages();
      const languageApi = new LanguageApiService();
      try {
        await renamingPage.validateRewardStoreManualTranslationsAcrossLanguages(rewardStoreTranslationsByLanguage);
      } finally {
        await languageApi.languageChangeFunction(renamingPage.page, { supportedLanguageId: 1 });
        await renamingPage.page.reload({ waitUntil: 'domcontentloaded' });
      }
    }
  );
});
