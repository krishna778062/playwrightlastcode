import { Locator, Page, Response, test } from '@playwright/test';

import { API_ENDPOINTS } from '@core/constants/apiEndpoints';
import {
  SocialCampaignNetworkUI,
  SocialCampaignOptions,
  SocialCampaignRecipient,
} from '@core/types/social-campaign.types';
import { BasePage } from '@core/ui/pages/basePage';

import { PAGE_ENDPOINTS } from '@/src/core/constants/pageEndpoints';

export interface IAddCampaignPageActions {
  selectMemberAsAudience: () => Promise<void>;
  enterCampaignMessage: (message: string) => Promise<void>;
  enterCampaignUrl: (url: string, linkText?: string) => Promise<void>;
  clickCreateCampaignButton: () => Promise<void>;
  AddCampaignAndCreate: (options: SocialCampaignOptions) => Promise<string>;
  uncheckNetwork: (networkName: string) => Promise<void>;
  selectNetworks: (networks: SocialCampaignNetworkUI[]) => Promise<void>;
}

export interface IAddCampaignPageAssertions {
  verifyErrorMessagePresence: (errorMessage: string) => Promise<void>;
  verifyAudienceNameDisplayed: (audienceName: string) => Promise<void>;
  verifyAudienceNameAndDescription: (
    audienceCount: string | number,
    description: string,
    name: string
  ) => Promise<void>;
  verifyAudienceNameAndNoDescription: (
    audienceCount: string | number,
    description: string,
    name: string
  ) => Promise<void>;
}

export class AddCampaignPage extends BasePage implements IAddCampaignPageActions, IAddCampaignPageAssertions {
  readonly addCampaignButton: Locator;
  readonly audienceOption: Locator;
  readonly campaignMessageInput: Locator;
  readonly campaignUrlInput: Locator;
  readonly createCampaignButton: Locator;
  readonly audienceDescriptionDisplay: Locator;
  private getHeadingByText: (text: string) => Locator;
  private getNetworkCheckbox: (networkName: string) => Locator;
  private errorLocator: (errorMessage: string) => Locator;
  private audienceNameDisplay: (audienceName: string, audienceCount: number, descriptionText: string) => Locator;
  private audienceName: Locator;

  constructor(page: Page) {
    super(page, PAGE_ENDPOINTS.ADD_SOCIAL_CAMPAIGNS);
    this.addCampaignButton = page.locator('span:has-text("Add campaign")');
    this.audienceOption = page.locator('label[for="recipient_audience"]');
    this.campaignMessageInput = page.locator('textarea#message');
    this.campaignUrlInput = page.locator('input#url');
    this.getHeadingByText = (text: string) => page.locator(`h2:has-text("${text}")`);
    this.createCampaignButton = page.locator('span:has-text("Create campaign")');
    this.getNetworkCheckbox = (networkName: string) => page.locator(`label:text("${networkName}")`);
    this.errorLocator = (errorMessage: string) => this.page.locator(`text="${errorMessage}"`);
    this.audienceDescriptionDisplay = page.locator(
      '[data-testid="audience-description"], .audience-description, .selected-audience-description'
    );
    this.audienceName = page.locator('input#audience');
    this.audienceNameDisplay = (audienceName: string, audienceCount: number, descriptionText: string) =>
      page.locator(
        `xpath=//div[@class='Panel-item']/span[text()='${audienceName} (${audienceCount})']/following-sibling::span[text()='${descriptionText}']`
      );
  }

  get actions(): IAddCampaignPageActions {
    return this;
  }

  get assertions(): IAddCampaignPageAssertions {
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

  async enterCampaignUrl(url: string, linkText?: string): Promise<void> {
    await test.step(`Enter campaign URL: ${url}`, async () => {
      // Fill in URL and wait for metadata to load
      await this.fillInElement(this.campaignUrlInput, url);

      if (linkText) {
        await this.verifier.verifyTheElementIsVisible(this.getHeadingByText(linkText), {
          assertionMessage: `Heading with text "${linkText}" should be visible`,
        });
      }
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
        await this.enterAudienceName(options.audienceDetails?.name || '');
        await this.selectAudience(options.audienceDetails?.name || '');
      }

      // Enter the campaign message
      await this.enterCampaignMessage(options.message);

      // Enter the campaign URL
      await this.enterCampaignUrl(options.url, options.linkText);

      // Select networks if specified
      if (options.networks && options.networks.length > 0) {
        await this.selectNetworks(options.networks);
      }

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

  async uncheckNetwork(networkName: string): Promise<void> {
    await test.step(`Uncheck ${networkName} network`, async () => {
      await this.clickOnElement(this.getNetworkCheckbox(networkName));
    });
  }

  async selectNetworks(networks: SocialCampaignNetworkUI[]): Promise<void> {
    await test.step(`Select networks: ${networks.join(', ')}`, async () => {
      // First uncheck all networks
      await this.uncheckNetwork('Facebook');
      await this.uncheckNetwork('LinkedIn');
      await this.uncheckNetwork('X');

      // Then check only the specified networks
      for (const network of networks) {
        await this.clickOnElement(this.getNetworkCheckbox(network));
      }
    });
  }

  async verifyErrorMessagePresence(errorMessage: string): Promise<void> {
    await test.step(`Verify error message: "${errorMessage}"`, async () => {
      await this.verifier.verifyTheElementIsVisible(this.errorLocator(errorMessage), {
        assertionMessage: `Error message "${errorMessage}" should be visible`,
      });
    });
  }

  async verifyAudienceNameDisplayed(audienceName: string): Promise<void> {
    await test.step(`Verify audience name "${audienceName}" is displayed`, async () => {
      const audienceNameLocator = this.page.locator(`text="${audienceName}"`);
      await this.verifier.verifyTheElementIsVisible(audienceNameLocator, {
        assertionMessage: `Audience name "${audienceName}" should be visible`,
      });
    });
  }

  async enterAudienceName(audienceName: string): Promise<void> {
    return await this.fillInElement(this.audienceName, audienceName);
  }

  async selectAudience(audienceName: string): Promise<void> {
    return await this.clickOnElement(this.audienceOption);
  }

  async verifyAudienceNameAndDescription(
    audienceCount: string | number,
    description: string,
    name: string
  ): Promise<void> {
    await test.step(`Verify audience name "${name}" and description "${description}" is displayed`, async () => {
      const text = `${name} (${audienceCount})`;
      await this.verifier.verifyTheElementIsVisible(
        this.audienceNameDisplay(name, Number(audienceCount), description),
        {
          assertionMessage: `Audience name "${name}" should be visible`,
        }
      );
    });
  }

  async verifyAudienceNameAndNoDescription(
    audienceCount: string | number,
    description: string,
    name: string
  ): Promise<void> {
    await test.step(`Verify audience name "${name}" and no description is displayed`, async () => {
      const text = `${name} (${audienceCount})`;
      await this.verifier.verifyTheElementIsNotVisible(
        this.audienceNameDisplay(name, Number(audienceCount), description),
        {
          assertionMessage: `Audience name "${name}" should be visible`,
        }
      );
    });
  }
}
