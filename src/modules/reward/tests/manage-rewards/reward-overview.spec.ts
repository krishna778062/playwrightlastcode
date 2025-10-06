import { expect } from '@playwright/test';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { getQuery } from '@core/utils/dbQuery';
import { executeQuery } from '@core/utils/dbUtils';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';

test.describe('Manage rewards', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  const rewardsTerminologyHeadings = ['Reward points', 'Peer gifting', 'Allowance', 'User wallet'];
  const rewardsTerminologyDescriptions = [
    'The digital currency used to reward users in recognition. Reward points can be redeemed for digital goods in the rewards store.',
    'The option to allow users to gift reward points to colleagues through peer recognition.',
    'A monthly balance of reward points that a user can use for peer gifting.',
    'The balance of reward points a user has received that can be redeemed for rewards.',
  ];

  test.beforeEach(async ({ appManagerPage }) => {
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
    await manageRewardsOverviewPage.enableTheRewardsAndPeerGiftingIfDisabled();
  });

  test(
    '[RC-3095] Validate Budget Exceeded Warnings on reward overview page',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_OVERVIEW,
        REWARD_SUITE_TAGS.REGRESSION_TEST,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Budget Exceeded Warnings on reward overview page',
        zephyrTestId: 'RC-3095',
        storyId: 'RC-3095',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);

      await manageRewardsOverviewPage.mockTheBudgetApiResponse();

      await manageRewardsOverviewPage.exceedBudgetIcon.scrollIntoViewIfNeeded();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.exceedBudgetHeadingText
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.exceedBudgetHeadingText,
        'Rewards spend has exceeded your annual budget'
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.exceedBudgetDescriptionText
      );
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.exceedBudgetDescriptionText,
        'You may disable peer gifting or adjust allowances to prevent or reduce further spend, or edit your budget'
      );
    }
  );

  test.skip(
    '[RC-3329] Validate if allowances summary shows 0 points when allowances are refreshing.',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OVERVIEW, REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P1],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate if allowances summary shows 0 points when allowances are refreshing.',
        zephyrTestId: 'RC-3329',
        storyId: 'RC-3329',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      // Get tenant code from window object
      const tenantCode = await appManagerPage.evaluate(() => {
        return (window as any).Simpplr?.Settings?.accountId;
      });

      // Set distribution allowance as failed using DB
      const resultAsFailed = getQuery('setDistributionAllowanceAsFail');
      await executeQuery(resultAsFailed.replace('tenantCode', tenantCode));

      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);

      await manageRewardsOverviewPage.verifier.waitUntilElementIsVisible(
        manageRewardsOverviewPage.pointBalanceSummaryAllowanceValue,
        {
          timeout: 15000,
          stepInfo: 'Verify Allowances value is visible in Points balance summary section',
        }
      );

      // Verify allowance points are 0
      const allowancePointsText = await manageRewardsOverviewPage.pointBalanceSummaryAllowanceValue.textContent();
      const allowancePoints = Number(allowancePointsText?.replace('points', '').trim());
      expect(allowancePoints).toBe(0);

      await manageRewardsOverviewPage.clickOnPointBalanceSummaryTheAllowanceInfoIcon();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.tooltipText);
      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.tooltipText,
        'Allowances are currently refreshing'
      );

      // Restore distribution allowance to success
      const resultAsSuccess = getQuery('setDistributionAllowanceAsSuccess');
      await executeQuery(resultAsSuccess.replace('tenantCode', tenantCode));
    }
  );

  test(
    '[RC-2192] Validate rewards overview tab page',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_OVERVIEW,
        REWARD_SUITE_TAGS.REGRESSION_TEST,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate rewards overview tab page',
        zephyrTestId: 'RC-2192',
        storyId: 'RC-2192',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.budgetSummaryMonthlySpendToDateValue.last(),
        {
          assertionMessage: ' Verifying Budget Summary Tile is loaded',
        }
      );
      const menuList = [
        'Overview',
        'Overview',
        'Gifting options',
        'Allowances',
        'Currency conversions',
        'Disable rewards',
      ];
      await manageRewardsOverviewPage.verifyTheMenuListItems(menuList);
      const count = await manageRewardsOverviewPage.sideBarMenuList.count();
      if (count < 6) {
        throw new Error(`Expected at least 6 menu items, but found ${count}`);
      }

      const descriptionLine1 =
        'Monitor your rewards budget, activity and allowances, to manage spend and track the health of your rewards program.';
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.rewardsOverviewDescriptionText.first(),
        descriptionLine1
      );
      const descriptionLine2 = 'View reward analytics for in depth reporting and insights.';
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.rewardsOverviewDescriptionText.last(),
        descriptionLine2
      );
      const summaryTilesCount = await manageRewardsOverviewPage.summaryTiles.count();
      if (summaryTilesCount !== 2) {
        throw new Error(`Expected 2 summary tiles, but found ${summaryTilesCount}`);
      }
      const activityContainerCount = await manageRewardsOverviewPage.activityContainer.count();
      if (activityContainerCount !== 1) {
        throw new Error(`Expected 1 activity container, but found ${activityContainerCount}`);
      }

      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTab.first());
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.insightBulbButton, {
        stepInfo: 'Clicking on Insight button',
        timeout: 15000,
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.insightModalContainer
      );
      // Verify each terminology heading
      for (let i = 0; i < rewardsTerminologyHeadings.length; i++) {
        await manageRewardsOverviewPage.verifier.verifyElementContainsText(
          manageRewardsOverviewPage.rewardTerminologySubHeadings.nth(i),
          rewardsTerminologyHeadings[i]
        );
      }
      // Verify each terminology description
      for (let i = 0; i < rewardsTerminologyDescriptions.length; i++) {
        await manageRewardsOverviewPage.verifier.verifyElementContainsText(
          manageRewardsOverviewPage.rewardTerminologySubHeadingsDescription.nth(i),
          rewardsTerminologyDescriptions[i]
        );
      }
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.rewardsTerminologyCloseButton, {
        stepInfo: 'Closing Rewards Terminology modal',
      });
      await manageRewardsOverviewPage.verifier.verifyTheElementIsNotVisible(
        manageRewardsOverviewPage.insightModalContainer
      );
    }
  );

  test(
    '[RC-5419] Validate on navigating to rewards tab & all its sub tabs one by one, rewards api is called for once only',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_OVERVIEW,
        REWARD_SUITE_TAGS.REGRESSION_TEST,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description:
          'Validate on navigating to rewards tab & all its sub tabs one by one, rewards api is called for once only',
        zephyrTestId: 'RC-5419',
        storyId: 'RC-5419',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      const rewardsApi = '**/recognition/admin/rewards';
      const calls: string[] = [];
      await appManagerPage.route(rewardsApi, async route => {
        calls.push(route.request().url());
        await route.continue();
      });

      const expectSingleApiCall = async () => {
        // Wait for a short time to ensure no additional calls are made
        await appManagerPage.waitForTimeout(2000);
        if (calls.length !== 1) {
          throw new Error(`Expected 1 API call, but got ${calls.length}`);
        }
        calls.length = 0; // reset for next step
      };

      // STEP 1: Navigate to Rewards tab
      await appManagerPage.goto('/manage/recognition/rewards');
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);
      await expectSingleApiCall();

      // STEP 2: Reload page
      await appManagerPage.reload();
      await manageRewardsOverviewPage.verifier.verifyElementHasText(appManagerPage.locator('h1'), 'Recognition');
      await expectSingleApiCall();

      // STEP 3: Navigate through sub-tabs
      const subTabs = ['Overview', 'Reward options', 'Currency conversions', 'Disable rewards'];

      for (const tab of subTabs) {
        await appManagerPage.getByRole('tab', { name: tab }).click();
        await manageRewardsOverviewPage.verifier.verifyElementHasAttribute(
          appManagerPage.getByRole('tab', { name: tab }),
          'aria-selected',
          'true'
        );
        await appManagerPage.waitForTimeout(500); // small wait to catch unexpected calls
        if (calls.length !== 0) {
          throw new Error(`Expected no new API calls for ${tab} tab, but got ${calls.length}`);
        }
      }
    }
  );

  test(
    '[RC-3094] Validate tooltips on Rewards Overview Points Balance summary tile component',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_OVERVIEW,
        REWARD_SUITE_TAGS.REGRESSION_TEST,
        TestPriority.P0,
        TestGroupType.SMOKE,
      ],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate tooltips on Rewards Overview Points Balance summary tile component',
        zephyrTestId: 'RC-3094',
        storyId: 'RC-3094',
      });
      const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerPage);
      await manageRewardsOverviewPage.verifyThePageIsLoaded();
      await manageRewardsOverviewPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.rewardsTabHeading);

      // Validate the tooltip text and "i" button on Allowances
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryTheAllowanceInfoIcon();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.tooltipText);
      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.tooltipText,
        'Allowances refresh on the 1st of every month'
      );
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryTheAllowanceInfoIcon();

      // Validate the tooltip text and "i" button on User wallets
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryTheUserWalletInfoIcon();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.tooltipText.first());
      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.tooltipText.first(),
        'Points in user wallets are available to be redeemed for rewards and do not expire.'
      );
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.tooltipText.last());
      await manageRewardsOverviewPage.verifier.verifyElementHasText(
        manageRewardsOverviewPage.tooltipText.last(),
        'Includes pending points.'
      );
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryTheUserWalletInfoIcon();

      // Validate the tooltip text of point conversion "i" button
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryThePointConversionIcon();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(manageRewardsOverviewPage.tooltipText);
      await manageRewardsOverviewPage.verifier.verifyElementContainsText(
        manageRewardsOverviewPage.tooltipText,
        'Point values may vary when using custom currency conversions'
      );
      await manageRewardsOverviewPage.clickOnPointBalanceSummaryThePointConversionIcon();

      // Disable Peer gifting and click on the Allowances "i" button.
      await manageRewardsOverviewPage.peerGifting.disableThePeerGifting();
      await manageRewardsOverviewPage.loadPage();
      await manageRewardsOverviewPage.verifier.verifyTheElementIsVisible(
        manageRewardsOverviewPage.pointBalanceSummaryActionBarButton
      );
      await manageRewardsOverviewPage.clickOnElement(manageRewardsOverviewPage.pointBalanceSummaryActionBarButton, {
        stepInfo: 'Clicking on Point Balance Summary Action Bar Button',
      });
      await manageRewardsOverviewPage.peerGifting.enableThePeerGifting();
    }
  );
});
