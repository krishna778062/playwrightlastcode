import { expect, Locator, Page, Response, test } from '@playwright/test';
import { DialogBox } from '@rewards-components/common/dialog-box';
import { RewardsAllowance } from '@rewards-components/manage-rewards/rewards-allowance';
import { RewardsBudgetModal } from '@rewards-components/manage-rewards/rewards-budget-modal';
import { RewardsPeerGifting } from '@rewards-components/manage-rewards/rewards-peer-gifting';
import fs from 'fs';
import path from 'path';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';
import { CSVUtils } from '@core/utils/csvUtils';

import { FileUtil } from '@/src/core/utils';

export type RecordResult = { URL: string; points: number } | null;

interface CSVRow {
  'Date time': string;
  'Gifter name': string;
  'Gifter email': string;
  'Gifter department': string;
  'Gifter location': string;
  'Receiver name': string;
  'Receiver email': string;
  'Receiver department': string;
  'Receiver location': string;
  'Receiver payroll currency': string;
  'Custom conversion rate': string | number | null;
  Type: string;
  'Points value': string | number;
  'USD value': string | number;
  'Transaction status': string;
  Message: string;
  URL: string;
}

export class ManageRewardsOverviewPage extends BasePage {
  // Components
  readonly peerGifting: RewardsPeerGifting;
  readonly budgetModal: RewardsBudgetModal;
  readonly rewardsAllowance: RewardsAllowance;

  // Page container and not found
  readonly manageRewardsPageContainer: Locator;
  readonly manageRewardsPageNotFound: Locator;
  public harnessFlagResponse: Response | undefined;
  readonly header: Locator;

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
  readonly monthSpendToDateInfoIcon: Locator;
  readonly annualBudgetBalanceInfoIcon: Locator;
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
  readonly disabledRewardPeerGiftingContainer: Locator;
  readonly disabledRewardRewardsBudgetContainer: Locator;
  readonly disabledRewardCurrencyConversionContainer: Locator;
  readonly disableRewardOptionsContainer: Locator;
  readonly disabledRewardAddPeerGiftingButton: Locator;
  readonly disabledRewardEditPeerGiftingButton: Locator;

  // Tab locators
  readonly rewardsTab: Locator;

  // Dialog box
  private readonly dialogBox: Locator;
  private readonly confirmInput: Locator;
  private readonly confirmButton: Locator;

  // Save button and toast messages
  readonly saveButton: Locator;
  readonly toastMessage: Locator;
  readonly disabledRewardAddBudgetButton: Locator;
  readonly disabledRewardEditBudgetButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);

    // Initialize components
    this.peerGifting = new RewardsPeerGifting(page);
    this.budgetModal = new RewardsBudgetModal(page);
    this.rewardsAllowance = new RewardsAllowance(page);

    // Page container and not found
    this.manageRewardsPageContainer = page.locator('div[class*="TypographyBody-module"]');
    this.manageRewardsPageNotFound = page.getByTestId('no-results');
    this.header = page.locator('h1, h2, h3').first();

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
    this.tooltipText = page.locator('[data-tippy-root] p');
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
    this.disableRewardOptionsContainer = page.locator('div[class*="Panel-module__panel"]').nth(1);
    this.disabledRewardPeerGiftingContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(0);
    this.disabledRewardAddPeerGiftingButton = this.disabledRewardPeerGiftingContainer.locator(
      'a[aria-label="Add peer gifting"]'
    );
    this.disabledRewardEditPeerGiftingButton = this.disabledRewardPeerGiftingContainer.locator(
      'a[aria-label="Edit peer gifting"]'
    );

    this.disabledRewardRewardsBudgetContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(1);
    this.disabledRewardAddBudgetButton = this.disabledRewardRewardsBudgetContainer.locator(
      'button[aria-label="Add rewards budget"]'
    );
    this.disabledRewardEditBudgetButton = this.disabledRewardRewardsBudgetContainer.locator(
      'button[aria-label="Edit rewards budget"]'
    );
    this.disabledRewardCurrencyConversionContainer = this.disableRewardOptionsContainer
      .locator('div[class*="PanelActionItem_layout"]')
      .nth(2);

    // Dialog box
    this.dialogBox = this.page.locator('[role="dialog"]');
    this.confirmInput = this.dialogBox.locator('input[type="text"]');
    this.confirmButton = this.dialogBox.getByRole('button', { name: 'Disable' });

    // Save button and toast messages
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.toastMessage = this.page.locator('div.Toastify__toast-body p');
  }

  get dialogContainerForm(): DialogBox {
    return new DialogBox(this.page);
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.insightBulbButton, {
      timeout: 30000,
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
    const manageRecognitionPage = new ManageRewardsOverviewPage(this.page);
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        res =>
          res.url().endsWith('/recognition/admin/rewards') &&
          res.request().resourceType() === 'xhr' &&
          res.status() === 200 &&
          res.request().method() === 'GET'
      ),
      manageRecognitionPage.loadPage(), // action that triggers API
      manageRecognitionPage.verifyThePageIsLoaded(),
    ]);
    console.log('Status:', apiResponse.status(), 'URL:', apiResponse.url());
    const body = await apiResponse.json();
    console.log(`/recognition/admin/rewards Response is:\n${JSON.stringify(body, null, 2)}`);
    const isRewardEnabled = body.enabled;
    const isPeerGiftingDisabled = body.peerGiftingEnabled;
    console.log(
      `${test.info().title}: Rewards Enabled: ${isRewardEnabled}, Peer Gifting Enabled: ${isPeerGiftingDisabled}`
    );
    if (!isPeerGiftingDisabled || !isRewardEnabled) {
      await manageRecognitionPage.loadPage();
      await manageRecognitionPage.verifyThePageIsLoaded();
      await manageRecognitionPage.checkTheRewardsIsEnabled(isRewardEnabled, isPeerGiftingDisabled);
      await this.loadPage();
    }
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
    await this.dismissTheToastMessage();
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

  async verifyTheMenuListItems(menuList: string[]) {
    const menuItem: string[] = await this.sideBarMenuList.allTextContents();
    for (const menu of menuList) {
      expect(menuItem).toContain(menu);
    }
  }

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

  /**
   * Redeem gift card and validate activity table for CSV testing
   */
  async redeemGiftCardAndValidateActivityTable(giftCardName: string): Promise<void> {
    // Import RewardsStore to access its methods
    const { RewardsStore } = await import('@rewards/ui/pages/reward-store/reward-store');
    const rewardsStore = new RewardsStore(this.page);

    // Navigate to rewards store and validate
    await rewardsStore.loadPage();
    await rewardsStore.verifier.waitUntilPageHasNavigatedTo('/rewards-store/gift-cards');
    await rewardsStore.verifier.verifyTheElementIsVisible(rewardsStore.header);
    await rewardsStore.selectDropdownByLabel(rewardsStore.rewardCountry, 'United States');

    // Redeem regular gift card and validate success
    await rewardsStore.redeemAndValidate({
      tab: null,
      giftCard: giftCardName,
      successMessage: 'Your reward has been sent',
      additionalMessages: ['Please check your email inbox for your reward details'],
    });

    // Navigate to manage rewards and validate activity table
    await this.loadPage();
    await this.activityContainer.last().waitFor({ state: 'visible', timeout: 15000 });
    await this.clickByInjectingJavaScript(this.activityPointsRedeemTable);
    await this.verifier.waitUntilElementIsVisible(this.activityPanelTableRows.last());
  }

  async verifyTheActivityTableForGiftCard(): Promise<void> {
    // Validate CSV download and content
    await test.step('Validate the new Entry in the Downloaded CSV file:', async () => {
      // Download with unique filename using BaseActionUtil
      const csvFile = await this.downloadAndSaveFile(
        () =>
          this.clickOnElement(this.activityTableDownloadCSVButton, {
            stepInfo: 'Clicking on Download CSV button',
          }),
        { stepInfo: 'Download CSV file' }
      );

      try {
        // Validate headers
        const csvHeaders = [
          'Date time',
          'Redeemer name',
          'Redeemer email',
          'Redeemer department',
          'Redeemer location',
          'Redeemer payroll currency',
          'Reward class',
          'Reward type',
          'Reward category',
          'Reward',
          'Reward currency',
          'Reward value',
          'Exchange rate',
          'USD value',
          'Point cost',
          'Reward email',
          'Transaction status',
        ];
        const headersValidation = await CSVUtils.validateHeaders(csvHeaders, csvFile.filePath);
        expect(headersValidation.isValid, `Missing headers: ${headersValidation.missingHeaders}`).toBeTruthy();

        // Validate last row column value
        const validationResult = await CSVUtils.validateRowValue('last', 16, 'APPROVED', csvFile.filePath);
        expect(validationResult.isMatch, `Expected "APPROVED" but got "${validationResult.actualValue}"`).toBeTruthy();
      } finally {
        // Clean up using FileUtil
        FileUtil.deleteTemporaryFile(csvFile.filePath);
      }
    });
  }

  /**
   * Mock the wallets API response for testing disable rewards without unredeemed points
   */
  async mockTheWalletsApiResponse() {
    await this.page.route('**/recognition/admin/rewards/analytics/wallets', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ result: { pointAmount: 0, usersCount: 0 } }),
      })
    );
    await this.page.reload();
  }

  /**
   * Validate disable rewards for different languages
   */
  async disableRewardsForDifferentLanguage(confirmText: string, disableButton: boolean) {
    const dialogBox = this.page.locator('[role="dialog"][data-state="open"]');
    const inputBox = dialogBox.locator('input[type="text"]');
    const confirmButton = dialogBox.getByRole('button').last();
    const inputBoxError = dialogBox.locator('div[class*="Field-module__error"] p');

    await inputBox.fill(confirmText);
    await inputBox.blur();
    disableButton ? await expect(confirmButton).toBeEnabled() : await expect(confirmButton).toBeDisabled();
    disableButton ? await expect(inputBoxError).not.toBeVisible() : await expect(inputBoxError).toBeVisible();
  }

  // Budget-related methods
  async clickOnAddEditBudgetButton(): Promise<string> {
    await this.clickOnElement(this.budgetSummaryActionBarButton, {
      stepInfo: 'Clicking on Add/Edit Budget button',
    });
    await this.verifier.waitUntilElementIsVisible(this.budgetModal.budgetContainer);
    const isRemoveOptionVisible = await this.verifier.isTheElementVisible(
      this.budgetModal.budgetPanelRemoveRadioInputBox,
      { timeout: 2000 }
    );
    return isRemoveOptionVisible ? 'Edit budget' : 'Add budget';
  }

  async verifyBudgetSummaryElements(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.budgetSummaryTileContainer, {
      assertionMessage: 'Verify Budget Summary tile container is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.budgetSummaryHeadingIcon, {
      assertionMessage: 'Verify Budget Summary heading icon is visible',
    });
    await this.verifier.verifyTheElementIsVisible(this.budgetSummaryHeadingText, {
      assertionMessage: 'Verify Budget Summary heading text is visible',
    });
  }

  async getTheBudgetApiResponse(): Promise<any> {
    await this.page.reload();
    const response = await this.page.waitForResponse(
      response => response.url().includes('/recognition/admin/rewards/analytics/budget') && response.status() === 200
    );
    return await response.json();
  }

  async validateTheLabelAndTooltip(data: any, label: string): Promise<void> {
    if (label === 'Month spend to date') {
      await expect(this.summaryTilePElements.nth(0)).toContainText('Month spend to date');
      await this.monthSpendToDateInfoIcon.click();
      const tooltipText =
        'Month spend to date is representative of points that have been gifted this current month, including pending transactions.';
      await expect(this.tooltipText).toBeVisible();
      await expect(this.tooltipText).toHaveText(tooltipText);
      await this.monthSpendToDateInfoIcon.click();
    } else if (label === 'budget balance') {
      await expect(this.summaryTilePElements.nth(2)).toContainText(/budget balance/);
      await this.annualBudgetBalanceInfoIcon.click();

      const amount = data.result.budgetBalanceDetails.totalBudgetUsdAmount;
      const refreshDate = data.result.budgetBalanceDetails.nextBudgetRefreshAt;

      const currentUserTimeZone = await this.page.evaluate(() => {
        return (window as any).Simpplr?.CurrentUser?.timezoneIso;
      });

      const formattedAmount = `$${amount.toLocaleString('en-US')}`;
      const formattedDate = new Date(refreshDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: currentUserTimeZone,
      });
      const tooltipText1 = `Refreshes to ${formattedAmount} ${formattedDate}.`;
      await expect(this.tooltipText.nth(0)).toBeVisible();
      await expect(this.tooltipText.nth(0)).toHaveText(tooltipText1);
      const tooltipText2 = 'Recognition managers will be notified if the budget is exceeded.';
      await expect(this.tooltipText.nth(1)).toHaveText(tooltipText2);
      await this.annualBudgetBalanceInfoIcon.click();
    }
  }

  async selectRadioIfNotSelected(locator: Locator): Promise<void> {
    const isSelected = await locator.isChecked();
    if (!isSelected) {
      await this.clickOnElement(locator, {
        stepInfo: 'Selecting radio button',
      });
    }
  }

  async clickOnDisabledRewardsAddEditBudgetButton(): Promise<void> {
    await this.disabledRewardRewardsBudgetContainer.waitFor({ state: 'attached', timeout: 30000 });
    if (await this.verifier.isTheElementVisible(this.disabledRewardAddBudgetButton)) {
      await this.clickOnElement(this.disabledRewardAddBudgetButton);
    } else if (await this.verifier.isTheElementVisible(this.disabledRewardEditBudgetButton)) {
      await this.clickOnElement(this.disabledRewardEditBudgetButton);
    } else {
      throw new Error('Neither Add Budget nor Edit Budget button is visible.');
    }
  }

  getRandomNo(min: number, max: number, exclude?: number): number {
    let randomNum: number;
    do {
      randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (exclude !== undefined && randomNum === exclude);
    return randomNum;
  }

  // Tooltip validation methods for allowance tests
  async validateTheAddButtonTooltip(
    allowanceType: 'Users allowance' | 'Manager allowances' | 'Audience allowances' | 'Individual allowances'
  ): Promise<void> {
    const buttonMap: Record<string, Locator> = {
      'Users allowance': this.rewardsAllowance.rewardsUserAllowance.addUserAllowance,
      'Manager allowances': this.rewardsAllowance.rewardsManagerAllowance.addManagerAllowance,
      'Audience allowances': this.rewardsAllowance.rewardsAudienceAllowance.addAudienceAllowance,
      'Individual allowances': this.rewardsAllowance.rewardsIndividualAllowance.addIndividualAllowance,
    };

    const button = buttonMap[allowanceType];
    if (!button) {
      throw new Error(`validateTheAddButtonTooltip: no button locator found for allowanceType="${allowanceType}"`);
    }

    // Wait for the button to be visible & enabled before hovering (best practice)
    await expect(button).toBeVisible({ timeout: 5000 });

    // Preferred: normal hover (avoid force unless UI requires it)
    await button.scrollIntoViewIfNeeded();
    await button.hover({ force: true });

    const locatorString = `//div[contains(@class,'PanelActionItem_layout')]//h3[text()="${allowanceType}"]//parent::div//following-sibling::div//div[@role="tooltip"]`;
    await this.verifier.verifyTheElementIsVisible(this.page.locator(locatorString));
    await this.verifier.verifyElementContainsText(
      this.page.locator(locatorString),
      'Allowances cannot be added while refreshing'
    );
  }

  async validateTheEditButtonTooltip(
    allowanceType: 'Users allowance' | 'Manager allowances' | 'Audience allowances' | 'Individual allowances'
  ): Promise<void> {
    const buttonMap: Record<string, Locator> = {
      'Users allowance': this.rewardsAllowance.rewardsUserAllowance.editUserAllowance,
      'Manager allowances': this.rewardsAllowance.rewardsManagerAllowance.editManagerAllowance,
      'Audience allowances': this.rewardsAllowance.rewardsAudienceAllowance.editAudienceAllowance,
      'Individual allowances': this.rewardsAllowance.rewardsIndividualAllowance.editIndividualAllowance,
    };

    const button = buttonMap[allowanceType];
    await button.hover({ force: true });
    const locatorString = `//div[contains(@class,'PanelActionItem_layout')]//h3[text()="${allowanceType}"]//parent::div//following-sibling::div//div[@role="tooltip"]`;
    await this.verifier.verifyTheElementIsVisible(this.page.locator(locatorString).last());
    await this.verifier.verifyElementContainsText(
      this.page.locator(locatorString).last(),
      'Allowances cannot be edited while refreshing'
    );
  }

  async validateTheRemoveButtonTooltip(
    allowanceType: 'Users allowance' | 'Manager allowances' | 'Audience allowances' | 'Individual allowances'
  ): Promise<void> {
    const buttonMap: Record<string, Locator> = {
      'Users allowance': this.rewardsAllowance.rewardsUserAllowance.removeUserAllowance,
      'Manager allowances': this.rewardsAllowance.rewardsManagerAllowance.removeManagerAllowance,
      'Audience allowances': this.rewardsAllowance.rewardsAudienceAllowance.removeAudienceAllowance,
      'Individual allowances': this.rewardsAllowance.rewardsIndividualAllowance.removeIndividualAllowance,
    };

    const button = buttonMap[allowanceType];
    if (!button) {
      throw new Error(`validateTheAddButtonTooltip: no button locator found for allowanceType="${allowanceType}"`);
    }

    // Wait for the button to be visible & enabled before hovering (best practice)
    await expect(button).toBeVisible({ timeout: 5000 });

    // Preferred: normal hover (avoid force unless UI requires it)
    await button.hover({ force: true });

    const locatorString = `//div[contains(@class,'PanelActionItem_layout')]//h3[text()="${allowanceType}"]//parent::div//following-sibling::div//div[@role="tooltip"]`;
    await this.verifier.verifyTheElementIsVisible(this.page.locator(locatorString).first());
    await this.verifier.verifyElementContainsText(
      this.page.locator(locatorString).first(),
      'Allowances cannot be removed while refreshing'
    );
  }

  async checkTheRewardsIsEnabled(isRewardEnabled: boolean, isPeerGiftingDisabled: boolean): Promise<void> {
    const manageRecognitionPage = new ManageRewardsOverviewPage(this.page);
    if (!isRewardEnabled && !isPeerGiftingDisabled) {
      await manageRecognitionPage.disabledRewardPeerGiftingContainer.waitFor({
        state: 'visible',
        timeout: 15000,
      });
      await this.clickOnDisabledRewardsAddEditPeerGiftingButton();
      if (await this.verifier.isTheElementVisible(this.page.locator('[aria-label="Add allowances"]'))) {
        await manageRecognitionPage.rewardsAllowance.rewardsUserAllowance.visitToUserAllowanceSetupPage();
        await manageRecognitionPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(10);
        await manageRecognitionPage.rewardsAllowance.saveAmount();
        await manageRecognitionPage.peerGifting.visit();
        await manageRecognitionPage.peerGifting.verifyThePageIsLoaded();
      }
      await manageRecognitionPage.peerGifting.peerGiftingToggleSwitch.click();
      await manageRecognitionPage.peerGifting.saveButton.waitFor({ state: 'attached', timeout: 15000 });
      await manageRecognitionPage.peerGifting.saveButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Saved changes successfully');
      await manageRecognitionPage.loadPage();
      await manageRecognitionPage.enableRewardsButton.waitFor({ state: 'visible', timeout: 15000 });
      await manageRecognitionPage.enableRewardsButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Rewards enabled');
      await expect(manageRecognitionPage.rewardsTabHeading).toHaveText('Rewards overview');
    } else if (!isRewardEnabled && isPeerGiftingDisabled) {
      // Directly enable Rewards
      await manageRecognitionPage.enableRewardsButton.waitFor({ state: 'visible', timeout: 15000 });
      await manageRecognitionPage.enableRewardsButton.click();
      await manageRecognitionPage.rewardsAllowance.validateToastMessage('Rewards enabled');
      await expect(manageRecognitionPage.rewardsTabHeading).toHaveText('Rewards overview');
    } else if (isRewardEnabled && !isPeerGiftingDisabled) {
      await manageRecognitionPage.peerGifting.loadPage();
      await manageRecognitionPage.verifier.waitUntilElementIsVisible(
        manageRecognitionPage.peerGifting.peerGiftingHeading
      );
      if (await this.verifier.isTheElementVisible(this.page.locator('[aria-label="Add allowances"]'))) {
        await manageRecognitionPage.rewardsAllowance.rewardsUserAllowance.visitToUserAllowanceSetupPage();
        await manageRecognitionPage.rewardsAllowance.rewardsUserAllowance.enterThePointAmount(10);
        await manageRecognitionPage.rewardsAllowance.saveAmount();
        await manageRecognitionPage.peerGifting.visit();
        await manageRecognitionPage.peerGifting.verifyThePageIsLoaded();
      }
      await manageRecognitionPage.peerGifting.enableThePeerGifting('Immediately');
    } else if (isRewardEnabled && isPeerGiftingDisabled) {
      // Both are already enabled, do nothing
      console.log('Reward and Gifting is enabled.');
    }
  }

  async clickOnDisabledRewardsAddEditPeerGiftingButton(): Promise<void> {
    await this.disabledRewardPeerGiftingContainer.waitFor({ state: 'attached', timeout: 15000 });
    if (await this.verifier.verifyTheElementIsVisible(this.disabledRewardAddPeerGiftingButton)) {
      await this.clickOnElement(this.disabledRewardAddPeerGiftingButton);
    } else if (await this.verifier.verifyTheElementIsVisible(this.disabledRewardEditPeerGiftingButton)) {
      await this.clickOnElement(this.disabledRewardEditPeerGiftingButton);
    } else {
      throw new Error('Neither Add Budget nor Edit Peer Gifting button is visible.');
    }
  }

  /**
   * Get the record's URL and Points value where:
   * - Date time is older than 23:59:59 (i.e. strictly older than 24h - 1s)
   * - Gifter name matches (if provided)
   * - Otherwise, picks the newest record older than that threshold
   * - Ignores records whose URL is "deleted"
   * - Ensures the URL looks like a recognition post (best-effort heuristic)
   *
   * Defensive: validates dates, coerces points to number, trims names.
   */
  async getRecordOlderThan24Hrs(records: CSVRow[], gifterName?: string) {
    if (!Array.isArray(records) || records.length === 0) return null;

    const nowMs = Date.now();
    const minAgeMs = 24 * 60 * 60 * 1000; // 86,399,000 ms

    const isLikelyRecognitionUrl = (rawUrl: unknown) => {
      const url = (rawUrl ?? '').toString().trim();
      if (url.length === 0) return false;
      const normalized = url.toLowerCase();
      if (normalized === 'deleted') return false;

      const hasRecognitionFragment = /\/recognition?/i.test(url);
      const looksLikeHttp = /^https?:\/\//i.test(url);
      return hasRecognitionFragment || looksLikeHttp;
    };

    // Normalize rows with parsed date; keep only ones older than threshold, valid dates, and valid recognition URLs
    const olderRecords = records
      .map(r => {
        const rawDate = r['Date time'];
        const dateStr = typeof rawDate === 'string' ? rawDate.trim() : '';
        const parsedMs = Number.isFinite(Date.parse(dateStr)) ? Date.parse(dateStr) : NaN;
        return { row: r, parsedMs };
      })
      .filter(item => {
        const { row, parsedMs } = item;
        // Must have a valid date and be older than minAgeMs
        if (!Number.isFinite(parsedMs) || !(nowMs - parsedMs > minAgeMs)) return false;

        // URL must not be 'deleted' and should look like a recognition post
        const urlRaw = row['URL'] ?? '';
        return isLikelyRecognitionUrl(urlRaw);
      })
      .map(item => item.row);

    if (olderRecords.length === 0) return null;

    // If gifterName provided, filter by it (case-insensitive, trimmed)
    let filtered = olderRecords;
    if (typeof gifterName === 'string' && gifterName.trim().length > 0) {
      const normalizedGifter = gifterName.trim().toLowerCase();
      filtered = olderRecords.filter(r => {
        const name = (r['Gifter name'] ?? '').toString().trim().toLowerCase();
        return name === normalizedGifter;
      });
    }

    if (filtered.length === 0) return null;

    // Pick the newest (latest) record among the filtered ones
    const latest = filtered.reduce((best, current) => {
      const bestMs = Number.isFinite(Date.parse((best['Date time'] ?? '').toString().trim()))
        ? Date.parse((best['Date time'] ?? '').toString().trim())
        : NaN;
      const curMs = Number.isFinite(Date.parse((current['Date time'] ?? '').toString().trim()))
        ? Date.parse((current['Date time'] ?? '').toString().trim())
        : NaN;

      if (Number.isNaN(bestMs)) return current;
      if (Number.isNaN(curMs)) return best;
      return curMs > bestMs ? current : best;
    });

    // Coerce points to number safely
    const rawPoints = latest['Points value'];
    let points = 0;
    if (typeof rawPoints === 'number') points = rawPoints;
    else if (typeof rawPoints === 'string') {
      const parsed = Number(rawPoints.trim());
      points = Number.isFinite(parsed) ? parsed : 0;
    }
    const url = (latest.URL ?? '').toString();
    return { URL: url, points };
  }

  /**
   * Clicks the Download CSV button, reads file, finds records older than 24 hours
   * Optionally filters by recognitionGiver (gifter name).
   *
   * Returns:
   *  - resultForGiver: result for provided recognitionGiver (or null)
   *  - resultAny: newest record older than 24 hrs regardless of gifter (or null)
   *  - pointsToValidate: convenience number (prefers resultForGiver if recognitionGiver provided)
   *  - urlToOpen: convenience URL (same preference)
   */
  public async openTheRecognitionPostCreatedBefore24Hrs(recognitionGiver?: string): Promise<{
    resultForGiver: RecordResult;
    resultAny: RecordResult;
    pointsToValidate: number | null;
    urlToOpen: string | null;
  }> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download', { timeout: 25000 }),
      this.clickOnElement(this.activityTableDownloadCSVButton, {
        stepInfo: 'Clicking on Download CSV button',
      }),
    ]);
    const csvFilePath = path.resolve('./downloads', download.suggestedFilename());
    await download.saveAs(csvFilePath);
    const records = (await CSVUtils.getAllRecords(csvFilePath)) as unknown as CSVRow[];
    const resultForGiver = await this.getRecordOlderThan24Hrs(records, recognitionGiver);
    const resultAny = await this.getRecordOlderThan24Hrs(records);
    const prefer = resultForGiver !== null ? resultForGiver : resultAny;
    const pointsToValidate = prefer ? prefer.points : null;
    const urlToOpen = prefer ? prefer.URL : null;
    try {
      fs.unlinkSync(csvFilePath);
    } catch (e) {
      /* ignore errors */
    }
    return { resultForGiver, resultAny, pointsToValidate, urlToOpen };
  }
}
