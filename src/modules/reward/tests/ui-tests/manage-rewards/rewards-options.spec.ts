import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardOptionsPage } from '@rewards-pages/manage-rewards/reward-options-page';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('reward Options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test(
    'RC-5371 Verify Reward options only visible to App managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestPriority.P0, TestGroupType.SMOKE, TestGroupType.REGRESSION],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to App managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(appManagerFixture.page);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
    }
  );

  test(
    'RC-5371 Verify Reward options only visible to recognition managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options only visible to recognition managers',
        zephyrTestId: 'RC-5371',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(recoManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();
      const rewardOptionsIsVisible = await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options');
      expect(rewardOptionsIsVisible).toBeTruthy();
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(true);
    }
  );

  test(
    'RC-5374 Verify Reward options not visible to user other than recognition managers',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ standardUserFixture }) => {
      tagTest(test.info(), {
        description: 'Verify Reward options not visible to user other than recognition managers',
        zephyrTestId: 'RC-5374',
        storyId: 'RC-5251',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(standardUserFixture.page);
      const rewardIsEnabled = await manageRewardsPage.hasManageRecognitionPermission();
      await manageRewardsPage.loadPageWithHarness();
      expect(rewardIsEnabled).toBeFalsy();
      await manageRewardsPage.verifyPageIsNotFound();
    }
  );

  test(
    'RC-5386 Validate search box on rewards option page',
    {
      tag: [
        REWARD_FEATURE_TAGS.REWARD_OPTIONS,
        TestGroupType.REGRESSION,
        TestPriority.P0,
        TestGroupType.SMOKE,
        TestGroupType.HEALTHCHECK,
      ],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate search box on rewards option page',
        zephyrTestId: 'RC-5386',
        storyId: 'RC-5251',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);

      await rewardOptionsPage.loadPage();
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.performSearchAndValidate('UnableToFindThisReward', false);
      await rewardOptionsPage.performSearchAndValidate('Appl', true);
      await rewardOptionsPage.performSearchAndValidate('#$%^&*()_+', false);
      await rewardOptionsPage.performSearchAndValidate(' Apple ', true);
      await rewardOptionsPage.performSearchAndValidate('Amazon', true);
      await rewardOptionsPage.checkTheCopiedURLOfSearchResultInNewTab('Amazon', true);
    }
  );

  test(
    '[RC-5385] Validate sorting of column on rewards options page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate sorting of column on rewards options page',
        zephyrTestId: 'RC-5385',
        storyId: 'RC-5385',
      });
      tagTest(test.info(), {
        description: 'Validate search box on rewards option page',
        zephyrTestId: 'RC-5386',
        storyId: 'RC-5386',
      });
      tagTest(test.info(), {
        description: 'Validate Reward Options page',
        zephyrTestId: 'RC-5375',
        storyId: 'RC-5375',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);

      // Load page and validate table structure
      await rewardOptionsPage.loadPage();
      await rewardOptionsPage.verifyThePageIsLoaded();
      await rewardOptionsPage.verifier.verifyTheElementIsVisible(rewardOptionsPage.rewardsOptionsHeader);
      await rewardOptionsPage.verifier.verifyElementHasText(rewardOptionsPage.rewardsOptionsHeader, 'Reward options');

      const headersCount = rewardOptionsPage.rewardsOptionsTableHeaders;
      await expect(headersCount).toHaveCount(6);
      await expect(rewardOptionsPage.rewardsOptionsTableHeaders).toHaveText([
        'Name',
        'Redeemable options',
        'Countries',
        'Currencies',
      ]);

      // Search for Zara to get specific results
      await rewardOptionsPage.searchInput.fill('Zara');
      await rewardOptionsPage.clickOnElement(rewardOptionsPage.searchButton, {
        stepInfo: 'Clicking on search button',
      });
      await rewardOptionsPage.rewardsOptionsTableRow.last().waitFor({ state: 'visible', timeout: 5000 });

      // Validate the 'Name' column is sortable
      const nameHeader = rewardOptionsPage.rewardsOptionsTableHeaders.getByText('Name');
      const nameCells = rewardOptionsPage.page.locator('tbody tr td:nth-child(1)');
      const originalNames = await nameCells.allTextContents();

      // Click once for ascending sort
      await rewardOptionsPage.clickOnElement(nameHeader, {
        stepInfo: 'Clicking on Name column header for ascending sort',
      });
      await rewardOptionsPage.rewardsOptionsTableRow.last().waitFor({ state: 'visible', timeout: 5000 });
      const ascendingNames = await nameCells.allTextContents();
      const sortedAscending = [...originalNames].sort((a, b) => b.localeCompare(a));
      expect(ascendingNames.toLocaleString()).toEqual(sortedAscending.toLocaleString());

      // Click again for descending sort
      await rewardOptionsPage.clickOnElement(nameHeader, {
        stepInfo: 'Clicking on Name column header for descending sort',
      });
      await rewardOptionsPage.page.waitForTimeout(500);
      const descendingNames = await nameCells.allTextContents();
      const sortedDescending = [...originalNames].sort((a, b) => a.localeCompare(b));
      expect(descendingNames.toLocaleString()).toEqual(sortedDescending.toLocaleString());

      // Validate non-sortable columns
      const nonSortableColumns = ['Redeemable options', 'Countries', 'Currencies', 'Status'];
      for (const columnName of nonSortableColumns) {
        await rewardOptionsPage.validateColumnSorting(columnName, false);
      }
    }
  );

  test(
    'RC-5570 Validate show more button on rewards option page',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate show more button on rewards option page',
        zephyrTestId: 'RC-5570',
        storyId: 'RC-5570',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);

      const { totalRewards, displayedRewards } = await rewardOptionsPage.validateShowMoreButton();
      console.log(`Successfully loaded all ${displayedRewards} rewards (matches API total: ${totalRewards})`);
    }
  );

  test(
    'RC-5377 Verify reward options when feature flag is enabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify reward options when feature flag is enabled',
        zephyrTestId: 'RC-5377',
        storyId: 'RC-5377',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardOptionsPage = new RewardOptionsPage(appManagerFixture.page);

      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await rewardOptionsPage.setTheRewardsOptionsFeatureFlag(true);
      await rewardOptionsPage.loadPage();
      await rewardOptionsPage.verifyThePageIsLoaded();
      // Verify the Rewards Options page elements are visible on rewards_options Flag enabled
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disableRewardLink);
      await rewardOptionsPage.loadPage();
      await rewardOptionsPage.verifyThePageIsLoaded();
      const headersCount = rewardOptionsPage.rewardsOptionsTableHeaders;
      await expect(headersCount).toHaveCount(6);
      await expect(rewardOptionsPage.rewardsOptionsTableHeaders).toHaveText([
        'Name',
        'Redeemable options',
        'Countries',
        'Currencies',
        'Status',
        '',
      ]);
    }
  );

  test(
    'RC-5379 Verify rewards options when feature flag is disabled',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Verify rewards options when feature flag is disabled',
        zephyrTestId: 'RC-5379',
        storyId: 'RC-5379',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      const rewardOptionsPage = new RewardOptionsPage(appManagerFixture.page);

      await manageRewardsPage.loadPage();
      await manageRewardsPage.verifyThePageIsLoaded();
      await manageRewardsPage.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/overview');
      await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.header);
      await rewardOptionsPage.setTheRewardsOptionsFeatureFlag(false);
      await rewardOptionsPage.validateVisibilityOfRewardOptionsLink(false);
    }
  );
});
