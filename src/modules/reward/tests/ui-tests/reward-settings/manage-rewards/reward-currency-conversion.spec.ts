import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardsCurrencyConversionPage } from '@rewards-pages/manage-rewards/rewards-currency-conversion-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('currency conversion flow', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  let currencyApiResponse: any;
  let apiData: any;
  let tenantCode: string;

  test.beforeEach(async ({ appManagerFixture }) => {
    const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
    await manageRewardsPage.loadPage();
    await manageRewardsPage.verifyThePageIsLoaded();
    await manageRewardsPage.enableTheRewardsAndPeerGiftingIfDisabled();
    const currencyConversion = new RewardsCurrencyConversionPage(appManagerFixture.page);

    // Get tenant code
    tenantCode = await appManagerFixture.page.evaluate(() => {
      return (window as any).Simpplr?.Settings?.accountId;
    });

    [currencyApiResponse] = await Promise.all([
      manageRewardsPage.page.waitForResponse(
        response =>
          response.url().endsWith('/recognition/admin/rewards/currencyConversions') &&
          response.request().resourceType() === 'xhr' &&
          response.status() === 200
      ),
      currencyConversion.loadPage(),
      currencyConversion.verifyThePageIsLoaded(),
    ]);
    apiData = await currencyApiResponse.json();
  });

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
      tagTest(test.info(), {
        description: 'Validate create currency conversion Tab / Page — delete flow',
        zephyrTestId: 'RC-2718',
        storyId: 'RC-2718',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const currency = 'XPF';

      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.completeCurrencyManagementWorkflow(currency);
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
        zephyrTestId: 'RC-3466',
        storyId: 'RC-3466',
      });
      tagTest(test.info(), {
        description: 'Validate currency conversion page on disabling custom conversion',
        zephyrTestId: 'RC-3467',
        storyId: 'RC-3467',
      });
      tagTest(test.info(), {
        description: 'Verify configure custom conversions',
        zephyrTestId: 'RC-2570',
        storyId: 'RC-2570',
      });

      const currencyConversionPage = new RewardsCurrencyConversionPage(appManagerFixture.page);
      const currency = 'XPF';
      const customValue = 10;

      await expect(appManagerFixture.page).toHaveURL('/manage/recognition/rewards/currency-conversions');
      await currencyConversionPage.completeCustomConversionWorkflow(currency, customValue);
    }
  );
});
