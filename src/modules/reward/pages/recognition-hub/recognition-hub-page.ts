import { expect, Locator, Page, test } from '@playwright/test';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { BasePage } from '@core/pages/basePage';
import { GiveRecognitionDialogBox } from '@modules/reward/components/recognition/give-recognition-dialog-box';
import { ManageRewardsOverviewPage } from '@modules/reward/pages/manage-rewards/manage-rewards-overview-page';
import { RewardGiftingOptionsPage } from '@modules/reward/pages/manage-rewards/reward-gifting-options-page';
import { RewardsStore } from '@modules/reward/pages/reward-store/reward-store';

export class RecognitionHubPage extends BasePage {
  readonly header: Locator;
  private giveRecognition: Locator;
  private giftingToggleSwitch: Locator;
  private giftingNotAvailable: Locator;
  private giftingNotAvailableInfoIcon: Locator;
  private giftingNotAvailableInfoIconTooltipText: Locator;
  readonly pointsToGive: Locator;
  readonly rewardStoreLink: Locator;
  readonly rewardRecognitionFirstPost: Locator;
  readonly rewardRecognitionFirstPostMoreButton: Locator;
  readonly rewardRecognitionFirstPostMoreOptions: Locator;
  readonly rewardRecognitionFirstBadgeIconOutline: Locator;
  readonly rewardRecognitionFirstBadgePointText: Locator;
  readonly rewardRecognitionFirstBadgePointTooltipIcon: Locator;
  readonly rewardRecognitionFirstBadgePointTooltipText: Locator;
  readonly allowanceRefreshing: Locator;
  readonly allowanceRefreshingInfoIcon: Locator;
  readonly allowanceRefreshingInfoIconTooltipText: Locator;

  // Delete recognition dialog box locators
  readonly deleteRecognitionDialogBoxContainer: Locator;
  readonly deleteRecognitionDialogBoxTitle: Locator;
  readonly deleteRecognitionDialogBoxDescriptionText: Locator;
  readonly deleteRecognitionWithRevokePoints: Locator;
  readonly deleteRecognitionOnly: Locator;
  readonly deleteRecognitionNote: Locator;
  readonly deleteRecognitionDialogBoxCloseButton: Locator;
  readonly deleteRecognitionDialogBoxDeleteButton: Locator;
  readonly deleteRecognitionDialogBoxCancelButton: Locator;
  readonly deletedRecognitionPostNotAvailable: Locator;
  readonly deletedRecognitionPostDeletedMessage: Locator;

  /**
   * This is a Recognition Hub class that contains locators and methods for the Recognition Hub page.
   */
  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.RECOGNITION_HUB);

    // Delete recognition dialog box locators
    this.deleteRecognitionDialogBoxContainer = page.locator('[data-state="open"][role="dialog"]');
    this.deleteRecognitionDialogBoxTitle = this.deleteRecognitionDialogBoxContainer.locator(
      'h2[class*="Dialog-module__title"]'
    );
    this.deleteRecognitionDialogBoxDescriptionText = this.deleteRecognitionDialogBoxContainer.locator(
      'p[class*="Typography-module__paragraph"]'
    );
    this.deleteRecognitionWithRevokePoints = this.deleteRecognitionDialogBoxContainer.locator('[id="revokePointsyes"]');
    this.deleteRecognitionOnly = this.deleteRecognitionDialogBoxContainer.locator('[id="revokePointsno"]');
    this.deleteRecognitionNote = this.deleteRecognitionDialogBoxContainer.locator(
      'p[class*="Typography-module__secondary"]'
    );
    this.deleteRecognitionDialogBoxCloseButton =
      this.deleteRecognitionDialogBoxContainer.locator('button[aria-label="Close"]');
    this.deleteRecognitionDialogBoxDeleteButton = this.deleteRecognitionDialogBoxContainer
      .locator('div[class*="Dialog-module__footer"] button')
      .last();
    this.deleteRecognitionDialogBoxCancelButton = this.deleteRecognitionDialogBoxContainer
      .locator('div[class*="Dialog-module__footer"] button')
      .first();

    // Locators for the Recognition Hub page
    this.header = page.getByRole('heading', { name: 'Recognition', level: 1 });
    this.giveRecognition = page.getByRole('button', { name: 'Give Recognition' });
    this.giftingToggleSwitch = page.locator('[class^="ToggleInput"] button');
    this.giftingNotAvailable = page.locator('//p[text()="Gifting is temporarily unavailable"]');
    this.giftingNotAvailableInfoIcon = page.getByRole('button', { name: 'Gifting unavailable information' });
    this.giftingNotAvailableInfoIconTooltipText = page.locator('[id^="tippy-"] p');
    this.pointsToGive = page.locator('[class*="RewardsWallet_item"] > div > p').nth(0);
    this.rewardStoreLink = page.locator('[class*="RewardsWallet_item"] a[aria-label="Redeem points"]');

    // Recognition post locators
    this.rewardRecognitionFirstPost = page
      .locator('[data-testid^="recognition"] > div[class*="Recognition_panelInner"]')
      .nth(0);
    this.rewardRecognitionFirstPostMoreButton = this.rewardRecognitionFirstPost
      .locator('[data-testid="recognition_popover_launcher"]')
      .nth(0);
    this.rewardRecognitionFirstPostMoreOptions = this.rewardRecognitionFirstPost.locator(
      '[role="menuitem"] > div[class*="DropdownMenuItemLabel"]'
    );
    this.rewardRecognitionFirstBadgeIconOutline = this.rewardRecognitionFirstPost.locator(
      '[data-testid="award-icon"] div[class*="UI_outline"]'
    );
    this.rewardRecognitionFirstBadgePointText = this.rewardRecognitionFirstPost.locator('button[class*="UI_pill"] p');
    this.rewardRecognitionFirstBadgePointTooltipIcon =
      this.rewardRecognitionFirstPost.locator('button[class*="UI_pill"] i');
    this.rewardRecognitionFirstBadgePointTooltipText = this.rewardRecognitionFirstPost.locator('[id*="tippy"] p');
    this.allowanceRefreshing = page.locator('//p[text()="Allowance refreshing"]');
    this.allowanceRefreshingInfoIcon = page.locator('button[aria-label="Allowance refreshing information"]');
    this.allowanceRefreshingInfoIconTooltipText = page.locator('[id^="tippy-"] p');
    this.deletedRecognitionPostNotAvailable = page.locator('div[class*="SingleRecognition_container"] h4');
    this.deletedRecognitionPostDeletedMessage = page.locator('div[class*="SingleRecognition_container"] p');
  }

  /**
   * Click on the Give recognition Button
   */
  async clickOnGiveRecognition(): Promise<void> {
    await this.giveRecognition.waitFor({ state: 'visible' });
    await this.clickOnElement(this.giveRecognition, { stepInfo: 'Clicking on Give Recognition button' });
  }

  /**
   * Check the gifting options status
   */
  async checkTheGiftingOptionsAre(status: boolean): Promise<void> {
    await this.page.locator('[role="dialog"][data-state="open"]').waitFor({ state: 'visible' });
    await this.giftingToggleSwitch.scrollIntoViewIfNeeded();
    if (!status) {
      await this.verifier.verifyTheElementIsDisabled(this.giftingToggleSwitch);
      await this.verifier.verifyTheElementIsVisible(this.giftingNotAvailable);
      await this.verifier.verifyTheElementIsVisible(this.giftingNotAvailableInfoIcon);
      await this.clickOnElement(this.giftingNotAvailableInfoIcon, {
        stepInfo: 'Clicking on gifting unavailable info icon',
      });
      await this.verifier.verifyTheElementIsVisible(this.giftingNotAvailableInfoIconTooltipText);
      await this.verifier.verifyElementHasText(
        this.giftingNotAvailableInfoIconTooltipText,
        'Gifting is currently unavailable while your allowance refreshes. Please try again shortly.'
      );
    } else {
      await this.verifier.verifyTheElementIsEnabled(this.giftingToggleSwitch);
    }
  }

  /**
   * Visit Recognition hub via Navigation bar
   */
  async visitRecognitionHub(): Promise<number[]> {
    const configResponsePromise = this.page.waitForResponse(
      response => response.url().includes('/recognition/v1/tenant/config') && response.status() === 200
    );
    await this.page.goto(PAGE_ENDPOINTS.RECOGNITION_HUB);
    const configResponse = await configResponsePromise;
    const data = await configResponse.json();
    return data?.rewardConfig?.options?.map((opt: any) => opt.amount) || [];
  }

  /**
   * Navigate to Recognition hub
   */
  async navigateToRecognitionHub(): Promise<void> {
    await this.page.goto('/recognition');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Check the points to give
   */
  async checkThePointsToGive(number: number): Promise<void> {
    const uiPointsToGive = await this.pointsToGive.textContent();
    expect(Number(uiPointsToGive)).toBe(number);
  }

  /**
   * Select users in the awardee
   */
  async selectUsersInTheAwardee(count: number): Promise<void> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    await giveRecognitionDialogBox.loadingIndicator.first().waitFor({ state: 'detached' });
    for (let i = 0; i < count; i++) {
      await giveRecognitionDialogBox.recognitionRecipientsInput.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.recognitionRecipientsInput.click();
      await giveRecognitionDialogBox.suggesterContainer.waitFor({ state: 'visible' });
      await giveRecognitionDialogBox.getOption(i).click();
    }
  }

  /**
   * Get recognition button text
   */
  async recognitionButtonText(): Promise<string> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    const text = await giveRecognitionDialogBox.recognizeButton.textContent();
    return text || '';
  }

  /**
   * Enables or disables the gifting option.
   * @param shouldEnable - true to enable, false to disable
   */
  async enableTheGiftingOption(shouldEnable: boolean): Promise<void> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    await expect(
      giveRecognitionDialogBox.giftingToggle,
      'Check if user have some points / Rewards is Disabled'
    ).toBeVisible();
    const currentState = await giveRecognitionDialogBox.giftingToggle.getAttribute('aria-checked');
    if ((shouldEnable && currentState === 'false') || (!shouldEnable && currentState === 'true')) {
      await giveRecognitionDialogBox.giftingToggle.click();
    }
  }

  /**
   * Check if insufficient point error message is displaying
   */
  async insufficientPointErrorMessageIsDisplaying(): Promise<boolean> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    return await giveRecognitionDialogBox.insufficientPointErrorMessage.isVisible();
  }

  /**
   * Check if the minimum point error message is displaying
   */
  async minimumPointErrorMessageIsDisplaying(): Promise<boolean> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    await giveRecognitionDialogBox.minimumPointErrorMessage.scrollIntoViewIfNeeded();
    return await giveRecognitionDialogBox.minimumPointErrorMessage.isVisible();
  }

  /**
   * Get insufficient point with recipients error message
   */
  async insufficientPointWithRecipientsErrorMessage(): Promise<string> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    const text = await giveRecognitionDialogBox.insufficientPointWithRecipientsErrorMessage.textContent();
    return text || '';
  }

  /**
   * Validate the gifting options
   */
  async validateTheGiftingOptions(input_values: number[]): Promise<void> {
    const giveRecognitionDialogBox = new GiveRecognitionDialogBox(this.page);
    await giveRecognitionDialogBox.giftingToggle.scrollIntoViewIfNeeded();
    const elements = await giveRecognitionDialogBox.giftingOptionsContainerPillText.all();
    for (let i = 0; i < elements.length; i++) {
      const text = await elements[i].inputValue();
      expect(input_values.includes(Number(text))).toBeTruthy();
    }
    await expect(giveRecognitionDialogBox.giftingOptionsContainerPill.first()).toBeChecked();
  }

  /**
   * Validate the reward elements in recognition post
   */
  async validateTheRewardElementsInRecognitionPost(
    visibility: boolean,
    rewardPointValue: string,
    _tooltipString: string
  ): Promise<void> {
    if (visibility) {
      await this.rewardRecognitionFirstPost.waitFor({ state: 'attached', timeout: 15000 });
      await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstPost);
      await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstBadgeIconOutline);
      const rewardPointText = await this.rewardRecognitionFirstBadgePointText.textContent();
      const pointLabel = rewardPointValue === '1' ? 'point' : 'points';
      expect(rewardPointText).toContain(`${rewardPointValue} ${pointLabel}`);
      await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstBadgePointTooltipIcon);
      await this.clickOnElement(this.rewardRecognitionFirstBadgePointTooltipIcon, {
        stepInfo: 'Clicking on reward point tooltip icon',
      });
      await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstBadgePointTooltipText);
      const rewardPointsInfoTooltipText = await this.rewardRecognitionFirstBadgePointTooltipText.textContent();
      const tooltipStrings = [
        'Only visible to you, your manager and app administrators',
        'Only visible to recipients, their managers and app administrators',
      ];
      expect(tooltipStrings).toContain(rewardPointsInfoTooltipText);
      await this.clickOnElement(
        this.rewardRecognitionFirstPost.locator('div[class*="PeerRecognitionCore_awardName"] h2'),
        {
          stepInfo: 'Clicking to close tooltip',
        }
      );
      await this.verifier.verifyTheElementIsNotVisible(this.rewardRecognitionFirstBadgePointTooltipText);
    } else {
      await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstPost);
      await this.verifier.verifyTheElementIsNotVisible(this.rewardRecognitionFirstBadgeIconOutline);
      await this.verifier.verifyTheElementIsNotVisible(this.rewardRecognitionFirstBadgePointTooltipIcon);
    }
  }

  /**
   * Validate the recognition post is deleted
   */
  async validateTheRecognitionPostIsDeleted(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.deletedRecognitionPostNotAvailable, { timeout: 30000 });
    const heading = await this.deletedRecognitionPostNotAvailable.innerText();
    expect(heading).toContain('Recognition not available');
    const paragraph = await this.deletedRecognitionPostDeletedMessage.textContent();
    expect(paragraph).toContain('This recognition may have been deleted');
  }

  /**
   * Click on the first post more option
   */
  async clickOnTheFirstPostMoreOption(optionText: string): Promise<void> {
    await this.rewardRecognitionFirstPost.waitFor({ state: 'visible', timeout: 15000 });
    await this.rewardRecognitionFirstPostMoreButton.waitFor({ state: 'visible', timeout: 15000 });
    await this.clickOnElement(this.rewardRecognitionFirstPostMoreButton, { stepInfo: 'Clicking on more button' });
    const menu = this.page.getByRole('menu', { name: 'More' });
    await menu.getByRole('menuitem').last().waitFor({ state: 'attached', timeout: 5000 });
    const option = menu.getByRole('menuitem').locator(`div:has-text("${optionText}")`);
    await option.first().waitFor({ state: 'attached', timeout: 15000 });
    await this.clickOnElement(option.first(), { stepInfo: `Clicking on ${optionText} option`, force: true });
  }

  /**
   * Mock the wallet points
   */
  async mockTheWalletPoints(pointsToGive: number, pointsToSpend: number, redeemedPoint: number): Promise<void> {
    await this.page.route('**/recognition/rewards/users/**/wallet', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: {
            gifting: {
              pendingIn: 0,
              available: pointsToGive,
              refreshingAt: '2025-07-01T00:00:00.000Z',
            },
            redeemable: {
              pendingIn: 0,
              available: pointsToSpend,
            },
            redeemed: {
              pendingIn: 0,
              available: redeemedPoint,
            },
          },
        }),
      })
    );
    await this.page.reload();
  }

  /**
   * Setup the multiple gifting options
   */
  async setupTheMultipleGiftingOptions(): Promise<number[]> {
    const input_values = [1, 2, 3, 4, 5, 6, 7];
    const availablePoints = await this.pointsToGive.textContent();

    const rewardGiftingOptions = new RewardGiftingOptionsPage(this.page);
    await rewardGiftingOptions.loadPage();
    await rewardGiftingOptions.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/options');

    const existingValue = await rewardGiftingOptions.getTheExistingValueInGiftingOptions();
    const rewardOption =
      Math.floor(Math.random() * (Number(availablePoints?.replace(',', '')) - 7 - Number(existingValue))) + 7;
    input_values.push(Number(rewardOption));

    await rewardGiftingOptions.enterTheAmountAndValidateNoError(String(input_values));
    await rewardGiftingOptions.clickOnSaveButton();

    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(this.page);
    await manageRewardsOverviewPage.verifyToastMessageIsVisibleWithText('Saved changes successfully');

    await this.visitRecognitionHub();
    return input_values;
  }

  /**
   * Set up the multiple gifting options
   */
  async setupTheSingleGiftingOptions(availablePoints: any): Promise<number> {
    const rewardGiftingOptions = new RewardGiftingOptionsPage(this.page);
    await rewardGiftingOptions.loadPage();
    await rewardGiftingOptions.verifier.waitUntilPageHasNavigatedTo('/manage/recognition/rewards/peer-gifting/options');
    const existingValue = await rewardGiftingOptions.getTheExistingValueInGiftingOptions();
    const cleanAvailablePoints = availablePoints.replace(/[,\s]/g, '');
    const parsedAvailablePoints = Number(cleanAvailablePoints) || 0;
    const parsedExistingValue = Number(existingValue) || 0;
    const maxRewardOption = Math.max(1, parsedAvailablePoints - parsedExistingValue - 1);
    const rewardOption = maxRewardOption > 0 ? Math.floor(Math.random() * maxRewardOption) + 1 : 1;
    await rewardGiftingOptions.enterTheAmountAndValidateNoError(String(rewardOption));
    await rewardGiftingOptions.clickOnSaveButton();
    await rewardGiftingOptions.verifyToastMessageIsVisibleWithText('Saved changes successfully');
    return rewardOption;
  }

  /**
   * Enable rewards and peer gifting if disabled
   */
  async enableTheRewardsAndPeerGiftingIfDisabled(): Promise<void> {
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(this.page);
    await manageRewardsOverviewPage.loadPage();
    await manageRewardsOverviewPage.enableTheRewardsAndPeerGiftingIfDisabled();
  }

  /**
   * Enable reward store and peer gifting if disabled
   */
  async enableTheRewardStoreAndPeerGiftingIfDisabled(): Promise<void> {
    const rewardsStore = new RewardsStore(this.page);
    await rewardsStore.loadPage();
    // Enable rewards first
    const manageRewardsOverviewPage = new ManageRewardsOverviewPage(this.page);
    await manageRewardsOverviewPage.enableTheRewardsAndPeerGiftingIfDisabled();
  }

  /**
   * Enable rewards and peer gifting if disabled (for Recognition Hub context)
   * This method checks the current state via API and enables both features if needed
   */
  async enableTheRewardsAndPeerGiftingForHubIfDisabled(): Promise<void> {
    const [apiResponse] = await Promise.all([
      this.page.waitForResponse(
        res =>
          res.url().includes('/recognition/v1/tenant/config') &&
          res.status() === 200 &&
          res.request().method() === 'GET'
      ),
      this.navigateToRecognitionHub(),
      this.verifyThePageIsLoaded(), // action that triggers API
    ]);
    const body = await apiResponse.json();
    const isRewardEnabled = body.rewardConfig?.enabled;
    const isPeerGiftingEnabled = body.rewardConfig?.peerGiftingEnabled;
    console.log(
      `${test.info().title}: Rewards Enabled: ${isRewardEnabled}, Peer Gifting Enabled: ${isPeerGiftingEnabled}`
    );
    if (!isRewardEnabled || !isPeerGiftingEnabled) {
      const manageRewardsPage = new ManageRewardsOverviewPage(this.page);
      await manageRewardsPage.loadPage();
      await this.checkTheRewardsIsEnabled(isRewardEnabled, isPeerGiftingEnabled);
    }
    await this.visitRecognitionHub();
  }

  /**
   * Check and enable rewards and peer gifting based on current state
   */
  private async checkTheRewardsIsEnabled(isRewardEnabled: boolean, isPeerGiftingEnabled: boolean): Promise<void> {
    const manageRewardsPage = new ManageRewardsOverviewPage(this.page);

    if (!isRewardEnabled && !isPeerGiftingEnabled) {
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
      await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');
    } else if (!isRewardEnabled && isPeerGiftingEnabled) {
      // Only rewards disabled: Enable rewards directly
      await manageRewardsPage.enableRewardsButton.waitFor({ state: 'visible', timeout: 15000 });
      await manageRewardsPage.clickOnElement(manageRewardsPage.enableRewardsButton, {
        stepInfo: 'Enabling rewards',
      });
      await manageRewardsPage.verifyToastMessageIsVisibleWithText('Rewards enabled');
      await expect(manageRewardsPage.rewardsTabHeading).toHaveText('Rewards overview');
    } else if (isRewardEnabled && !isPeerGiftingEnabled) {
      // Only peer gifting disabled: Enable peer gifting
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
    } else if (isRewardEnabled && isPeerGiftingEnabled) {
      // Both are already enabled, do nothing
      console.log('Reward and Peer Gifting are already enabled.');
    }
  }

  /**
   * Verify the page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.rewardRecognitionFirstPost, {
      timeout: 15000,
      assertionMessage: 'Recognition Hub page first Post should be visible',
    });
  }

  async validatedTheInsufficientPointError(
    recognitionHub: RecognitionHubPage,
    rewardOption: number,
    userCount: number
  ) {
    const textOfRecognitionButton = await recognitionHub.recognitionButtonText();
    const insufficientErrorMessage = await recognitionHub.insufficientPointErrorMessageIsDisplaying();
    const insufficientPointsWithRecipients = await recognitionHub.insufficientPointWithRecipientsErrorMessage();
    expect(textOfRecognitionButton).toContain(
      `Recognize & gift ${(Number(rewardOption) * userCount).toLocaleString()} points`
    );
    expect(insufficientPointsWithRecipients).toContain(
      `${userCount} recipients = ${(Number(rewardOption) * userCount).toLocaleString()} points`
    );
    expect(insufficientErrorMessage).toBe(true);
  }

  async deleteTheFirstRecognitionPost() {
    await this.clickOnTheFirstPostMoreOption('Delete');
    await this.deleteRecognitionDialogBoxContainer.waitFor({ state: 'visible' });
    await expect(this.deleteRecognitionDialogBoxTitle).toHaveText('Delete recognition');
    await expect(this.deleteRecognitionDialogBoxDeleteButton).toBeEnabled();
    await this.clickOnElement(this.deleteRecognitionDialogBoxDeleteButton);
    await expect(this.deleteRecognitionDialogBoxContainer).not.toBeVisible();
    await this.verifyToastMessageIsVisibleWithText('Recognition deleted');
  }
}
