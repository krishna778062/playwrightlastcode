import { expect, Locator, Page, test } from '@playwright/test';
import { RewardsAllowance } from '@rewards-components/manage-rewards/rewards-allowance';
import { WorkAnniversaryPage } from '@rewards-pages/work-anniversary/work-anniversary-page';
import * as console from 'node:console';

import { PAGE_ENDPOINTS } from '@core/constants/pageEndpoints';
import { TIMEOUTS } from '@core/constants/timeouts';
import { BasePage } from '@core/pages/basePage';

export class ManageRecognitionPage extends BasePage {
  readonly header: Locator;
  readonly milestonesTab: Locator;
  readonly toastAlertText: Locator;
  readonly showMoreButton: Locator;
  readonly automatedAwards: {
    getThreeDotsButton: (index: number) => Locator;
    editMenuItem: Locator;
    deactivateMenuItem: Locator;
    activeMenuItem: Locator;
  };
  readonly rewards: any; // This would need to be properly defined
  readonly dialogContainerForm: any; // This would need to be properly defined

  // Components
  readonly rewardsAllowance: RewardsAllowance;
  readonly workAnniversaryWithPoints: WorkAnniversaryPage;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.MANAGE_RECOGNITION_MILESTONES);

    this.header = page.locator('h1');
    this.milestonesTab = page.getByRole('tab', { name: 'Milestones' });
    this.toastAlertText = page.locator('div[role="alert"] p');
    this.showMoreButton = page.locator('button:has-text("Show more")');
    this.rewardsAllowance = new RewardsAllowance(page);
    this.workAnniversaryWithPoints = new WorkAnniversaryPage(page);

    // Automated awards menu items
    this.automatedAwards = {
      getThreeDotsButton: (index: number) =>
        page.locator(`[data-testid*="dataGridRow"] button[aria-label="Show more"]`).nth(index),
      editMenuItem: page.getByRole('menuitem', { name: 'Edit', exact: true }),
      deactivateMenuItem: page.getByRole('menuitem', { name: 'Deactivate' }),
      activeMenuItem: page.getByRole('menuitem', { name: 'Activate' }),
    };

    this.rewards = {
      enableTheRewardsAndPeerGiftingIfDisabled: async () => {
        // Mock implementation
        console.log('enableTheRewardsAndPeerGiftingIfDisabled called');
      },
      visit: async () => {
        await this.page.goto(PAGE_ENDPOINTS.MANAGE_REWARDS_PAGE);
      },
    };

    const dialog = page.getByRole('dialog');
    this.dialogContainerForm = {
      dailogHeader: dialog.getByText('year work anniversary').first(),
      dailogIProfileEmblem: dialog.locator('[data-testid="i-profile"]').first(),
      dailogAwardeeName: dialog.locator('[data-testid*="awardeeNames"]'),
      dailogSubHeader: dialog.getByRole('heading', { name: 'year work anniversary' }).nth(1),
      dailogSubWorkAnniversaryHeader: dialog.getByText('WORK ANNIVERSARY', { exact: true }),
      dailogTipTapContent: dialog
        .locator('[class*="MessageBubble"]')
        .locator('[class*="Tiptap_tiptapContent"]')
        .locator('p')
        .filter({ hasNotText: /^(intranetName|Recognized by)/i })
        .first(),
      dailogCheerIcon: dialog.getByRole('button', { name: 'Cheer this recognition' }),
      dailogCommentIcon: dialog.getByRole('button', { name: 'Comment on this recognition' }),
      dailogShareIcon: dialog.getByRole('button', { name: 'Share this recognition' }),
      dailogCancelBtn: dialog.getByRole('button', { name: 'Cancel' }),
      dailogSaveBtn: dialog.getByRole('button', { name: 'Save' }),
      dailogCrossBtn: dialog.getByRole('button', { name: 'Close' }),
      dailogRemoveMilestoneBtn: dialog.getByRole('button', { name: 'Remove milestone instance' }),
      dailogCustomiseMsgLink: dialog.getByRole('button', { name: /milestone instance message/i }),
      dailogCustomiseMsgHeader: dialog.getByRole('heading', { name: 'Message' }),
      dailogAttachAnImageBtn: dialog.getByRole('button', { name: 'Attach an image' }),
      dailogContentEditorTextBox: dialog.locator('[class*="tiptap ProseMirror"]'),
      dailogContentBodyText: dialog.getByTestId('tiptap-content'),
      dailogCustomiseMsgFooterText: dialog.getByText('Insert the name of the user'),
      dailogCustomiseAuthorLink: dialog.getByRole('button', { name: 'Customize milestone instance author' }),
      dailogCustomiseAuthorHeader: dialog.getByRole('heading', { name: 'Author' }),
      dailogCustomiseNoAuthorRadio: dialog.getByRole('radio', { name: 'No author' }),
      dailogCustomiseAuthorFooterText: dialog.getByText('Select the user the'),
      dailogIntranetNameRadio: dialog.getByRole('radio', { name: 'Intranet name' }),
      dailogAuthorNameLink: dialog.locator('[class*="MessageBubble"] p[class*="Typography"]').first(),
      dailogCustomAuthorTextBox: dialog.getByRole('textbox', { name: 'custom author name' }),
      dailogSelectedUserTextBox: dialog.getByRole('combobox'),
      dailogSelectOptions: dialog.getByRole('menuitem'),
      dailogSelectUserValue: dialog.locator('[class*="MultiValueLabelWithIcon-module__label"]').first(),
      dailogAuthorAppNameLabel: dialog.getByText('Intranet name'),
      dailogCustomiseMsgError: dialog.getByText('Must not exceed 2,500 characters'),
      dailogCustomiseBadgeLink: dialog.getByRole('button', { name: 'milestone instance badge' }),
      dailogCustomiseBadgeHeader: dialog.getByRole('heading', { name: 'Badge' }),
      dailogBadgeUploadBtn: dialog.getByRole('button', { name: 'Upload' }),
      dailogFirstBagde: dialog.locator('[class*="AwardIcon"]').first(),
      dailogCustomiseBadgeFooterText: dialog.getByText('Uploaded badges will be'),
      dailogShowMoreBtn: dialog.getByRole('button', { name: 'Show more' }),
      dialogHeader: page.locator('[role="dialog"] h2').first(),
      dialogSaveBtn: page.getByRole('button', { name: 'Save' }),
      dialogCancelBtn: page.getByRole('button', { name: 'Cancel' }),
      intranetNameRadio: dialog.getByRole('radio', { name: 'Intranet name' }),
      // Image attachment locators for award instance dialog
      dailogAttachAnImageInput: dialog.locator('input[data-testid="uploadImageInput"]'),
      dailogUploadImageThumbnail: dialog.locator('[class*="UploadMedia"] img'),
      dailogUploadImagePanel: dialog.locator('[class*="UploadMedia_panel"]'),
      dailogUploadImageProgressBar: dialog.getByRole('progressbar'),
      dailogRemoveImageIcon: dialog.getByRole('button', { name: 'Remove image' }),
      dailogAddedImagePanel: dialog.locator('[class*="imageContainer"] img'),
      dailogAltTextIcon: dialog.getByRole('button', { name: 'Add image alt text' }),
    };
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
      await expect(this.header).toBeVisible({
        timeout: TIMEOUTS.MEDIUM,
      });
    });
  }

  /**
   * Verify recognition page is loaded
   */
  async verifyRecognitionPageLoaded(): Promise<void> {
    await test.step('User should be on recognition page', async () => {
      await expect(this.header).toBeVisible({
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

  verifyThePageIsLoaded(): Promise<void> {
    return Promise.resolve(undefined);
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
