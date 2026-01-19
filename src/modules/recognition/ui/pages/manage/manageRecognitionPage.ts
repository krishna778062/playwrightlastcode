import { expect, Locator, Page, test } from '@playwright/test';
import { DialogContainerForm } from '@recognition/ui/components/common/dialog-container-form';
import { SubTabIndicator } from '@recognition/ui/components/common/sub-tab-indicator';
import { MESSAGES } from '@recognition-constants/messages';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class ManageRecognitionPage extends BasePage {
  subTabIndicator: SubTabIndicator;
  dialogContainerForm: DialogContainerForm;
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
  readonly renamingTab: Locator;

  constructor(page: Page, pageUrl: string = PAGE_ENDPOINTS.MANAGE_PEER_RECOGNITION) {
    super(page, pageUrl);
    this.subTabIndicator = new SubTabIndicator(page);
    this.dialogContainerForm = new DialogContainerForm(page);
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
    this.renamingTab = page.getByRole('tab', { name: 'Naming' });
  }

  /**
   * Verify that the manage recognition page is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verifying the manage recognition page is loaded', async () => {
      await expect(this.recognitionHeader, 'expecting manage recognition header element to be visible').toBeVisible({
        timeout: TIMEOUTS.LONG,
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
  async cleanupCreatedAwardInRecurringAwards(): Promise<void> {
    await test.step('Clean up - Delete recently created award', async () => {
      await this.subTabIndicator.clickOnColumnButton('Created', 2);
      await this.subTabIndicator.cleanupCreatedAward();
      await this.assertToastMessageIsVisible(MESSAGES.AWARD_DELETED);
    });
  }

  /**
   * Open the peer recognition dialog.
   */
  async openPeerRecognitionDialog(dialogContainerForm: DialogContainerForm): Promise<void> {
    await this.clickOnElement(this.peerRecognitionButton, { stepInfo: 'Clicking New peer recognition' });
    await dialogContainerForm.verifyThePageIsLoaded();
  }

  /**
   * Create a peer recognition award via dialog.
   */
  async createPeerRecognitionAwardViaDialog(
    dialogContainerForm: DialogContainerForm,
    awardName: string,
    awardDescription: string
  ): Promise<void> {
    await this.openPeerRecognitionDialog(dialogContainerForm);
    await dialogContainerForm.dialogAwardTextBox.fill(awardName);
    await dialogContainerForm.dialogAwardDescTextBox.fill(awardDescription);
    await dialogContainerForm.dialogAddButton.click();
    await this.assertToastMessageIsVisible(MESSAGES.NEW_AWARD_CREATED);
  }

  /**
   * Edit an existing peer recognition award via dialog.
   */
  async editPeerRecognitionAwardViaDialog(
    dialogContainerForm: DialogContainerForm,
    awardName: string,
    updatedAwardName: string
  ): Promise<void> {
    await this.subTabIndicator.getThreeDotsButton(awardName).click();
    await this.subTabIndicator.editMenuItem.click();
    await dialogContainerForm.dialogAwardTextBox.fill(updatedAwardName);
    await dialogContainerForm.dialogUpdateButton.click();
    await this.subTabIndicator.checkTheAwardNameInTable(updatedAwardName);
  }

  /**
   * Activate or deactivate an award.
   */
  async togglePeerRecognitionAwardStatus(awardName: string, action: 'Activate' | 'Deactivate'): Promise<void> {
    await this.subTabIndicator.getThreeDotsButton(awardName).click();
    if (action === 'Deactivate') {
      await this.subTabIndicator.deactivateMenuItem.click();
      await this.dialogContainerForm.dialogDeactivateButton.click();
    } else {
      await this.subTabIndicator.activateMenuItem.click();
    }
  }

  /**
   * Delete a peer recognition award.
   */
  async deletePeerRecognitionAward(awardName: string): Promise<void> {
    await this.subTabIndicator.getThreeDotsButton(awardName).click();
    await this.subTabIndicator.deleteMenuItem.click();
    await this.subTabIndicator.deleteButton.click();
    await this.assertToastMessageIsVisible(MESSAGES.AWARD_DELETED);
  }

  /**
   * End-to-end peer recognition award lifecycle using dialog container form.
   */
  async runPeerRecognitionLifecycle(options: {
    dialogContainerForm: DialogContainerForm;
    awardName: string;
    updatedAwardName: string;
    awardDescription: string;
  }): Promise<void> {
    const { dialogContainerForm, awardName, updatedAwardName, awardDescription } = options;

    await test.step('Create peer recognition award via dialog', async () => {
      await this.createPeerRecognitionAwardViaDialog(dialogContainerForm, awardName, awardDescription);
    });

    await test.step('Validate created award in grid', async () => {
      await this.subTabIndicator.clickOnColumnButton('Created', 2);
      await this.subTabIndicator.checkTheAwardNameInTable(awardName);
    });

    await test.step('Edit peer recognition award', async () => {
      await this.editPeerRecognitionAwardViaDialog(dialogContainerForm, awardName, updatedAwardName);
    });

    await test.step('Deactivate peer recognition award', async () => {
      await this.togglePeerRecognitionAwardStatus(updatedAwardName, 'Deactivate');
      await this.subTabIndicator.checkRecentlyCreatedAwardStatus('Inactive', 3);
    });

    await test.step('Activate peer recognition award', async () => {
      await this.togglePeerRecognitionAwardStatus(updatedAwardName, 'Activate');
      await this.subTabIndicator.checkRecentlyCreatedAwardStatus('Active', 3);
    });

    await test.step('Delete peer recognition award', async () => {
      await this.deletePeerRecognitionAward(updatedAwardName);
    });
  }
}
