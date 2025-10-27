import { Locator, Page, test } from '@playwright/test';

import { BaseComponent } from '@/src/core';

export class FooterMobilePromotionComponent extends BaseComponent {
  readonly mobilePromotionIosIcon: Locator;
  readonly mobilePromotionAndroidIcon: Locator;
  readonly mobilePromotionDownloadText: Locator;

  constructor(page: Page) {
    super(page);
    this.mobilePromotionIosIcon = page.getByRole('img', { name: 'Apple App Store' });
    this.mobilePromotionAndroidIcon = page.getByRole('img', { name: 'Google Play Store' });
    this.mobilePromotionDownloadText = page.getByText('Download the app and get Simpplr on your mobile');
  }

  /**
   * Verifies the mobile promotion download text is displayed
   */
  async verifyMobilePromotionDownloadTextIsDisplayed(): Promise<void> {
    await test.step('Verify mobile promotion download text is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mobilePromotionDownloadText, {
        assertionMessage: 'Verify mobile promotion download text is visible',
        timeout: 80000,
      });
    });
  }

  /**
   * Clicks on the mobile promotion iOS icon
   */
  async clickOnMobilePromotionIosIcon(): Promise<void> {
    await test.step('Click on mobile promotion iOS icon', async () => {
      await this.clickOnElement(this.mobilePromotionIosIcon);
    });
  }

  /**
   * Clicks on the mobile promotion Android icon
   */
  async clickOnMobilePromotionAndroidIcon(): Promise<void> {
    await test.step('Click on mobile promotion Android icon', async () => {
      await this.clickOnElement(this.mobilePromotionAndroidIcon);
    });
  }

  /**
   * Verifies the mobile promotion iOS icon is displayed
   */
  async verifyMobilePromotionIosIconIsDisplayed(): Promise<void> {
    await test.step('Verify mobile promotion iOS icon is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mobilePromotionIosIcon, {
        assertionMessage: 'Verify mobile promotion iOS icon is visible',
        timeout: 30000,
      });
    });
  }

  /**
   * Verifies the mobile promotion Android icon is displayed
   */
  async verifyMobilePromotionAndroidIconIsDisplayed(): Promise<void> {
    await test.step('Verify mobile promotion Android icon is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.mobilePromotionAndroidIcon, {
        assertionMessage: 'Verify mobile promotion Android icon is visible',
        timeout: 30000,
      });
    });
  }
}
