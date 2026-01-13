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
    '[RC-6963, RC-6935] Validate naming page and option of RnR renaming',
    {
      tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate naming page of RnR renaming',
        zephyrTestId: 'RC-6963',
        storyId: 'RC-6370',
      });
      tagTest(test.info(), {
        description: 'Verify naming option in manage>recognition page',
        zephyrTestId: 'RC-6935',
        storyId: 'RC-6370',
      });
      const { page } = appManagerFixture;
      const renamingPage = new RenamingPage(page);
      await renamingPage.validateTheHarnessFlagValue('recognition_custom_label', true);
      await renamingPage.verifyThePageIsLoaded();
      await renamingPage.validateTheCurrentPageURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_RENAMING);
      await test.step('Verify Recognition option is visible', async () => {
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.recognitionCard);
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.recognitionEditButton);
      });

      await test.step('Verify Points option is visible', async () => {
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.pointsCard);
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.pointsEditButton);
      });

      await test.step('Verify Rewards store option is visible', async () => {
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.rewardsStoreCard);
        await renamingPage.verifier.verifyTheElementIsVisible(renamingPage.rewardsStoreEditButton);
      });
    }
  );

  [
    {
      testId: 'RC-6930',
      testDescription: 'Validate edit of Recognition from a new naming settings page',
      cardType: 'recognition' as const,
    },
    {
      testId: 'RC-6931',
      testDescription: 'Validate edit of Points from a new naming settings page',
      cardType: 'points' as const,
    },
    {
      testId: 'RC-6932',
      testDescription: 'Validate edit option of Reward store from a new naming settings page',
      cardType: 'rewardsStore' as const,
    },
  ].forEach(({ testId, cardType, testDescription }) => {
    test(
      `[${testId}] Verify edit modal appears and default language input is disabled for ${cardType}`,
      {
        tag: [TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.SANITY],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          description: testDescription,
          zephyrTestId: testId,
          storyId: 'RC-6370',
        });
        const { page } = appManagerFixture;
        const renamingPage = new RenamingPage(page);
        await renamingPage.verifyThePageIsLoaded();
        const isElementAlreadyCustomized = await renamingPage.isCardCustomized(cardType);
        await renamingPage.clickEditButtonByCardType(cardType);
        await renamingPage.verifyModalIsVisible();
        await renamingPage.verifyDefaultLanguageInputIs(isElementAlreadyCustomized);
        await renamingPage.clickDialogCancelButton();
      }
    );
  });
});
