import { Locator, Page, test } from '@playwright/test';

import { FooterMobilePromotionComponent } from '../components/footerMobilePromotionComponent';
import { MobilePromotionEmailSMSComponent } from '../components/mobilePromotionEmailSMSComponent';
import { MobilePromotionQRModalComponent } from '../components/mobilePromotionQRModalComponent';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

export class MobilePromotionPage extends BasePage {
  readonly footerMobilePromotionComponent: FooterMobilePromotionComponent;
  readonly mobilePromotionQRModalComponent: MobilePromotionQRModalComponent;
  readonly mobilePromotionEmailSMSComponent: MobilePromotionEmailSMSComponent;
  readonly sendLinkButton: Locator;
  readonly cancelButton: Locator;
  readonly crossButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.footerMobilePromotionComponent = new FooterMobilePromotionComponent(page);
    this.mobilePromotionQRModalComponent = new MobilePromotionQRModalComponent(page);
    this.mobilePromotionEmailSMSComponent = new MobilePromotionEmailSMSComponent(page);
    this.sendLinkButton = page.getByText('Send link');
    this.cancelButton = page.getByText('Cancel');
    this.crossButton = page.getByRole('button', { name: 'Dismiss' });
  }

  /**
   * Verifies the mobile promotion section is loaded
   */
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify mobile promotion section is loaded', async () => {
      await this.footerMobilePromotionComponent.scrollToComponent();
      await this.footerMobilePromotionComponent.verifyMobilePromotionDownloadTextIsDisplayed();
    });
  }

  async verifySendLinkButtonIsDisplayed(): Promise<void> {
    await test.step('Verify send link button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.sendLinkButton, {
        assertionMessage: 'Verify send link button is visible',
        timeout: 30000,
      });
    });
  }
  async verifyCancelButtonIsDisplayed(): Promise<void> {
    await test.step('Verify cancel button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.cancelButton, {
        assertionMessage: 'Verify cancel button is visible',
        timeout: 30000,
      });
    });
  }
  async clickOnCancelButton(): Promise<void> {
    await test.step('Click on cancel button', async () => {
      await this.clickOnElement(this.cancelButton, { force: true });
    });
  }
  async clickOnSendLinkButton(): Promise<void> {
    await test.step('Click on send link button', async () => {
      await this.clickOnElement(this.sendLinkButton, { force: true });
    });
  }

  /**
   * Clicks on the dismiss button
   */
  async clickOnDismissButton(): Promise<void> {
    await test.step('Click on dismiss button', async () => {
      await this.clickOnElement(this.crossButton);
    });
  }
}
