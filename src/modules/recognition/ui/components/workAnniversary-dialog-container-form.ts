import { Locator, Page } from '@playwright/test';

import { BasePage } from '@core/pages/basePage';

export class DialogContainerForm extends BasePage {
  readonly container: Locator;
  readonly dialog: Locator;
  // Dialog header and basic elements
  readonly dailogHeader: Locator;
  readonly dailogIProfileEmblem: Locator;
  readonly dailogAwardeeName: Locator;
  readonly dailogSubHeader: Locator;
  readonly dailogSubWorkAnniversaryHeader: Locator;
  readonly dailogTipTapContent: Locator;
  readonly dailogCheerIcon: Locator;
  readonly dailogCommentIcon: Locator;
  readonly dailogShareIcon: Locator;
  readonly dailogCancelBtn: Locator;
  readonly dailogSaveBtn: Locator;
  readonly dailogCrossBtn: Locator;
  readonly dailogRemoveMilestoneBtn: Locator;

  // Customize message section
  readonly dailogCustomiseMsgLink: Locator;
  readonly dailogCustomiseMsgHeader: Locator;
  readonly dailogAttachAnImageBtn: Locator;
  readonly dailogContentEditorTextBox: Locator;
  readonly dailogContentBodyText: Locator;
  readonly dailogCustomiseMsgFooterText: Locator;
  readonly dailogCustomiseMsgError: Locator;

  // Customize author section
  readonly dailogCustomiseAuthorLink: Locator;
  readonly dailogCustomiseAuthorHeader: Locator;
  readonly dailogCustomiseNoAuthorRadio: Locator;
  readonly dailogCustomiseAuthorFooterText: Locator;
  readonly dailogIntranetNameRadio: Locator;
  readonly dailogAuthorNameLink: Locator;
  readonly dailogCustomAuthorTextBox: Locator;
  readonly dailogSelectedUserTextBox: Locator;
  readonly dailogSelectOptions: Locator;
  readonly dailogSelectUserValue: Locator;
  readonly dailogAuthorAppNameLabel: Locator;

  // Customize badge section
  readonly dailogCustomiseBadgeLink: Locator;
  readonly dailogCustomiseBadgeHeader: Locator;
  readonly dailogBadgeUploadBtn: Locator;
  readonly dailogFirstBagde: Locator;
  readonly dailogCustomiseBadgeFooterText: Locator;
  readonly dailogShowMoreBtn: Locator;

  // Additional dialog elements
  readonly dialogHeader: Locator;
  readonly dialogSaveBtn: Locator;
  readonly dialogCancelBtn: Locator;
  readonly intranetNameRadio: Locator;

  // Image attachment locators for award instance dialog
  readonly dailogAttachAnImageInput: Locator;
  readonly dailogUploadImageThumbnail: Locator;
  readonly dailogUploadImagePanel: Locator;
  readonly dailogUploadImageProgressBar: Locator;
  readonly dailogRemoveImageIcon: Locator;
  readonly dailogAddedImagePanel: Locator;
  readonly dailogAltTextIcon: Locator;

  constructor(page: Page) {
    super(page);
    this.container = page.locator('[role="dialog"][data-state="open"]');
    this.dialog = page.getByRole('dialog');

    // Dialog header and basic elements
    this.dailogHeader = this.dialog.getByText('year work anniversary').first();
    this.dailogIProfileEmblem = this.dialog.locator('[data-testid="i-profile"]').first();
    this.dailogAwardeeName = this.dialog.locator('[data-testid*="awardeeNames"]');
    this.dailogSubHeader = this.dialog.getByRole('heading', { name: 'year work anniversary' }).nth(1);
    this.dailogSubWorkAnniversaryHeader = this.dialog.getByText('WORK ANNIVERSARY', { exact: true });
    this.dailogTipTapContent = this.dialog
      .locator('[class*="MessageBubble"]')
      .locator('[class*="Tiptap_tiptapContent"]')
      .locator('p')
      .filter({ hasNotText: /^(intranetName|Recognized by)/i })
      .first();
    this.dailogCheerIcon = this.dialog.getByRole('button', { name: 'Cheer this recognition' });
    this.dailogCommentIcon = this.dialog.getByRole('button', { name: 'Comment on this recognition' });
    this.dailogShareIcon = this.dialog.getByRole('button', { name: 'Share this recognition' });
    this.dailogCancelBtn = this.dialog.getByRole('button', { name: 'Cancel' });
    this.dailogSaveBtn = this.dialog.getByRole('button', { name: 'Save' });
    this.dailogCrossBtn = this.dialog.getByRole('button', { name: 'Close' });
    this.dailogRemoveMilestoneBtn = this.dialog.getByRole('button', { name: 'Remove milestone instance' });

    // Customize message section
    this.dailogCustomiseMsgLink = this.dialog.getByRole('button', { name: 'Customize milestone instance message' });
    this.dailogCustomiseMsgHeader = this.dialog.getByRole('heading', { name: 'Message' });
    this.dailogAttachAnImageBtn = this.dialog.getByRole('button', { name: 'Attach an image' });
    this.dailogContentEditorTextBox = this.dialog.locator('[class*="tiptap ProseMirror"]');
    this.dailogContentBodyText = this.dialog.getByTestId('tiptap-content');
    this.dailogCustomiseMsgFooterText = this.dialog.getByText('Insert the name of the user');
    this.dailogCustomiseMsgError = this.dialog.getByText('Must not exceed 2,500 characters');

    // Customize author section
    this.dailogCustomiseAuthorLink = this.dialog.getByRole('button', { name: 'Customize milestone instance author' });
    this.dailogCustomiseAuthorHeader = this.dialog.getByRole('heading', { name: 'Author' });
    this.dailogCustomiseNoAuthorRadio = this.dialog.getByRole('radio', { name: 'No author' });
    this.dailogCustomiseAuthorFooterText = this.dialog.getByText('Select the user the');
    this.dailogIntranetNameRadio = this.dialog.getByRole('radio', { name: 'Intranet name' });
    this.dailogAuthorNameLink = this.dialog.locator('[class*="MessageBubble"] p[class*="Typography"]').first();
    this.dailogCustomAuthorTextBox = this.dialog.getByRole('textbox', { name: 'custom author name' });
    this.dailogSelectedUserTextBox = this.dialog.getByRole('combobox');
    this.dailogSelectOptions = this.dialog.getByRole('menuitem');
    this.dailogSelectUserValue = this.dialog.locator('[class*="MultiValueLabelWithIcon-module__label"]').first();
    this.dailogAuthorAppNameLabel = this.dialog.getByText('Intranet name');

    // Customize badge section
    this.dailogCustomiseBadgeLink = this.dialog.getByRole('button', { name: 'milestone instance badge' });
    this.dailogCustomiseBadgeHeader = this.dialog.getByRole('heading', { name: 'Badge' });
    this.dailogBadgeUploadBtn = this.dialog.getByRole('button', { name: 'Upload' });
    this.dailogFirstBagde = this.dialog.locator('[class*="AwardIcon"]').first();
    this.dailogCustomiseBadgeFooterText = this.dialog.getByText('Uploaded badges will be');
    this.dailogShowMoreBtn = this.dialog.getByRole('button', { name: 'Show more' });

    // Additional dialog elements
    this.dialogHeader = page.locator('[role="dialog"] h2').first();
    this.dialogSaveBtn = page.getByRole('button', { name: 'Save' });
    this.dialogCancelBtn = page.getByRole('button', { name: 'Cancel' });
    this.intranetNameRadio = this.dialog.getByRole('radio', { name: 'Intranet name' });

    // Image attachment locators for award instance dialog
    this.dailogAttachAnImageInput = this.dialog.locator('input[data-testid="uploadImageInput"]');
    this.dailogUploadImageThumbnail = this.dialog.locator('[class*="UploadMedia"] img');
    this.dailogUploadImagePanel = this.dialog.locator('[class*="UploadMedia_panel"]');
    this.dailogUploadImageProgressBar = this.dialog.getByRole('progressbar');
    this.dailogRemoveImageIcon = this.dialog.getByRole('button', { name: 'Remove image' });
    this.dailogAddedImagePanel = this.dialog.locator('[class*="imageContainer"] img');
    this.dailogAltTextIcon = this.dialog.getByRole('button', { name: 'Add image alt text' });
  }

  async verifyThePageIsLoaded(): Promise<void> {
    // Component doesn't need page load verification
    return Promise.resolve();
  }
}
