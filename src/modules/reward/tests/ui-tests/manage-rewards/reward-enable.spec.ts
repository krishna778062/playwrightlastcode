import { REWARD_FEATURE_TAGS } from '@rewards/constants/testTags';
import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';
import { ManageRewardsOverviewPage } from '@rewards/pages/manage-rewards/manage-rewards-overview-page';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';

test.describe('enable Rewards flow', () => {
  test(
    'validate Enable rewards flow',
    {
      tag: [TestGroupType.REGRESSION, REWARD_FEATURE_TAGS.ENABLE_REWARD, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerFixture }) => {
      tagTest(test.info(), {
        description: 'Validate Enable rewards flow',
        zephyrTestId: 'RC-3014',
        storyId: 'RC-3014',
      });
      const manageRewardsPage = new ManageRewardsOverviewPage(appManagerFixture.page);
      await manageRewardsPage.loadPageWithHarness();
      await manageRewardsPage.verifyThePageIsLoaded();

      const isEnableRewardButtonDisplayed = await manageRewardsPage.verifier.isTheElementVisible(
        manageRewardsPage.disableRewardLink,
        { timeout: 10000 }
      );

      if (!isEnableRewardButtonDisplayed) {
        // Scenario 1: Rewards are already turn off → Enable directly
        await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
          stepInfo: 'Clicking on enable rewards button',
        });
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
        await manageRewardsPage.verifier.verifyElementHasText(manageRewardsPage.rewardsTabHeading, 'Rewards overview');
      } else {
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.disableRewardLink);
        await manageRewardsPage.disableTheRewards();
        await manageRewardsPage.verifier.waitUntilElementIsVisible(manageRewardsPage.rewardsTabHeading);

        // Enable again
        await manageRewardsPage.page.reload();
        await manageRewardsPage.verifier.verifyTheElementIsVisible(manageRewardsPage.enableRewardsButton);
        await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
          stepInfo: 'Clicking on enable rewards button after reload',
        });
        await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
        await manageRewardsPage.verifier.verifyElementHasText(manageRewardsPage.rewardsTabHeading, 'Rewards overview');
      }
    }
  );
});
