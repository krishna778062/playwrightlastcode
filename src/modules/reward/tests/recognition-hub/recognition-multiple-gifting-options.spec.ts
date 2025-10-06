import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { tagTest } from '@core/utils/testDecorator';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { RecognitionHubPage } from '@modules/reward/pages/recognition-hub/recognition-hub-page';
test.describe('Multiple Gifting options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test.beforeEach(async ({ appManagerPage }) => {
    const recognitionHub = new RecognitionHubPage(appManagerPage);
    await recognitionHub.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-2835] Verify multiple gifting option using Single Recipient & Multiple Recipient',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Verify multiple gifting option using Single Recipient & Multiple Recipient',
        zephyrTestId: 'RC-2835',
        storyId: 'RC-2835',
      });

      // TODO: Implement when RecognitionHubPage and GiveRecognitionDialogBox are available

      const recognitionHub = new RecognitionHubPage(appManagerPage);
      let input_values: number[];

      // Navigate to Recognition Hub and Click on Give recognition Modal
      const existingOptions = await recognitionHub.visitRecognitionHub();
      if (existingOptions.length < 2) {
        input_values = await recognitionHub.setupTheMultipleGiftingOptions();
      } else {
        input_values = existingOptions;
      }
      await recognitionHub.clickOnGiveRecognition();

      // Validated the First Gifting Option is selected by default when we enable Gifting option
      await recognitionHub.selectUsersInTheAwardee(1);
      await recognitionHub.enableTheGiftingOption(true);
      await recognitionHub.validateTheGiftingOptions(input_values);
      const textOfRecognitionButton = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessage = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButton).toContain(`Recognize & gift ${Number(input_values[0]).toLocaleString()} point`);
      expect(insufficientErrorMessage).toBe(false);

      // Validated the one more user to validate the points
      await recognitionHub.selectUsersInTheAwardee(1);
      const textOfRecognitionButtonMultiple = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessageMultiple = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButtonMultiple).toContain(
        `Recognize & gift ${Number(input_values[0] * 2).toLocaleString()} points`
      );
      expect(insufficientErrorMessageMultiple).toBe(false);

      // Validate the updated points in the Recognize button without any error message
      const index = 2;
      const giveRecognitionDialogBox = new GiveRecognitionDialogBox(appManagerPage);
      await expect(giveRecognitionDialogBox.giftingPointsPrivacyInfoIcon).toBeVisible();
      await giveRecognitionDialogBox.giftingPointsPrivacyInfoIcon.click({ force: true });
      await expect(giveRecognitionDialogBox.giftingPointsPrivacyTooltipText).toBeVisible();
      await expect(giveRecognitionDialogBox.giftingPointsPrivacyTooltipText).toHaveText(
        'Only those you recognize, their managers and app administrators can see gifted points'
      );
      await giveRecognitionDialogBox.giftingPointsPrivacyInfoIcon.click({ force: true });
      await expect(giveRecognitionDialogBox.giftingPointsPrivacyTooltipText).not.toBeVisible();
      await expect(giveRecognitionDialogBox.giftingPointsPrivacyText).toHaveText('Points are gifted privately');
      const giftingValueText = await giveRecognitionDialogBox.giftingOptionsContainerPill.nth(index).inputValue();
      await giveRecognitionDialogBox.giftingOptionsContainerPill.nth(index).click();
      const textOfRecognitionButtonUpdated = await recognitionHub.recognitionButtonText();
      const insufficientErrorMessageUpdated = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
      expect(textOfRecognitionButtonUpdated).toContain(
        `Recognize & gift ${(Number(giftingValueText) * 2).toLocaleString()} points`
      );
      expect(insufficientErrorMessageUpdated).toBe(false);
    }
  );

  test(
    '[RC-2835-B] Verify Minimum N points required',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async () => {
      tagTest(test.info(), {
        description: 'Verify Minimum N points required',
        zephyrTestId: 'RC-2835-B',
        storyId: 'RC-2835',
      });

      // TODO: Implement when RecognitionHubPage and GiveRecognitionDialogBox are available
      // This test requires mocking wallet API to set available points to 0
      // and then verifying that minimum point error message is displayed
    }
  );
});
