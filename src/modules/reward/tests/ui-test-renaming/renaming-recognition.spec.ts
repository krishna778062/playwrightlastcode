import { expect } from '@playwright/test';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
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
});
