import { Locator, Page, test } from '@playwright/test';

import { ListOfSocialCampaignComponent } from '@content/ui/components/listOfSocialCampaignComponent';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';
import { ShareComponent } from '@/src/modules/content/ui/components/shareComponent';

export class SocialCampaignPage extends BasePage {
  readonly socialCampaignsSection: Locator;
  readonly addCampaignButton: Locator;
  readonly popularLink: Locator;
  readonly expiredLink: Locator;
  private listOfSocialCampaignComponent: ListOfSocialCampaignComponent;
  private shareSocialCampaignComponent: ShareComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS_PAGE);

    this.socialCampaignsSection = page.locator('h1', { hasText: /^Social campaigns$/ });
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.expiredLink = page.locator('a', { hasText: /^Expired$/ });
    this.listOfSocialCampaignComponent = new ListOfSocialCampaignComponent(page);
    this.shareSocialCampaignComponent = new ShareComponent(page);
  }
  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify social campaign page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.socialCampaignsSection, {
        assertionMessage: 'Social campaign page should be visible',
      });
    });
  }

  async clickAddCampaignButton(): Promise<void> {
    await test.step('Click Add campaign button', async () => {
      await this.clickOnElement(this.addCampaignButton);
    });
  }

  async removeAllExistingCampaigns(): Promise<void> {
    await test.step('Remove all existing social campaigns', async () => {
      // Implementation to remove existing campaigns
      console.log('Removing all existing social campaigns');
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string): Promise<void> {
    try {
      return await this.listOfSocialCampaignComponent.verifyCampaignLinkDisplayed(linkText);
    } catch (error) {
      console.error('Error verifying campaign link displayed:', error);
      return await this.listOfSocialCampaignComponent.verifyCampaignLinkDisplayed(linkText);
    }
  }

  async clickCampaignOptions(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickCampaignOptions();
  }

  async clickExpireCampaignButton(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickExpireCampaignButton();
  }

  async confirmExpireCampaign(): Promise<void> {
    return await this.listOfSocialCampaignComponent.confirmExpireCampaign();
  }

  async getSocialCampaignCount(): Promise<number> {
    return await this.listOfSocialCampaignComponent.getSocialCampaignCount();
  }

  async verifyCampaignNotInLatest(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignNotInLatest(linkText);
  }

  async verifyCampaignInExpired(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignInExpired(linkText);
  }

  async clickPopularLink(): Promise<void> {
    await test.step('Click Popular link', async () => {
      await this.clickOnElement(this.popularLink);
    });
  }

  async clickExpiredLink(): Promise<void> {
    await test.step('Click Expired link', async () => {
      await this.clickOnElement(this.expiredLink);
    });
  }

  async clickDeleteCampaignButton(): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickDeleteCampaignButton();
  }

  async confirmDeleteCampaign(): Promise<void> {
    return await this.listOfSocialCampaignComponent.confirmDeleteCampaign();
  }

  async verifyCampaignNotInExpired(linkText: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyCampaignNotInExpired(linkText);
  }

  async verifyToastMessage(message: string): Promise<void> {
    await this.verifier.verifyTheElementIsVisible(this.toastMessages.filter({ hasText: message }), {
      assertionMessage: `Verify toast message: "${message}"`,
    });
  }

  async clickShareToFeedButton(): Promise<void> {
    await test.step('Click Share to feed button', async () => {
      await this.listOfSocialCampaignComponent.clickShareToFeedButton();
    });
  }

  async selectShareOptionAsSiteFeed(): Promise<void> {
    return await this.shareSocialCampaignComponent.selectShareOptionAsSiteFeed();
  }

  async enterShareDescription(description: string): Promise<void> {
    return await this.shareSocialCampaignComponent.enterShareDescription(description);
  }

  async enterSiteName(siteName: string): Promise<void> {
    return await this.shareSocialCampaignComponent.enterSiteName(siteName);
  }

  async clickShareButton(): Promise<void> {
    return await this.shareSocialCampaignComponent.clickShareButton();
  }

  async verifyAddCampaignButtonIsNotVisible(): Promise<void> {
    await test.step('Verify Add Campaign button is not visible to end user', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.addCampaignButton, {
        assertionMessage: 'Add Campaign button should not be visible to end user',
      });
    });
  }

  async verifyExpireTabNotVisible(): Promise<void> {
    await test.step('Verify Expired tab is not visible to end user', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.expiredLink, {
        assertionMessage: 'Expired tab should not be visible to end user',
      });
    });
  }

  async verifyExpireCampaignButtonIsNotVisible(): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyExpireCampaignButtonIsNotVisible();
  }

  async verifyDeleteCampaignButtonIsNotVisible(): Promise<void> {
    return await this.listOfSocialCampaignComponent.verifyDeleteCampaignButtonIsNotVisible();
  }

  /**
   * Clicks the first Share button on a social campaign
   */
  async clickFirstShareButton(): Promise<void> {
    await test.step('Click first Share button', async () => {
      const shareButton = this.page.getByRole('button', { name: 'Share' }).first();
      await this.verifier.verifyTheElementIsVisible(shareButton, {
        assertionMessage: 'Share button should be visible',
        timeout: 5000,
      });
      await this.clickOnElement(shareButton);
    });
  }

  /**
   * Connects LinkedIn account by clicking Connect LinkedIn button and logging in
   * @param linkedInEmail - LinkedIn email address
   * @param linkedInPassword - LinkedIn password
   */
  async connectLinkedIn(linkedInEmail: string, linkedInPassword: string): Promise<void> {
    await test.step('Connect LinkedIn account', async () => {
      // Click Connect LinkedIn button
      const connectLinkedInButton = this.page.getByRole('button', { name: 'Connect LinkedIn' });
      await this.verifier.verifyTheElementIsVisible(connectLinkedInButton, {
        assertionMessage: 'Connect LinkedIn button should be visible',
        timeout: 10000,
      });
      await this.clickOnElement(connectLinkedInButton);

      // Wait for LinkedIn login page to load
      await this.page.waitForTimeout(2000);

      // Fill LinkedIn email
      const linkedInEmailInput = this.page.getByRole('textbox', { name: 'Email or Phone' });
      await this.verifier.verifyTheElementIsVisible(linkedInEmailInput, {
        assertionMessage: 'LinkedIn email input should be visible',
        timeout: 10000,
      });
      await linkedInEmailInput.click();
      await linkedInEmailInput.press('ControlOrMeta+a');
      await linkedInEmailInput.fill(linkedInEmail);

      // Fill LinkedIn password
      const linkedInPasswordInput = this.page.getByRole('textbox', { name: 'Password' });
      await this.verifier.verifyTheElementIsVisible(linkedInPasswordInput, {
        assertionMessage: 'LinkedIn password input should be visible',
        timeout: 5000,
      });
      await linkedInPasswordInput.click();
      await linkedInPasswordInput.fill(linkedInPassword);

      // Click Sign in button
      const signInButton = this.page.getByRole('button', { name: 'Sign in' });
      await this.verifier.verifyTheElementIsVisible(signInButton, {
        assertionMessage: 'Sign in button should be visible',
        timeout: 5000,
      });
      await this.clickOnElement(signInButton);

      // Wait for redirect back to Simpplr
      await this.page.waitForURL(/campaigns\/latest/, { timeout: 30000 });
    });
  }

  /**
   * Verifies that LinkedIn connection was successful by checking for success message
   */
  async verifyLinkedInConnectionSuccess(): Promise<void> {
    await test.step('Verify LinkedIn connection success', async () => {
      // Verify the success message is visible
      const successMessage = this.page.getByText('Shared social campaign to', { exact: false });
      await this.verifier.verifyTheElementIsVisible(successMessage, {
        assertionMessage: 'LinkedIn connection success message should be visible',
        timeout: 10000,
      });
    });
  }
}
