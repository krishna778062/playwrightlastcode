import { expect } from '@playwright/test';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { RenamingPage } from '@rewards/ui/pages/manage-renaming/renamingPage';
import { UserProfilePage } from '@rewards-pages/user-profile/user-profile-page';

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
      const renamingPage = new RenamingPage(appManagerFixture.page);
      const userProfile = new UserProfilePage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('recognition');
      await renamingPage.changeSomeDataAndClickOnSave('Recognition');
      await renamingPage.verifyThePageIsLoaded();
      const getCustomValue: Map<string, string> = await renamingPage.getAllTheCustomValue();
      const selectedLanguageIds = await renamingPage.getSelectedLanguageIdsFromAppConfig();
      const uniqueLanguageIds = Array.from(new Set(selectedLanguageIds));
      const otherLanguageIds = uniqueLanguageIds.filter(id => id !== uniqueLanguageIds[0] && id !== 1);

      // Mock each non-default language and re-run validations
      for (const langId of otherLanguageIds) {
        // ensure we don't stack multiple route handlers
        await appManagerFixture.page.unroute('**/account/**').catch(() => {});
        await userProfile.mockAppConfigLanguage(appManagerFixture.page, langId);
        await renamingPage.validateTheRecognitionValueInApp(getCustomValue);
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
      await renamingPage.validateRecognitionManualTranslationsAcrossLanguages(recognitionTranslationsByLanguage);
    }
  );
});
