import { BaseComponent } from '@/src/core/components/baseComponent';
import { Locator, Page,test } from '@playwright/test';

export class ImageCropperComponent extends BaseComponent {
  readonly imageCropperContainer: Locator;
  readonly cropOptions: Locator;
  readonly nextButton: Locator;
  readonly cancelButton: Locator;
  readonly addButton: Locator;
  constructor(readonly page: Page) {
    super(page);
    this.imageCropperContainer = page.locator("[class*='ImageCropper-module-container']");
    this.cropOptions = page.locator("button[class*='module-cropListItem']");
    this.nextButton = page.getByRole('button', { name: 'Next' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.addButton = page.getByRole('button', { name: 'Add' });
  }
  

  async verifyTheImageCropperIsVisible(options?: { stepInfo?: string }): Promise<void> {
    await test.step(options?.stepInfo || `Verifying image cropper is visible`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.imageCropperContainer);
    });
  }

  async selectCropOption(cropOptionToSelect: "Widescreen" | "Square"): Promise<void> {
    await test.step(`Selecting crop option: ${cropOptionToSelect}`, async () => {
      await this.cropOptions.filter({ hasText: cropOptionToSelect }).click();
    });
  }
  
  async clickOnNextButton(): Promise<void> {
    await test.step(`Clicking on next button`, async () => {
      await this.nextButton.click();
    });
  }

  async clickOnCancelButton(): Promise<void> {
    await test.step(`Clicking on cancel button`, async () => {
      await this.cancelButton.click();
    });
  }

  async clickOnAddButton(): Promise<void> {
    await test.step(`Clicking on add button`, async () => {
      await this.addButton.click();
    });
  }
}