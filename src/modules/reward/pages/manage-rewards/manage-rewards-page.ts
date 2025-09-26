import { Locator, Page, Response } from '@playwright/test';

import { PAGE_ENDPOINTS, PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class ManageRewardsPage extends BasePage {
  readonly manageRewardsPageContainer: Locator;
  readonly manageRewardsPageNotFound: Locator;
  readonly rewardsOverviewDescriptionText: Locator;
  readonly rewardTerminologyButton: Locator;
  readonly rewardsTabHeading: Locator;
  readonly enableRewardsButton: Locator;
  readonly disableRewardLink: Locator;
  readonly disableRewardContainer: Locator;
  readonly disableRewardH1Text: Locator;
  readonly disableRewardText: Locator;
  readonly disableRewardButton: Locator;
  public harnessFlagResponse: Response | undefined;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.manageRewardsPageContainer = this.page.locator('div[class*="TypographyBody-module"]');
    this.manageRewardsPageNotFound = this.page.getByTestId('no-results');
    this.rewardTerminologyButton = this.page.locator('button[aria-label="Insight"]');
    this.rewardsOverviewDescriptionText = this.manageRewardsPageContainer.locator('p');

    // Enable/Disable rewards locators
    this.rewardsTabHeading = this.page.locator('h2[class*="Typography-module__heading1"]');
    this.enableRewardsButton = this.page.locator('button[aria-label="Enable rewards"]');
    this.disableRewardLink = this.page.locator('a[href="/manage/recognition/rewards/disable-rewards"]');
    this.disableRewardContainer = this.page.locator('div[class*="Rewards_content"]');
    this.disableRewardH1Text = this.disableRewardContainer.getByRole('button', {
      name: 'Disable rewards',
      exact: true,
    });
    this.disableRewardText = this.disableRewardContainer.locator('[class*="TypographyBody-module__wrapper"] p');
    this.disableRewardButton = this.disableRewardContainer.locator('form > button[data-state="closed"]');
  }

  async loadPage(): Promise<void> {
    const apiUrlPattern = /\/api\/1\.0\/client\/env\/.*\/target\/.*\/evaluations\?cluster=2/;
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => apiUrlPattern.test(resp.url()) && resp.status() === 200, {
        timeout: TIMEOUTS.SHORT,
      }),
      await this.page.goto(rewardsEndpoint.MANAGE_REWARDS_PAGE),
    ]);
    this.harnessFlagResponse = response;
  }

  async fetchKeyValueFromHarnessResponse(targetKey: string): Promise<string | null> {
    if (this.harnessFlagResponse === undefined) {
      await this.setTheHarnessResponseAfterPageReload();
    }
    const json = await this.harnessFlagResponse?.json();
    const match = json.find((item: any) => item.flag === targetKey);
    return match?.kind === 'boolean' ? (match.value === 'true' ? 'true' : 'false') : (match?.value ?? null);
  }

  async hasManageRecognitionPermission(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser?.permissions?.includes('recognition_admin_tool');
    });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardTerminologyButton, {
      assertionMessage: 'Verify the rewards overview description text is visible',
    });
  }

  async verifyPageIsNotFound(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageRewardsPageNotFound, {
      assertionMessage: 'Verify the Manage Reward page is visible',
    });
  }

  async setTheHarnessResponseAfterPageReload(): Promise<void> {
    const apiUrlPattern = /\/api\/1\.0\/client\/env\/.*\/target\/.*\/evaluations\?cluster=2/;
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => apiUrlPattern.test(resp.url()) && resp.status() === 200),
      this.page.reload(),
      this.verifyThePageIsLoaded(),
    ]);
    this.harnessFlagResponse = response;
  }

  async disableTheRewards(): Promise<void> {
    await this.clickOnElement(this.disableRewardLink, {
      stepInfo: 'Clicking on disable rewards link',
    });
    await this.verifier.waitUntilElementIsVisible(this.disableRewardButton);
    await this.clickOnElement(this.disableRewardButton, {
      stepInfo: 'Clicking on disable rewards button',
    });

    // Handle the confirmation dialog
    const dialogBox = this.page.locator('[role="dialog"]');
    await this.verifier.waitUntilElementIsVisible(dialogBox);

    const confirmInput = dialogBox.locator('input[type="text"]');
    await this.fillInElement(confirmInput, 'confirm', {
      stepInfo: 'Filling confirm text in dialog',
    });

    const confirmButton = dialogBox.locator('button[type="submit"]');
    await this.clickOnElement(confirmButton, {
      stepInfo: 'Clicking confirm button in dialog',
    });

    await this.verifyToastMessage('Rewards disabled');
    await this.verifier.waitUntilElementIsVisible(this.rewardsTabHeading);
  }
}
