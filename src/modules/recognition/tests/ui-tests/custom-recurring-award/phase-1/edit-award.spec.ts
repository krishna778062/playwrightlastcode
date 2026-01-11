import { expect } from '@playwright/test';
import {
  RecognitionFeatureTags,
  RecognitionSuitTags,
  RecurringAwardsFeatureTags,
} from '@recognition/constants/testTags';
import { recognitionTestFixture as test } from '@recognition/fixtures/recognitionFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { getRecognitionTenantConfigFromCache } from '@/src/modules/recognition/config/recognitionConfig';
import { MESSAGES } from '@/src/modules/recognition/constants/messages';
import { SubTabIndicator } from '@/src/modules/recognition/ui/components/common/sub-tab-indicator';
import { ManageRecognitionPage } from '@/src/modules/recognition/ui/pages/manage/manageRecognitionPage';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';

test.describe('edit created custom recurring award', () => {
  test(
    'Verify if User can update participation window after nomination close date of award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.EDIT_CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6121',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const subTabIndicator = new SubTabIndicator(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles',
        2
      );
      await recurringAwardPage.setParticipationWindowCustomDays(7);
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();

      await subTabIndicator.clickOnColumnButton('Created', 2);
      await subTabIndicator.getThreeDotsButton(0).click();
      await subTabIndicator.editMenuItem.click();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.editParticipationWindowCustomDays(14);
      // Validate participation window is updated to 14 on the current instance
      await expect(recurringAwardPage.awardCreationForm.rangeValueInput).toHaveValue('14');
      // Clean up the created award
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await subTabIndicator.clickOnColumnButton('Created', 2);
      await manageRecognitionPage.cleanupCreatedAwardInRecurringAwards();
    }
  );

  test(
    'Verify if user can extend (update) participation window for award  before nomination closing date',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.EDIT_CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6120',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const subTabIndicator = new SubTabIndicator(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      // Create a quarterly award with custom participation 60 days and nomination close last day of quarter
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      const _awardName = await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Quarterly',
        'America/Los_Angeles',
        2
      );
      await recurringAwardPage.setParticipationWindowCustomDays(60);
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);

      // Edit same award and update participation window to 20 days
      await subTabIndicator.clickOnColumnButton('Created', 2);
      await subTabIndicator.getThreeDotsButton(0).click();
      await subTabIndicator.editMenuItem.click();
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.editParticipationWindowCustomDays(20);
      await expect(recurringAwardPage.awardCreationForm.rangeValueInput).toHaveValue('20');
      await recurringAwardPage.awardCreationForm.nextButton.click();
      await recurringAwardPage.saveChangesAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.cleanupCreatedAwardInRecurringAwards();
    }
  );
});
