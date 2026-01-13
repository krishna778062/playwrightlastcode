import { expect, Locator, Page, test } from '@playwright/test';

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
