import { expect } from '@playwright/test';
import { REWARD_FEATURE_TAGS, REWARD_SUITE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';
import { RewardOptionsPage } from '@rewards-pages/manage-rewards/reward-options-page';
import { RewardsStore } from '@rewards-pages/reward-store/reward-store';

import { TestGroupType, TestPriority } from '@core/constants';
import { tagTest } from '@core/utils';

test.describe('reward Options', { tag: [REWARD_SUITE_TAGS.MANAGE_REWARD] }, () => {
  test(
    'a - Verify Reward options only visible to App managers',
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
    'b - Verify Reward options only visible to recognition managers',
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
    'verify Reward options not visible to user other than recognition managers',
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
    'validate search box on rewards option page',
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
      const headers = await rewardOptionsPage.rewardsOptionsTableHeaders.allTextContents();
      expect(headers).toEqual(['Name', 'Redeemable options', 'Countries', 'Currencies', 'Status', '']);

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
    '[RC-5570] Validate show more button on rewards option page',
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
    '[RC-5377] Verify reward options when feature flag is enabled',
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
      const headers = await rewardOptionsPage.rewardsOptionsTableHeaders.allTextContents();
      expect(headers).toEqual(['Name', 'Redeemable options', 'Countries', 'Currencies', 'Status', '']);
    }
  );

  test(
    '[RC-5379] Verify rewards options when feature flag is disabled',
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
      await manageRewardsPage.page.reload();
      await manageRewardsPage.verifyPageIsNotFound();
    }
  );

  test(
    '[RC-5567] Validate user should able to deactivate the active cards',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate user should able to deactivate the active cards',
        zephyrTestId: 'RC-5567',
        storyId: 'RC-5567',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      const rewardsStorePage = new RewardsStore(recoManagerFixture.page);
      const giftCardDetails = { country: 'Turkey', name: 'A101 Turkey' };

      // Ensure card is Active before deactivation
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');

      // Now deactivate
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Inactive');

      // Verify NOT visible in Reward Store
      await rewardsStorePage.loadPage();
      await rewardsStorePage.selectCountry(giftCardDetails.country);
      await rewardsStorePage.searchForGiftCard(giftCardDetails.name);
      await rewardsStorePage.verifier.verifyTheElementIsVisible(rewardsStorePage.noRewardsFoundHeading);
      await rewardsStorePage.verifier.verifyTheElementIsVisible(rewardsStorePage.noRewardsFoundText);
    }
  );

  test(
    '[RC-5568] Validate user should able to activate the inactive cards',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate user should able to activate the inactive cards',
        zephyrTestId: 'RC-5568',
        storyId: 'RC-5568',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      const rewardsStorePage = new RewardsStore(recoManagerFixture.page);
      const giftCardDetails = { country: 'Turkey', name: 'A101 Turkey' };

      // Ensure the card is Inactive before activation
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Inactive');

      // Now activate
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');

      // Verify visible in Reward Store
      await rewardsStorePage.loadPage();
      await rewardsStorePage.selectCountry(giftCardDetails.country);
      await rewardsStorePage.searchForGiftCard(giftCardDetails.name);
      await rewardsStorePage.verifier.verifyTheElementIsVisible(rewardsStorePage.giftCardNames.first());
    }
  );

  test(
    '[RC-5433] Validate gift card on order history after user deactivate it',
    {
      tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ recoManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate gift card on order history after user deactivate it',
        zephyrTestId: 'RC-5433',
        storyId: 'RC-5433',
      });
      const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
      const rewardsStorePage = new RewardsStore(recoManagerFixture.page);
      const giftCardDetails = { country: 'United States', name: "Domino's" };

      // Navigate to the Rewards option page and check the gift card is enabled
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');

      // Redeem the gift card
      await rewardsStorePage.loadPage();
      await rewardsStorePage.verifyThePageIsLoaded();
      await rewardsStorePage.selectCountry(giftCardDetails.country);
      await rewardsStorePage.searchForGiftCard(giftCardDetails.name);
      await rewardsStorePage.clickOnTheNthGiftCard(1);
      await rewardsStorePage.rewardsDialogBox.clickOnTheCheckoutButton();
      await rewardsStorePage.rewardsDialogBox.enterTheConfirmEmail();
      await rewardsStorePage.rewardsDialogBox.checkTheTermsAndConditionCheckbox();
      await rewardsStorePage.verifier.verifyTheElementIsEnabled(rewardsStorePage.rewardsDialogBox.confirmOrder);
      await rewardsStorePage.rewardsDialogBox.clickOnConfirmOrder();

      // Navigate to Rewards option page again and deactivate the gift card
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Inactive');

      // Go to the Order History page and validate order for gift card
      await rewardsStorePage.visit();
      await rewardsStorePage.verifyThePageIsLoaded();
      await rewardsStorePage.visitTheOrderHistory();
      await rewardsStorePage.verifier.verifyTheElementIsVisible(rewardsStorePage.orderHistoryPanel.first());
      await rewardsStorePage.verifier.verifyTheElementIsVisible(
        rewardsStorePage.orderHistoryPanel.first().locator(`img[alt^="${giftCardDetails.name}"]`)
      );
      await rewardsStorePage.verifier.verifyElementContainsText(
        rewardsStorePage.orderHistoryPanelRewardName.first(),
        giftCardDetails.name
      );
      await rewardsStorePage.verifier.verifyTheElementIsVisible(
        rewardsStorePage.orderHistoryPanelRewardResendButton.first()
      );
      await rewardsStorePage.validateTheOrderHistoryElements();
      await rewardsStorePage.clickOnTheResendButton(1);
      await rewardsStorePage.clickOnTheCancelButtonInResendReward();
      await rewardsStorePage.clickOnTheResendButton(1);
      await rewardsStorePage.enterAllTheDetailsAndClickOnResend('sonu.kumar+12@simmplr.com');
      await rewardsStorePage.validateTheResentConfirmation();

      // Navigate to the Rewards option page and Set the Active again for the gift card
      await rewardOptionsPage.setGiftCardState(rewardOptionsPage, giftCardDetails.name, 'Active');
    }
  );

  const giftCards = [
    { country: 'Turkey', name: 'A101 Turkey', visibility: 'Active' },
    { country: 'Turkey', name: 'A101 Turkey', visibility: 'Inactive' },
  ];
  for (const giftCard of giftCards) {
    test(
      `Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
      { tag: [REWARD_FEATURE_TAGS.REWARD_OPTIONS, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE] },
      async ({ recoManagerFixture }) => {
        tagTest(test.info(), {
          description: `RC-5565, RC-5376 - Gift card should ${giftCard.visibility === 'Active' ? 'be visible' : 'not be visible'} when set to ${giftCard.visibility}`,
          zephyrTestId: giftCard.visibility === 'Active' ? 'RC-5565' : 'RC-5376',
          storyId: 'RC-5251',
        });
        const manageRewardsPage = new ManageRewardsOverviewPage(recoManagerFixture.page);
        const rewardOptionsPage = new RewardOptionsPage(recoManagerFixture.page);
        const rewardsStorePage = new RewardsStore(recoManagerFixture.page);

        await manageRewardsPage.loadPage();
        await manageRewardsPage.verifyThePageIsLoaded();
        expect(await manageRewardsPage.fetchKeyValueFromHarnessResponse('reward_options')).toBeTruthy();

        await rewardOptionsPage.setGiftCardState(
          rewardOptionsPage,
          giftCard.name,
          giftCard.visibility as 'Active' | 'Inactive'
        );

        await rewardsStorePage.loadPage();
        await rewardsStorePage.selectCountry(giftCard.country);
        await rewardsStorePage.searchForGiftCard(giftCard.name);
        await rewardsStorePage.verifyGiftCardVisibility(giftCard.name, giftCard.visibility as 'Active' | 'Inactive');
      }
    );
  }
});
