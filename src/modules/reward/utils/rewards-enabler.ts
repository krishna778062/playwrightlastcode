import { Page, test } from '@playwright/test';
import { ManageRewardsOverviewPage } from '@rewards-pages/manage-rewards/manage-rewards-overview-page';

/**
 * Configuration options for enabling rewards and peer gifting
 */
export interface RewardsConfigOptions {
  /** API endpoint to check the current state */
  apiEndpoint: string;
  /** Path to extract enabled and peerGiftingEnabled from API response */
  responsePath: {
    enabled: string;
    peerGiftingEnabled: string;
  };
  /** Action to trigger the API call */
  triggerAction: () => Promise<void>;
  /** Action to return to the original page after enabling */
  returnAction: () => Promise<void>;
  /** Optional: only enable if needed (for reward store) */
  conditionalCheck?: boolean;
}

/**
 * Utility class for enabling rewards and peer gifting across different contexts
 */
export class RewardsEnabler {
  constructor(private page: Page) {}

  /**
   * Unified function to enable rewards and peer gifting if disabled
   * @param options Configuration options for the specific context
   */
  async enableRewardsAndPeerGiftingIfDisabled(options: RewardsConfigOptions): Promise<void> {
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        res => res.url().includes(options.apiEndpoint) && res.status() === 200 && res.request().method() === 'GET'
      ),
      this.page.waitForLoadState('domcontentloaded'),
      options.triggerAction(), // action that triggers API
    ]);

    console.log('Status:', apiResponse.status(), 'URL:', apiResponse.url());
    const body = await apiResponse.json();
    console.log(`${options.apiEndpoint} Response is:\n${JSON.stringify(body, null, 2)}`);

    // Extract values using the provided paths
    const isRewardEnabled = this.extractValueFromPath(body, options.responsePath.enabled);
    const isPeerGiftingDisabled = this.extractValueFromPath(body, options.responsePath.peerGiftingEnabled);

    console.log(
      `${test.info().title}: Rewards Enabled: ${isRewardEnabled}, Peer Gifting Enabled: ${isPeerGiftingDisabled}`
    );

    // Apply conditional check if specified (for reward store)
    if (options.conditionalCheck && isRewardEnabled && isPeerGiftingDisabled) {
      console.log('Both rewards and peer gifting are already enabled, skipping enablement.');
      return;
    }

    // Enable rewards and peer gifting if needed
    await this.checkTheRewardsIsEnabled(isRewardEnabled, isPeerGiftingDisabled);

    // Return to the original page
    await options.returnAction();
  }

  /**
   * Extract value from nested object using dot notation path
   * @param obj The object to extract from
   * @param path The dot notation path (e.g., 'rewardConfig.enabled')
   */
  private extractValueFromPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Check and enable rewards and peer gifting based on current state
   * This is the core logic that was duplicated across all three functions
   */
  private async checkTheRewardsIsEnabled(isRewardEnabled: boolean, isPeerGiftingDisabled: boolean): Promise<void> {
    const manageRewardsPage = new ManageRewardsOverviewPage(this.page);

    if (!isRewardEnabled && !isPeerGiftingDisabled) {
      // Both disabled: Enable peer gifting first, then rewards
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();

      // Enable peer gifting
      const isPeerGiftingToggleOff = await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.isChecked();
      if (!isPeerGiftingToggleOff) {
        await manageRewardsPage.peerGifting.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
          stepInfo: 'Enabling peer gifting toggle',
        });
      }
      await manageRewardsPage.peerGifting.saveButton.waitFor({ state: 'attached', timeout: 15000 });
      await manageRewardsPage.peerGifting.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking save button',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

      // Now enable rewards
      await manageRewardsPage.loadPage();
      await manageRewardsPage.enableRewardsButton.waitFor({ state: 'visible', timeout: 15000 });
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Enabling rewards',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await manageRewardsPage.verifier.verifyElementHasText(manageRewardsPage.rewardsTabHeading, 'Rewards overview');
    } else if (!isRewardEnabled && isPeerGiftingDisabled) {
      // Only rewards disabled: Enable rewards only
      await manageRewardsPage.enableRewardsButton.waitFor({ state: 'visible', timeout: 15000 });
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Enabling rewards',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await manageRewardsPage.verifier.verifyElementHasText(manageRewardsPage.rewardsTabHeading, 'Rewards overview');
    } else if (isRewardEnabled && !isPeerGiftingDisabled) {
      // Only peer gifting disabled: Enable peer gifting only
      await manageRewardsPage.peerGifting.loadPage();
      await manageRewardsPage.peerGifting.verifyThePageIsLoaded();

      const isPeerGiftingToggleOff = await manageRewardsPage.peerGifting.peerGiftingToggleSwitch.isChecked();
      if (!isPeerGiftingToggleOff) {
        await manageRewardsPage.peerGifting.clickOnElement(manageRewardsPage.peerGifting.peerGiftingToggleSwitch, {
          stepInfo: 'Enabling peer gifting toggle',
        });
      }
      await manageRewardsPage.peerGifting.clickOnElement(manageRewardsPage.peerGifting.saveButton, {
        stepInfo: 'Clicking save button',
      });
      await manageRewardsPage.peerGifting.selectThePeerGiftingEnableType('Immediately');
      await manageRewardsPage.peerGifting.clickOnElement(manageRewardsPage.peerGifting.grantAllowancesConfirmButton, {
        stepInfo: 'Confirming grant allowances',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    } else if (isRewardEnabled && isPeerGiftingDisabled) {
      // Both are already enabled, do nothing
      console.log('Reward and Gifting is enabled.');
    }
  }
}
