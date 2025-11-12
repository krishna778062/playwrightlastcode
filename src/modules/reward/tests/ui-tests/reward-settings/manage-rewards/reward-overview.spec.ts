import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

import { tagTest, TestGroupType, TestPriority } from '@/src/core';

test(
  '[RC-3094] Validate tooltips on Rewards Overview Points Balance summary tile component',
  {
    tag: [REWARD_FEATURE_TAGS.REWARD_OVERVIEW, TestGroupType.REGRESSION, TestPriority.P0, TestGroupType.SMOKE],
  },
  async ({ appManagerFixture }) => {
    tagTest(test.info(), {
      description: 'Validate tooltips on Rewards Overview Points Balance summary tile component',
      zephyrTestId: 'RC-3094',
      storyId: 'RC-3094',
    });
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(appManagerFixture.page);
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
    await manageRewardsOverviewPage.peerGifting.enableThePeerGifting('Immediately');
  }
);
