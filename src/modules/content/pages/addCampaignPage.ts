import { Locator, Page, Response, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import { BasePage } from '@core/pages/basePage';
import { SocialCampaignOptions, SocialCampaignRecipient } from '@core/types/social-campaign.types';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IAddCampaignPageActions {
  selectMemberAsAudience: () => Promise<void>;
  enterCampaignMessage: (message: string) => Promise<void>;
  enterCampaignUrl: (url: string, linkText: string) => Promise<void>;
  clickCreateCampaignButton: () => Promise<void>;
  AddCampaignAndCreate: (options: SocialCampaignOptions) => Promise<string>;
}

export class AddCampaignPage extends BasePage implements IAddCampaignPageActions {
  readonly addCampaignButton: Locator;
  readonly audienceOption: Locator;
  readonly campaignMessageInput: Locator;
  readonly campaignUrlInput: Locator;
  readonly createCampaignButton: Locator;
  private getHeadingByText: (text: string) => Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SOCIAL_CAMPAIGNS);
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.audienceOption = page.getByRole('option', { name: 'Audience' });
    this.campaignMessageInput = page.locator('textarea#message');
    this.campaignUrlInput = page.locator('input#url');
    this.getHeadingByText = (text: string) => page.locator(`h2:has-text("${text}")`);
    this.createCampaignButton = page.locator('span:has-text("Create campaign")');
  }

  get actions(): IAddCampaignPageActions {
    return this;
  }

  async verifyThePageIsLoaded(): Promise<void> {
    await test.step('Verify add campaign page is loaded', async () => {
      await this.verifier.verifyTheElementIsVisible(this.campaignMessageInput, {
        assertionMessage: 'Add campaign form should be visible',
      });
    });
  }

  async selectMemberAsAudience(): Promise<void> {
    await test.step('Select member as Audience', async () => {
      await this.clickOnElement(this.audienceOption);
    });
  }

  async enterCampaignMessage(message: string): Promise<void> {
    await test.step(`Enter campaign message: ${message}`, async () => {
      await this.fillInElement(this.campaignMessageInput, message);
    });
  }

  async enterCampaignUrl(url: string, linkText: string): Promise<void> {
    await test.step(`Enter campaign URL: ${url}`, async () => {
      await this.fillInElement(this.campaignUrlInput, url);
      await this.verifier.verifyTheElementIsVisible(this.getHeadingByText(linkText), {
        assertionMessage: `Heading with text "${linkText}" should be visible`,
      });
    });
  }

  async clickCreateCampaignButton(): Promise<void> {
    await test.step('Click Create campaign button', async () => {
      await this.clickOnElement(this.createCampaignButton);
    });
  }

  /**
   * Creates and publishes a new social campaign
   * @param options - Options for creating the campaign including message, URL, recipient, and networks
   * @returns Result containing campaign details and link text
   */
  async AddCampaignAndCreate(options: SocialCampaignOptions): Promise<string> {
    return await test.step(`Creating and publishing social campaign with message: ${options.message}`, async () => {
      // Select member as "audience" (default) or handle everyone selection
      if (options.recipient !== SocialCampaignRecipient.EVERYONE) {
        await this.selectMemberAsAudience();
      }

      // Enter the campaign message
      await this.enterCampaignMessage(options.message);

      // Enter the campaign URL
      await this.enterCampaignUrl(options.url, options.linkText);

      // Publish the campaign and wait for API response
      const campaignResponse = await this.createCampaign();

      // Parse response body
      const campaignResponseBody = await campaignResponse.json();
      console.log('Campaign JSON Response:', JSON.stringify(campaignResponseBody, null, 2));

      // Extract campaign ID from response
      const campaignId = campaignResponseBody.result?.campaignId;
      console.log('campaignId', campaignId);

      return campaignId;
    });
  }

  /**
   * Creates social campaign and waits for API response
   * @returns API response from campaign creation
   */
  async createCampaign(): Promise<Response> {
    return await test.step(`Creating social campaign and wait for api response`, async () => {
      const campaignResponse = await this.performActionAndWaitForResponse(
        () => this.clickOnElement(this.createCampaignButton, { delay: 3_000 }),
        response =>
          response.url().includes(API_ENDPOINTS.socialCampaign.create) &&
          response.request().method() === 'POST' &&
          response.status() === 201,
        {
          timeout: 20_000,
        }
      );
      return campaignResponse;
    });
  }
}
