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
    '[RC-7032] Validate "Edit program name & translations" page of points in RnR naming',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate "Edit program name & translations" page of points in RnR naming',
        zephyrTestId: 'RC-7032',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify cancel button on edit program name and translation for points',
        zephyrTestId: 'RC-7006',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify save button on edit program name and translation of points',
        zephyrTestId: 'RC-7008',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description:
          'Validate success message after saving the change on edit program name and translation page of points',
        zephyrTestId: 'RC-6999',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      const isElementAlreadyCustomized = await renamingPage.isCardCustomized('points');
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('points');
      await renamingPage.validateTheEditModalElements(isElementAlreadyCustomized);
      await renamingPage.mockTheAppConfigAPIForTwoLanguages([1, 2, 3]);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('points');
      await renamingPage.validateTheEditModalWithMockedResult();
      await renamingPage.releaseTheAppConfigAPIData();
      await renamingPage.verifyThePageIsLoaded();
      //Cancel button
      await renamingPage.clickEditButtonByCardType('points');
      const customValue = await renamingPage.changeSomeDataAndClickOnCancel('Points');
      let currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('points');
      expect(currentCustomizedValue, `${currentCustomizedValue} is not matching with ${customValue!}`).not.toEqual(
        customValue!
      );
      //Save button
      await renamingPage.clickEditButtonByCardType('points');
      const newCustomValue = await renamingPage.changeSomeDataAndClickOnSave('Points');
      await renamingPage.verifyThePageIsLoaded();
      currentCustomizedValue = await renamingPage.getTheNewCustomizedValue('points');
      expect(currentCustomizedValue, `${currentCustomizedValue} is matching with ${newCustomValue!}`).toEqual(
        newCustomValue!
      );
    }
  );

  test(
    '[RC-7010] Validate reset all translation to automatic option on edit program name and translation page of points',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate reset all translation to automatic option on edit program name and translation page of points',
        zephyrTestId: 'RC-7010',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.enableTheLanguageInTenantIfNotEnabled(['French', 'German']);
      await renamingPage.loadPage();
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('points');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('points');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('checked', defaultCustomizedValue!);
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      const defaultOtherLanguageTranslationValue = await renamingPage.getTheDefaultTranslationValues();
      await renamingPage.enableTheOtherLanguageAndEnterCustomValue('points');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('points');
      await renamingPage.clickOnResetButton();
      await renamingPage.validateTheLanguageDataRested(defaultOtherLanguageTranslationValue);
      await renamingPage.clickOnSaveButton();
    }
  );

  test(
    '[RC-7107] Validate when user deselect “Use this name for all languages” option for points',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate when user deselect “Use this name for all languages” option for points',
        zephyrTestId: 'RC-7107',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('points');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('points');
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
    '[RC-6977] Validate "Use the default language name for all languages" option in different languages showing in application for points',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description:
          'Validate "Use the default language name for all languages" option in different languages showing in application for points',
        zephyrTestId: 'RC-6977',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      const userProfile = new UserProfilePage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await renamingPage.clickEditButtonByCardType('points');
      await renamingPage.changeSomeDataAndClickOnSave('Points');
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
        await renamingPage.validateThePointsValueInApp(getCustomValue);
      }
    }
  );

  test(
    '[RC-7126] Validate custom and manual translation for points in different languages showing in application',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      test.setTimeout(360_000);
      tagTest(test.info(), {
        description: 'Validate custom and manual translation for points in different languages showing in application',
        zephyrTestId: 'RC-7126',
        storyId: 'RC-6370',
      });
      const renamingPage = new RenamingPage(appManagerFixture.page);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('points');
      const defaultCustomizedValue = await renamingPage.getTheNewCustomizedValue('points');
      await renamingPage.unCheckAndCheckTheCustomLanguageForAll('unchecked', defaultCustomizedValue!);
      await renamingPage.changeSomeDataAndClickOnSave('Points');
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.clickEditButtonByCardType('points');
      const pointsTranslationsByLanguage: Map<string, string> =
        await renamingPage.getTheDefaultTranslationValuesByLanguages();
      await renamingPage.validatePointsManualTranslationsAcrossLanguages(pointsTranslationsByLanguage);
    }
  );
});
