import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class MobilePromotionQRModalComponent extends BaseComponent {
  readonly descriptionText: Locator;
  readonly scanQRButton: Locator;
  readonly getAppLinkButton: Locator;

  constructor(page: Page) {
    super(page);

    this.descriptionText = page.getByText(
      'All the latest company news, quick access to company docs and your entire company directory from your pocket - wherever you need it'
    );
    this.scanQRButton = page.getByTitle('Scan QR');
    this.getAppLinkButton = page.getByText('Get app link');
  }

  async verifyMobilePromotionModalIsOpen(): Promise<void> {
    await test.step('Verify mobile promotion modal is open', async () => {
      await this.verifier.verifyTheElementIsVisible(this.descriptionText, {
        assertionMessage: 'Verify mobile promotion modal is open',
        timeout: 30000,
      });
    });
  }

  async verifyDescriptionTextIsDisplayed(): Promise<void> {
    await test.step('Verify description text is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.descriptionText, {
        assertionMessage: 'Verify description text is visible',
        timeout: 30000,
      });
    });
  }

  async verifyScanQRButtonIsDisplayed(): Promise<void> {
    await test.step('Verify scan QR button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.scanQRButton, {
        assertionMessage: 'Verify scan QR button is visible',
        timeout: 30000,
      });
    });
  }

  async verifyGetAppLinkButtonIsDisplayed(): Promise<void> {
    await test.step('Verify get app link button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.getAppLinkButton, {
        assertionMessage: 'Verify get app link button is visible',
        timeout: 30000,
      });
    });
  }

  async clickOnScanQRButton(): Promise<void> {
    await test.step('Click on scan QR button', async () => {
      await this.clickOnElement(this.scanQRButton, { force: true });
    });
  }

  async clickOnGetAppLinkButton(): Promise<void> {
    await test.step('Click on get app link button', async () => {
      await this.clickOnElement(this.getAppLinkButton, { force: true });
    });
  }
}
