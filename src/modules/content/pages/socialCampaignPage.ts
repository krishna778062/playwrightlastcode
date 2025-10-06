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
  clickCampaignOptions: (campaignId: string) => Promise<void>;
  clickExpireCampaignButton: () => Promise<void>;
  confirmExpireCampaign: () => Promise<void>;
  clickDeleteCampaignButton: () => Promise<void>;
  clickExpiredLink: () => Promise<void>;
  getSocialCampaignCount: () => Promise<number>;
  confirmDeleteCampaign: () => Promise<void>;
}

export interface ISocialCampaignPageAssertions {
  verifyCampaignLinkDisplayed: (linkText: string) => Promise<void>;
  verifyCampaignNotInLatest: (linkText: string) => Promise<void>;
  verifyCampaignNotInExpired: (linkText: string) => Promise<void>;
  verifyCampaignInExpired: (linkText: string) => Promise<void>;
  verifyToastMessage: (message: string) => Promise<void>;
}

export class SocialCampaignPage extends BasePage implements ISocialCampaignPageActions, ISocialCampaignPageAssertions {
  readonly socialCampaignsSection: Locator;
  readonly addCampaignButton: Locator;
  readonly popularLink: Locator;
  readonly expiredLink: Locator;
  private addCampaignPage: AddCampaignPage;
  private listOfSocialCampaignComponent: ListOfSocialCampaignComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS_PAGE);

    this.socialCampaignsSection = page.locator('[data-testid="social-campaigns-section"]');
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.expiredLink = page.locator('a', { hasText: /^Expired$/ });
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

  async clickCampaignOptions(campaignId: string): Promise<void> {
    return await this.listOfSocialCampaignComponent.clickCampaignOptions(campaignId);
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
}
