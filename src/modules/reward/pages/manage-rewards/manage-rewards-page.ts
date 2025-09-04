import { Locator, Page, Response } from '@playwright/test';

import { PAGE_ENDPOINTS, PAGE_ENDPOINTS as rewardsEndpoint } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class ManageRewardsPage extends BasePage {
  readonly manageRewardsPageContainer: Locator;
  readonly manageRewardsPageNotFound: Locator;
  readonly rewardsOverviewDescriptionText: Locator;
  public harnessFlagResponse: Response | undefined;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);
    // Initialize locators - these would need to be updated based on actual DOM structure
    this.manageRewardsPageContainer = this.page.locator('div[class*="TypographyBody-module"]');
    this.manageRewardsPageNotFound = this.page.getByTestId('no-results');
    this.rewardsOverviewDescriptionText = this.manageRewardsPageContainer.locator('p');
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
    await this.verifier.verifyTheElementIsVisible(this.rewardsOverviewDescriptionText.last(), {
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
}
