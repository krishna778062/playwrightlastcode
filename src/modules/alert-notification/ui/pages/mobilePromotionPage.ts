import { Locator, Page, test } from '@playwright/test';

import { CommonActionsComponent } from '../components/commonActionsComponent';
import { FooterMobilePromotionComponent } from '../components/footerMobilePromotionComponent';
import { MobilePromotionEmailSMSComponent } from '../components/mobilePromotionEmailSMSComponent';
import { MobilePromotionQRModalComponent } from '../components/mobilePromotionQRModalComponent';

import { BasePage, PAGE_ENDPOINTS } from '@/src/core';

export class MobilePromotionPage extends BasePage {
  readonly footerMobilePromotionComponent: FooterMobilePromotionComponent;
  readonly mobilePromotionQRModalComponent: MobilePromotionQRModalComponent;
  readonly mobilePromotionEmailSMSComponent: MobilePromotionEmailSMSComponent;
  readonly commonActionsComponent: CommonActionsComponent;
  readonly sendLinkButton: Locator;
  readonly cancelButton: Locator;
  readonly distributionAndPromotionText: Locator;
  readonly enableText: Locator;
  readonly disableText: Locator;
  // readonly crossButton: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.HOME_PAGE);
    this.footerMobilePromotionComponent = new FooterMobilePromotionComponent(page);
    this.mobilePromotionQRModalComponent = new MobilePromotionQRModalComponent(page);
    this.mobilePromotionEmailSMSComponent = new MobilePromotionEmailSMSComponent(page);
    this.commonActionsComponent = new CommonActionsComponent(page);
    this.sendLinkButton = page.getByText('Send link');
    this.cancelButton = page.getByText('Cancel');
    this.distributionAndPromotionText = page.getByRole('heading', { name: 'Distribution and promotion' });
    this.enableText = page.getByText('Enable', { exact: true });
    this.disableText = page.getByText('Disable', { exact: true });
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

  async refreshPage(): Promise<void> {
    await test.step('Refresh the current page', async () => {
      await this.reloadPage();
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

  async navigateToApplicationMobileAppSettingsPage(): Promise<void> {
    await test.step('Navigate to application mobile app settings page', async () => {
      await this.page.goto(PAGE_ENDPOINTS.MOBILE_APP_SETTINGS_PAGE);
    });
  }
  async verifyDistributionAndPromotionTextIsDisplayed(): Promise<void> {
    await test.step('Verify distribution and promotion text is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.distributionAndPromotionText, {
        assertionMessage: 'Verify distribution and promotion text is visible',
        timeout: 30000,
      });
    });
  }

  async clickOnEnableDistributionAndPromotionButton(): Promise<void> {
    await test.step('Click on enable distribution and promotion button', async () => {
      await this.clickOnElement(this.enableText, { force: true });
    });
  }
  async clickOnDisableDistributionAndPromotionButton(): Promise<void> {
    await test.step('Click on disable distribution and promotion button', async () => {
      await this.clickOnElement(this.disableText, { force: true });
    });
  }
  async verifyEnableDistributionAndPromotionButtonIsDisplayed(): Promise<void> {
    await test.step('Verify enable distribution and promotion button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.enableText, {
        assertionMessage: 'Verify enable distribution and promotion button is visible',
        timeout: 30000,
      });
    });
  }
  async verifyDisableDistributionAndPromotionButtonIsDisplayed(): Promise<void> {
    await test.step('Verify disable distribution and promotion button is displayed', async () => {
      await this.verifier.verifyTheElementIsVisible(this.disableText, {
        assertionMessage: 'Verify disable distribution and promotion button is visible',
        timeout: 30000,
      });
    });
  }
}
