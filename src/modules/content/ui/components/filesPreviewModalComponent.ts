import test, { Locator, Page } from '@playwright/test';

import {
  FilesPreviewDeleteModal,
  FilesPreviewShowMoreActionsOption,
  FilesPreviewToastMessages,
} from '@content/constants/filesPreviewEnums';

export enum FilesPreviewMenuActionButton {
  DOWNLOAD = 'Download',
  FILE_INFO = 'File info',
  EDIT = 'Edit',
  ANALYTICS = 'Analytics',
  SHOW_MORE_ACTIONS = 'Show more',
}

import { BaseComponent } from '@/src/core/ui/components/baseComponent';

export class FilesPreviewModalComponent extends BaseComponent {
  get filesPreviewLoadingProgressBar(): Locator {
    return this.filesPreviewModalContainer.locator(`div[role="progressbar"]`);
  }

  getFileNameTitleLocator(titleWithExtension: string): Locator {
    return this.page.locator(`#preview-modal #modalTitle h3:has-text("${titleWithExtension}")`);
  }

  getShowMoreActionOptionLocator(showMoreActionOptions: FilesPreviewShowMoreActionsOption): Locator {
    return this.page.getByText(showMoreActionOptions);
  }

  get showMoreButtonLocator(): Locator {
    return this.filesPreviewModalContainer.getByRole('button', { name: 'Show more' });
  }

  getMenuActionButtonLocator(menuActionButton: FilesPreviewMenuActionButton): Locator {
    return this.filesPreviewModalContainer.getByLabel(menuActionButton).first();
  }

  getDeleteOrCancelButtonLocator(option: string): Locator {
    return this.page.locator(`div[role="dialog"] button:has-text("${option}")`);
  }

  readonly filesPreviewModalContainer: Locator;
  constructor(page: Page) {
    super(page);
    this.filesPreviewModalContainer = page.locator('#preview-modal');
  }

  async verifyProgressBarLoadingIsComplete() {
    await this.verifier.verifyTheElementIsVisible(this.filesPreviewLoadingProgressBar);
    await this.verifier.verifyTheElementIsNotVisible(this.filesPreviewLoadingProgressBar);
  }

  async verifyFileNameTitle(expectedTitleWithExtension: string) {
    await test.step(`Verify the File Name ${expectedTitleWithExtension} is shown correctly in Files Preview`, async () => {
      const fileNameTitle: Locator = this.getFileNameTitleLocator(expectedTitleWithExtension);

      await this.verifier.verifyTheElementIsVisible(fileNameTitle);
    });
  }

  async clickOnShowMoreActionsOption(showMoreActionOptions: FilesPreviewShowMoreActionsOption) {
    await test.step(`Click on ${showMoreActionOptions} option under More actions`, async () => {
      await this.clickOnElement(this.getShowMoreActionOptionLocator(showMoreActionOptions));
    });
  }

  async clickOnPreviewMenuActionButton(menuActionButtons: FilesPreviewMenuActionButton) {
    await test.step(`Click on ${menuActionButtons} menu action`, async () => {
      if (menuActionButtons === FilesPreviewMenuActionButton.SHOW_MORE_ACTIONS) {
        await this.clickOnElement(this.showMoreButtonLocator);
      } else {
        await this.clickOnElement(this.getMenuActionButtonLocator(menuActionButtons));
      }
    });
  }

  async confirmDeleteOrCancelFromDeleteFileModal(option: string) {
    await test.step(`Confirm ${option} option from Delete file modal`, async () => {
      const deleteOrCancel: Locator = this.getDeleteOrCancelButtonLocator(option);

      await this.verifier.verifyTheElementIsVisible(deleteOrCancel);
      await this.clickOnElement(deleteOrCancel);
    });
  }

  async deleteFile() {
    await this.clickOnPreviewMenuActionButton(FilesPreviewMenuActionButton.SHOW_MORE_ACTIONS);
    await this.clickOnShowMoreActionsOption(FilesPreviewShowMoreActionsOption.Delete);
    await this.confirmDeleteOrCancelFromDeleteFileModal(FilesPreviewDeleteModal.Delete);
    await this.verifyToastMessageIsVisibleWithText(FilesPreviewToastMessages.DeletedFileSuccessfully);
  }

  /**
   * Gets the locator for the like/unlike button in the files preview modal
   * @returns Locator for the like/unlike button
   */
  getLikeButtonLocator(): Locator {
    return this.filesPreviewModalContainer.getByRole('button', { name: /^Like|Unlike$/i }).first();
  }

  /**
   * Gets the locator for the favorite/unfavorite button in the files preview modal
   * @returns Locator for the favorite/unfavorite button
   */
  getFavoriteButtonLocator(): Locator {
    return this.filesPreviewModalContainer.getByRole('button', { name: /^Favorite|Unfavorite$/i }).first();
  }

  /**
   * Gets the locator for the close button in the files preview modal
   * @returns Locator for the close button
   */
  getCloseButtonLocator(): Locator {
    return this.filesPreviewModalContainer.getByRole('button', { name: 'Close' }).first();
  }

  /**
   * Verifies that the like button is visible in the files preview modal
   */
  async verifyLikeButtonIsVisible(): Promise<void> {
    await test.step('Verify like button is visible in files preview modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getLikeButtonLocator(), {
        assertionMessage: 'Like button should be visible',
      });
    });
  }

  /**
   * Verifies that the favorite button is visible in the files preview modal
   */
  async verifyFavoriteButtonIsVisible(): Promise<void> {
    await test.step('Verify favorite button is visible in files preview modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getFavoriteButtonLocator(), {
        assertionMessage: 'Favorite button should be visible',
      });
    });
  }

  /**
   * Verifies that the show more button is visible in the files preview modal
   */
  async verifyShowMoreButtonIsVisible(): Promise<void> {
    await test.step('Verify show more button is visible in files preview modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.showMoreButtonLocator, {
        assertionMessage: 'Show more button (for delete) should be visible',
      });
    });
  }

  /**
   * Verifies that the close button is visible in the files preview modal
   */
  async verifyCloseButtonIsVisible(): Promise<void> {
    await test.step('Verify close button is visible in files preview modal', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getCloseButtonLocator(), {
        assertionMessage: 'Close button should be visible',
      });
    });
  }

  /**
   * Clicks the like button in the files preview modal
   */
  async clickLikeButton(): Promise<void> {
    await test.step('Click like button in files preview modal', async () => {
      await this.clickOnElement(this.getLikeButtonLocator());
    });
  }

  /**
   * Clicks the favorite button in the files preview modal
   */
  async clickFavoriteButton(): Promise<void> {
    await test.step('Click favorite button in files preview modal', async () => {
      await this.clickOnElement(this.getFavoriteButtonLocator());
    });
  }

  /**
   * Clicks the close button in the files preview modal
   */
  async clickCloseButton(): Promise<void> {
    await test.step('Click close button in files preview modal', async () => {
      await this.clickOnElement(this.getCloseButtonLocator());
    });
  }
}
