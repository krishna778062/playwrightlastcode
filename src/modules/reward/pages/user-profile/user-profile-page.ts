import { expect, Locator, Page } from '@playwright/test';

import { TopNavBarComponent } from '@core/components/topNavBarComponent';
import { BasePage } from '@core/pages/basePage';

export class UserProfilePage extends BasePage {
  mockAppConfigLanguage(page: Page, arg1: number) {
    throw new Error('Method not implemented.');
  }
  restoreAppConfigMock(page: Page) {
    throw new Error('Method not implemented.');
  }
  // Components
  readonly topNavBarComponent: TopNavBarComponent;

  // User profile page locators
  readonly rewardIcons: Locator;
  readonly pointsToGiveValue: Locator;
  readonly pointsToRedeemValue: Locator;
  readonly pointsRefreshingText: Locator;
  readonly viewOrderButton: Locator;
  readonly allowanceRefreshing: Locator;
  readonly allowanceRefreshingInfoIcon: Locator;
  readonly allowanceRefreshingInfoIconTooltipText: Locator;

  constructor(page: Page) {
    super(page);

    // Initialize components
    this.topNavBarComponent = new TopNavBarComponent(page);

    // User profile page locators
    this.rewardIcons = page.locator('[class*="UserProfile_rewardIcons"]');
    this.pointsToGiveValue = page.locator('[class*="UserProfile_pointsToGiveValue"]');
    this.pointsToRedeemValue = page.locator('[class*="UserProfile_pointsToRedeemValue"]');
    this.pointsRefreshingText = page.locator('[class*="UserProfile_pointsRefreshingText"]');
    this.viewOrderButton = page.locator('[class*="UserProfile_viewOrderButton"]');
    this.allowanceRefreshing = page.locator('[class*="UserProfile_allowanceRefreshing"]');
    this.allowanceRefreshingInfoIcon = page.locator('[class*="UserProfile_allowanceRefreshingInfoIcon"]');
    this.allowanceRefreshingInfoIconTooltipText = page.locator(
      '[class*="UserProfile_allowanceRefreshingInfoIconTooltipText"]'
    );
  }

  /**
   * Validates that the View Order button is visible
   */
  async validateTheViewOrderButton(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.viewOrderButton);
  }

  /**
   * Clicks on the View Orders button
   */
  async clickOnTheViewOrders(): Promise<void> {
    await this.clickOnElement(this.viewOrderButton);
  }

  /**
   * Navigates to the current user's profile page
   */
  async navigateToCurrentUserProfile(): Promise<void> {
    await this.topNavBarComponent.clickOnElement(this.topNavBarComponent.profileSettingsButton);
    // This would need to be implemented based on the actual UI flow
    // For now. we'll navigate directly to a profile URL
    await this.page.goto('/profile');
  }

  /**
   * Verifies the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardIcons.first());
  }

  /**
   * Navigate to user profile and capture wallet data
   */
  async navigateToUserProfileAndCaptureWalletData(): Promise<any> {
    const [walletResponse] = await Promise.all([
      this.page.waitForResponse(
        resp => !!(resp.url().match(/\/recognition\/rewards\/users\/.*\/wallet/) && resp.status() === 200)
      ),
      this.navigateToCurrentUserProfile(),
    ]);
    await walletResponse.body();
    expect(walletResponse.status()).toBe(200);
    const walletData = await walletResponse.json();
    console.log('Wallet Data:', walletData);
    return walletData;
  }

  /**
   * Validate wallet data structure
   */
  async validateWalletDataStructure(walletData: any): Promise<void> {
    expect(walletData).toBeDefined();
    expect(walletData.result.gifting.available).toBeDefined();
    expect(walletData.result.redeemable.available).toBeDefined();
    expect(walletData.result.redeemed.available).toBeDefined();
  }

  /**
   * Validate wallet data in UI
   */
  async validateWalletDataInUI(walletData: any): Promise<void> {
    await this.rewardIcons.first().waitFor({ state: 'visible' });
    await expect(this.rewardIcons).toHaveCount(2);
    await this.verifier.verifyTheElementIsVisible(this.pointsToGiveValue);
    const pointsToGiveText = (await this.pointsToGiveValue.textContent()) || '';
    expect(pointsToGiveText.toLocaleString()).toContain(
      String(walletData.result.gifting.available.toLocaleString()).toLocaleString()
    );
    await this.verifier.verifyTheElementIsVisible(this.pointsToRedeemValue);
    const pointsToRedeemText = (await this.pointsToRedeemValue.textContent()) || '';
    expect(pointsToRedeemText.toLocaleString()).toContain(
      String(walletData.result.redeemable.available.toLocaleString()).toLocaleString()
    );
    if (Number(walletData.result.redeemed.available) > 0) {
      await this.validateTheViewOrderButton();
    }
    const userTimeZone = await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser?.timezoneIso;
    });

    const date = new Date(walletData.result.gifting.refreshingAt);
    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: userTimeZone,
    });
    expect(`Refreshing ${formatted}`).toContain((await this.pointsRefreshingText.textContent()) || '');
  }

  /**
   * Validate zero values on the page
   */
  async validateZeroValuesOnPage(): Promise<void> {
    await this.page.route('**/recognition/rewards/users/**/wallet', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            gifting: {
              pendingIn: 0,
              available: 0,
              refreshingAt: '2025-08-01T00:00:00.000Z',
            },
            redeemable: {
              pendingIn: 0,
              available: 0,
            },
            redeemed: {
              pendingIn: 0,
              available: 0,
            },
          },
        }),
      })
    );

    await this.page.reload();
    await this.pointsToGiveValue.waitFor({ state: 'attached', timeout: 15000 });
    const pointsToGiveText = (await this.pointsToGiveValue.textContent()) || '';
    expect(pointsToGiveText).toContain(String(0));
    const pointsToRedeemText = (await this.pointsToRedeemValue.textContent()) || '';
    expect(pointsToRedeemText).toContain(String(0));
    const expectedText = [`Refreshing Aug 1`, `Refreshing Aug 2`, `Refreshing Jul 31`];
    const actualText = (await this.pointsRefreshingText.textContent()) || '';
    expect(expectedText).toContain(actualText);
  }

  /**
   * Validate allowance refreshing tooltip
   */
  async validateAllowanceRefreshingTooltip(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.allowanceRefreshing);
    await this.verifier.verifyTheElementIsVisible(this.allowanceRefreshingInfoIcon);
    await this.clickOnElement(this.allowanceRefreshingInfoIcon);
    await this.verifier.verifyTheElementIsVisible(this.allowanceRefreshingInfoIconTooltipText);
    await this.verifier.verifyElementHasText(
      this.allowanceRefreshingInfoIconTooltipText,
      'Your monthly allowance is refreshing and will be available soon'
    );
    await this.allowanceRefreshingInfoIcon.click({ force: true });
  }
}
