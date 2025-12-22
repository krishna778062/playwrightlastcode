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
import { ManageRecognitionPage } from '@/src/modules/recognition/ui/pages/manage/manageRecognitionPage';
import { RecurringAwardPage } from '@/src/modules/recognition/ui/pages/manage/recurringAwardPage';

test.describe('custom recurring award creation', () => {
  test(
    'verify if user is able to create recurring award with no overdue setting',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        RecurringAwardsFeatureTags.RECURRING_AWARD_CREATION,
        TestPriority.P0,
        TestGroupType.SANITY,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6341',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles'
      );
      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await manageRecognitionPage.cleanupCreatedAward();
    }
  );

  test(
    'validate if user is able to create quarterly award with custom participation max(88) days ,nomination close (max 88 days) and overdue (max 88 days)',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6181',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const { appManagerName } = getRecognitionTenantConfigFromCache();
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Quarterly',
        'America/Los_Angeles',
        2
      );

      // Participation window: Custom 88 days
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Participation window',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      // Nominations close: Custom 88 days
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Nominations close',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      // Award overdue: Custom 88 days
      await recurringAwardPage.selectOverdueOption('Custom');
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Award overdue',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await manageRecognitionPage.cleanupCreatedAward();
    }
  );

  test(
    'verify custom monthly award creation with custom participation and nomination window',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P3,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6098',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;
      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Monthly',
        'America/Los_Angeles'
      );

      // Participation window: Custom 27 days
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Participation window',
        plusClicks: 26, // assumes starting at 1 -> 26
        expectedValue: 27,
      });

      // Nominations close: Custom 5 days before month-end
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Nominations close',
        plusClicks: 4, // assumes starting at 1 -> 5
        expectedValue: 5,
      });

      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await manageRecognitionPage.cleanupCreatedAward();
    }
  );
});

test.describe('recurring award custom range validation', () => {
  test(
    'verify custom overdue range validation for recurring award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6192',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const fieldTestId = 'Award overdue';

      const validateCustomRange = async ({
        frequency,
        nearMaxClicks,
        clicksToMax,
        maxExpected,
      }: {
        frequency: 'Monthly' | 'Quarterly';
        nearMaxClicks: number;
        clicksToMax: number;
        maxExpected: number;
      }) => {
        await recurringAwardPage.selectAwardFrequency(frequency);
        await recurringAwardPage.selectOverdueOption('Custom');

        // Clamp to minimum (covers "Try setting 0/1" and minus disabled)
        await recurringAwardPage.setCustomRangeForCustomRecurringAward({
          fieldTestId,
          minusClicks: 50,
          expectedValue: 1,
          expectMinusDisabled: true,
        });
        // Re-assert min stays at 1
        await recurringAwardPage.setCustomRangeForCustomRecurringAward({
          fieldTestId,
          expectedValue: 1,
          expectMinusDisabled: true,
        });

        // Near max (e.g., 26 for monthly, 87 for quarterly)
        await recurringAwardPage.setCustomRangeForCustomRecurringAward({
          fieldTestId,
          plusClicks: nearMaxClicks,
          expectedValue: maxExpected - 1,
        });

        // Max (e.g., 27 for monthly, 88 for quarterly)
        await recurringAwardPage.setCustomRangeForCustomRecurringAward({
          fieldTestId,
          plusClicks: clicksToMax,
          expectedValue: maxExpected,
        });

        // Assert increment disabled beyond max (covers "Try setting 28/88")
        await recurringAwardPage.setCustomRangeForCustomRecurringAward({
          fieldTestId,
          expectedValue: maxExpected,
          expectPlusDisabled: true,
        });
      };

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      // Monthly: allowed 1–27
      await validateCustomRange({
        frequency: 'Monthly',
        nearMaxClicks: 25, // 1 + 25 = 26 (max - 1)
        clicksToMax: 1, // 26 -> 27
        maxExpected: 27,
      });

      // Quarterly: allowed 1–88
      await validateCustomRange({
        frequency: 'Quarterly',
        nearMaxClicks: 86, // 1 + 86 = 87 (max - 1)
        clicksToMax: 1, // 87 -> 88
        maxExpected: 88,
      });
    }
  );

  test('validate Nomination close date and participation window custom option field for Monthly awards', async ({
    appManagerFixture,
  }) => {
    const { page: appManagerPage } = appManagerFixture;
    const recurringAwardPage = new RecurringAwardPage(appManagerPage);
    const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

    await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
    await recurringAwardPage.clickRecurringAwardNewButton();
    await recurringAwardPage.fillRecurringAwardFormPageOne();
    await recurringAwardPage.fillRecurringAwardFormPageTwo(
      appManagerName,
      'Nominations',
      'Monthly',
      'America/Los_Angeles',
      1
    );

    const assertMonthlyCustomRangeBounds = async (fieldTestId: string) => {
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId,
        minusClicks: 1,
        expectedValue: 1,
        expectMinusDisabled: true,
      });

      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId,
        plusClicks: 26,
        expectedValue: 27,
        expectPlusDisabled: true,
      });
    };

    await assertMonthlyCustomRangeBounds('Participation window');
    await assertMonthlyCustomRangeBounds('Nominations close');
    await recurringAwardPage.selectOverdueOption('Custom');
    await assertMonthlyCustomRangeBounds('Award overdue');
  });

  test(
    'validate quarterly award allows max custom ranges (88 days) and saves successfully',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P2,
        TestGroupType.REGRESSION,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6181',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const manageRecognitionPage = new ManageRecognitionPage(appManagerPage);
      const appManagerName = getRecognitionTenantConfigFromCache().appManagerName;

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(
        appManagerName,
        'Nominations',
        'Quarterly',
        'America/Los_Angeles',
        2
      );

      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Participation window',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Nominations close',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      await recurringAwardPage.selectOverdueOption('Custom');
      await recurringAwardPage.setCustomRangeForCustomRecurringAward({
        fieldTestId: 'Award overdue',
        plusClicks: 87, // 1 -> 88
        expectedValue: 88,
      });

      await recurringAwardPage.confirmAndCreateRecurringAward();
      await recurringAwardPage.submitRecurringAward();
      await manageRecognitionPage.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
      await manageRecognitionPage.cleanupCreatedAward();
    }
  );
});

test.describe('custom recurring award details in final confirmation page', () => {
  test(
    'validate award frequency and schedule section on final confirmation create award page for nomination type award',
    {
      tag: [
        RecognitionSuitTags.REGRESSION_TEST,
        RecognitionFeatureTags.CUSTOM_RECURRING_AWARD,
        TestPriority.P1,
        TestGroupType.SANITY,
      ],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        zephyrTestId: 'RC-6182',
        storyId: 'RC-3426',
      });
      const { page: appManagerPage } = appManagerFixture;
      const recurringAwardPage = new RecurringAwardPage(appManagerPage);
      const { appManagerName } = getRecognitionTenantConfigFromCache();
      const timeZone = 'Africa/Algiers';
      const nominationCloseDays = 27;
      const awardOverdueDays = 2;
      const monthsToValidate = 4;

      await recurringAwardPage.navigateRecurringAwardPageViaEndpoint(PAGE_ENDPOINTS.MANAGE_RECURRING_RECOGNITION);
      await recurringAwardPage.clickRecurringAwardNewButton();
      await recurringAwardPage.fillRecurringAwardFormPageOne();
      await recurringAwardPage.fillRecurringAwardFormPageTwo(appManagerName, 'Nominations', 'Monthly', timeZone, 1);
      await recurringAwardPage.configureMonthlyScheduleAndValidateSummary({
        timeZone,
        participationWindowOption: 'Whole month',
        nominationsCloseDays: nominationCloseDays,
        awardOverdueDays,
        monthsToValidate,
      });
    }
  );
});
