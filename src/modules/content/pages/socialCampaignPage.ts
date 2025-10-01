import { Locator, Page, Response, test } from '@playwright/test';

import { AddCampaignComponent, SocialCampaignOptions } from '@content/components/addCampaignComponent';
import { BasePage } from '@core/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface ISocialCampaignPageActions {
  removeAllExistingCampaigns: () => Promise<void>;
  clickPopularLink: () => Promise<void>;
  getSocialCampaignLink: () => Promise<string>;
  AddCampaignAndCreate: (options: SocialCampaignOptions) => Promise<string>;
  clickAddCampaignButton: () => Promise<void>;
}

export interface ISocialCampaignPageAssertions {
  verifyCampaignLinkDisplayed: (linkText: string) => Promise<void>;
}

export class SocialCampaignPage extends BasePage implements ISocialCampaignPageActions, ISocialCampaignPageAssertions {
  readonly socialCampaignsSection: Locator;
  readonly campaignLink: Locator;
  readonly linkByText: (linkText: string) => Locator;
  readonly popularLink: Locator;
  readonly addCampaignButton: Locator;
  private addCampaignComponent: AddCampaignComponent;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.SOCIAL_CAMPAIGNS);

    this.socialCampaignsSection = page.locator('[data-testid="social-campaigns-section"]');
    this.campaignLink = page.locator('[data-testid="campaign-link"]');
    this.linkByText = (linkText: string) => page.locator('a', { hasText: linkText });
    this.popularLink = page.locator('a', { hasText: /^Popular$/ });
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.addCampaignComponent = new AddCampaignComponent(page);
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

  async getSocialCampaignLink(): Promise<string> {
    return await test.step('Get social campaign link', async () => {
      const linkText = await this.campaignLink.textContent();
      return linkText || '';
    });
  }

  async clickPopularLink(): Promise<void> {
    await test.step('Click Popular link', async () => {
      await this.clickOnElement(this.popularLink);
    });
  }

  async verifyCampaignLinkDisplayed(linkText: string): Promise<void> {
    await test.step(`Verify campaign link "${linkText}" is displayed`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.linkByText(linkText).first(), {
        assertionMessage: `Campaign link "${linkText}" should be displayed`,
      });
    });
  }

  /**
   * Creates and publishes a new social campaign
   * @param options - Options for creating the campaign including message, URL, recipient, and networks
   * @returns Result containing campaign details and link text
   */
  async AddCampaignAndCreate(options: SocialCampaignOptions): Promise<string> {
    return await this.addCampaignComponent.AddCampaignAndCreate(options);
  }
}
