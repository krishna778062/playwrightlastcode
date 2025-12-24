import { RecognitionSuitTags } from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';
import { ManageRecognitionPage } from '@recognition/ui/pages/manage/manageRecognitionPage';
import { RenamingPage } from '@recognition/ui/pages/manage/renamingPage';

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
    '[RC-6963] Validate naming page of RnR renaming',
    {
      tag: [RecognitionSuitTags.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6963',
        storyId: 'RC-6963',
      });
      const { page } = appManagerFixture;
      const renamingPage = new RenamingPage(page);
      await renamingPage.verifyThePageIsLoaded();
    }
  );
  test(
    '[RC-6935] Verify naming option in manage>recognition page',
    {
      tag: [RecognitionSuitTags.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6935',
        storyId: 'RC-6935',
      });
      const { page } = appManagerFixture;
      const renamingPage = new RenamingPage(page);
      await renamingPage.verifyThePageIsLoaded();

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
      cardType: 'recognition' as const,
    },
    {
      testId: 'RC-6931',
      cardType: 'points' as const,
    },
    {
      testId: 'RC-6932',
      cardType: 'rewardsStore' as const,
    },
  ].forEach(({ testId, cardType }) => {
    test(
      `[${testId}] Verify edit modal appears and default language input is disabled for ${cardType}`,
      {
        tag: [RecognitionSuitTags.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
      },
      async ({ appManagerFixture }) => {
        tagTest(test.info(), {
          zephyrTestId: testId,
          storyId: testId,
        });
        const { page } = appManagerFixture;
        const renamingPage = new RenamingPage(page);
        await renamingPage.verifyThePageIsLoaded();

        await renamingPage.clickEditButtonByCardType(cardType);
        await renamingPage.verifyModalIsVisible();
        await renamingPage.verifyDefaultLanguageInputIsDisabled();

        await renamingPage.clickDialogCancelButton();
      }
    );
  });
});
