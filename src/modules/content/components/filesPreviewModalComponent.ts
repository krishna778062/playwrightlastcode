import test, { Locator, Page } from '@playwright/test';

import { FilesPreviewMoreActionsOption, FilesPreviewTooltip } from '../constants/filesPreviewEnums';

import { BaseComponent } from '@/src/core/components/baseComponent';

export class FilesPreviewModalComponent extends BaseComponent {
  get filesPreviewLoadingProgressBar(): Locator {
    return this.page.locator(`div[id="preview-modal"]`).locator(`div[role="progressbar"]`);
  }

  // Files Preview Icons locators
  get fileInfoIcon(): Locator {
    return this.page.locator(
      `#preview-modal button[aria-label="File info"][type="button"][data-testid][data-slot="tooltip-trigger"]`
    );
  }

  get moreActionsIcon(): Locator {
    return this.page.locator(
      '#preview-modal div[class*="PreviewModal-module-rightActions"] button[aria-label="Show more"]'
    );
  }

  get closeIcon(): Locator {
    return this.page.locator(
      `#preview-modal button[aria-label="Close"][type="button"][data-testid][data-slot="tooltip-trigger"]`
    );
  }

  // Files Preview More actions options locators
  get moreActionsOptionCopyLinkToThisFile(): Locator {
    return this.page
      .locator('[data-orientation="vertical"]')
      .locator('..')
      .getByText(`${FilesPreviewMoreActionsOption.CopyLinkToThisFile}`);
  }

  get moreActionsOptionOpenInNewBrowserTab(): Locator {
    return this.page
      .locator('[data-orientation="vertical"]')
      .locator('..')
      .locator('div')
      .filter({ hasText: `${FilesPreviewMoreActionsOption.OpenInNewBrowserTab}` });
  }

  get moreActionsOptionDelete(): Locator {
    return this.page.locator(
      `[role="menuitem"][data-orientation="vertical"] >> text=${FilesPreviewMoreActionsOption.Delete}`
    );
  }

  constructor(page: Page) {
    super(page);
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

  async verifyButtonIsDisplayedFor(buttonIconName: string) {
    const buttonIcon: Locator = this.page
      .locator(
        `#preview-modal button[aria-label="${buttonIconName}"][type="button"][data-testid][data-slot="tooltip-trigger"]`
      )
      .first();

    await this.verifier.verifyTheElementIsVisible(buttonIcon);
  }

  async clickOnIcon(buttonIconName: string) {
    await test.step(`Click on ${buttonIconName} icon`, async () => {
      switch (buttonIconName) {
        case `${FilesPreviewTooltip.File_info}`: {
          await this.verifier.verifyTheElementIsVisible(this.fileInfoIcon);
          await this.clickOnElement(this.fileInfoIcon);
        }

        case `${FilesPreviewTooltip.More_actions}`: {
          await this.verifier.verifyTheElementIsVisible(this.moreActionsIcon);
          await this.clickOnElement(this.moreActionsIcon);
          break;
        }

        case `${FilesPreviewTooltip.Close}`: {
          await this.verifier.verifyTheElementIsVisible(this.closeIcon);
          await this.clickOnElement(this.closeIcon);
          break;
        }

        default:
          throw new Error(`Unknown button type: ${buttonIconName}`);
      }
    });
  }

  async clickOnShowMoreActionsOption(moreActionsOption: string) {
    await test.step(`Click on ${moreActionsOption} option under More actions`, async () => {
      switch (moreActionsOption) {
        case `${FilesPreviewMoreActionsOption.CopyLinkToThisFile}`: {
          await this.verifier.verifyTheElementIsVisible(this.moreActionsOptionCopyLinkToThisFile);
          await this.clickOnElement(this.moreActionsOptionCopyLinkToThisFile);
          break;
        }

        case `${FilesPreviewMoreActionsOption.OpenInNewBrowserTab}`: {
          await this.verifier.verifyTheElementIsVisible(this.moreActionsOptionOpenInNewBrowserTab);
          await this.clickOnElement(this.moreActionsOptionOpenInNewBrowserTab);
          break;
        }

        case `${FilesPreviewMoreActionsOption.Delete}`: {
          await this.verifier.verifyTheElementIsVisible(this.moreActionsOptionDelete);
          await this.clickOnElement(this.moreActionsOptionDelete);
          break;
        }

        default:
          throw new Error(`Unknown button type: ${moreActionsOption}`);
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

  async verifyFilesPreviewToastMessage(message: string) {
    await this.verifyToastMessage(message, {
      stepInfo: `Verify with Toast Message displays ${message}`,
    });
    await this.verifyToastMessage(message);
  }
}
