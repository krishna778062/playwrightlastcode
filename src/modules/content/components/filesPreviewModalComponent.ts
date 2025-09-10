import test, { Locator, Page } from '@playwright/test';

import {
  FilesPreviewDeleteModal,
  FilesPreviewShowMoreActionsOption,
  FilesPreviewToastMessages,
} from '../constants/filesPreviewEnums';

import { BaseComponent } from '@/src/core/components/baseComponent';

export enum FilesPreviewMenuActionButton {
  DOWNLOAD = 'Download',
  FILE_INFO = 'File info',
  EDIT = 'Edit',
  ANALYTICS = 'Analytics',
  SHOW_MORE_ACTIONS = 'Show more',
}

export class FilesPreviewModalComponent extends BaseComponent {
  get filesPreviewLoadingProgressBar(): Locator {
    return this.filesPreviewModalContainer.locator(`div[role="progressbar"]`);
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
      const fileNameTitle: Locator = this.page.locator(
        `#preview-modal #modalTitle h3:has-text("${expectedTitleWithExtension}")`
      );

      await this.verifier.verifyTheElementIsVisible(fileNameTitle);
    });
  }

  async clickOnShowMoreActionsOption(showMoreActionOptions: FilesPreviewShowMoreActionsOption) {
    await test.step(`Click on ${showMoreActionOptions} option under More actions`, async () => {
      await this.page.getByText(showMoreActionOptions).click();
    });
  }

  async clickOnPreviewMenuActionButton(menuActionButtons: FilesPreviewMenuActionButton) {
    await test.step(`Click on ${menuActionButtons} menu action`, async () => {
      if (menuActionButtons === FilesPreviewMenuActionButton.SHOW_MORE_ACTIONS) {
        const actionLocator = this.filesPreviewModalContainer.getByRole('button', { name: 'Show more' });
        await this.clickOnElement(actionLocator);
      } else {
        const actionLocator = this.filesPreviewModalContainer.getByLabel(menuActionButtons).first();
        await this.clickOnElement(actionLocator);
      }
    });
  }

  async confirmDeleteOrCancelFromDeleteFileModal(option: string) {
    await test.step(`Confirm ${option} option from Delete file modal`, async () => {
      const deleteOrCancel: Locator = this.page.locator(`div[role="dialog"] button:has-text("${option}")`);

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
}
