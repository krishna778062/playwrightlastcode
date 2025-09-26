import { rewardTestFixture as test } from '@rewards/fixtures/rewardFixture';

import { TestPriority } from '@core/constants/testPriority';
import { TestGroupType } from '@core/constants/testType';
import { tagTest } from '@core/utils/testDecorator';
import { REWARD_SUITE_TAGS } from '@modules/reward/constants/testTags';
import { ManageRewardsPage } from '@modules/reward/pages/manage-rewards/manage-rewards-page';

test.describe('Enable Rewards flow', { tag: [REWARD_SUITE_TAGS.REGRESSION_TEST] }, () => {
  test.only(
    'Validate Enable rewards flow',
    {
      tag: [REWARD_SUITE_TAGS.REGRESSION_TEST, TestPriority.P0, TestGroupType.SMOKE],
    },
    async ({ appManagerPage }) => {
      tagTest(test.info(), {
        description: 'Validate Enable rewards flow',
        zephyrTestId: 'RC-3014',
        storyId: 'RC-3014',
      });
      const manageRewardsPage = new ManageRewardsPage(appManagerPage);
      await manageRewardsPage.loadPage();
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
        await manageRewardsPage.verifyToastMessage('Rewards enabled');
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
        await manageRewardsPage.verifyToastMessage('Rewards enabled');
        await manageRewardsPage.verifier.verifyElementHasText(manageRewardsPage.rewardsTabHeading, 'Rewards overview');
      }
    }
  );
});
