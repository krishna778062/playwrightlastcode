import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { TestDbScenarios } from '@rewards/utils/testDatabaseHelper';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardsCurrencyConversionPage } from '@rewards-pages/manage-rewards/rewards-currency-conversion-page';
import fs from 'fs';
import path from 'path';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { CSVUtils } from '@core/utils/csvUtils';
import { tagTest } from '@core/utils/testDecorator';

test.describe('currency conversion flow', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  let currencyApiResponse: any;
  let apiData: any;
  let tenantCode: string;

  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPageWithHarness();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();

    // Get tenant code
    tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });

    [currencyApiResponse] = await Promise.all([
      appManagerFixture.page.waitForResponse(
        response =>
          response.url().endsWith('/recognition/admin/rewards/currencyConversions') && response.status() === 200
      ),
      appManagerFixture.page.goto('/manage/recognition/rewards/currency-conversions'),
    ]);
    apiData = await currencyApiResponse.json();
  });

  test(
    '[RC-2266] Validate All the UI elements in the Currency conversion page',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.CURRENCY_CONVERSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate All the UI elements in the Currency conversion page',
        zephyrTestId: 'RC-2266',
        storyId: 'RC-2266',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      await currencyConversionPage.validateAllUIElements(apiData);
    }
  );

  test(
    '[RC-2531] Validate Add & remove currency in currency conversion tab.',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.CURRENCY_CONVERSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Add & remove currency in currency conversion tab.',
        zephyrTestId: 'RC-2531',
        storyId: 'RC-2531',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const currency = 'XPF';

      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.completeCurrencyManagementWorkflow(currency);
    }
  );

  test(
    '[RC-3115] Verify dialog for unsaved changes when user in currency conversion page navigates to different page or refreshes',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.CURRENCY_CONVERSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Verify dialog for unsaved changes when user in currency conversion page navigates to different page or refreshes',
        zephyrTestId: 'RC-3115',
        storyId: 'RC-3115',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const currency = 'XPF';

      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.completeUnsavedChangesDialogWorkflow(currency);
    }
  );

  test(
    '[RC-3466,RC-3467] Validate currency conversion page on custom conversion',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.CURRENCY_CONVERSION, TestPriority.P0],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate currency conversion page on custom conversion',
        zephyrTestId: 'RC-3466,RC-3467',
        storyId: 'RC-3466,RC-3467',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const currency = 'XPF';
      const customValue = 10;

      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.completeCustomConversionWorkflow(currency, customValue);
    }
  );

  test(
    '[RC-4590] Validate Download CSV option if some active users on the platform have not set a payroll currency on their profile',
    {
      tag: [REWARD_FEATURE_TAGS.REWARDS_DB_CASES, REWARD_FEATURE_TAGS.REWARDS_CSV_CASES, TestPriority.P3],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description:
          'Validate Download CSV option if some active users on the platform have not set a payroll currency on their profile',
        zephyrTestId: 'RC-4590',
        storyId: 'RC-4590',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const csvUtils = new CSVUtils(path.resolve('./downloads'));

      await currencyConversionPage.loadPage();
      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.verifyThePageIsLoaded();

      // Download CSV for users who have not set their currency
      const latestCsvPath = await currencyConversionPage.downloadCSVForUnsetCurrencyUsers();

      // Validate DB result count matches CSV row count using TestDbScenarios pattern
      const dbEmailsSet = await TestDbScenarios.getAllTheUsersCountWhichHaveCurrencyAsNull(tenantCode);
      const csvCount = await csvUtils.getAllRecords();
      expect(dbEmailsSet.size, 'DB row count should match CSV row count').toBe(csvCount.length);

      // Validate all DB emails are present in CSV
      if (!latestCsvPath || !fs.existsSync(latestCsvPath)) {
        throw new Error('CSV file not found for validation: ' + latestCsvPath);
      }

      const csvRows: Record<string, string>[] = await csvUtils.getAllRecords();

      if (!csvRows || csvRows.length === 0) {
        throw new Error('CSV is empty: ' + latestCsvPath);
      }

      const headerKeys = Object.keys(csvRows[0]);
      const emailKey = headerKeys.find(h => h.toLowerCase().includes('email'));
      if (!emailKey) {
        throw new Error('Could not find an "email" column in CSV headers: ' + headerKeys.join(','));
      }

      const csvEmails = csvRows.map(r => (r[emailKey] ?? '').trim()).filter(Boolean);
      console.log('CSV emails count:', csvEmails.length);

      // Convert Set to Array for comparison
      const dbEmails = Array.from(dbEmailsSet);
      const csvSet = new Set(csvEmails.map(e => e.toLowerCase()));
      const missingEmails = dbEmails.filter(e => !csvSet.has(e.toLowerCase()));

      if (missingEmails.length > 0) {
        console.error('Missing emails in CSV:', missingEmails);
      }
      expect(missingEmails.length, 'All DB emails should be present in CSV').toBe(0);
      await csvUtils.deleteTheDownloadedCSV(latestCsvPath);
    }
  );
});
