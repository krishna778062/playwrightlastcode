import { expect, Locator, Page, test } from '@playwright/test';

import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

import { MESSAGES } from '../../constants/messages';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export class ManageRecognitionPage extends BasePage {
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

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION) {
    super(page, pageUrl);
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
}
