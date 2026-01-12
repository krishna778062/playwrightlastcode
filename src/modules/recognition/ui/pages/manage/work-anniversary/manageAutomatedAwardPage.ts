import { expect, Locator, Page, test } from '@playwright/test';
import { MESSAGES } from '@recognition-constants/messages';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { SubTabIndicator } from '../../../components/common/sub-tab-indicator';

export class ManageAutomatedAwardPage extends BasePage {
  subTabIndicator: SubTabIndicator;
  readonly recognitionHeader: Locator;
  readonly peerRecognitionTab: Locator;
  readonly spotAwardTab: Locator;
  readonly milestonesTab: Locator;
  readonly recurringTab: Locator;
  readonly badgesTab: Locator;
  readonly analyticsLink: Locator;
  readonly peerRecognitionButton: Locator;
  readonly addBadgeButton: Locator;
  readonly featureNotAvailable: Locator;
  readonly featureNotEnabled: Locator;
  readonly toastAlertText: Locator;
  readonly showMoreButton: Locator;
  readonly automatedAwards: {
    getThreeDotsButton: (index: number) => Locator;
    editMenuItem: Locator;
    deactivateMenuItem: Locator;
    activeMenuItem: Locator;
  };

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION) {
    super(page, pageUrl);
    this.subTabIndicator = new SubTabIndicator(page);
    this.recognitionHeader = page.getByRole('heading', { name: 'Recognition' }).first();
    this.analyticsLink = page.locator('[class^="Manage_analytics]');
    this.peerRecognitionButton = page.getByRole('button', { name: 'New peer recognition' });
    this.addBadgeButton = page.getByRole('button', { name: 'Add badges' });
    this.featureNotAvailable = page.getByText('Feature Unavailable');
    this.featureNotEnabled = page.getByText('This feature is not currently enabled');
    this.peerRecognitionTab = page.getByRole('tab', { name: 'Peer Recognition' });
    this.spotAwardTab = page.getByRole('tab', { name: 'Spot awards' });
    this.milestonesTab = page.getByRole('tab', { name: 'Milestones' });
    this.recurringTab = page.getByRole('tab', { name: 'Recurring awards' });
    this.badgesTab = page.getByRole('tab', { name: 'Badges' });
    this.toastAlertText = page.locator('div[role="alert"] p');
    this.showMoreButton = page.locator('button:has-text("Show more")');

    // Automated awards menu items
    this.automatedAwards = {
      getThreeDotsButton: (index: number) =>
        page.locator(`[data-testid*="dataGridRow"] button[aria-label="Show more"]`).nth(index),
      editMenuItem: page.getByRole('menuitem', { name: 'Edit', exact: true }),
      deactivateMenuItem: page.getByRole('menuitem', { name: 'Deactivate' }),
      activeMenuItem: page.getByRole('menuitem', { name: 'Activate' }),
    };
  }

  /**
   * Verify that the manage recognition page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the manage recognition page is loaded', async () => {
      await expect(this.recognitionHeader, 'expecting manage recognition header element to be visible').toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Navigate to Recognition pages via endpoint
   */
  async navigateManageRecognitionPageViaEndpoint(pageName: string, endpoint: string): Promise<void> {
    await test.step(`Navigating to ${endpoint} via endpoint`, async () => {
      let page: Locator;
      switch (pageName) {
        case 'manage':
          page = this.recognitionHeader;
          break;
        case 'peer':
          page = this.peerRecognitionButton;
          break;
        default:
          throw new Error(`Page name with name ${pageName} not found`);
      }
      await this.page.goto(endpoint);
      await this.verifyThePageIsLoaded();
      await expect(page).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Navigate to Peer Recognition tab and check if its accessible
   */
  async verifyPeerRecognitionAccessibleInP2POnlyMode(): Promise<void> {
    await test.step(`User is able to access Peer recognition page when only P2p is active in an org`, async () => {
      await expect(this.peerRecognitionTab).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.peerRecognitionButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Navigate to Badge tab and check if its accessible
   */
  async verifyBadgeTabAccessibleInP2POnlyMode(): Promise<void> {
    await test.step(`User is able to access Badge page when only P2p is active in an org`, async () => {
      await expect(this.badgesTab).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await this.clickOnElement(this.badgesTab, { stepInfo: 'Clicking on Badge tab' });
      await expect(this.addBadgeButton).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
    });
  }

  /**
   * Navigate to not accessible tabs in manage recognition page when only P2P is enabled and verify the message
   */
  async verifyTabNotAccessibleInP2POnlyMode(tabName: string): Promise<void> {
    await test.step(`User is not able to access ${tabName} page when only P2p is active in an org`, async () => {
      let tab: Locator;
      switch (tabName) {
        case 'Spot awards':
          tab = this.spotAwardTab;
          break;
        case 'Milestones':
          tab = this.milestonesTab;
          break;
        case 'Recurring awards':
          tab = this.recurringTab;
          break;
        default:
          throw new Error(`Tab with name ${tabName} not found`);
      }
      await this.clickOnElement(tab, { stepInfo: `Clicking on ${tabName} tab` });
      await expect(this.featureNotAvailable).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.featureNotEnabled).toBeVisible({ timeout: TIMEOUTS.MEDIUM });
      await expect(this.featureNotEnabled).toContainText(MESSAGES.FEATURE_NOT_AVAILABLE);
    });
  }

  /**
   * Assert that recurring award submission is successful by verifying toast message
   * Checks for Continue button and clicks it if present, then verifies success toast
   */
  async assertToastMessageIsVisible(toastMessage: string): Promise<void> {
    await test.step('Verifying success toast message: New award created', async () => {
      const toastLocator = this.page.getByRole('alert').filter({ hasText: toastMessage }).first();
      await this.verifier.verifyTheElementIsVisible(toastLocator, {
        timeout: TIMEOUTS.MEDIUM,
        assertionMessage: `Toast message should be visible: ${toastMessage}`,
      });
    });
  }

  /**
   * Clean up the created award
   */
  async cleanupCreatedAward(): Promise<void> {
    await test.step('Clean up - Delete recently created award', async () => {
      const button = this.subTabIndicator.createdColumnButton;
      for (let i = 0; i < 2; i++) {
        await button.click();
        await this.page.waitForTimeout(500);
      }
      await this.subTabIndicator.getThreeDotsButton(0).click();
      await this.subTabIndicator.deleteMenuItem.click();
      await this.page.waitForTimeout(500);
      await this.subTabIndicator.deleteButton.click();
      await this.assertToastMessageIsVisible(MESSAGES.AWARD_DELETED);
    });
  }
  async navigateViaUrl(url: string) {
    await this.page.goto(url);
  }

  /**
   * Navigate to automated awards page
   */
  async navigateToAutomatedAwardsPage(): Promise<void> {
    await test.step('User should be on automated award page', async () => {
      await this.navigateViaUrl(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(this.page).toHaveURL(PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);
      await expect(this.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify recognition page is loaded
   */
  async verifyRecognitionPageLoaded(): Promise<void> {
    await test.step('User should be on recognition page', async () => {
      await expect(this.recognitionHeader).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify automated awards tab is visible
   */
  async verifyAutomatedAwardsTabVisible(): Promise<void> {
    await test.step('Validate automated awards tab', async () => {
      await expect(this.milestonesTab).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Returns a locator for a text box by matching its accessible name exactly.
   * @param textBoxName - The exact accessible name of the text box.
   * @returns - A Locator for the specified text box element.
   */
  getTextBoxByPassingText(textBoxName: string): Locator {
    return this.page.getByRole('textbox', { name: textBoxName, exact: true });
  }

  /**
   * Returns a locator for a button by matching its accessible name (partial or full).
   * @param buttonName - Partial or full accessible name of the button.
   * @returns - A Locator for the matching button element.
   */
  getButtonByPassingText(buttonName: string): Locator {
    return this.page.getByRole('button', { name: buttonName });
  }
}
