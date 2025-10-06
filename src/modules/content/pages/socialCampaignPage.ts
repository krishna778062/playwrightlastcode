import { Locator, Page, Response, test } from '@playwright/test';

import { ListOfSocialCampaignComponent } from '@content/components/listOfSocialCampaignComponent';
import { AddCampaignPage } from '@content/pages/addCampaignPage';
import { BasePage } from '@core/pages/basePage';
import { SocialCampaignOptions } from '@core/types/social-campaign.types';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISocialCampaignPageActions {
  removeAllExistingCampaigns: () => Promise<void>;
  clickPopularLink: () => Promise<void>;
  AddCampaignAndCreate: (options: SocialCampaignOptions) => Promise<string>;
  clickAddCampaignButton: () => Promise<void>;
  clickCampaignOptions: () => Promise<void>;
  clickExpireCampaignButton: () => Promise<void>;
  confirmExpireCampaign: () => Promise<void>;
  clickDeleteCampaignButton: () => Promise<void>;
  clickExpiredLink: () => Promise<void>;
  getSocialCampaignCount: () => Promise<number>;
  confirmDeleteCampaign: () => Promise<void>;
  clickShareToFeedButton: () => Promise<void>;
  selectShareOption: (option: string) => Promise<void>;
  enterShareDescription: (description: string) => Promise<void>;
  enterSiteName: (siteName: string) => Promise<void>;
  clickShareButton: () => Promise<void>;
}

export interface ISocialCampaignPageAssertions {
  verifyCampaignLinkDisplayed: (linkText: string) => Promise<void>;
  verifyCampaignNotInLatest: (linkText: string) => Promise<void>;
  verifyCampaignNotInExpired: (linkText: string) => Promise<void>;
  verifyCampaignInExpired: (linkText: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
  verifyShareButtonNotVisible: () => Promise<void>;
}

export class SocialCampaignPage extends BasePage implements ISocialCampaignPageActions, ISocialCampaignPageAssertions {
  readonly socialCampaignsSection: Locator;
  readonly addCampaignButton: Locator;
  readonly popularLink: Locator;
  readonly expiredLink: Locator;
  readonly shareToFeedButton: Locator;
  readonly shareOptionDropdown: Locator;
  readonly shareDescriptionInput: Locator;
  readonly siteNameInput: Locator;
  readonly shareButton: Locator;
  readonly shareButtonOnFeed: Locator;
  private addCampaignPage: AddCampaignPage;
  private listOfSocialCampaignComponent: ListOfSocialCampaignComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS_PAGE);

    this.socialCampaignsSection = page.locator('h1', { hasText: /^Social campaigns$/ });
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.expiredLink = page.locator('a', { hasText: /^Expired$/ });
    this.shareToFeedButton = page.locator('button:has-text("Share to feed")');
    this.shareOptionDropdown = page.locator('[data-testid="share-option-dropdown"]');
    this.shareDescriptionInput = page.locator('textarea[placeholder*="description"], textarea[name="description"]');
    this.siteNameInput = page.locator('input[placeholder*="site"], input[name="siteName"]');
    this.shareButton = page.locator('button:has-text("Share")');
    this.shareButtonOnFeed = page.locator('button:has-text("Share")').first();
    this.addCampaignPage = new AddCampaignPage(page);
    this.listOfSocialCampaignComponent = new ListOfSocialCampaignComponent(page);
  }

  get actions(): ISocialCampaignPageActions {
    return this;
  }

  get assertions(): ISocialCampaignPageAssertions {
    return this;
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
    return await this.listOfSocialCampaignComponent.verifyCampaignLinkDisplayed(linkText);
  }

  /**
   * Creates and publishes a new social campaign
   * @param options - Options for creating the campaign including message, URL, recipient, and networks
   * @returns Result containing campaign details and link text
   */
  async AddCampaignAndCreate(options: SocialCampaignOptions): Promise<string> {
    return await this.addCampaignPage.AddCampaignAndCreate(options);
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
    return await this.listOfSocialCampaignComponent.verifyToastMessage(message);
  }

  async clickShareToFeedButton(): Promise<void> {
    await test.step('Click Share to feed button', async () => {
      await this.clickOnElement(this.shareToFeedButton);
    });
  }

  async selectShareOption(option: string): Promise<void> {
    await test.step(`Select share option: ${option}`, async () => {
      await this.clickOnElement(
        this.page.locator(`button:has-text("${option}"), [role="option"]:has-text("${option}")`)
      );
    });
  }

  async enterShareDescription(description: string): Promise<void> {
    await test.step(`Enter share description: ${description}`, async () => {
      await this.fillInElement(this.shareDescriptionInput, description);
    });
  }

  async enterSiteName(siteName: string): Promise<void> {
    await test.step(`Enter site name: ${siteName}`, async () => {
      await this.fillInElement(this.siteNameInput, siteName);
      // Wait for autocomplete and select the option
      await this.page.waitForTimeout(1000);
      await this.page.locator(`[role="option"]:has-text("${siteName}")`).first().click();
    });
  }

  async clickShareButton(): Promise<void> {
    await test.step('Click Share button', async () => {
      await this.clickOnElement(this.shareButton);
    });
  }

  async verifyShareButtonNotVisible(): Promise<void> {
    await test.step('Verify share button is not visible on expired campaign', async () => {
      await this.verifier.verifyTheElementIsNotVisible(this.shareButtonOnFeed, {
        assertionMessage: 'Share button should not be visible on expired campaign',
      });
    });
  }
}
