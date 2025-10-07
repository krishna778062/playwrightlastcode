import { expect, Locator, Page, Response, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { RewardsPeerGifting } from '@modules/reward/components/manage-rewards/rewards-peer-gifting';

export class ManageRewardsOverviewPage extends BasePage {
  // Components
  readonly peerGifting: RewardsPeerGifting;

  // Page container and not found
  readonly manageRewardsPageContainer: Locator;
  readonly manageRewardsPageNotFound: Locator;
  public harnessFlagResponse: Response | undefined;

  // Reward Terminology
  readonly rewardsTabHeading: Locator;
  readonly enableRewardsButton: Locator;
  readonly insightBulbButton: Locator;
  readonly rewardTerminologyButton: Locator;
  readonly insightModalContainer: Locator;
  readonly rewardsTerminologyHeading: Locator;
  readonly rewardsTerminologyCloseButton: Locator;
  readonly rewardTerminologySubHeadings: Locator;
  readonly rewardTerminologySubHeadingsDescription: Locator;
  readonly tooltipText: Locator;

  // Sidebar menu
  readonly sideBarMenuList: Locator;

  // Reward container
  readonly rewardContainer: Locator;
  readonly rewardsOverviewDescriptionText: Locator;

  // Summary tile
  readonly summaryTiles: Locator;
  private summaryTilePElements: Locator;
  private monthSpendToDateInfoIcon: Locator;
  private annualBudgetBalanceInfoIcon: Locator;
  readonly pointBalanceSummaryAllowanceInfoIcon: Locator;
  readonly pointBalanceSummaryUserAllowanceInfoIcon: Locator;
  readonly pointBalanceSummaryAllowancePoints: Locator;
  readonly budgetSummaryTileContainer: Locator;
  readonly budgetSummaryHeadingIcon: Locator;
  readonly budgetSummaryHeadingText: Locator;
  readonly budgetSummaryMonthlySpendToDateLabel: Locator;
  readonly budgetSummaryMonthlySpendToDateValue: Locator;
  readonly budgetSummaryAnnualBudgetBalanceLabel: Locator;
  readonly budgetSummaryAnnualBudgetBalanceValue: Locator;
  readonly budgetSummaryActionBarButton: Locator;
  readonly pointBalanceSummaryContainer: Locator;
  readonly pointBalanceSummaryHeadingIcon: Locator;
  readonly pointBalanceSummaryHeadingText: Locator;
  readonly pointBalanceSummaryAllowanceLabel: Locator;
  readonly pointBalanceSummaryAllowanceValue: Locator;
  readonly pointBalanceSummaryUserAllowanceLabel: Locator;
  readonly pointBalanceSummaryUserAllowanceValue: Locator;
  readonly pointBalanceSummaryTooltipText: Locator;
  readonly pointBalanceSummaryActionBar: Locator;
  readonly pointBalanceSummaryActionBarLabel: Locator;
  readonly pointBalanceSummaryActionBarInfoIcon: Locator;
  readonly pointBalanceSummaryActionBarButton: Locator;

  readonly exceedBudgetIcon: Locator;
  readonly exceedBudgetHeadingText: Locator;
  readonly exceedBudgetDescriptionText: Locator;
  readonly exceedBudgetWarningPanel: Locator;

  // Activity Container
  readonly activityContainer: Locator;
  readonly activityPanelHeader: Locator;
  readonly activityPanelLastUpdatedText: Locator;
  readonly activityPanelLastUpdatedInfoIcon: Locator;
  readonly activityPanelFiltersButton: Locator;
  readonly activityPanelFiltersButtonText: Locator;
  readonly activityTableDownloadCSVButton: Locator;
  readonly activityTableNoResultHeading: Locator;
  readonly activityTableNoResultText: Locator;
  readonly activityPanelTableHeader: Locator;
  readonly activityPointsGivenTable: Locator;
  readonly activityPointsRedeemTable: Locator;
  readonly activityPanelTableSortableHeader: Locator;
  readonly activityPanelTableSortableHeaderText: Locator;
  readonly activityPanelTableShowMoreButton: Locator;
  readonly activityPanelTableRows: Locator;
  readonly activityPanelTableViewRecognitionItems: Locator;
  readonly viewRecognitionDropdown: Locator;
  readonly viewRecognitionDropdownLink: Locator;
  readonly viewRecognitionDropdownText: Locator;

  // Disable rewards
  readonly disableRewardLink: Locator;
  readonly disableRewardContainer: Locator;
  readonly disableRewardH1Text: Locator;
  readonly disableRewardText: Locator;
  readonly disableRewardButton: Locator;

  // Tab locators
  readonly rewardsTab: Locator;

  // Dialog box
  private readonly dialogBox: Locator;
  private readonly confirmInput: Locator;
  private readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);

    // Initialize components
    this.peerGifting = new RewardsPeerGifting(page);

    // Page container and not found
    this.manageRewardsPageContainer = page.locator('div[class*="TypographyBody-module"]');
    this.manageRewardsPageNotFound = page.getByTestId('no-results');

    // Locators for the Rewards Overview page
    this.rewardsTab = page.getByRole('tab', { name: 'Rewards', exact: true });
    this.rewardsTabHeading = page.locator('h2[class*="Typography-module__heading1"]');
    this.enableRewardsButton = page.locator('button[aria-label="Enable rewards"]');
    this.insightBulbButton = page.getByRole('button', { name: 'Insight' });
    this.rewardTerminologyButton = page.locator('button[aria-label="Insight"]');
    this.insightModalContainer = page.locator('[id*="tippy"]');
    this.rewardsTerminologyHeading = this.insightModalContainer.getByRole('heading', { name: 'Rewards terminology' });
    this.rewardsTerminologyCloseButton = this.insightModalContainer.getByRole('button', { name: 'Close' });
    this.rewardTerminologySubHeadings = this.insightModalContainer.getByRole('heading', { level: 4 });
    this.rewardTerminologySubHeadingsDescription = this.insightModalContainer.locator('p');

    // Sidebar menu
    this.sideBarMenuList = page.locator('div[class*="Rewards_sidebar"] a');

    // Reward Description
    this.rewardContainer = page.locator('div[class*="TypographyBody-module"]');
    this.rewardsOverviewDescriptionText = this.rewardContainer.locator('p');

    // Summary Tile container
    this.summaryTiles = page.locator('div[class*="SummaryPanel_summaryPanel"]');
    this.summaryTilePElements = this.summaryTiles.locator('p');
    this.monthSpendToDateInfoIcon = page.locator('[aria-label="Monthly spend information"]');
    this.annualBudgetBalanceInfoIcon = page.locator('[aria-label="Budget balance information"]');
    this.pointBalanceSummaryAllowancePoints = this.summaryTilePElements.nth(5);
    this.budgetSummaryTileContainer = page.locator(
      '//h3[text()="Budget summary"]//ancestor::div[contains(@class,"SummaryPanel_summaryPanel")]'
    );
    this.budgetSummaryHeadingIcon = this.budgetSummaryTileContainer.locator('[data-testid="i-coinsStackedWithFile"]');
    this.budgetSummaryHeadingText = this.budgetSummaryTileContainer.locator('h3[class*="Typography-module__heading2"]');
    this.budgetSummaryMonthlySpendToDateLabel = this.budgetSummaryTileContainer.locator(
      'p[class*="Typography-module__paragraph"]:nth-child(1)'
    );
    this.budgetSummaryAnnualBudgetBalanceLabel = this.budgetSummaryTileContainer.locator(
      'p[class*="Typography-module__paragraph"]:nth-child(2)'
    );
    this.budgetSummaryMonthlySpendToDateValue = this.budgetSummaryTileContainer.locator(
      'p[class*="Typography-module__reportingSmall"]'
    );
    this.budgetSummaryAnnualBudgetBalanceValue = this.budgetSummaryTileContainer.locator(
      'p[class*="Typography-module__reportingSmall"]'
    );
    this.budgetSummaryActionBarButton = this.budgetSummaryTileContainer.locator(
      '[class*="SummaryPanel_actionBarButton"] button'
    );

    // Point balance summary
    this.pointBalanceSummaryContainer = page.locator(
      '//h3[text()="Point balance summary"]//ancestor::div[contains(@class,"SummaryPanel_summaryPanel")]'
    );
    this.pointBalanceSummaryHeadingIcon = this.pointBalanceSummaryContainer.locator('[data-testid="i-coinsStacked"]');
    this.pointBalanceSummaryHeadingText = this.pointBalanceSummaryContainer.locator(
      'h3[class*="Typography-module__heading2"]'
    );
    this.pointBalanceSummaryAllowanceLabel = this.pointBalanceSummaryContainer
      .locator('p[class*="Typography-module__paragraph"]')
      .first();
    this.pointBalanceSummaryUserAllowanceLabel = this.pointBalanceSummaryContainer
      .locator('p[class*="Typography-module__paragraph"]')
      .last();
    this.pointBalanceSummaryAllowanceValue = this.pointBalanceSummaryContainer
      .locator('p[class*="Typography-module__reportingSmall"]')
      .first();
    this.pointBalanceSummaryUserAllowanceValue = this.pointBalanceSummaryContainer
      .locator('p[class*="Typography-module__reportingSmall"]')
      .last();
    this.pointBalanceSummaryAllowanceInfoIcon = this.pointBalanceSummaryContainer.locator(
      '[aria-label="Allowances information"]'
    );
    this.pointBalanceSummaryUserAllowanceInfoIcon = this.pointBalanceSummaryContainer.locator(
      '[aria-label="User wallets points information"]'
    );
    this.pointBalanceSummaryTooltipText = this.insightModalContainer.locator('p');
    this.pointBalanceSummaryActionBar = this.pointBalanceSummaryContainer.locator(
      'div[class*="SummaryPanel_actionBar"]'
    );
    this.pointBalanceSummaryActionBarLabel = this.pointBalanceSummaryActionBar.locator(
      'span[class*="Typography-module__secondary"]'
    );
    this.pointBalanceSummaryActionBarInfoIcon = this.pointBalanceSummaryActionBar.locator(
      '[aria-label="Currency conversion information"]'
    );
    this.pointBalanceSummaryActionBarButton = this.pointBalanceSummaryActionBar.locator(
      'a[href*="/manage/recognition/rewards/peer-gifting"]'
    );

    // Exceed Budget
    this.exceedBudgetIcon = page.locator('div[class*="Panel-module__panel"] i[data-testid="i-warningCircle"]');
    this.exceedBudgetHeadingText = page.locator(
      'div[class*="Panel-module__panel"] div>p[class*="Typography-module__paragrap"]:nth-child(1)'
    );
    this.exceedBudgetDescriptionText = page
      .locator('div[class*="Panel-module__panel"] div>p[class*="Typography-module__paragrap"]:nth-child(2)')
      .nth(0);
    this.exceedBudgetWarningPanel = page.locator('div[class*="SummaryPanel_hasWarning"]');

    // Activity Container
    this.activityContainer = page.locator('div[class*="Panel-module__panel"]');
    this.activityPanelHeader = this.activityContainer.getByRole('heading', { level: 3 });
    this.activityPanelLastUpdatedText = this.activityContainer.locator('h3+div span');
    this.activityPanelLastUpdatedInfoIcon = this.activityContainer.getByRole('button', {
      name: 'Activity update time',
    });
    this.activityPanelFiltersButton = this.activityContainer.locator('div[class^="Activity_filters"] input');
    this.activityPanelFiltersButtonText = this.activityContainer.locator(
      'div[class^="Activity_filters"] input + div span'
    );
    this.activityPointsGivenTable = this.activityContainer.locator(
      'div[class*="Activity_filters"] input[type="radio"][id="categoryRECOGNITION_PEER_GIFTING"]'
    );
    this.activityPointsRedeemTable = this.activityContainer.locator(
      'div[class*="Activity_filters"] input[type="radio"][id="categoryREDEMPTION"]'
    );
    this.activityPanelTableHeader = this.activityContainer.locator('table th');
    this.activityPanelTableSortableHeader = this.activityContainer.locator('table th button');
    this.activityPanelTableSortableHeaderText = this.activityContainer.locator('table th button > div');
    this.tooltipText = page.locator('[id^="tippy-"] p');
    this.activityTableNoResultHeading = this.activityContainer.locator(
      '[class*="Activity_container"] h3[class*="Typography-module__heading3"]'
    );
    this.activityTableNoResultText = this.activityContainer.locator(
      '[class*="Activity_container"] p[class*="Typography-module__paragraph"]'
    );
    this.activityTableDownloadCSVButton = this.activityContainer.locator('//button/div[text()="Download CSV"]');
    this.activityPanelTableShowMoreButton = this.activityContainer.locator(
      '//button[@type="button" and text()="Show more"]'
    );
    this.activityPanelTableRows = this.activityContainer.locator('div[class*="Activity_filters"]+div tbody > tr');
    this.activityPanelTableViewRecognitionItems = this.activityContainer.locator(
      'div[class*="Activity_filters"]+div tbody > tr:nth-child(1) > td'
    );
    this.viewRecognitionDropdown = this.page.locator('div[data-radix-popper-content-wrapper]');
    this.viewRecognitionDropdownLink = this.viewRecognitionDropdown.locator('[role="menuitem"]');
    this.viewRecognitionDropdownText = this.viewRecognitionDropdown.locator(
      '[class*="DropdownMenu-module__DropdownMenuItemLabel"]'
    );

    // Disable rewards
    this.disableRewardLink = this.page.locator('a[href="/manage/recognition/rewards/disable-rewards"]');
    this.disableRewardContainer = this.page.locator('div[class*="Rewards_content"]');
    this.disableRewardH1Text = this.disableRewardContainer.getByRole('button', {
      name: 'Disable rewards',
      exact: true,
    });
    this.disableRewardText = this.disableRewardContainer.locator('[class*="TypographyBody-module__wrapper"] p');
    this.disableRewardButton = this.disableRewardContainer.locator('form > button[data-state="closed"]');

    // Dialog box
    this.dialogBox = this.page.locator('[role="dialog"]');
    this.confirmInput = this.dialogBox.locator('input[type="text"]');
    this.confirmButton = this.dialogBox.getByRole('button', { name: 'Disable' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardsTabHeading, {
      assertionMessage: 'Verify the Rewards Overview page is loaded',
    });
  }

  async clickOnPointBalanceSummaryTheAllowanceInfoIcon() {
    await this.clickOnElement(this.pointBalanceSummaryAllowanceInfoIcon, {
      stepInfo: 'Clicking on Allowances info icon',
    });
  }

  async clickOnPointBalanceSummaryTheUserWalletInfoIcon() {
    await this.clickOnElement(this.pointBalanceSummaryUserAllowanceInfoIcon, {
      stepInfo: 'Clicking on User Wallet info icon',
    });
  }

  async clickOnPointBalanceSummaryThePointConversionIcon() {
    await this.clickOnElement(this.pointBalanceSummaryActionBarInfoIcon, {
      stepInfo: 'Clicking on Point Conversion info icon',
    });
  }

  async mockTheBudgetApiResponse() {
    await this.page.route('**/recognition/admin/rewards/analytics/budget', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            monthlySpentUsdAmount: 1378.93,
            monthlySpentUsdAmountCents: 137893,
            budgetBalanceDetails: {
              totalBudgetUsdAmountCents: 137900,
              totalBudgetUsdAmount: 1379,
              remainingBudgetUsdAmountCents: -7,
              remainingBudgetUsdAmount: -0.07,
              budgetFrequency: 'ANNUAL',
              nextBudgetRefreshAt: '2026-06-01T00:00:00.000Z',
            },
          },
        }),
      })
    );
    await this.page.reload();
  }

  async enableTheRewardsAndPeerGiftingIfDisabled(): Promise<void> {
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        res =>
          res.url().includes('/recognition/admin/rewards') && res.status() === 200 && res.request().method() === 'GET'
      ),
      this.loadPage(),
      this.rewardsTabHeading.waitFor({ state: 'visible', timeout: 15000 }),
    ]);
    console.log('Status:', apiResponse.status(), 'URL:', apiResponse.url());
    const body = await apiResponse.json();
    console.log(`/recognition/admin/rewards Response is:\n${JSON.stringify(body, null, 2)}`);
    const isRewardEnabled = body.enabled;
    const isPeerGiftingEnabled = body.peerGiftingEnabled;
    console.log(
      `${test.info().title}: Rewards Enabled: ${isRewardEnabled}, Peer Gifting Enabled: ${isPeerGiftingEnabled}`
    );

    // Enable rewards if not enabled
    if (!isRewardEnabled) {
      const isEnableButtonVisible = await this.verifier.isTheElementVisible(this.enableRewardsButton, {
        timeout: 5000,
      });
      if (isEnableButtonVisible) {
        await this.clickOnElement(this.enableRewardsButton, {
          stepInfo: 'Enabling rewards',
        });
        await this.verifyToastMessageIsVisibleWithText('Rewards enabled');
      }
    }

    // Reload to ensure we're on the overview page
    await this.loadPage();
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
    await this.verifier.waitUntilElementIsVisible(this.dialogBox);
    await this.fillInElement(this.confirmInput, 'confirm', {
      stepInfo: 'Filling confirm text in dialog',
    });
    await this.clickOnElement(this.confirmButton, {
      stepInfo: 'Clicking confirm button in dialog',
    });

    await this.verifyToastMessageIsVisibleWithText('Rewards disabled');
    await this.verifier.waitUntilElementIsVisible(this.rewardsTabHeading);
  }

  async enableTheRewards(): Promise<void> {
    const isEnableButtonVisible = await this.verifier.isTheElementVisible(this.enableRewardsButton, {
      timeout: 5000,
    });
    if (isEnableButtonVisible) {
      await this.clickOnElement(this.enableRewardsButton, {
        stepInfo: 'Enabling rewards',
      });
      await this.verifyToastMessageIsVisibleWithText('Rewards enabled');
    }
  }

  /**
   * Optimized function to open recognition created before 24 hours
   * Performs the following steps:
   * 1. Checks the Activity table
   * 2. Click the "Show more" button until date difference is more than 3 days
   * 3. Find the specified user's recognition and click "View recognition"
   * 4. Validates the post opens in the same page
   */
  async openTheRecognitionCreatedBefore24Hrs(recognitionGiver: string): Promise<string> {
    await test.step('Click and verify "Show more" button until last 3 days data is loaded', async () => {
      while (await this.verifier.isTheElementVisible(this.activityPanelTableShowMoreButton)) {
        const [response] = await Promise.all([
          this.page.waitForResponse(
            res => res.url().includes('/recognition/admin/rewards/transactions') && res.status() === 200
          ),
          this.activityPanelTableShowMoreButton.click(),
        ]);
        const lastRowDate = await this.activityPanelTableRows.last().locator('td').first().textContent();
        const currentDate = new Date();
        const lastRowDateWithYear = new Date(lastRowDate + ` ${currentDate.getFullYear()}`);
        const differenceInTime = currentDate.getDate() - lastRowDateWithYear.getDate();
        if (differenceInTime > 5) break;
      }
    });

    const rows = this.page.locator('tr[data-testid^="dataGridRow"]');
    let rewardPointsText: any;
    const rowCount = await rows.count();
    for (let i = rowCount - 1; i > 0; i--) {
      await rows.nth(i).locator('td').first().scrollIntoViewIfNeeded();
      const dateText = await rows.nth(i).locator('td').first().textContent();
      const rowDate = new Date(dateText + ` ${new Date().getFullYear()}`); // Append current year to date string
      const today = new Date();
      const diffDays = (today.getTime() - rowDate.getTime()) / (1000 * 60 * 60 * 24);
      if (
        recognitionGiver === (await rows.nth(i).locator('td').nth(1).textContent()) &&
        diffDays > 2 &&
        (await rows.nth(i).locator('td').nth(3).locator('p').textContent()) === 'Peer recognition'
      ) {
        await rows.nth(i).locator('td').last().scrollIntoViewIfNeeded();
        await rows.nth(i).locator('td').last().click();
        await this.viewRecognitionDropdown.waitFor({ state: 'visible' });
        await this.viewRecognitionDropdown.scrollIntoViewIfNeeded();
        rewardPointsText = await rows.nth(i).locator('td').nth(4).textContent();
        await expect(this.viewRecognitionDropdown).toBeVisible();
        await expect(this.viewRecognitionDropdownText).toHaveText('View recognition');
        await this.viewRecognitionDropdownLink.click();
        // Import RecognitionHubPage dynamically to avoid circular dependencies
        const { RecognitionHubPage } = await import('@modules/reward/pages/recognition-hub/recognition-hub-page');
        const recognitionHub = new RecognitionHubPage(this.page);
        await recognitionHub.rewardRecognitionFirstPost.waitFor({ state: 'visible', timeout: 25000 });
        break;
      }
    }
    return rewardPointsText;
  }

  async verifyTheMenuListItems(menuList: string[]) {
    const menuItem: string[] = await this.sideBarMenuList.allTextContents();
    for (const menu of menuList) {
      expect(menuItem).toContain(menu);
    }
  }

  async getTheActivityTableUpdatedTime(lastUpdatedAt: any): Promise<string> {
    if (!lastUpdatedAt) {
      throw new Error('Invalid timestamp: lastUpdatedAt is required.');
    }

    const now = new Date();
    const updatedAt = new Date(lastUpdatedAt);
    const diffMs = now.getTime() - updatedAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 59) {
      return `Last updated ${diffMinutes} min ago`;
    } else if (diffMinutes > 59 && diffMinutes < 120) {
      return 'Last updated 1 hours ago';
    } else {
      return 'Check the Job is failing, it is updated more than 2 hours';
    }
  }

  // Methods from ManageRewardsPage

  /**
   * Load page with Harness flag response
   */
  async loadPageWithHarness(): Promise<void> {
    const apiUrlPattern = /\/api\/1\.0\/client\/env\/.*\/target\/.*\/evaluations\?cluster=2/;
    const [response] = await Promise.all([
      this.page.waitForResponse(resp => apiUrlPattern.test(resp.url()) && resp.status() === 200, {
        timeout: TIMEOUTS.SHORT,
      }),
      this.page.goto(PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE),
    ]);
    this.harnessFlagResponse = response;
  }

  /**
   * Fetch key value from Harness response
   */
  async fetchKeyValueFromHarnessResponse(targetKey: string): Promise<string | null> {
    if (this.harnessFlagResponse === undefined) {
      await this.setTheHarnessResponseAfterPageReload();
    }
    const json = await this.harnessFlagResponse?.json();
    const match = json.find((item: any) => item.flag === targetKey);
    return match?.kind === 'boolean' ? (match.value === 'true' ? 'true' : 'false') : (match?.value ?? null);
  }

  /**
   * Check if user has manage recognition permission
   */
  async hasManageRecognitionPermission(): Promise<boolean> {
    return await this.page.evaluate(() => {
      return (window as any).Simpplr?.CurrentUser?.permissions?.includes('recognition_admin_tool');
    });
  }

  /**
   * Verify page is not found
   */
  async verifyPageIsNotFound(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.manageRewardsPageNotFound, {
      assertionMessage: 'Verify the Manage Reward page is visible',
    });
  }

  /**
   * Set Harness response after page reload
   */
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
